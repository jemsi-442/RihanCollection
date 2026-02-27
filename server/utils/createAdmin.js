import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

dotenv.config();

await mongoose.connect(process.env.MONGODB_URI);

const createAdmin = async () => {
  const email = "admin@ramla.com";

  const exists = await User.findOne({ email });
  if (exists) {
    console.log("Admin already exists");
    process.exit();
  }

  const hashed = await bcrypt.hash("admin123", 10);

  await User.create({
    name: "Ramla Admin",
    email,
    password: hashed,
    role: "admin",
  });

  console.log("Admin created successfully");
  process.exit();
};

createAdmin();
