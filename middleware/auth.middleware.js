import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const verifyJWT = async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      res.send(401).json({ message: "Unauthorized request" });
      return;
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken "
    );

    if (!user) {
      res.send(401).json({ message: "Invalid access token" });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res
      .send(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

export default verifyJWT;
