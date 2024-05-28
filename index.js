const express = require("express");
const { PrismaClient } = require("@prisma/client");
const authenticateToken = require("./middleware/authentication.middleware");
require("dotenv").config();

const transactionRouter = require("./routes/transaction.router");
const userRouter = require("./routes/user.router");
const categoryRouter = require("./routes/category.router");
const budgetRouter = require("./routes/budget.router");

const app = express();
app.use(express.json());

const prismaClient = new PrismaClient();

app.get("/", (req, res) => {
  return res.send({ message: "Hello from server!" });
});

app.use("/user", userRouter);
app.use("/transaction", transactionRouter);
app.use("/category", categoryRouter);
app.use("/budget", budgetRouter);

// Monthly financial reports
app.get("/reports/monthly", authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const { month, year } = req.query;

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  try {
    const transactions = await prismaClient.transaction.findMany({
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
      },
    });

    const income = transactions
      .filter((t) => t.type === "INCOME")
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions
      .filter((t) => t.type === "EXPENSE")
      .reduce((sum, t) => sum + t.amount, 0);

    res.status(200).json({
      message: "Success",
      data: {
        income,
        expenses,
        balance: income - expenses,
        transactions,
      },
    });
  } catch (error) {
    res.status(400).json({ message: "Error Occured", error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
