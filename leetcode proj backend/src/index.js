const express = require('express')
require('dotenv').config() // I want to use values from .env file

const app = express()

// 1. IMPORT DEPENDENCIES
const cors = require("cors")
const cookieParser = require('cookie-parser')
const redisClient = require('./config/redis');
const main = require('./config/db')

// 2. IMPORT ROUTERS
const authRouter = require('./routes/userauth')
const problemRouter = require('./routes/problemCreator')
const submitRouter = require('./routes/submit')
const aiRouter = require('./routes/aiHelp')


// ==========================================
// 3. GLOBAL MIDDLEWARE (MUST COME BEFORE ROUTES)
// ==========================================

// Enable CORS first so the browser doesn't block the request
app.use(cors({
    origin: 'http://localhost:5173', // Changed from https to http
    credentials: true // Required to allow cookies (JWT) to pass through
}))

// Convert data from json to javascript format
app.use(express.json()); 

// Helper that helps the backend READ cookies sent by the browser.
app.use(cookieParser())


// ==========================================
// 4. ROUTES
// ==========================================
app.use('/user', authRouter);
app.use('/problem', problemRouter);
app.use('/submission', submitRouter);
app.use('/ai', aiRouter);


// ==========================================
// 5. INITIALIZE CONNECTION & START SERVER
// ==========================================
const InitalizeConnection = async () => {
    try {
        // main --> connect to DB, and redisClient.connect() --> connects to redis DB
        await Promise.all([main(), redisClient.connect()]);
        console.log("DB Connected");

        app.listen(process.env.PORT, () => {
            console.log("Server listening at port number: " + process.env.PORT);
        })
    } catch (err) {
        console.log("error occured", err);
    }
}

InitalizeConnection();
