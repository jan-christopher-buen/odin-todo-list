export function createProject(name) {
  if (typeof name !== 'string' || name.trim() === '') {
    throw new Error('A project name is required.');
  }

  const todos = [];

  return {
    id: crypto.randomUUID(),
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
