const { MongoClient } = require('mongodb');
const fs = require('fs').promises;
const path = require('path');

// Path to the configuration file
const DB_CONFIG_PATH = path.join(__dirname, 'dbConfig.json');
let db = null; // Cached database connection instance

// --- Database Connection ---

/**
 * Establishes a single connection to MongoDB Atlas and caches the DB instance.
 * @returns {Promise<import('mongodb').Db>} The MongoDB database instance.
 */
async function connectToDb() {
    if (db) return db;

    let config;
    try {
        // Read the config file to get connection details
        const content = await fs.readFile(DB_CONFIG_PATH, 'utf8');
        config = JSON.parse(content);
    } catch (err) {
        console.error('Error loading database config file:', err.message);
        throw new Error('Could not load database configuration.');
    }

    // Destructure all necessary parts from the config
    const { userName, password, hostname, DB_NAME } = config;

    if (!userName || !password || !hostname || !DB_NAME) {
        throw new Error('Database config file is missing required fields (userName, password, hostname, DB_NAME).');
    }

    // Construct the MONGODB_URI from the config parts
    const MONGODB_URI = `mongodb+srv://${userName}:${password}@${hostname}/?retryWrites=true&w=majority`;

    try {
        const client = new MongoClient(MONGODB_URI);
        await client.connect();
        // Use the DB_NAME from the config to get the database instance
        db = client.db(DB_NAME);
        console.log('Successfully connected to MongoDB Atlas.');
        return db;
    } catch (ex) {
        console.error('Failed to connect to MongoDB Atlas:', ex);
        throw ex;
    }
}

// --- Collection Access Helper ---
async function getCollection(name) {
    const database = await connectToDb();
    return database.collection(name);
}

// --- CRUD Operations for PlanIt Data ---

// Users (for Login/Auth)
async function getUser(email) {
    const users = await getCollection('users');
    return users.findOne({ email: email });
}

async function getUserByToken(token) {
    const users = await getCollection('users');
    return users.findOne({ token: token });
}

async function addUser(user) {
    const users = await getCollection('users');
    await users.insertOne(user);
}

async function updateUser(user) {
    const users = await getCollection('users');
    // Update the user's document based on their email
    await users.updateOne({ email: user.email }, { $set: user });
}

// Events
async function getEvents(userEmail) {
    const events = await getCollection('events');
    // Find all events belonging to the user
    return events.find({ ownerEmail: userEmail }).toArray();
}

async function addEvent(event) {
    const events = await getCollection('events');
    await events.insertOne(event);
    return event;
}

// Unavailable Times
async function getUnavailableTimes(userEmail) {
    const unavailableTimes = await getCollection('unavailableTimes');
    return unavailableTimes.find({ ownerEmail: userEmail }).toArray();
}

async function addUnavailableTime(time) {
    const unavailableTimes = await getCollection('unavailableTimes');
    await unavailableTimes.insertOne(time);
    return time;
}

async function removeUnavailableTime(userEmail, id) {
    const unavailableTimes = await getCollection('unavailableTimes');
    // Delete by the unique ID (UUID) and ensure it belongs to the user
    const result = await unavailableTimes.deleteOne({ ownerEmail: userEmail, id: id });
    return result.deletedCount;
}

// Export all CRUD functions
module.exports = {
    getUser,
    getUserByToken,
    addUser,
    updateUser,
    getEvents,
    addEvent,
    getUnavailableTimes,
    addUnavailableTime,
    removeUnavailableTime,
};