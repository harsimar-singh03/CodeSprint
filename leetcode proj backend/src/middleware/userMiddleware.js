const jwt = require('jsonwebtoken');
const redisClient = require('../config/redis');
const User = require('../models/user');

const userMiddleware = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      throw new Error("token absent");
    }

    const payload = jwt.verify(token, process.env.JWT_KEY);
    const { _id } = payload;

    if (!_id) {
      throw new Error("Invalid token");
    }

    const result = await User.findById(_id);
    if (!result) {
      throw new Error("User Doesn't Exist");
    }

    const isBlocked = await redisClient.exists(`token:${token}`);
    if (isBlocked) {
      throw new Error("Invalid Token");
    }

    req.result = result;
    next();
  } 
    catch (err) {
    console.log("err:sim", err);
    return res.status(401).send("ERR:sim " + err.message);
  }
};

module.exports = userMiddleware;
