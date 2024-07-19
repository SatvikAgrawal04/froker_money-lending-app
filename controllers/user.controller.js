import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const calculateAge = (dob) => {
  const difference = Date.now() - new Date(dob).getTime();
  const age = new Date(difference).getUTCFullYear() - 1970;
  return age;
};

export const signup = async (req, res) => {};
