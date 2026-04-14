import { useState } from "react";
import { motion } from "framer-motion";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState("");

  const addTask = () => {
    if (!input.trim()) return;
    setTasks([...tasks, { id: Date.now(), text: input, done: false }]);
    setInput("");
  };

  const toggleTask = (id) => {
    setTasks(
      tasks.map((t) =>
        t.id === id ? { ...t, done: !t.done } : t
      )
    );
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  return (
    <div className="app">
      <motion.div
        className="glass-container"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1>✨ Task Manager</h1>

        <div className="input-box">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Add a task..."
          />
          <button onClick={addTask}>Add</button>
        </div>

        <div className="task-list">
          {tasks.map((task) => (
            <motion.div
              key={task.id}
              className={`task ${task.done ? "done" : ""}`}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <span onClick={() => toggleTask(task.id)}>
                {task.text}
              </span>

              <button onClick={() => deleteTask(task.id)}>✕</button>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}