export function createUI(app) {
  const projectList = document.querySelector('#project-list');
  const projectForm = document.querySelector('#project-form');
  const projectName = document.querySelector('#project-name');
  const projectError = document.querySelector('#project-error');
  const projectHeading = document.querySelector('#project-heading');
  const todoList = document.querySelector('#todo-list');
  const emptyState = document.querySelector('#empty-state');
  const addTodoButton = document.querySelector('#add-todo');
  const todoDialog = document.querySelector('#todo-dialog');
  const todoForm = document.querySelector('#todo-form');
  const todoDialogHeading = document.querySelector('#todo-dialog-heading');
  const todoProjectName = document.querySelector('#todo-project-name');
  const todoError = document.querySelector('#todo-error');
  const actionStatus = document.querySelector('#action-status');
  let activeProjectId = app.defaultProjectId;
  let editingTodoId = null;

  function openTodoDialog(todo = null) {
    editingTodoId = todo ? todo.id : null;
    todoForm.reset();
    todoError.textContent = '';
    todoForm.elements.namedItem('title').removeAttribute('aria-invalid');
    todoDialogHeading.textContent = todo ? 'View or edit todo' : 'Add todo';
    todoProjectName.textContent = `Project: ${app.getProject(activeProjectId).name}`;
    if (todo) {
      for (const name of ['title', 'description', 'dueDate', 'priority']) {
        todoForm.elements.namedItem(name).value = todo[name];
      }
    }
    todoDialog.showModal();
  }

  function renderProjects() {
    const buttons = app.getProjects().map((project) => {
      const item = document.createElement('li');
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = project.name;
      if (project.id === activeProjectId) {
        button.setAttribute('aria-current', 'true');
      }
      button.addEventListener('click', () => {
        activeProjectId = project.id;
        render();
        projectHeading.focus();
      });
      item.append(button);
      return item;
    });
    projectList.replaceChildren(...buttons);
  }

  function renderTodos() {
    const project = app.getProject(activeProjectId);
    projectHeading.textContent = project.name;
    const todos = project.getTodos();
    emptyState.hidden = todos.length > 0;

    const items = todos.map((todo) => {
      const item = document.createElement('li');
      item.className = 'todo-card';
      item.dataset.priority = todo.priority;
      item.dataset.completed = String(todo.completed);
      const title = document.createElement('h3');
      title.textContent = todo.title;
      const dueDate = document.createElement(todo.dueDate ? 'time' : 'span');
      if (todo.dueDate) {
        dueDate.dateTime = todo.dueDate;
      }
      dueDate.textContent = todo.dueDate || 'No due date';
      const details = document.createElement('p');
      const priority = `${todo.priority[0].toUpperCase()}${todo.priority.slice(1)}`;
      const status = document.createElement('span');
      status.textContent = todo.completed ? 'Complete' : 'Incomplete';
      details.append('Due: ', dueDate, ` · Priority: ${priority} · `, status);

      const completionLabel = document.createElement('label');
      const completion = document.createElement('input');
      completion.type = 'checkbox';
      completion.checked = todo.completed;
      completion.setAttribute('aria-label', `Complete ${todo.title}`);
      completion.addEventListener('change', () => {
        app.toggleTodoComplete(activeProjectId, todo.id);
        status.textContent = todo.completed ? 'Complete' : 'Incomplete';
        item.dataset.completed = String(todo.completed);
      });
      completionLabel.append(completion, ' Complete');

      const editButton = document.createElement('button');
      editButton.type = 'button';
      editButton.textContent = 'View / edit';
      editButton.setAttribute('aria-label', `View or edit ${todo.title}`);
      editButton.addEventListener('click', () => openTodoDialog(todo));

      const deleteButton = document.createElement('button');
      deleteButton.type = 'button';
      deleteButton.textContent = 'Delete';
      deleteButton.className = 'delete-button';
      deleteButton.setAttribute('aria-label', `Delete ${todo.title}`);
      deleteButton.addEventListener('click', () => {
        app.deleteTodo(activeProjectId, todo.id);
        actionStatus.textContent = `Deleted ${todo.title}.`;
        renderTodos();
        projectHeading.focus();
      });

      const actions = document.createElement('div');
      actions.className = 'todo-actions';
      actions.append(completionLabel, editButton, deleteButton);
      item.append(title, details, actions);
      return item;
    });
    todoList.replaceChildren(...items);
  }

  function render() {
    renderProjects();
    renderTodos();
  }

  projectForm.addEventListener('submit', (event) => {
    event.preventDefault();
    try {
      const project = app.addProject(projectName.value);
      activeProjectId = project.id;
      projectForm.reset();
      projectError.textContent = '';
      projectName.removeAttribute('aria-invalid');
      render();
      projectHeading.focus();
    } catch (error) {
      projectError.textContent = error.message;
      projectName.setAttribute('aria-invalid', 'true');
      projectName.focus();
    }
  });

  addTodoButton.addEventListener('click', () => openTodoDialog());
  document.querySelector('#cancel-todo').addEventListener('click', () => todoDialog.close());

  todoForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const details = Object.fromEntries(new FormData(todoForm));
    try {
      if (editingTodoId === null) {
        app.addTodo(details, activeProjectId);
      } else {
        app.updateTodo(activeProjectId, editingTodoId, details);
      }
    } catch (error) {
      todoError.textContent = error.message;
      todoForm.elements.namedItem('title').setAttribute('aria-invalid', 'true');
      todoForm.elements.namedItem('title').focus();
      return;
    }
    actionStatus.textContent = editingTodoId === null ? 'Todo added.' : 'Todo updated.';
    todoDialog.close();
    renderTodos();
    projectHeading.focus();
  });

  return { render };
}
