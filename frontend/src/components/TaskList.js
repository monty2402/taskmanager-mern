import React from "react";
import TaskItem from "./TaskItem";

const TaskList = ({ tasks, onToggle, onDelete }) => {
  if (!tasks.length) return <p>No tasks yet 🚀</p>;

  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <TaskItem
          key={task._id}
          task={task}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
};

export default TaskList;