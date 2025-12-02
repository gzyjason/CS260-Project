const cookie = require('cookie');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const express = require('express');
const uuid = require('uuid');
const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');
const fs = require('fs').promises;
const path = require('path');
const DB = require('./database.js'); // <<< IMPORT DATABASE MODULE
const { WebSocketServer } = require('ws');

const app = express();
const port = process.argv.length > 2 ? process.argv[2] : 4000;

// --- Database related memory ---
const authCookieName = 'token';
// We no longer need the in-memory object for Google tokens.
// let googleRefreshTokens = {}; // <<< REMOVED

// --- Middleware ---
app.use(express.json());
app.use(cookieParser());
app.use(express.static('public')); // Serve static files

// API router
const apiRouter = express.Router();
app.use(`/api`, apiRouter);

// =================================================================
// == START: WebSocket Setup
// =================================================================

// 1. Capture the HTTP server instance
const server = app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

server.on('upgrade', (request, socket, head) => {
    console.log(`[DEBUG] Upgrade request received for URL: ${request.url}`);
    // Note: We don't handle the upgrade here; we just log it.
    // The WebSocketServer below picks it up automatically.
});
// 2. Create the WebSocket server
const wss = new WebSocketServer({ server, path: '/ws' });
// 3. Handle connections
wss.on('connection', async (ws, req) => {
    console.log('[WS] Connection handler started');

    const cookies = cookie.parse(req.headers.cookie || '');
    const token = cookies[authCookieName];

    if (token) {
        console.log(`[WS] Token found: ${token.substring(0, 8)}...`);
        try {
            const user = await DB.getUserByToken(token);
            if (user) {
                ws.userEmail = user.email;
                console.log(`[WS] Client connected: ${user.email}`);
            } else {
                console.log(`[WS] Invalid token: ${token}`);
                ws.close(); // Close if token doesn't match a user
            }
        } catch (err) {
            console.error('[WS] Database error during connection:', err);
            ws.close();
        }
    } else {
        console.log('[WS] Connection attempted without auth token');
        ws.close();
    }

    ws.on('close', () => {
        // console.log('Client disconnected');
    });
});

async function broadcastMessage(type, data, ownerEmail) {
    // Fetch the owner's team from the database
    const team = await DB.getTeam(ownerEmail);

    // The "Audience" is the owner plus everyone in their team
    const audience = new Set([...team, ownerEmail]);

    wss.clients.forEach((client) => {
        // Only send if the client is authenticated AND in the audience
        if (client.readyState === 1 && client.userEmail && audience.has(client.userEmail)) {
            client.send(JSON.stringify({ type, data }));
        }
    });
}

// =================================================================
// == END: WebSocket Setup
// =================================================================

// =================================================================
// == START: Auth Helper Functions
// =================================================================

async function findUser(field, value) {
    if (!value) return null;
    if (field === 'token') {
        return DB.getUserByToken(value);
    }
    return DB.getUser(value); // Assumes 'email' is the field for getUser
}

async function createUser(email, password) {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = {
        email: email,
        password: passwordHash,
        token: uuid.v4(),
        googleRefreshToken: null, // Add new field for Google token
    };
    await DB.addUser(user);
    return user;
}

function setAuthCookie(res, authToken) {
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie(authCookieName, authToken, {
        maxAge: 1000 * 60 * 60 * 24 * 365, // Stays logged in for one year
        secure: isProduction, // NOW SECURE IN PRODUCTION
        httpOnly: true,
        sameSite: 'lax',
    });
}

const verifyAuth = async (req, res, next) => {
    // Find user by token in cookie
    const user = await findUser('token', req.cookies[authCookieName]);
    if (user) {
        // Attach the user object to the request
        req.user = user;
        next();
    } else {
        res.status(401).send({ msg: 'Unauthorized' });
    }
};

// =================================================================
// == END: Auth Helper Functions
// =================================================================


// =================================================================
// == START: Standard Auth Endpoints
// =================================================================

apiRouter.post('/auth/create', async (req, res) => {
    try {
        if (await findUser('email', req.body.email)) {
            res.status(409).send({ msg: 'Existing user' });
        } else {
            const user = await createUser(req.body.email, req.body.password);
            setAuthCookie(res, user.token);
            res.send({ email: user.email });
        }
    } catch (err) {
        console.error("Error in /auth/create:", err);
        res.status(500).send({ msg: 'Error creating user', error: err.message });
    }
});

apiRouter.post('/auth/login', async (req, res) => {
    try {
        const user = await findUser('email', req.body.email);
        if (user) {
            if (await bcrypt.compare(req.body.password, user.password)) {
                user.token = uuid.v4();
                await DB.updateUser(user); // Update token in DB
                setAuthCookie(res, user.token);
                res.send({ email: user.email });
                return;
            }
        }
        res.status(401).send({ msg: 'Unauthorized' });
    } catch (err) {
        console.error("Error in /auth/login:", err);
        res.status(500).send({ msg: 'Error logging in', error: err.message });
    }
});

