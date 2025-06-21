import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import "./index.css";

const sectionTitles = {
  work: "Work",
  personal: "Personal",
};

const columnTitles = {
  todo: "To Do",
  inprogress: "In Progress",
  done: "Done",
};

const initialData = {
  work: {
    todo: [],
    inprogress: [],
    done: [],
  },
  personal: {
    todo: [],
    inprogress: [],
    done: [],
  },
};

function App() {
  const [data, setData] = useState(initialData);
  const [taskText, setTaskText] = useState("");
  const [section, setSection] = useState("work");
  const [darkMode, setDarkMode] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const addTask = () => {
    if (!taskText.trim()) return;
    const newTask = {
      id: `${section}-${Date.now()}`,
      content: taskText,
    };
    setData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        todo: [...prev[section].todo, newTask],
      },
    }));
    setTaskText("");
  };

  const deleteTask = (sectionId, columnId, taskId) => {
    setTimeout(() => {
      setData((prev) => {
        const updatedItems = prev[sectionId][columnId].filter(
          (task) => task.id !== taskId
        );
        return {
          ...prev,
          [sectionId]: {
            ...prev[sectionId],
            [columnId]: updatedItems,
          },
        };
      });
    }, 200);
  };

  const onDragEnd = (result) => {
    setIsDragging(false);
    const { source, destination } = result;
    if (!destination) return;

    const [fromSection, fromColumn] = source.droppableId.split("-");
    const [toSection, toColumn] = destination.droppableId.split("-");

    setData((prevData) => {
      const newData = { ...prevData };
      const sourceTasks = Array.from(newData[fromSection][fromColumn]);
      const [movedTask] = sourceTasks.splice(source.index, 1);

      if (fromSection === toSection && fromColumn === toColumn) {
        sourceTasks.splice(destination.index, 0, movedTask);
        newData[fromSection][fromColumn] = sourceTasks;
      } else {
        const destTasks = Array.from(newData[toSection][toColumn]);
        destTasks.splice(destination.index, 0, movedTask);
        newData[fromSection][fromColumn] = sourceTasks;
        newData[toSection][toColumn] = destTasks;
      }

      return newData;
    });
  };

  return (
    <div className={`${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"} min-h-screen p-4`}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-center w-full">Focus Frame</h1>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="ml-4 px-3 py-1 text-sm rounded border border-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          {darkMode ? "🌙 " : "🌞 "}

        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
        <input
          type="text"
          value={taskText}
          onChange={(e) => setTaskText(e.target.value)}
          placeholder="Enter a task"
          className={`p-2 border rounded w-full sm:w-64 ${darkMode ? "bg-gray-800 text-white border-gray-600" : ""}`}
        />
        <select
          value={section}
          onChange={(e) => setSection(e.target.value)}
          className={`p-2 border rounded ${darkMode ? "bg-gray-800 text-white border-gray-600" : ""}`}
        >
          {Object.keys(sectionTitles).map((sec) => (
            <option key={sec} value={sec}>
              {sectionTitles[sec]}
            </option>
          ))}
        </select>
        <button
          onClick={addTask}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add
        </button>
      </div>

      <DragDropContext
        onDragStart={() => setIsDragging(true)}
        onDragEnd={onDragEnd}
      >
        <div className="flex flex-col gap-6">
          {Object.entries(data).map(([sectionId, columns]) => (
            <div
              key={sectionId}
              className={`p-4 rounded-lg border shadow-md ${
                sectionId === "work"
                  ? "bg-blue-50 border-blue-200 dark:bg-blue-900"
                  : "bg-green-50 border-green-200 dark:bg-green-900"
              }`}
            >
              <h2 className={`text-2xl font-bold mb-4 ${sectionId === "work" ? "text-blue-800 dark:text-blue-200" : "text-green-800 dark:text-green-200"}`}>
                {sectionTitles[sectionId]}
              </h2>
              <div className="grid sm:grid-cols-3 gap-4">
                {Object.entries(columns).map(([columnId, tasks]) => (
                  <Droppable
                    key={columnId}
                    droppableId={`${sectionId}-${columnId}`}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`rounded p-3 min-h-[200px] transition-colors duration-200 ${
                          snapshot.isDraggingOver
                            ? "bg-yellow-200 dark:bg-yellow-700"
                            : darkMode
                            ? "bg-gray-800 border border-gray-700"
                            : "bg-white"
                        }`}
                      >
                        <h3 className="text-lg font-semibold text-center mb-2">
                          {columnTitles[columnId]}
                        </h3>
                        {tasks.map((task, index) => (
                          <Draggable
                            key={task.id}
                            draggableId={task.id}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`p-2 mb-2 rounded flex justify-between items-center text-sm shadow-md ${
                                  snapshot.isDragging
                                    ? "bg-blue-200 dark:bg-blue-800"
                                    : darkMode
                                    ? "bg-gray-700 text-white"
                                    : "bg-gray-100"
                                }`}
                              >
                                <span>{task.content}</span>
                                <button
                                  disabled={isDragging}
                                  onClick={() => deleteTask(sectionId, columnId, task.id)}
                                  className={`text-red-500 text-xs ${isDragging ? "opacity-50 cursor-not-allowed" : "hover:underline"}`}
                                >
                                  ❌
                                </button>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}

export default App;