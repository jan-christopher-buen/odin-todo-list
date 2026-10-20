# Odin Todo List

A learning project for [The Odin Project Todo List assignment](https://www.theodinproject.com/lessons/node-path-javascript-todo-list).

## Current status

Phases 1–4 are implemented: build tooling, application logic, project creation and navigation, and todo creation, viewing/editing, completion, and deletion. The app starts with an empty Inbox. Persistence and responsive styling are not implemented yet.

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

## Using the app

- Create a project with the New project name form, then select a project from navigation.
- Click Add todo to open a dialog for the selected project. A title is required; description and due date are optional. Priority defaults to Medium.
- Click View / edit to inspect or update all four todo fields. Save todo applies the changes; Cancel or Escape discards unsaved changes.
- Use the Complete checkbox to toggle completion.
- Click Delete to remove a todo immediately.

All data is currently in memory and is lost on reload.

## Manual browser checks

1. Run `npm start` and open http://localhost:8080. Confirm the empty Inbox appears.
2. Add a Study project. Switch between Study and Inbox and confirm the active project and main heading match.
3. Try empty and whitespace-only project names. Confirm no project is created and validation feedback appears.
4. In Inbox, create a todo with a title, multiline description, due date, and High priority. Confirm its summary shows the correct title, date, priority, and incomplete status.
5. Open View / edit. Confirm all saved fields are present. Change all fields, save, and reopen to verify the changes.
6. Make another edit, then Cancel. Reopen and confirm the saved values remain. Repeat with Escape.
7. Try an empty and whitespace-only todo title. Confirm the dialog stays open, no data is changed, and validation feedback appears.
8. Clear the description and due date, choose Low priority, and save. Confirm the summary shows No due date and Low priority.
9. Use Complete to mark and unmark the todo. Confirm the checkbox and completion text agree and the state survives project switching and editing.
10. Create a todo in Study. Confirm each project shows only its own todos. Delete one of several todos and confirm the others remain; delete the last todo to check the empty state.
11. Enter `<Read the lesson>` as a title and HTML-like text in the description. Confirm it appears literally rather than becoming HTML.
12. Use Tab, Enter, and Space to operate the app. Confirm the dialog receives focus, keeps keyboard focus inside while open, and returns focus when canceled. Check the browser console for errors.
13. Reload and confirm only an empty Inbox remains; persistence is not implemented yet.
14. Run both build commands and confirm each generates `dist/index.html` and `dist/main.js`.

## Application logic

The logic runs independently of the DOM and storage. `src/app.js` exports `createApp()`, which creates an empty default project named Inbox. Each application instance has its own state.

- `src/models/todo.js`: factory for todos with a unique ID, title, description, due date, priority, and completion state. Supports validated detail updates and completion toggling.
- `src/models/project.js`: factory for named projects that hold todos. Supports lookup, addition, and deletion.
- `src/app.js`: coordinates project creation and todo creation, updates, completion, and deletion. Todos go to Inbox unless a project ID is supplied.
- `src/ui.js`: renders projects and todos, tracks the active project, and handles project creation and todo UI events through application operations. A shared native dialog handles todo creation and viewing/editing. User text is inserted as text rather than HTML. Native controls and labeled inputs support keyboard use; the active project is marked with `aria-current`.

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
