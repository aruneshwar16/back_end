const express = require("express");
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(express.json());

const PORT = 8000;

// MongoDB connection URL (updated with the database name)
const mongourl = "mongodb+srv://aruneshwar:aruneshwar16@cluster0.q953g.mongodb.net/test";

// MongoDB connection
mongoose
  .connect(mongourl)
  .then(() => {
    console.log("DB Connected");
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("DB connection error:", err);
  });

const expenseSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  amount: { type: Number, required: true, min: 1 },
});

// Explicitly define the collection name as "Expense-Tracker"
const Expense = mongoose.model("Expense-Tracker", expenseSchema);

// Create Expense
app.post("/api/expenses", async (req, res) => {
  try {
    const { title, amount } = req.body;

    // Validate the input data
    if (!title || !amount || amount <= 0) {
      return res.status(400).json({ message: "Valid Title and Amount are required" });
    }

    // Create a new expense record
    const newExpense = new Expense({
      id: uuidv4(),
      title: title,
      amount: amount,
    });

    // Save the new expense to the database
    const savedExpense = await newExpense.save();
    res.status(200).json(savedExpense);
  } catch (error) {
    res.status(500).json({ message: "Error saving expense", error: error.message });
  }
});

// Get Expense by ID
app.get("/api/expensesbyId/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await Expense.findOne({ id });

    if (expense) {
      res.status(200).json(expense);
    } else {
      res.status(404).json({ message: "Expense not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching expense", error: error.message });
  }
});

// Update Expense
app.put("/api/expensesUpdate/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Update the expense record
    const updatedExpense = await Expense.findOneAndUpdate(
      { id },
      updates,
      { new: true }
    );

    if (updatedExpense) {
      res.status(200).json(updatedExpense);
    } else {
      res.status(404).json({ message: "Expense not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error updating expense", error: error.message });
  }
});

// Delete Expense by ID
app.delete("/api/expensesdeletebyId/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Expense.deleteOne({ id });

    if (result.deletedCount > 0) {
      res.status(200).json({ message: "Expense deleted successfully" });
    } else {
      res.status(404).json({ message: "Expense not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error deleting expense", error: error.message });
  }
});