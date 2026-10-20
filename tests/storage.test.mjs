import assert from 'node:assert/strict';
import test from 'node:test';
import { createApp } from '../src/app.js';
import { createStorage, STORAGE_KEY } from '../src/storage.js';

function createMemoryStorage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
}

function startApp(storage) {
  return createApp({ initialState: storage.load(), onChange: (state) => storage.save(state) });
}

test('starts without saved data and persists each successful data operation', () => {
  const memory = createMemoryStorage();
  const storage = createStorage({ getStorage: () => memory });
  assert.equal(storage.load(), null);
  const app = startApp(storage);
  const verifySaved = () => assert.deepEqual(startApp(storage).getState(), app.getState());
  const project = app.addProject('Study');
  verifySaved();
  const todo = app.addTodo({ title: 'Read', description: 'Chapter 1', dueDate: '2028-02-29', priority: 'high' }, project.id);
  verifySaved();
  app.updateTodo(project.id, todo.id, { title: 'Read more', description: '', dueDate: '', priority: 'low' });
  verifySaved();
  app.toggleTodoComplete(project.id, todo.id);
  verifySaved();
  const restored = startApp(storage);
  assert.equal(restored.getProject(project.id).getTodo(todo.id).completed, true);
  restored.updateTodo(project.id, todo.id, { title: 'Restored methods work' });
  restored.toggleTodoComplete(project.id, todo.id);
  const next = startApp(storage);
  assert.equal(next.getProject(project.id).getTodo(todo.id).title, 'Restored methods work');
  assert.equal(next.getProject(project.id).getTodo(todo.id).completed, false);
  next.deleteTodo(project.id, todo.id);
  assert.deepEqual(startApp(storage).getProject(project.id).getTodos(), []);
  const inboxTodo = next.addTodo({ title: 'Default destination' });
  assert.equal(startApp(storage).getProject(app.defaultProjectId).getTodo(inboxTodo.id).title, 'Default destination');
});

test('rejects invalid saved data without overwriting it on load', () => {
  const valid = createApp().getState();
  const corruptTodo = { ...valid, projects: [{ ...valid.projects[0], todos: [{ id: 'todo', title: 'Missing fields' }] }] };
  const badDate = structuredClone(valid);
  badDate.projects[0].todos = [{ id: 'todo', title: 'Bad date', description: '', dueDate: '2026-02-29', priority: 'low', completed: false }];
  const duplicate = structuredClone(valid);
  duplicate.projects.push({ ...duplicate.projects[0] });
  const missingDefault = { ...valid, defaultProjectId: 'missing' };
  for (const raw of ['invalid JSON', 'null', '{}', JSON.stringify({ ...valid, version: 99 }), JSON.stringify(corruptTodo), JSON.stringify(badDate), JSON.stringify(duplicate), JSON.stringify(missingDefault)]) {
    const memory = createMemoryStorage();
    memory.setItem(STORAGE_KEY, raw);
    let message = '';
    const storage = createStorage({ getStorage: () => memory, onStatus: (text) => { message = text; } });
    const app = startApp(storage);
    assert.equal(app.getProjects().length, 1);
    assert.equal(app.getProject(app.defaultProjectId).name, 'Inbox');
    assert.match(message, /could not be loaded/);
    assert.equal(memory.getItem(STORAGE_KEY), raw);
    app.addTodo({ title: 'Fresh task' });
    assert.equal(message, '');
    assert.equal(startApp(storage).getProject(app.defaultProjectId).getTodos().length, 1);
  }
});

test('handles unavailable storage and failed writes while keeping in-memory changes', () => {
  let message = '';
  const storage = createStorage({
    getStorage() { throw new Error('Access denied'); },
    onStatus(text) { message = text; },
  });
  const app = startApp(storage);
  assert.match(message, /could not be loaded/);
  app.addTodo({ title: 'Keep in memory' });
  assert.match(message, /could not be saved/);
  assert.equal(app.getProject(app.defaultProjectId).getTodos().length, 1);

  const memory = createMemoryStorage();
  memory.setItem(STORAGE_KEY, 'previous saved value');
  memory.setItem = () => { throw new Error('Quota exceeded'); };
  const failing = createStorage({ getStorage: () => memory });
  assert.equal(failing.save(app.getState()), false);
  assert.equal(memory.getItem(STORAGE_KEY), 'previous saved value');
});

test('does not save rejected operations and returns independent plain snapshots', () => {
  const snapshots = [];
  const app = createApp({ onChange: (state) => snapshots.push(state) });
  const todo = app.addTodo({ title: 'Original' });
  assert.equal(snapshots.length, 1);
  assert.throws(() => app.updateTodo(app.defaultProjectId, todo.id, { title: ' ' }));
  assert.throws(() => app.addProject(' '));
  assert.equal(snapshots.length, 1);
  app.updateTodo(app.defaultProjectId, todo.id, { title: 'Changed' });
  assert.equal(snapshots[0].projects[0].todos[0].title, 'Original');
  assert.equal(snapshots[1].projects[0].todos[0].title, 'Changed');
  assert.deepEqual(JSON.parse(JSON.stringify(app.getState())), app.getState());
});
