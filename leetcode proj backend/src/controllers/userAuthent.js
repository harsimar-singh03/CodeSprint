const validate=require('../utils/validator')
const User=require('../models/user')
const bcrypt = require('bcrypt')//will use this for encrypting the password while storing
const jwt=require('jsonwebtoken')//will send to user
const redisClient = require('../config/redis')

const userReply = (user) => ({
        firstName : user.firstName,
        emailId : user.emailId,
        _id : user._id,
        role: user.role
    });

const setAuthCookie = (res, user) => {
    const token = jwt.sign(
        {_id:user._id,emailId:user.emailId,role:user.role},
        process.env.JWT_KEY,
        {expiresIn:60*60}
    );
    res.cookie('token',token,{maxAge:60*60*1000});
}

const register=async (req,res)=>{

    try{ 
        validate(req.body);
        const {firstName,password,emailId}=req.body;

        req.body.password=await bcrypt.hash(password,10);

        req.body.role="user";
        const user = await User.create(req.body)//this line will also prevent duplicate entry with same email as we have given unique for email in schema
        
        const reply = userReply(user);
        setAuthCookie(res, user);
        res.status(200).json({
            user:reply,
            message:"loggin successful"
        })

    }
    catch(err){
        res.status(400).send("Error:"+err)
    }
}


                                         //building the login feature
const login = async (req,res)=>{

    try{
    console.log("Incoming data from React:", req.body);
    const {emailId,password}=req.body;
    if(!emailId)
    {
        throw new Error("email not sent");
    }
    if(!password)
    {
        throw new Error("password not entered");
    }

    const user = await User.findOne({emailId})
    if(!user)
    {
        throw new Error("wrong credentials");
    }
    const match = await bcrypt.compare(password,user.password);

    if(!match)
    {
        throw new Error("wrong credentials");
    }

    const reply = userReply(user);
    setAuthCookie(res, user);
        res.status(200).json({
            user:reply,
            message:"loggin successful"
        })

}
catch(err){
    res.status(401).send("error :"+err)

}




}

const adminLogin = async (req,res)=>{

    try{
    const {emailId,password}=req.body;
    if(!emailId)
    {
        throw new Error("email not sent");
    }
    if(!password)
    {
        throw new Error("password not entered");
    }

    const user = await User.findOne({emailId});
    if(!user || user.role !== "admin")
    {
        throw new Error("wrong admin credentials");
    }

    const match = await bcrypt.compare(password,user.password);

    if(!match)
    {
        throw new Error("wrong admin credentials");
    }

    setAuthCookie(res, user);
        res.status(200).json({
            user:userReply(user),
            message:"admin login successful"
        })

}
catch(err){
    res.status(401).send("error :"+err)

}

}

const logout = async (req,res)=>{
    try {
        
        const {token}=req.cookies;
        const payload =jwt.decode(token);

        await redisClient.set(`token:${token}`,'blocked');
        await redisClient.expireAt(`token:${token}`,payload.exp);

        res.cookie("token",null,{expires:new Date(Date.now())});
        res.send("logged out successfully");
    } catch (err) {
        res.status(401).send("err:simar"+err);
    }
}

const amdinRegister=async (req,res)=>{
    try{ 
        validate(req.body);
        const {firstName,password,emailId}=req.body;

        req.body.password=await bcrypt.hash(password,10);

        req.body.role="admin";
        const user = await User.create(req.body)//this line will also prevent duplicate entry with same email as we have given unique for email in schema
        
        res.status(201).json({user:userReply(user), message:"admin created succesfully"})

    }
    catch(err){
        res.status(400).send("Error:"+err)
    }

}


module.exports={register,login,adminLogin,logout,amdinRegister}
