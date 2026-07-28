const express =require('express')
const userMiddleware=require('../middleware/userMiddleware')
const authRouter = express.Router()   //used to create a separate group of routes, usually for a specific feature like authentication.
const adminMiddleware=require('../middleware/adminMiddleware')
const {register,login,adminLogin,logout,amdinRegister}=require("../controllers/userAuthent")

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/admin/login', adminLogin);
authRouter.post('/logout',userMiddleware,logout);
authRouter.post('/admin/register',adminMiddleware ,amdinRegister);
authRouter.get('/check',userMiddleware,(req,res)=>{
    const reply ={
        firstName: req.result.firstName,
        emailId : req.result.emailId,
        _id : req.result._id,
        role: req.result.role
    }

    res.json({user:reply,message:"valid user"});
});

//authRouter.get('getProfile',getProfile);

module.exports=authRouter;

