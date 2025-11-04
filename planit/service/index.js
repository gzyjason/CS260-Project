// planit/service/index.js
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const express = require('express');
const { MongoClient } = require('mongodb'); // <-- Add MongoDB
const uuid = require('uuid');

const app = express();
const port = process.argv.length > 2 ? process.argv[2] : 4000;

// --- Add MongoDB Connection Logic Here ---
// e.g., const client = new MongoClient('mongodb://localhost:27017');
// const db = client.db('planit');

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

// --- Add Auth functions (see step 2) ---