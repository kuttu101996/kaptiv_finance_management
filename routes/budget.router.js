const budgetRouter = require("express").Router();
const authenticateToken = require("../middleware/authentication.middleware");
const { PrismaClient } = require("@prisma/client");
const prismaClient = new PrismaClient();

function parseAndFormatDate(dateString) {
  const [day, month, year] = dateString.split("/");
  return `${year}-${month}-${day}T00:00:00.000Z`;
}

budgetRouter.post("/budgets", authenticateToken, async (req, res) => {
  let { categoryId, amount, startDate, endDate } = req.body;
  if (!categoryId || !amount || !startDate || !endDate)
    return res.status(400).json({ message: "Required fields missing" });
  const userId = req.user.userId;

  try {
    categoryId = parseInt(categoryId);
    amount = parseInt(amount);
    startDate = parseAndFormatDate(startDate);
    endDate = parseAndFormatDate(endDate);

    const budget = await prismaClient.budget.create({
      data: {
        userId,
        categoryId,
        amount,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
    });
    res.status(201).json({ message: "Success", budget });
  } catch (error) {
    res.status(500).json({ message: "Error occured", error: error.message });
  }
});

budgetRouter.get("/budgets", authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  try {
    const budgets = await prismaClient.budget.findMany({ where: { userId } });
    res.status(201).json({ message: "Success", budgets });
  } catch (error) {
    res.status(500).json({ message: "Error occured", error: error.message });
  }
});

budgetRouter.put("/budgets/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  let { categoryId, amount, startDate, endDate } = req.body;
  const userId = req.user.userId;

  startDate = parseAndFormatDate(startDate);
  endDate = parseAndFormatDate(endDate);

  try {
    const budget = await prismaClient.budget.updateMany({
      where: { id: parseInt(id), userId },
      data: {
        categoryId,
        amount,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
    });
    res.status(200).json({ message: "Success", budget });
  } catch (error) {
    res.status(400).json({ message: "Error Occured", error: error.message });
  }
});

budgetRouter.delete("/budgets/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;
  try {
    await prismaClient.budget.deleteMany({
      where: { id: parseInt(id), userId },
    });
    res.status(204).send({ message: "Success" });
  } catch (error) {
    res.status(400).json({ message: "Error Occured", error: error.message });
  }
});

module.exports = budgetRouter;
