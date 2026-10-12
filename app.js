const STORAGE_KEY = "daylist.todos";

const form = document.querySelector("#add-form");
const input = document.querySelector("#todo-input");
const list = document.querySelector("#todo-list");
const count = document.querySelector("#todo-count");
const clearCompletedButton = document.querySelector("#clear-completed");
const filterButtons = document.querySelectorAll("[data-filter]");

let todos = loadTodos();
let currentFilter = "all";

function loadTodos() {
  try {
    const savedTodos = localStorage.getItem(STORAGE_KEY);
    const parsedTodos = savedTodos ? JSON.parse(savedTodos) : [];

    if (!Array.isArray(parsedTodos)) {
      return [];
    }

    return parsedTodos.filter(
      (todo) =>
        todo &&
        typeof todo.id === "string" &&
        typeof todo.text === "string" &&
        typeof todo.completed === "boolean",
    );
  } catch {
    return [];
  }
}

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function getVisibleTodos() {
  if (currentFilter === "active") {
    return todos.filter((todo) => !todo.completed);
  }

  if (currentFilter === "completed") {
    return todos.filter((todo) => todo.completed);
  }

  return todos;
}

function render() {
  const visibleTodos = getVisibleTodos();
  list.replaceChildren();

  if (visibleTodos.length === 0) {
    const emptyState = document.createElement("div");
    emptyState.className = "empty-state";
    const message = document.createElement("div");
    const title = document.createElement("strong");
    const detail = document.createElement("span");

    title.textContent = todos.length === 0 ? "A clear page feels good." : "Nothing here yet.";
    detail.textContent =
      todos.length === 0 ? "Add one small thing to get started." : "Try another view.";
    message.append(title, detail);
    emptyState.append(message);
    list.append(emptyState);
  } else {
    visibleTodos.forEach((todo) => {
      list.append(createTodoElement(todo));
    });
  }

  const openTodos = todos.filter((todo) => !todo.completed).length;
  count.textContent = `${openTodos} ${openTodos === 1 ? "task" : "tasks"} left`;
  clearCompletedButton.disabled = !todos.some((todo) => todo.completed);
  clearCompletedButton.style.opacity = clearCompletedButton.disabled ? "0.45" : "1";

  filterButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.filter === currentFilter);
  });
}

function createTodoElement(todo) {
  const item = document.createElement("div");
  item.className = `todo-item${todo.completed ? " is-complete" : ""}`;

  const checkbox = document.createElement("input");
  checkbox.className = "todo-check";
  checkbox.type = "checkbox";
  checkbox.checked = todo.completed;
  checkbox.setAttribute("aria-label", `Mark "${todo.text}" as ${todo.completed ? "open" : "done"}`);
  checkbox.addEventListener("change", () => {
    todo.completed = checkbox.checked;
    saveTodos();
    render();
  });

  const text = document.createElement("span");
  text.className = "todo-text";
  text.textContent = todo.text;

  const deleteButton = document.createElement("button");
  deleteButton.className = "delete-button";
  deleteButton.type = "button";
  deleteButton.setAttribute("aria-label", `Delete "${todo.text}"`);
  deleteButton.textContent = "×";
  deleteButton.addEventListener("click", () => {
    todos = todos.filter((itemTodo) => itemTodo.id !== todo.id);
    saveTodos();
    render();
  });

  item.append(checkbox, text, deleteButton);
  return item;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = input.value.trim();

  if (!text) {
    input.focus();
    return;
  }

  todos.unshift({
    id: crypto.randomUUID(),
    text,
    completed: false,
  });
  saveTodos();
  input.value = "";
  render();
  input.focus();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    render();
  });
});

clearCompletedButton.addEventListener("click", () => {
  todos = todos.filter((todo) => !todo.completed);
  saveTodos();
  render();
});

render();
