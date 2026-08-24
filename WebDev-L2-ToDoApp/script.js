const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const inputMessage = document.getElementById("inputMessage");

const pendingList = document.getElementById("pendingList");
const completedList = document.getElementById("completedList");

const pendingEmpty = document.getElementById("pendingEmpty");
const completedEmpty = document.getElementById("completedEmpty");

const pendingCount = document.getElementById("pendingCount");
const completedCount = document.getElementById("completedCount");

const pendingTotal = document.getElementById("pendingTotal");
const completedTotal = document.getElementById("completedTotal");
const allTasksTotal = document.getElementById("allTasksTotal");

const currentDate = document.getElementById("currentDate");

const STORAGE_KEY = "tasknest-tasks";

let tasks = loadTasks();

/* ---------------------------------
   Date
---------------------------------- */

function setCurrentDate() {
    const today = new Date();

    currentDate.textContent = today.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

/* ---------------------------------
   Local Storage
---------------------------------- */

function saveTasks() {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(tasks)
    );
}

function loadTasks() {
    const savedTasks = localStorage.getItem(STORAGE_KEY);

    if (!savedTasks) {
        return [];
    }

    try {
        const parsedTasks = JSON.parse(savedTasks);

        return Array.isArray(parsedTasks)
            ? parsedTasks
            : [];
    } catch (error) {
        return [];
    }
}

/* ---------------------------------
   Helpers
---------------------------------- */

function generateTaskId() {
    return `${Date.now()}-${Math.random()
        .toString(16)
        .slice(2)}`;
}

