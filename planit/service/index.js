// planit/service/index.js

const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const express = require('express');
const { MongoClient } = require('mongodb'); // <-- Add MongoDB
const uuid = require('uuid');
const { google } = require('googleapis');
const fs = require('fs').promises; // Used to read your client_secret.json

const app = express();
const port = process.argv.length > 2 ? process.argv[2] : 4000;

// --- In-Memory "Databases" ---
const authCookieName = 'token';
let users = [];
let events = {};
let unavailableTimes = {};
let googleRefreshTokens = {};

// --- Middleware ---
app.use(express.json());
app.use(cookieParser());
app.use(express.static('public')); // Serve static files

// API router
const apiRouter = express.Router();
app.use(`/api`, apiRouter);

// =================================================================
// == START: Auth Helper Functions
// =================================================================

async function findUser(field, value) {
    if (!value) return null;
    // NOTE: This will be replaced with a database call
    return users.find((u) => u[field] === value);
}

async function createUser(email, password) {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = {
        email: email,
        password: passwordHash,
        token: uuid.v4(),
    };
    // NOTE: This will be replaced with a database call
    users.push(user);
    return user;
}

function setAuthCookie(res, authToken) {
    res.cookie(authCookieName, authToken, {
        maxAge: 1000 * 60 * 60 * 24 * 365, // Stays logged in for one year
        secure: false, // <-- THE FIX: Set to false for HTTP (localhost)
        httpOnly: true,
        sameSite: 'strict',
    });
}

const verifyAuth = async (req, res, next) => {
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
    if (await findUser('email', req.body.email)) {
        res.status(409).send({ msg: 'Existing user' });
    } else {
        const user = await createUser(req.body.email, req.body.password);
        setAuthCookie(res, user.token);
        res.send({ email: user.email });
    }
});

apiRouter.post('/auth/login', async (req, res) => {
    const user = await findUser('email', req.body.email);
    if (user) {
        if (await bcrypt.compare(req.body.password, user.password)) {
            user.token = uuid.v4();
            setAuthCookie(res, user.token);
            res.send({ email: user.email });
            return;
        }
    }
    res.status(401).send({ msg: 'Unauthorized' });
});

apiRouter.delete('/auth/logout', async (req, res) => {
    const user = await findUser('token', req.cookies[authCookieName]);
    if (user) {
        delete user.token;
    }
    res.clearCookie(authCookieName);
    res.status(204).end();
});

// =================================================================
// == END: Standard Auth Endpoints
// =================================================================


// =================================================================
// == START: Google Calendar API Endpoints
// =================================================================

const GOOGLE_SCOPES = ['https://www.googleapis.com/auth/calendar.events'];
const CREDENTIALS_PATH = 'client_secret.json'; // Path to your downloaded file

// ... (this function is in planit/service/index.js)
async function getOAuth2Client() {
    try {
        const content = await fs.readFile(CREDENTIALS_PATH);
        const credentials = JSON.parse(content);
        const { client_secret, client_id, redirect_uris } = credentials.web;

        // === THIS IS THE FIX ===
        // Check if we are in production
        const isProduction = process.env.NODE_ENV === 'production';

        // Use the production URI (index 1) if in production,
        // otherwise use the development URI (index 0)
        const redirect_uri = isProduction ? redirect_uris[1] : redirect_uris[0];

        console.log("Using Redirect URI:", redirect_uri); // For debugging
        // === END OF FIX ===

        const oAuth2Client = new google.auth.OAuth2(
            client_id,
            client_secret,
            redirect_uri // Use our new dynamic variable
        );
        return oAuth2Client;
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

apiRouter.get('/auth/google/callback', verifyAuth, async (req, res) => { // verifyAuth is included
    const { code } = req.query;

    if (!code) {
        return res.status(400).send('Missing authorization code');
    }

    try {
        const oAuth2Client = await getOAuth2Client();
        const { tokens } = await oAuth2Client.getToken(code);

        console.log('Received Google Tokens:', tokens);

        if (tokens.refresh_token) {
            const userEmail = req.user.email;
            googleRefreshTokens[userEmail] = tokens.refresh_token;
            console.log(`SUCCESS: Got a refresh_token for ${userEmail}. Save this to your database!`);
        } else {
            console.log('NOTE: No refresh_token received. User likely already authorized.');
        }

        res.redirect('/preferences'); // Redirect back to frontend

    } catch (err) {
        console.error('Error exchanging Google token:', err);
        res.status(500).send({ msg: 'Error exchanging Google token', error: err.message });
    }
});

apiRouter.post('/google/sync', verifyAuth, async (req, res) => {
    const userEmail = req.user.email;
    const { events: planItEvents } = req.body;

    const refreshToken = googleRefreshTokens[userEmail];
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
                    timeZone: 'America/Denver',
                },
                end: {
                    dateTime: new Date(new Date(event.date).getTime() + event.durationHours * 60 * 60 * 1000).toISOString(),
                    timeZone: 'America/Denver',
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
// == START: PlanIt Data Endpoints
// =================================================================

apiRouter.get('/events', verifyAuth, (req, res) => {
    const userEmail = req.user.email;
    if (!events[userEmail]) {
        events[userEmail] = [];
    }
    res.send(events[userEmail]);
});

apiRouter.post('/events', verifyAuth, (req, res) => {
    const userEmail = req.user.email;
    const newEvent = req.body;
    newEvent.id = uuid.v4();
    newEvent.ownerEmail = userEmail;

    if (!events[userEmail]) {
        events[userEmail] = [];
    }
    events[userEmail].push(newEvent);
    res.status(201).send(newEvent);
});

apiRouter.get('/unavailable', verifyAuth, (req, res) => {
    const userEmail = req.user.email;
    if (!unavailableTimes[userEmail]) {
        unavailableTimes[userEmail] = [
            { id: uuid.v4(), day: 'mon', startTime: '12:00', endTime: '13:00', ownerEmail: userEmail }
        ];
    }
    res.send(unavailableTimes[userEmail]);
});

apiRouter.post('/unavailable', verifyAuth, (req, res) => {
    const userEmail = req.user.email;
    const newTime = req.body;
    newTime.id = uuid.v4();
    newTime.ownerEmail = userEmail;

    if (!unavailableTimes[userEmail]) {
        unavailableTimes[userEmail] = [
            { id: uuid.v4(), day: 'mon', startTime: '12:00', endTime: '13:00', ownerEmail: userEmail }
        ];
    }
    unavailableTimes[userEmail].push(newTime);
    res.status(201).send(newTime);
});

apiRouter.delete('/unavailable/:id', verifyAuth, (req, res) => {
    const userEmail = req.user.email;
    const { id } = req.params;

    if (unavailableTimes[userEmail]) {
        const initialLength = unavailableTimes[userEmail].length;
        unavailableTimes[userEmail] = unavailableTimes[userEmail].filter(
            (time) => time.id !== id
        );

        if (unavailableTimes[userEmail].length === initialLength) {
            return res.status(4404).send({ msg: 'Time block not found' });
        }
    }
    res.status(204).end();
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

// Start the server
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});