apiRouter.delete('/auth/logout', async (req, res) => {
    try {
        const user = await findUser('token', req.cookies[authCookieName]);
        if (user) {
            delete user.token;
            await DB.updateUser(user); // Clear token in DB
        }
        res.clearCookie(authCookieName);
        res.status(204).end();
    } catch (err) {
        console.error("Error in /auth/logout:", err);
        res.status(500).send({ msg: 'Error logging out', error: err.message });
    }
});

apiRouter.get('/auth/status', verifyAuth, (req, res) => {
    if (!req.user) {
        return res.status(401).send({ msg: 'Unauthorized' });
    }
    // Send back the user's email and whether they have a Google token
    res.send({
        email: req.user.email,
        hasGoogleAuth: !!req.user.googleRefreshToken // Convert token/null to true/false
    });
});

apiRouter.post('/team', verifyAuth, async (req, res) => {
    try {
        const userEmail = req.user.email;
        const { teammateEmail } = req.body;

        // Simple validation: Ensure teammate exists (optional, but good practice)
        const teammate = await findUser('email', teammateEmail);
        if (!teammate) {
            return res.status(404).send({ msg: 'User not found' });
        }

        await DB.addTeammate(userEmail, teammateEmail);
        res.status(200).send({ msg: `Added ${teammateEmail} to your team` });
    } catch (err) {
        res.status(500).send({ msg: 'Error adding teammate', error: err.message });
    }
});

// =================================================================
// == END: Standard Auth Endpoints
// =================================================================


// =================================================================
// == START: Google Calendar API Endpoints
// =================================================================

const GOOGLE_SCOPES = [
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
    'openid'
];
const CREDENTIALS_PATH = path.join(__dirname, 'client_secret.json');

async function getOAuth2Client() {
    try {
        const content = await fs.readFile(CREDENTIALS_PATH);
        const credentials = JSON.parse(content);
        const { client_secret, client_id } = credentials.web;

        const redirect_uri = "https://startup.planittoday.click/api/auth/google/callback";
        console.log("Using Redirect URI:", redirect_uri);

        return new google.auth.OAuth2(
            client_id,
            client_secret,
            redirect_uri
        );
    } catch (err) {
        console.error('Error loading client secret file:', err);
        throw new Error('Could not load client secret file.');
    }
}


apiRouter.get('/auth/google', async (req, res) => {
    try {
        const oAuth2Client = await getOAuth2Client();
        const authUrl = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: GOOGLE_SCOPES,
            prompt: 'consent',
        });
        res.redirect(authUrl);
    } catch (err) {
        res.status(500).send({ msg: 'Error generating Google auth URL', error: err.message });
    }
});

apiRouter.get('/auth/google/callback', async (req, res) => {
    const { code } = req.query;

    if (!code) {
        return res.status(400).send('Missing authorization code');
    }

    try {
        const oAuth2Client = await getOAuth2Client();
        const { tokens } = await oAuth2Client.getToken(code);
        oAuth2Client.setCredentials(tokens);

        const oauth2 = google.oauth2({ version: 'v2', auth: oAuth2Client });
        const { data } = await oauth2.userinfo.get();
        const userEmail = data.email;

        if (!userEmail) {
            throw new Error("Could not retrieve user's email from Google.");
        }

        if (tokens.refresh_token) {
            // Find the user in our database
            const user = await DB.getUser(userEmail);
            if (user) {
                // Save the token to their database document
                user.googleRefreshToken = tokens.refresh_token;
                await DB.updateUser(user);
                console.log(`SUCCESS: Saved refresh_token to DB for ${userEmail}.`);
            } else {
                // User authorized Google but doesn't have an account in our system.
                // This is fine, we just can't save their token.
                console.log(`NOTE: User ${userEmail} authorized Google but does not have a PlanIt account.`);
            }
        } else {
            console.log(`NOTE: No refresh_token received for ${userEmail}. User likely already authorized.`);
        }

        res.redirect('/preferences');

    } catch (err) {
        console.error('Error exchanging Google token:', err);
        res.status(500).send({ msg: 'Error exchanging Google token', error: err.message });
    }
});

