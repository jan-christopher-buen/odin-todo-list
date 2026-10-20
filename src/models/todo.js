const priorities = ['low', 'medium', 'high'];

function validateDetails({ title, description, dueDate, priority }) {
  if (typeof title !== 'string' || title.trim() === '') {
    throw new Error('A todo title is required.');
  }
  if (typeof description !== 'string') {
    throw new Error('The description must be text.');
  }
  if (dueDate !== '') {
    const date = new Date(`${dueDate}T00:00:00.000Z`);
    if (
      typeof dueDate !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}$/.test(dueDate) ||
      Number.isNaN(date.getTime()) ||
      date.toISOString().slice(0, 10) !== dueDate
    ) {
      throw new Error('The due date must be a valid YYYY-MM-DD date or empty.');
    }
  }
  if (!priorities.includes(priority)) {
    throw new Error('Priority must be low, medium, or high.');
  }
}

export function createTodo({ title, description = '', dueDate = '', priority = 'medium' }) {
  const details = { title, description, dueDate, priority };
  validateDetails(details);

  return {
    id: crypto.randomUUID(),
    ...details,
    title: title.trim(),
    completed: false,
    update(changes) {
      const next = {
        title: changes.title === undefined ? this.title : changes.title,
        description: changes.description === undefined ? this.description : changes.description,
        dueDate: changes.dueDate === undefined ? this.dueDate : changes.dueDate,
        priority: changes.priority === undefined ? this.priority : changes.priority,
      };
      validateDetails(next);
      Object.assign(this, next, { title: next.title.trim() });
    },
    toggleComplete() {
      this.completed = !this.completed;
    },
  };
}
