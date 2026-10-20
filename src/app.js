import { createProject } from './models/project.js';
import { createTodo } from './models/todo.js';

export function createApp({ initialState = null, onChange = () => {} } = {}) {
  const projects = initialState ? initialState.projects : [createProject('Inbox')];
  const defaultProjectId = initialState ? initialState.defaultProjectId : projects[0].id;

  function getState() {
    return {
      version: 1,
      defaultProjectId,
      projects: projects.map((project) => ({
        id: project.id,
        name: project.name,
        todos: project.getTodos().map((todo) => ({
          id: todo.id,
          title: todo.title,
          description: todo.description,
          dueDate: todo.dueDate,
          priority: todo.priority,
          completed: todo.completed,
        })),
      })),
    };
  }

  function notifyChange() {
    onChange(getState());
  }

  function getProject(projectId) {
    const project = projects.find((item) => item.id === projectId);
    if (!project) throw new Error('Project not found.');
    return project;
  }

  return {
    defaultProjectId,
    getState,
    getProjects() {
      return [...projects];
    },
    getProject,
    addProject(name) {
      const project = createProject(name);
      projects.push(project);
      notifyChange();
      return project;
    },
    addTodo(details, projectId = defaultProjectId) {
      const project = getProject(projectId);
      const todo = createTodo(details);
      project.addTodo(todo);
      notifyChange();
      return todo;
    },
    updateTodo(projectId, todoId, changes) {
      const todo = getProject(projectId).getTodo(todoId);
      todo.update(changes);
      notifyChange();
      return todo;
    },
    toggleTodoComplete(projectId, todoId) {
      const todo = getProject(projectId).getTodo(todoId);
      todo.toggleComplete();
      notifyChange();
      return todo;
    },
    deleteTodo(projectId, todoId) {
      getProject(projectId).deleteTodo(todoId);
      notifyChange();
    },
  };
}
