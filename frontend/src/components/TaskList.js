import React from "react";
import TaskItem from "./TaskItem";

const TaskList = ({ tasks, onComplete, onDelete }) => {
  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onComplete={onComplete}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
};

export default TaskList;
