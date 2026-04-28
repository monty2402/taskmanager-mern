require('dotenv').config({ path: './.env' });
const express = require("express");
const Task = require('./src/task.model');
const cors = require("cors");

const connectDB = require('./src/config/db');
const taskRoutes = require("./src/task.routes");

const app = express();

app.use(cors());
app.use(express.json());

// 👇 THIS IS CRITICAL
connectDB();
app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
  console.log("MONGO_URI:", process.env.MONGO_URI);
});

app.get("/", (req, res) => {
  res.send("API Running 🚀");
});

app.post('/api/tasks', async (req, res) => {
  try {

    const task = new Task(req.body);
    await task.save();

    res.status(201).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create task" });
  }
});

app.use("/api/tasks", taskRoutes);

module.exports = app;