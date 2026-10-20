# Odin Todo List

A learning project for [The Odin Project Todo List assignment](https://www.theodinproject.com/lessons/node-path-javascript-todo-list).

## Current status

Phases 1–3 are implemented: build tooling, application logic, project creation and navigation, and read-only todo rendering. The app starts with an empty Inbox. Todo forms, completion controls, deletion controls, and persistence are not implemented yet.

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
- `src/index.js`: creates the application and UI, then renders the initial view.
- `src/template.html`: HTML template containing project navigation, the project form, and the todo list. The HTML plugin injects the bundle script.
- `.gitignore`: excludes installed dependencies (`node_modules/`) and generated output (`dist/`).

## Dependencies

JavaScript source and the Webpack configuration use ES modules (`"type": "module"`).

All dependencies are development tools:

- `webpack`: bundles JavaScript modules and optimizes production builds.
- `webpack-cli`: runs Webpack from npm scripts.
- `webpack-dev-server`: serves the development build and updates the browser during development.
- `html-webpack-plugin`: generates HTML from the template and inserts the bundle script.

There are no runtime dependencies. CSS tooling will be added when styles are introduced.

## Manual browser checks

1. Run `npm start` and open http://localhost:8080.
2. Confirm Inbox is selected and the main view says "No todos in this project."
3. Add a project named Study. Confirm it appears in navigation and becomes the active project.
4. Switch between Inbox and Study using the project buttons. Confirm the main heading changes and the selected button has `aria-current="true"` in DevTools.
5. Try an empty name and a whitespace-only name. Confirm neither creates a project and validation feedback appears.
6. Use Tab, Enter, and Space to navigate projects and submit the form. Check the browser console for errors.
7. Reload. Confirm only the empty Inbox remains; state is not persisted yet.
8. Run both build commands and confirm each generates `dist/index.html` and `dist/main.js`.

To manually inspect todo rendering before todo forms are available, temporarily insert this code in `src/index.js` after `const app = createApp();` and before UI creation:

```js
const study = app.addProject('Study');
app.addTodo({ title: '<Read the lesson>', dueDate: '2026-12-01', priority: 'high' });
const completed = app.addTodo({ title: 'Practice factories', priority: 'low' }, study.id);
app.toggleTodoComplete(study.id, completed.id);
app.addProject('Empty project');
```

Confirm Inbox displays the literal title `<Read the lesson>`, due date, high priority, and incomplete status. Select Study and confirm only its completed todo appears with "No due date" and low priority. Select Empty project to check the empty state. Return to Inbox and confirm its todo is still present. Remove the temporary fixture afterward.

## Application logic

The logic runs independently of the DOM and storage. `src/app.js` exports `createApp()`, which creates an empty default project named Inbox. Each application instance has its own state.

- `src/models/todo.js`: factory for todos with a unique ID, title, description, due date, priority, and completion state. Supports validated detail updates and completion toggling.
- `src/models/project.js`: factory for named projects that hold todos. Supports lookup, addition, and deletion.
- `src/app.js`: coordinates project creation and todo creation, updates, completion, and deletion. Todos go to Inbox unless a project ID is supplied.
- `src/ui.js`: renders project buttons and the active project’s todos, tracks the active project, and handles project creation. User text is inserted as text rather than HTML. Native buttons and labeled inputs support keyboard use; the active project is marked with `aria-current`.

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
