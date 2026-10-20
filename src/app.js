import { createProject } from './models/project.js';
import { createTodo } from './models/todo.js';

export function createApp() {
  const defaultProject = createProject('Inbox');
  const projects = [defaultProject];

  function getProject(projectId) {
    const project = projects.find((item) => item.id === projectId);
    if (!project) throw new Error('Project not found.');
    return project;
  }

  return {
    defaultProjectId: defaultProject.id,
    getProjects() {
      return [...projects];
    },
    getProject,
    addProject(name) {
      const project = createProject(name);
      projects.push(project);
      return project;
    },
    addTodo(details, projectId = defaultProject.id) {
      const project = getProject(projectId);
      const todo = createTodo(details);
      project.addTodo(todo);
      return todo;
    },
    updateTodo(projectId, todoId, changes) {
      const todo = getProject(projectId).getTodo(todoId);
      todo.update(changes);
      return todo;
    },
    toggleTodoComplete(projectId, todoId) {
      const todo = getProject(projectId).getTodo(todoId);
      todo.toggleComplete();
      return todo;
    },
    deleteTodo(projectId, todoId) {
      getProject(projectId).deleteTodo(todoId);
    },
  };
}
