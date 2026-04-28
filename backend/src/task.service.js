const Task = require("./task.model");

// CREATE
const createTask = async (data) => {
  return await Task.create(data);
};

// READ ALL
const getTasks = async () => {
  return await Task.find().sort({ createdAt: -1 });
};

// UPDATE
const updateTask = async (id, data) => {
  return await Task.findByIdAndUpdate(id, data, { new: true });
};

// DELETE
const deleteTask = async (id) => {
  return await Task.findByIdAndDelete(id);
};

module.exports = {
  createTask,
  getTasks,
  updateTask,
  deleteTask
};