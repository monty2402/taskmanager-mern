import { useEffect, useState } from "react";
import TaskList from "./components/TaskList";

const API_URL = "http://localhost:5000/api/tasks";

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");

  // GET
  const fetchTasks = async () => {
    const res = await fetch(API_URL);
    const data = await res.json();
    setTasks(data.tasks);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // CREATE
  const addTask = async (e) => {
    e.preventDefault();

    if (!title.trim()) return;

    await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ title })
    });

    setTitle("");
    fetchTasks();
  };

  // DELETE
  const deleteTask = async (id) => {
    await fetch(`${API_URL}/${id}`, {
      method: "DELETE"
    });

    fetchTasks();
  };

  // TOGGLE STATUS
  const toggleTask = async (task) => {
    const newStatus =
      task.status === "done" ? "pending" : "done";

    await fetch(`${API_URL}/${task._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ status: newStatus })
    });

    fetchTasks();
  };

  return (
    <div className="container">
      <h1>Task Manager 🚀</h1>

      {/* CREATE */}
      <form onSubmit={addTask} className="glass">
        <input
          placeholder="Add task..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button>Add</button>
      </form>

      {/* LIST */}
      <TaskList
        tasks={tasks}
        onToggle={toggleTask}
        onDelete={deleteTask}
      />
    </div>
  );
}

export default App;