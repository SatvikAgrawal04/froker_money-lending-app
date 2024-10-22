import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

//Function to calculate age
const calculateAge = (dob) => {
  const difference = Date.now() - new Date(dob).getTime();
  const age = new Date(difference).getUTCFullYear() - 1970;
  return age;
};

// function to convert date string to dd-mm-yyyy format
function formatDate(dateString) {
  const date = new Date(dateString);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  const formattedDate = `${day}-${month}-${year}`;

  return formattedDate;
}

//Function to generate access token and refresh token from user id
const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error occurred while generating tokens", error });
  }
};

//SIGNUP API
const signup = async (req, res) => {
  const { phoneNumber, email, name, dob, monthlySalary, password } = req.body;

  const age = calculateAge(dob);
  if (age <= 20) {
    res.status(200).json({ message: "You must be older than 20 to sign up." });
    return;
  }

  if (monthlySalary < 25000) {
    res.status(200).json({ message: "Monthly salary must be at least 25000" });
    return;
  }

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
    res.status(500).json({ message: "Error During SignUp", error });
  }
};

//LOGIN API
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email) {
      res.status(400).json({ message: "Email is required" });
      return;
    }
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: "User not Found" });
      return;
    }

    const isCorrect = await bcrypt.compare(password, user.password);
    if (!isCorrect) {
      res.status(400).json({ message: "Invalid Password" });
      return;
    }
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user._id
    );

    const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    const options = {
      httpOnly: true,
      secure: true,
    };

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
  } catch (error) {
    res.status(500).json({ message: "Error during login", error });
  }
};

// SHOW USER DATA API
const getUserData = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "-password -refreshToken"
    );
    const {
      purchasePower,
      phoneNumber,
      email,
      dateOfRegistration,
      dob,
      monthlySalary,
    } = user;

    const Date_of_Registration = formatDate(dateOfRegistration);
    const DOB = formatDate(dob);

    res.status(200).json({
      purchasePower,
      phoneNumber,
      email,
      Date_of_Registration,
      DOB,
      monthlySalary,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// BORROW MONEY API
const borrowMoney = async (req, res) => {
  try {
    const { amount, tenure } = req.body;
    const user = await User.findById(req.user._id);
    const interest = 0.08;
    const monthlyRepayment = (amount * (1 + interest)) / tenure;
    user.purchasePower -= amount;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      message: "Money borrowed Successfully",
      newPurchasePower: user.purchasePower,
      monthlyRepayment,
    });
  } catch (error) {
    res.status(500).json({ message: "Error During borrowing money", error });
  }
};

// REFRESH ACCESS TOKEN

const refreshAccessToken = async (req, res) => {
  try {
    const incomingRefreshToken =
      req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
      res.status(401).json({ message: "unauthorized request" });
      return;
    }

    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      res.status(401).json({ message: "Invalid Refresh Token" });
      return;
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      res.status(401).json({ message: "Invalid Refresh Token" });
      return;
    }

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(accessToken, newRefreshToken);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error occurred while refreshing token", error });
  }
};

export { signup, login, getUserData, borrowMoney };
