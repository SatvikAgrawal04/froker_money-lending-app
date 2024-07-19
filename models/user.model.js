import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  dateOfRegistration: {
    type: Date,
    default: Date.now,
  },
  dob: {
    type: Date,
    required: true,
  },
  monthlySalary: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["approved", "rejected", "pending"],
    default: "pending",
  },
  purchasePower: {
    type: Number,
    default: 0,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
});

const User = mongoose.model("User", userSchema);
export default User;
