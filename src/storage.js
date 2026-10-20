import { createProject } from './models/project.js';
import { createTodo } from './models/todo.js';

export const STORAGE_KEY = 'odin-todo-list';

function restoreState(data) {
  if (
    !data || data.version !== 1 || !Array.isArray(data.projects) ||
    data.projects.length === 0
  ) {
    throw new Error('Invalid saved application state.');
  }

  const ids = new Set();
  function checkId(id) {
    if (typeof id !== 'string' || id.trim() === '' || ids.has(id)) {
      throw new Error('Invalid or duplicate saved ID.');
    }
    ids.add(id);
  }

  const projects = data.projects.map((savedProject) => {
    checkId(savedProject.id);
    if (!Array.isArray(savedProject.todos)) throw new Error('Invalid saved todos.');
    const project = createProject(savedProject.name, savedProject.id);
    for (const savedTodo of savedProject.todos) {
      checkId(savedTodo.id);
      if (
        typeof savedTodo.title !== 'string' ||
        typeof savedTodo.description !== 'string' ||
        typeof savedTodo.dueDate !== 'string' ||
        typeof savedTodo.priority !== 'string' ||
        typeof savedTodo.completed !== 'boolean'
      ) {
        throw new Error('Invalid saved todo fields.');
      }
      project.addTodo(createTodo(savedTodo));
    }
    return project;
  });

  if (!projects.some((project) => project.id === data.defaultProjectId)) {
    throw new Error('The saved default project is missing.');
  }
  return { defaultProjectId: data.defaultProjectId, projects };
}

export function createStorage({
  getStorage = () => window.localStorage,
  onStatus = () => {},
} = {}) {
  return {
    load() {
      try {
        const saved = getStorage().getItem(STORAGE_KEY);
        if (saved === null) return null;
        return restoreState(JSON.parse(saved));
      } catch {
        onStatus('Saved data could not be loaded. Starting with an empty Inbox. Your next change will attempt to replace the saved data.');
        return null;
      }
    },
    save(state) {
      try {
        getStorage().setItem(STORAGE_KEY, JSON.stringify(state));
        onStatus('');
        return true;
      } catch {
        onStatus('Changes could not be saved in this browser. Keep this page open to avoid losing your latest changes.');
        return false;
      }
    },
  };
}
