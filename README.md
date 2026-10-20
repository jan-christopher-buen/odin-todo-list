# Odin Todo List

A learning project for [The Odin Project Todo List assignment](https://www.theodinproject.com/lessons/node-path-javascript-todo-list).

## Current status

Phases 1 and 2 are implemented: build tooling and application logic. The browser still shows the setup placeholder. Project navigation, todo forms, and persistence are not implemented yet.

## Getting started

Use Node.js 24 LTS and npm.

```sh
npm ci
npm start
```

Open http://localhost:8080. Stop the server with Ctrl+C. The server rebuilds on source changes and reloads the page when needed; development assets are served from memory.

```sh
npm run build:dev
npm run build
```

Both commands generate `dist/`. The development build includes source maps; the production build uses Webpack's production optimizations without source maps. Each build cleans old output.

## Setup files

- `package.json`: project metadata, scripts, and development dependencies. The package is private to prevent accidental npm publishing.
- `package-lock.json`: exact dependency versions for reproducible installs with `npm ci`.
- `webpack.config.js`: entry point, output directory, HTML generation, source maps, and local development server.
- `src/index.js`: browser entry point; currently updates the placeholder status text.
- `src/template.html`: HTML template with language, title, and viewport metadata. The HTML plugin injects the bundle script.
- `.gitignore`: excludes installed dependencies (`node_modules/`) and generated output (`dist/`).

## Dependencies

JavaScript source and the Webpack configuration use ES modules (`"type": "module"`).

All dependencies are development tools:

- `webpack`: bundles JavaScript modules and optimizes production builds.
- `webpack-cli`: runs Webpack from npm scripts.
- `webpack-dev-server`: serves the development build and updates the browser during development.
- `html-webpack-plugin`: generates HTML from the template and inserts the bundle script.

There are no runtime dependencies. CSS tooling will be added when styles are introduced.

## Manual setup checks

1. Run `npm start` and open http://localhost:8080.
2. Confirm the heading reads "Odin Todo List" and the status reads "The development setup is ready."
3. Change the status string in `src/index.js`, save, and confirm the browser updates. Revert the temporary change.
4. Change the heading in `src/template.html`, save, and confirm the browser updates. Revert the temporary change.
5. Check the browser console for errors.
6. Run both build commands and confirm each generates `dist/index.html` and `dist/main.js`.

## Application logic

The logic runs independently of the DOM and storage. `src/app.js` exports `createApp()`, which creates an empty default project named Inbox. Each application instance has its own state.

- `src/models/todo.js`: factory for todos with a unique ID, title, description, due date, priority, and completion state. Supports validated detail updates and completion toggling.
- `src/models/project.js`: factory for named projects that hold todos. Supports lookup, addition, and deletion.
- `src/app.js`: coordinates project creation and todo creation, updates, completion, and deletion. Todos go to Inbox unless a project ID is supplied.

Titles and project names are trimmed and must not be blank. Descriptions must be strings. Due dates are either empty or valid calendar dates in `YYYY-MM-DD` format. Priority is `low`, `medium` (the default), or `high`. Invalid operations throw errors. Updates validate all details before applying changes. Collection getters return array copies; returned objects are live references and should be changed through application operations.

All state is currently in memory. Reloading or creating another application instance starts fresh.

## Logic checks

```sh
npm test
```

The tests cover default project behavior, project isolation, todo updates, completion, deletion, validation, missing IDs, and collection array copies. No additional test dependencies are required.

To check the logic manually without a browser, run `node --input-type=module` from the repository root and enter:

```js
const { createApp } = await import('./src/app.js');
const app = createApp();
const project = app.addProject('Study');
const todo = app.addTodo({ title: 'Read the lesson', priority: 'high' }, project.id);
app.updateTodo(project.id, todo.id, { dueDate: '2026-12-01' });
app.toggleTodoComplete(project.id, todo.id);
console.log(project.getTodos()); // One completed todo with the updated due date.
app.deleteTodo(project.id, todo.id);
console.log(project.getTodos()); // []
console.log(app.getProjects()); // Inbox and Study.
```
