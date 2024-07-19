import dotenv, { config } from "dotenv";
import mongoose from "mongoose";
import express from "express";
import userRouter from "./routes/user.routes.js";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

dotenv.config({
  path: "./.env",
});

const app = express();
app.use(bodyParser.json());
app.use(cookieParser());

//ROUTES
app.use("/api", userRouter);

// MONGOOSE CONNECTION
const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/money-lending-app`
    );

    console.log(
      `\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`
    );
    app.on("error", (error) => {
      console.log("ERROR: ", error);
      throw error;
    });

    app.listen(process.env.PORT, () => {
      console.log(`listening on ${process.env.PORT}`);
    });
  } catch (error) {
    console.log("MONDO_DB connection error: ", error);
    process.exit(1);
  }
};

connectDB();
