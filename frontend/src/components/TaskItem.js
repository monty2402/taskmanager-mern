import React from "react";

const TaskItem = ({ task, onComplete, onDelete }) => {
  return (
    <li className={`task-card ${task.completed ? "completed" : ""}`}>
      <span className="task-title">{task.title}</span>
      <div className="task-buttons">
        <button className="complete-btn" onClick={() => onComplete(task.id)}>
          ✅
        </button>
        <button className="delete-btn" onClick={() => onDelete(task.id)}>
          ❌
        </button>
      </div>
    </li>
  );
};

export default TaskItem;