apiRouter.post('/google/sync', verifyAuth, async (req, res) => {
    const userEmail = req.user.email;
    const { events: planItEvents } = req.body;

    // Get the user fresh from the DB to ensure we have the token
    const user = await DB.getUser(userEmail);
    const refreshToken = user ? user.googleRefreshToken : null;

    if (!refreshToken) {
        return res.status(400).send({ msg: 'User has not authorized Google Calendar. Please "1. Authorize with Google" first.' });
    }

    try {
        const oAuth2Client = await getOAuth2Client();
        oAuth2Client.setCredentials({
            refresh_token: refreshToken
        });

        const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

        let createdCount = 0;
        for (const event of planItEvents) {
            const googleEvent = {
                summary: event.title,
                description: 'Scheduled by PlanIt!',
                start: {
                    dateTime: new Date(event.date).toISOString(),
                    timeZone: 'America/Denver', // Note: This is hardcoded, consider making it dynamic
                },
                end: {
                    dateTime: new Date(new Date(event.date).getTime() + event.durationHours * 60 * 60 * 1000).toISOString(),
                    timeZone: 'America/Denver', // Note: This is hardcoded, consider making it dynamic
                },
            };

            await calendar.events.insert({
                calendarId: 'primary',
                resource: googleEvent,
            });
            createdCount++;
        }

        res.status(200).send({ msg: `Successfully synced ${createdCount} events to Google Calendar.` });

    } catch (err) {
        console.error('Error syncing to Google Calendar:', err);
        res.status(500).send({ msg: 'Error syncing events', error: err.message });
    }
});

// =================================================================
// == END: Google Calendar API Endpoints
// =================================================================


// =================================================================
// == START: PlanIt Data Endpoints (Using DB functions)
// =================================================================

// Helper to add default unavailable time if none exists for the user
async function ensureDefaultUnavailableTime(userEmail) {
    const defaultTime = {
        id: uuid.v4(),
        day: 'mon',
        startTime: '12:00',
        endTime: '13:00',
        ownerEmail: userEmail
    };
    await DB.addUnavailableTime(defaultTime);
    return [defaultTime];
}


apiRouter.get('/events', verifyAuth, async (req, res) => {
    try {
        const userEmail = req.user.email;
        const events = await DB.getEvents(userEmail);
        res.send(events);
    } catch (err) {
        console.error("Error in /events GET:", err);
        res.status(500).send({ msg: 'Error fetching events', error: err.message });
    }
});

apiRouter.post('/events', verifyAuth, async (req, res) => {
    try {
        const userEmail = req.user.email;
        const newEvent = req.body;
        newEvent.id = uuid.v4();
        newEvent.ownerEmail = userEmail;

        const createdEvent = await DB.addEvent(newEvent);

        broadcastMessage('eventAdded', createdEvent, userEmail);

        res.status(201).send(createdEvent);
    } catch (err) {
        console.error("Error in /events POST:", err);
        res.status(500).send({ msg: 'Error adding event', error: err.message });
    }
});

apiRouter.get('/unavailable', verifyAuth, async (req, res) => {
    try {
        const userEmail = req.user.email;
        let unavailableTimes = await DB.getUnavailableTimes(userEmail);

        // Check if the array is empty and add a default one, as per original logic
        if (unavailableTimes.length === 0) {
            unavailableTimes = await ensureDefaultUnavailableTime(userEmail);
        }

        res.send(unavailableTimes);
    } catch (err) {
        console.error("Error in /unavailable GET:", err);
        res.status(500).send({ msg: 'Error fetching unavailable times', error: err.message });
    }
});

apiRouter.post('/unavailable', verifyAuth, async (req, res) => {
    try {
        const userEmail = req.user.email;
        const newTime = req.body;
        newTime.id = uuid.v4();
        newTime.ownerEmail = userEmail;

        const createdTime = await DB.addUnavailableTime(newTime);

        broadcastMessage('unavailableAdded', createdTime, userEmail);

        res.status(201).send(createdTime);
    } catch (err) {
        console.error("Error in /unavailable POST:", err);
        res.status(500).send({ msg: 'Error adding unavailable time', error: err.message });
    }
});

apiRouter.delete('/unavailable/:id', verifyAuth, async (req, res) => {
    try {
        const userEmail = req.user.email;
        const { id } = req.params;

        const deletedCount = await DB.removeUnavailableTime(userEmail, id);

        if (deletedCount === 0) {
            return res.status(404).send({ msg: 'Time block not found' });
        }

        broadcastMessage('unavailableRemoved', { id }, userEmail);

        res.status(204).end();
    } catch (err) {
        console.error("Error in /unavailable DELETE:", err);
        res.status(500).send({ msg: 'Error deleting unavailable time', error: err.message });
    }
});

// =================================================================
// == END: PlanIt Data Endpoints
// =================================================================


// =================================================================
// == START: Server Fallback and Listen
// =================================================================

// Default error handler
app.use(function (err, req, res, next) {
    res.status(500).send({ type: err.name, message: err.message });
});

// Return frontend for unknown paths (for React Router)
app.use((_req, res) => {
    res.sendFile('index.html', { root: 'public' });
});
