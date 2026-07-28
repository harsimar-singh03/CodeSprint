const express = require('express');
const aiRouter = express.Router();
const userMiddleware = require('../middleware/userMiddleware');
const { getAiHelp } = require('../controllers/aiHelp');

aiRouter.post('/help', userMiddleware, getAiHelp);

module.exports = aiRouter;
