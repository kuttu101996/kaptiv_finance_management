const categoryRouter = require("express").Router();
const authenticateToken = require("../middleware/authentication.middleware");
const { PrismaClient } = require("@prisma/client");
const prismaClient = new PrismaClient();

categoryRouter.post("/categories", authenticateToken, async (req, res) => {
  const { name } = req.body;
  const userId = req.user.userId;

  if (!["GROCERIES", "RENT", "ENTERTAINMENT"].includes(name)) {
    return res.status(400).json({ error: "Invalid category name" });
  }

  try {
    const category = await prismaClient.category.create({
      data: {
        name,
        userId,
      },
    });
    res.status(201).json({ message: "Success", category });
  } catch (error) {
    res.status(400).json({ message: "Error Occured", error: error.message });
  }
});

categoryRouter.get("/categories", authenticateToken, async (req, res) => {
  const userId = req.user.userId;

  try {
    const categories = await prismaClient.category.findMany({
      where: { userId },
    });
    res.status(201).json({ message: "Success", categories });
  } catch (error) {
    res.status(400).json({ message: "Error Occured", error: error.message });
  }
});

categoryRouter.put("/categories/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const userId = req.user.userId;

  // Ensure the category name is valid
  if (!["GROCERIES", "RENT", "ENTERTAINMENT"].includes(name)) {
    return res.status(400).json({ error: "Invalid category name" });
  }

  try {
    const category = await prismaClient.category.updateMany({
      where: { id: parseInt(id), userId },
      data: { name },
    });
    res.status(200).json({ message: "Success", category });
  } catch (error) {
    res.status(400).json({ message: "Error Occured", error: error.message });
  }
});

categoryRouter.delete(
  "/categories/:id",
  authenticateToken,
  async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;

    try {
      await prismaClient.category.deleteMany({
        where: { id: parseInt(id), userId },
      });
      res.status(204).send({ message: "Success" });
    } catch (error) {
      res.status(400).json({ message: "Error Occured", error: error.message });
    }
  }
);

module.exports = categoryRouter;
