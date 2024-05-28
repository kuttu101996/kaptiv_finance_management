const transactionRouter = require("express").Router();
const authenticateToken = require("../middleware/authentication.middleware");
const { PrismaClient } = require("@prisma/client");
const prismaClient = new PrismaClient();

function parseAndFormatDate(dateString) {
  const [day, month, year] = dateString.split("/");
  return `${year}-${month}-${day}T00:00:00.000Z`;
}

transactionRouter.post("/transactions", authenticateToken, async (req, res) => {
  let { amount, date, type, categoryId, description } = req.body;
  if (!categoryId || !amount || !type)
    return res.status(400).json({ message: "Required fields missing" });
  const userId = req.user.userId;

  if (!["INCOME", "EXPENSE"].includes(type)) {
    return res.status(400).json({ error: "Transaction type Invalid" });
  }

  date = parseAndFormatDate(date);
  amount = parseInt(amount);
  categoryId = parseInt(categoryId);
  try {
    const transaction = await prismaClient.transaction.create({
      data: {
        amount,
        date,
        type,
        categoryId,
        description,
        userId,
      },
    });
    res.status(201).json({ message: "Success", transaction });
  } catch (error) {
    res.status(400).json({ message: "Error Occured", error: error.message });
  }
});

transactionRouter.get("/transactions", authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  try {
    const transactions = await prismaClient.transaction.findMany({
      where: { userId },
    });
    res.status(200).json({ message: "Success", transactions });
  } catch (error) {
    res.status(400).json({ message: "Error Occured", error: error.message });
  }
});

transactionRouter.put(
  "/transactions/:id",
  authenticateToken,
  async (req, res) => {
    const { id } = req.params;
    const { amount, date, type, categoryId, description } = req.body;
    const userId = req.user.userId;

    try {
      const transaction = await prismaClient.transaction.updateMany({
        where: { id: parseInt(id), userId },
        data: { amount, date: new Date(date), type, categoryId, description },
      });
      res.status(200).json({ message: "Success", transaction });
    } catch (error) {
      res.status(400).json({ message: "Error Occured", error: error.message });
    }
  }
);

transactionRouter.delete(
  "/transactions/:id",
  authenticateToken,
  async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;
    try {
      await prismaClient.transaction.deleteMany({
        where: { id: parseInt(id), userId },
      });
      res.status(204).send({ message: "Success" });
    } catch (error) {
      res.status(400).json({ message: "Error Occured", error: error.message });
    }
  }
);

module.exports = transactionRouter;
