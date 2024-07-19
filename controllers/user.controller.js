import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { ApiError } from "../utils/ApiError.js";

//Function to calculate age
const calculateAge = (dob) => {
  const difference = Date.now() - new Date(dob).getTime();
  const age = new Date(difference).getUTCFullYear() - 1970;
  return age;
};

//Function to generate access token and refresh token from user id
const generateAccessAndRefreshToken = async (userId) => {
  console.log("generating tokens...");
  try {
    const user = await User.findById(userId);
    console.log(user);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    console.log(accessToken, refreshToken);

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    // throw new ApiError(
    //   500,
    //   "something went wrong while generating request and access token"
    // );
    res.status(500).json({
      message: error.message,
    });
  }
};

//SIGNUP API
const signup = async (req, res) => {
  const { phoneNumber, email, name, dob, monthlySalary, password } = req.body;

  const age = calculateAge(dob);
  if (age <= 20) throw new ApiError(400, "User must be above 20 years old");
  if (monthlySalary < 25000)
    throw new ApiError(400, "Monthly Salary must be at least 25000");

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      phoneNumber,
      email,
      name,
      dob,
      monthlySalary,
      password: hashedPassword,
      status: "approved", // User application status is approved
      purchasePower: monthlySalary * 5, // Assuming purchase power of user would be 5 times their monthly salary
    });

    await newUser.save();
    res
      .status(200)
      .json({ message: "User registered successfully", user: newUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }

  console.log(req.body);

  /*
  {
    "phoneNumber": "3428234234",
    "email": "bkjsabf@bkajsf.com",
    "name": "John Doe",
    "dob": "12/11/1981",
    "monthlySalary": 30000,
    "password": "abc123"
}
  */
};

//LOGIN API
const login = async (req, res) => {
  const { email, password } = req.body;
  console.log(email, password);
  if (!email) {
    // console.log("Email not provided");
    throw new ApiError(400, "Email is required");
  }
  const user = await User.findOne({ email });
  if (!user) {
    // console.log("User not found");
    throw new ApiError(404, "User not found");
  }

  const isCorrect = await bcrypt.compare(password, user.password);
  if (!isCorrect) {
    throw new ApiError(400, "Invalid Password");
    // console.log("Invalid Password");
  }
  console.log("password verified");
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );
  console.log(`access token:${accessToken}\nrefresh token: ${refreshToken}`);

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  console.log(loggedInUser);

  const options = {
    httpOnly: true,
    secure: true,
  };

  console.log("created options");
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json({
      user: loggedInUser,
      accessToken,
      refreshToken,
      message: "User logged in successfully",
    });
};

// SHOW USER DATA API

const getUserData = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { signup, login, getUserData };
