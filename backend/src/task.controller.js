const taskService = require("./task.service");

// GET
const getTasks = async (req, res) => {
  const tasks = await taskService.getTasks();
  res.json({ tasks });
};

// POST
const createTask = async (req, res) => {
  const task = await taskService.createTask(req.body);
  res.status(201).json(task);
};

// PUT
const updateTask = async (req, res) => {
  const task = await taskService.updateTask(req.params.id, req.body);
  res.json(task);
};

// DELETE
const deleteTask = async (req, res) => {
  await taskService.deleteTask(req.params.id);
  res.json({ message: "Deleted successfully" });
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask
};