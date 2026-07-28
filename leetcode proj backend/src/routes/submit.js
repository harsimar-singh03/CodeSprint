const express = require('express');
const submitRouter = express.Router();
const userMiddleware = require('../middleware/userMiddleware')
const adminMiddleware = require('../middleware/adminMiddleware')
const {submitCode,runCode,getAllSubmissions,getMySubmissions,getMySubmissionsByProblem} = require('../controllers/userSubmissions');

submitRouter.post('/submit/:id',userMiddleware,submitCode)
submitRouter.post('/run/:id',userMiddleware,runCode)
submitRouter.get('/my',userMiddleware,getMySubmissions)
submitRouter.get('/my/:problemId',userMiddleware,getMySubmissionsByProblem)
submitRouter.get('/all',adminMiddleware,getAllSubmissions)

module.exports =submitRouter;
