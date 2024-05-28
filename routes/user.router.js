const userRouter = require("express").Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const prismaClient = new PrismaClient();

userRouter.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Required details not provided" });
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prismaClient.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });
    res.status(201).json({ message: "User created", user });
  } catch (error) {
    res
      .status(400)
      .json({ error: "User already exists", error: error.message });
  }
});

userRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Required details not provided" });
  try {
    const user = await prismaClient.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user.id }, process.env.SECRET_KEY, {
      expiresIn: "1h",
    });
    res.status(200).json({ message: "Login Successful", token });
  } catch (error) {
    res.status(400).json({ error: "Something wrong", error: error.message });
  }
});

module.exports = userRouter;
