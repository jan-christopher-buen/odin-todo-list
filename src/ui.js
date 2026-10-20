export function createUI(app) {
  const projectList = document.querySelector('#project-list');
  const projectForm = document.querySelector('#project-form');
  const projectName = document.querySelector('#project-name');
  const projectError = document.querySelector('#project-error');
  const projectHeading = document.querySelector('#project-heading');
  const todoList = document.querySelector('#todo-list');
  const emptyState = document.querySelector('#empty-state');
  let activeProjectId = app.defaultProjectId;

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
      const title = document.createElement('h3');
      title.textContent = todo.title;
      const dueDate = document.createElement(todo.dueDate ? 'time' : 'span');
      if (todo.dueDate) {
        dueDate.dateTime = todo.dueDate;
      }
      dueDate.textContent = todo.dueDate || 'No due date';
      const details = document.createElement('p');
      const priority = `${todo.priority[0].toUpperCase()}${todo.priority.slice(1)}`;
      details.append('Due: ', dueDate, ` · Priority: ${priority} · ${todo.completed ? 'Complete' : 'Incomplete'}`);
      item.append(title, details);
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
      render();
      projectHeading.focus();
    } catch (error) {
      projectError.textContent = error.message;
      projectName.focus();
    }
  });

  return { render };
}
