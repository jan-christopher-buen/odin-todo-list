export function createProject(name, id = crypto.randomUUID()) {
  if (typeof id !== 'string' || id.trim() === '') {
    throw new Error('A project ID is required.');
  }
  if (typeof name !== 'string' || name.trim() === '') {
    throw new Error('A project name is required.');
  }

  const todos = [];

  return {
    id,
    name: name.trim(),
    getTodos() {
      return [...todos];
    },
    getTodo(todoId) {
      const todo = todos.find((item) => item.id === todoId);
      if (!todo) throw new Error('Todo not found.');
      return todo;
    },
    addTodo(todo) {
      todos.push(todo);
    },
    deleteTodo(todoId) {
      const todo = this.getTodo(todoId);
      todos.splice(todos.indexOf(todo), 1);
    },
  };
}
