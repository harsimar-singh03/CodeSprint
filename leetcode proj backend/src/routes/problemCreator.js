
const express =require('express')
const problemRouter = express.Router()   
const adminMiddleware=require('../middleware/adminMiddleware')
const {createProblem,updateProblem,deleteProblem,getProblemById,getAllProblem,solvedAllProblemByUser} = require('../controllers/userProblem');
const userMiddleware=require('../middleware/userMiddleware')

problemRouter.post("/create",adminMiddleware, createProblem);
problemRouter.delete("/delete/:id",adminMiddleware, deleteProblem);
problemRouter.put("/update/:id",adminMiddleware, updateProblem);
//above apis require adminMiddleware

problemRouter.get("/problemSolvedByuser",userMiddleware, solvedAllProblemByUser);
problemRouter.get("/problemById/:id",userMiddleware, getProblemById);
problemRouter.get("/getAllProblem",userMiddleware, getAllProblem);

module.exports = problemRouter;