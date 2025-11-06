const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const express = require('express');
const { MongoClient } = require('mongodb'); // <-- Add MongoDB
const uuid = require('uuid');
const { google } = require('googleapis');
const fs = require('fs').promises; // Used to read your client_secret.json

const app = express();
const port = process.argv.length > 2 ? process.argv[2] : 4000;


const authCookieName = 'token';

app.use(express.json());
app.use(cookieParser());

// Serve static files (your React build)
app.use(express.static('public'));

// API router
var apiRouter = express.Router();
app.use(`/api`, apiRouter);

// --- Add API Endpoints (see step 2) ---

// Default error handler
app.use(function (err, req, res, next) {
    res.status(500).send({ type: err.name, message: err.message });
});

// Return frontend for unknown paths (for React Router)
app.use((_req, res) => {
    res.sendFile('index.html', { root: 'public' });
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

apiRouter.post('/auth/create', async (req, res) => {
    if (await findUser('email', req.body.email)) {
        res.status(409).send({ msg: 'Existing user' });
    } else {
        const user = await createUser(req.body.email, req.body.password);

        setAuthCookie(res, user.token);
        res.send({ email: user.email });
    }
});

// GetAuth login an existing user
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

// DeleteAuth logout a user
apiRouter.delete('/auth/logout', async (req, res) => {
    const user = await findUser('token', req.cookies[authCookieName]);
    if (user) {
        delete user.token;
    }
    res.clearCookie(authCookieName);
    res.status(204).end();
});


let events = {};
let unavailableTimes = {};
let googleRefreshTokens = {};


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
// == START: Google Calendar API Endpoints (Part 2, Step 3)
// =================================================================

const GOOGLE_SCOPES = ['https://www.googleapis.com/auth/calendar.events'];
const CREDENTIALS_PATH = 'client_secret.json'; // Path to your downloaded file

/**
 * Creates a new OAuth2 client with the credentials from client_secret.json
 */
async function getOAuth2Client() {
    try {
        const content = await fs.readFile(CREDENTIALS_PATH);
        const credentials = JSON.parse(content);
        const { client_secret, client_id, redirect_uris } = credentials.web;

        // Make sure you use the correct redirect URI
        // For local, this is http://localhost:4000/api/auth/google/callback
        const oAuth2Client = new google.auth.OAuth2(
            client_id,
            client_secret,
            redirect_uris[0] // Assumes the first URI is your intended callback
        );
        return oAuth2Client;
    } catch (err) {
        console.error('Error loading client secret file:', err);
        throw new Error('Could not load client secret file.');
    }
}

/**
 * Endpoint 1: Redirects the user to Google's consent screen
 */
apiRouter.get('/auth/google', async (req, res) => {
    try {
        const oAuth2Client = await getOAuth2Client();

        const authUrl = oAuth2Client.generateAuthUrl({
            access_type: 'offline', // 'offline' is required to get a refresh_token
            scope: GOOGLE_SCOPES,
            prompt: 'consent', // Forces the user to re-consent, which ensures you get a refresh_token
        });

        res.redirect(authUrl);
    } catch (err) {
        res.status(500).send({ msg: 'Error generating Google auth URL', error: err.message });
    }
});

apiRouter.post('/api/google/sync', verifyAuth, async (req, res) => {
    const userEmail = req.user.email;
    const { events: planItEvents } = req.body; // Get events from frontend

    // 1. Get the user's saved refresh_token
    const refreshToken = googleRefreshTokens[userEmail];
    if (!refreshToken) {
        return res.status(400).send({ msg: 'User has not authorized Google Calendar. Please "Sync with Google" first.' });
    }

    try {
        // 2. Create an auth'd client using the refresh_token
        const oAuth2Client = await getOAuth2Client();
        oAuth2Client.setCredentials({
            refresh_token: refreshToken
        });

        // 3. Initialize the Google Calendar API
        const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

        // 4. Loop through events from frontend and add them to Google
        let createdCount = 0;
        for (const event of planItEvents) {
            // Format the event for Google Calendar
            const googleEvent = {
                summary: event.title,
                description: 'Scheduled by PlanIt!',
                start: {
                    dateTime: new Date(event.date).toISOString(), // Use full ISO string
                    timeZone: 'America/Denver', // You can make this dynamic later
                },
                end: {
                    dateTime: new Date(new Date(event.date).getTime() + event.durationHours * 60 * 60 * 1000).toISOString(),
                    timeZone: 'America/Denver',
                },
            };

            // 5. Insert the event
            await calendar.events.insert({
                calendarId: 'primary', // 'primary' means the user's main calendar
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

apiRouter.get('/auth/google/callback', verifyAuth, async (req, res) => {
    const { code } = req.query; // The authorization code from Google

    if (!code) {
        return res.status(400).send('Missing authorization code');
    }

    try {
        const oAuth2Client = await getOAuth2Client();
        const { tokens } = await oAuth2Client.getToken(code);

        // IMPORTANT: tokens.refresh_token is what you must save!
        // You only get a refresh_token the *first* time a user authorizes.
        console.log('Received Google Tokens:', tokens);

        if (tokens.refresh_token) {
            const userEmail = req.user.email;
            googleRefreshTokens[userEmail] = tokens.refresh_token;
            console.log('SUCCESS: Got a refresh_token. Save this to your database!');
        } else {
            console.log('NOTE: No refresh_token received. User likely already authorized.');
        }

        res.redirect('/preferences');

    } catch (err) {
        console.error('Error exchanging Google token:', err);
        res.status(500).send({ msg: 'Error exchanging Google token', error: err.message });
    }
});

// =================================================================
// == END: Google Calendar API Endpoints
// =================================================================

// GetEvents: Get all events for the logged-in user
apiRouter.get('/events', verifyAuth, (req, res) => {
    const userEmail = req.user.email;
    // Ensure the user has an event array initialized
    if (!events[userEmail]) {
        events[userEmail] = [];
    }
    res.send(events[userEmail]);
});

// CreateEvent: Add a new event for the logged-in user
apiRouter.post('/events', verifyAuth, (req, res) => {
    const userEmail = req.user.email;
    const newEvent = req.body;

    // Assign a server-side ID and owner
    newEvent.id = uuid.v4();
    newEvent.ownerEmail = userEmail;

    // Ensure the user has an event array initialized
    if (!events[userEmail]) {
        events[userEmail] = [];
    }

    events[userEmail].push(newEvent);

    // Send back the newly created event (with its ID)
    res.status(201).send(newEvent);
});

// === UNAVAILABLE TIMES ENDPOINTS ===

// GetUnavailableTimes: Get all unavailable times for the logged-in user
apiRouter.get('/unavailable', verifyAuth, (req, res) => {
    const userEmail = req.user.email;

    // Initialize with default value if user has no times set
    // This matches your AppProvider's initial state
    if (!unavailableTimes[userEmail]) {
        unavailableTimes[userEmail] = [
            {
                id: uuid.v4(),
                day: 'mon',
                startTime: '12:00',
                endTime: '13:00',
                ownerEmail: userEmail
            }
        ];
    }

    res.send(unavailableTimes[userEmail]);
});

// AddUnavailableTime: Add a new unavailable time block
apiRouter.post('/unavailable', verifyAuth, (req, res) => {
    const userEmail = req.user.email;
    const newTime = req.body;

    // Assign server-side ID and owner
    newTime.id = uuid.v4();
    newTime.ownerEmail = userEmail;

    // Initialize if needed (same as GET)
    if (!unavailableTimes[userEmail]) {
        unavailableTimes[userEmail] = [
            {
                id: uuid.v4(),
                day: 'mon',
                startTime: '12:00',
                endTime: '13:00',
                ownerEmail: userEmail
            }
        ];
    }

    unavailableTimes[userEmail].push(newTime);

    res.status(201).send(newTime);
});

// DeleteUnavailableTime: Remove an unavailable time block
apiRouter.delete('/unavailable/:id', verifyAuth, (req, res) => {
    const userEmail = req.user.email;
    const { id } = req.params;

    // Ensure the user's array exists
    if (unavailableTimes[userEmail]) {
        const initialLength = unavailableTimes[userEmail].length;
        unavailableTimes[userEmail] = unavailableTimes[userEmail].filter(
            (time) => time.id !== id
        );

        if (unavailableTimes[userEmail].length === initialLength) {
            // Nothing was deleted (ID not found)
            return res.status(404).send({ msg: 'Time block not found' });
        }
    }

    // Send "No Content" success status
    res.status(204).end();
});


async function findUser(field, value) {
    if (!value) return null;

    return users.find((u) => u[field] === value);
}
function setAuthCookie(res, authToken) {
    res.cookie(authCookieName, authToken, {
        maxAge: 1000 * 60 * 60 * 24 * 365,
        secure: true,
        httpOnly: true,
        sameSite: 'strict',
    });
}