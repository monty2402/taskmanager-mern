import React from "react";

const TaskItem = ({ task, onToggle, onDelete }) => {
  return (
    <li className="task-card">
      <div>
        <span className="task-title">{task.title}</span>
        <p className="task-desc">{task.description}</p>

        <span className={`status ${task.status}`}>
          {task.status}
        </span>
      </div>

      <div className="task-buttons">
        <button
          className="complete-btn"
          onClick={() => onToggle(task)}
        >
          🔄
        </button>

        <button
          className="delete-btn"
          onClick={() => onDelete(task._id)}
        >
          ❌
        </button>
      </div>
    </li>
  );
};

export default TaskItem;