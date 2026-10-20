import assert from 'node:assert/strict';
import test from 'node:test';
import { createApp } from '../src/app.js';
import { createTodo } from '../src/models/todo.js';

test('starts with an empty default project and adds todos to it by default', () => {
  const app = createApp();
  assert.equal(app.getProjects().length, 1);
  const inbox = app.getProject(app.defaultProjectId);
  assert.equal(inbox.name, 'Inbox');
  assert.deepEqual(inbox.getTodos(), []);
  const todo = app.addTodo({ title: ' Read the lesson ' });
  assert.equal(todo.title, 'Read the lesson');
  assert.equal(todo.description, '');
  assert.equal(todo.dueDate, '');
  assert.equal(todo.priority, 'medium');
  assert.equal(todo.completed, false);
  assert.deepEqual(inbox.getTodos(), [todo]);
});

test('keeps project todos and separate application instances independent', () => {
  const app = createApp();
  const project = app.addProject(' Study ');
  const todo = app.addTodo({ title: 'Practice factories' }, project.id);
  assert.equal(project.name, 'Study');
  assert.deepEqual(project.getTodos(), [todo]);
  assert.deepEqual(app.getProject(app.defaultProjectId).getTodos(), []);
  assert.notEqual(todo.id, app.addTodo({ title: 'Another task' }).id);
  const otherApp = createApp();
  assert.deepEqual(otherApp.getProject(otherApp.defaultProjectId).getTodos(), []);
  assert.notEqual(otherApp.defaultProjectId, app.defaultProjectId);
});

test('updates details, toggles completion, and deletes only the chosen todo', () => {
  const app = createApp();
  const first = app.addTodo({ title: 'First' });
  const second = app.addTodo({ title: 'Second' });
  app.updateTodo(app.defaultProjectId, first.id, {
    title: ' Updated ', description: 'Details', dueDate: '2028-02-29', priority: 'high',
    id: 'replacement', completed: true,
  });
  assert.equal(first.title, 'Updated');
  assert.equal(first.description, 'Details');
  assert.equal(first.dueDate, '2028-02-29');
  assert.equal(first.priority, 'high');
  assert.notEqual(first.id, 'replacement');
  assert.equal(first.completed, false);
  app.toggleTodoComplete(app.defaultProjectId, first.id);
  assert.equal(first.completed, true);
  app.toggleTodoComplete(app.defaultProjectId, first.id);
  assert.equal(first.completed, false);
  app.deleteTodo(app.defaultProjectId, first.id);
  assert.deepEqual(app.getProject(app.defaultProjectId).getTodos(), [second]);
});

test('rejects invalid input without partially updating or inserting data', () => {
  const app = createApp();
  assert.throws(() => app.addProject(' '));
  for (const details of [
    { title: '' }, { title: 'Task', description: null },
    { title: 'Task', dueDate: '2026-02-29' },
    { title: 'Task', dueDate: '2026-13-01' },
    { title: 'Task', dueDate: 'tomorrow' },
    { title: 'Task', priority: 'urgent' },
  ]) {
    assert.throws(() => app.addTodo(details));
  }
  assert.deepEqual(app.getProject(app.defaultProjectId).getTodos(), []);
  const todo = createTodo({ title: 'Original' });
  assert.throws(() => todo.update({ title: 'Changed', priority: 'urgent' }));
  assert.equal(todo.title, 'Original');
});

test('reports missing IDs and protects collection membership from array changes', () => {
  const app = createApp();
  const todo = app.addTodo({ title: 'Keep me' });
  app.getProjects().pop();
  app.getProject(app.defaultProjectId).getTodos().pop();
  assert.equal(app.getProjects().length, 1);
  assert.equal(app.getProject(app.defaultProjectId).getTodos().length, 1);
  assert.throws(() => app.getProject('missing'), /Project not found/);
  assert.throws(() => app.addTodo({ title: 'Task' }, 'missing'), /Project not found/);
  assert.throws(() => app.updateTodo(app.defaultProjectId, 'missing', {}), /Todo not found/);
  assert.throws(() => app.deleteTodo(app.defaultProjectId, 'missing'), /Todo not found/);
  assert.equal(app.getProject(app.defaultProjectId).getTodo(todo.id), todo);
});