function formatTimestamp(timestamp) {
    const date = new Date(timestamp);

    return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function sanitizeTaskText(text) {
    return text.trim().replace(/\s+/g, " ");
}

function showMessage(message) {
    inputMessage.textContent = message;
}

function clearMessage() {
    inputMessage.textContent = "";
}

/* ---------------------------------
   Add Task
---------------------------------- */

function addTask() {
    const taskText = sanitizeTaskText(taskInput.value);

    clearMessage();

    if (!taskText) {
        showMessage("Please enter a task before adding.");
        taskInput.focus();
        return;
    }

    const newTask = {
        id: generateTaskId(),
        text: taskText,
        completed: false,
        createdAt: new Date().toISOString(),
        completedAt: null
    };

    tasks.unshift(newTask);

    saveTasks();
    renderTasks();

    taskInput.value = "";
    taskInput.focus();
}

/* ---------------------------------
   Complete / Incomplete
---------------------------------- */

function toggleTask(taskId) {
    tasks = tasks.map((task) => {
        if (task.id !== taskId) {
            return task;
        }

        const isNowCompleted = !task.completed;

        return {
            ...task,
            completed: isNowCompleted,
            completedAt: isNowCompleted
                ? new Date().toISOString()
                : null
        };
    });

    saveTasks();
    renderTasks();
}

/* ---------------------------------
   Delete
---------------------------------- */

function deleteTask(taskId) {
    tasks = tasks.filter(
        (task) => task.id !== taskId
    );

    saveTasks();
    renderTasks();
}

/* ---------------------------------
   Edit
---------------------------------- */

function startEdit(taskId) {
    const taskCard = document.querySelector(
        `[data-task-id="${taskId}"]`
    );

    if (!taskCard) {
        return;
    }

    const task = tasks.find(
        (item) => item.id === taskId
    );

    if (!task) {
        return;
    }

    const contentContainer =
        taskCard.querySelector(".task-content");

    const actionsContainer =
        taskCard.querySelector(".task-actions");

    contentContainer.innerHTML = `
        <input
            class="edit-input"
            type="text"
            maxlength="120"
            value="${escapeAttribute(task.text)}"
            aria-label="Edit task"
        >
    `;

    actionsContainer.innerHTML = `
        <button
            class="action-btn save-btn"
            type="button"
            data-action="save"
        >
            Save
        </button>

        <button
            class="action-btn cancel-btn"
            type="button"
            data-action="cancel"
        >
            Cancel
        </button>
    `;

    const editInput =
        taskCard.querySelector(".edit-input");

    editInput.focus();
    editInput.select();
}

function saveEditedTask(taskId) {
    const taskCard = document.querySelector(
        `[data-task-id="${taskId}"]`
    );

    if (!taskCard) {
        return;
    }

    const editInput =
        taskCard.querySelector(".edit-input");

    const updatedText =
        sanitizeTaskText(editInput.value);

    if (!updatedText) {
        editInput.focus();
        return;
    }

    tasks = tasks.map((task) => {
        if (task.id === taskId) {
            return {
                ...task,
                text: updatedText
            };
        }

        return task;
    });

    saveTasks();
    renderTasks();
}

/* ---------------------------------
   HTML Escaping
---------------------------------- */

function escapeHTML(text) {
    return text
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function escapeAttribute(text) {
    return escapeHTML(text);
}

/* ---------------------------------
   Task Card
---------------------------------- */

function createTaskCard(task) {
    const taskCard = document.createElement("article");

    taskCard.className = task.completed
        ? "task-card completed"
        : "task-card";

    taskCard.dataset.taskId = task.id;

    const completedMeta = task.completedAt
        ? `
            <span>
                Completed:
                ${formatTimestamp(task.completedAt)}
            </span>
        `
        : "";

    taskCard.innerHTML = `
        <div class="task-main">

            <button
                type="button"
                class="complete-toggle"
                data-action="toggle"
                aria-label="${
                    task.completed
                        ? "Mark task as pending"
                        : "Mark task as complete"
                }"
            >
                ✓
            </button>

            <div class="task-content">

                <p class="task-text">
                    ${escapeHTML(task.text)}
                </p>

                <div class="task-meta">

                    <span>
                        Added:
                        ${formatTimestamp(task.createdAt)}
                    </span>

                    ${completedMeta}

                </div>

            </div>

        </div>

        <div class="task-actions">

            <button
                type="button"
                class="action-btn edit-btn"
                data-action="edit"
            >
                Edit
            </button>

            <button
                type="button"
                class="action-btn delete-btn"
                data-action="delete"
            >
                Delete
            </button>

        </div>
    `;

    return taskCard;
}

/* ---------------------------------
   Render
---------------------------------- */

function renderTasks() {
    pendingList.innerHTML = "";
    completedList.innerHTML = "";

    const pendingTasks = tasks.filter(
        (task) => !task.completed
    );

    const completedTasks = tasks.filter(
        (task) => task.completed
    );

    pendingTasks.forEach((task) => {
        pendingList.appendChild(
            createTaskCard(task)
        );
    });

    completedTasks.forEach((task) => {
        completedList.appendChild(
            createTaskCard(task)
        );
    });

    updateCounters(
        pendingTasks.length,
        completedTasks.length
    );

    updateEmptyStates(
        pendingTasks.length,
        completedTasks.length
    );
}

/* ---------------------------------
   Counters
---------------------------------- */

function updateCounters(
    pendingNumber,
    completedNumber
) {
    pendingCount.textContent =
        `${pendingNumber} pending`;

    completedCount.textContent =
        `${completedNumber} completed`;

    pendingTotal.textContent =
        pendingNumber;

    completedTotal.textContent =
        completedNumber;

    allTasksTotal.textContent =
        pendingNumber + completedNumber;
}

/* ---------------------------------
   Empty States
---------------------------------- */

function updateEmptyStates(
    pendingNumber,
    completedNumber
) {
    pendingEmpty.style.display =
        pendingNumber === 0
            ? "flex"
            : "none";

    completedEmpty.style.display =
        completedNumber === 0
            ? "flex"
            : "none";
}

/* ---------------------------------
   Event Delegation
---------------------------------- */

function handleTaskAction(event) {
    const actionButton =
        event.target.closest("[data-action]");

    if (!actionButton) {
        return;
    }

    const taskCard =
        actionButton.closest("[data-task-id]");

    if (!taskCard) {
        return;
    }

    const taskId = taskCard.dataset.taskId;
    const action = actionButton.dataset.action;

    if (action === "toggle") {
        toggleTask(taskId);
    }

    if (action === "edit") {
        startEdit(taskId);
    }

    if (action === "delete") {
        deleteTask(taskId);
    }

    if (action === "save") {
        saveEditedTask(taskId);
    }

    if (action === "cancel") {
        renderTasks();
    }
}

pendingList.addEventListener(
    "click",
    handleTaskAction
);

completedList.addEventListener(
    "click",
    handleTaskAction
);

/* ---------------------------------
   Main Input Events
---------------------------------- */

addTaskBtn.addEventListener(
    "click",
    addTask
);

taskInput.addEventListener(
    "keydown",
    (event) => {
        if (event.key === "Enter") {
            addTask();
        }
    }
);

taskInput.addEventListener(
    "input",
    clearMessage
);

/* ---------------------------------
   Start App
---------------------------------- */

setCurrentDate();
renderTasks();