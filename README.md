# Odin Todo List

A learning project for [The Odin Project Todo List assignment](https://www.theodinproject.com/lessons/node-path-javascript-todo-list).

## Features

The app supports projects, todo creation and editing, completion, deletion, and localStorage persistence with object restoration. It includes responsive styling, keyboard controls, and a GitHub Pages deployment workflow. A first visit starts with an empty Inbox; subsequent visits restore saved projects and todos.

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
- `src/index.js`: loads saved state, wires application changes to storage and storage feedback to the page, then renders the UI.
- `src/template.html`: semantic page, labeled forms, and native todo dialog. The HTML plugin injects the bundle script and resolves the stylesheet asset.
- `src/styles.css`: responsive layout, control styling, focus indicators, priority accents, and completion styling.
- `.github/workflows/deploy.yml`: installs dependencies, runs tests, builds, and deploys `dist/` to GitHub Pages.
- `.gitignore`: excludes installed dependencies (`node_modules/`) and generated output (`dist/`).

## Dependencies

JavaScript source and the Webpack configuration use ES modules (`"type": "module"`).

All dependencies are development tools:

- `webpack`: bundles JavaScript modules and optimizes production builds.
- `webpack-cli`: runs Webpack from npm scripts.
- `webpack-dev-server`: serves the development build and updates the browser during development.
- `html-webpack-plugin`: generates HTML from the template and inserts the bundle script.

There are no runtime dependencies. Webpack emits the plain CSS as an asset referenced by the HTML template; no CSS loader is needed. Production asset URLs are relative so the build works under a project subpath. Development uses `/` as its public path so Webpack serves the root page correctly. Restart `npm start` after changing the Webpack configuration.

## Using the app

- Create a project with the New project name form, then select a project from navigation.
- Click Add todo to open a dialog for the selected project. A title is required; description and due date are optional. Priority defaults to Medium.
- Click View / edit to inspect or update all four todo fields. Save todo applies the changes; Cancel or Escape discards unsaved changes.
- Use the Complete checkbox to toggle completion.
- Click Delete to remove a todo immediately.

Each successful project or todo change is saved to localStorage. Reloading restores the data; navigation returns to Inbox.

## Application logic

The logic runs independently of the DOM and storage. `src/app.js` exports `createApp()`, which creates an empty default project named Inbox. Each application instance has its own state.

- `src/models/todo.js`: factory for todos with a unique ID, title, description, due date, priority, and completion state. Supports validated detail updates and completion toggling.
- `src/models/project.js`: factory for named projects that hold todos. Supports lookup, addition, and deletion.
- `src/app.js`: coordinates project creation and todo creation, updates, completion, and deletion. Todos go to Inbox unless a project ID is supplied.
- `src/ui.js`: renders projects and todos, tracks the active project, and handles project creation and todo UI events through application operations. A shared native dialog handles todo creation and viewing/editing. User text is inserted as text rather than HTML. Native controls and labeled inputs support keyboard use; the active project is marked with `aria-current`.

Titles and project names are trimmed and must not be blank. Descriptions must be strings. Due dates are either empty or valid calendar dates in `YYYY-MM-DD` format. Priority is `low`, `medium` (the default), or `high`. Invalid operations throw errors. Updates validate all details before applying changes. Collection getters return array copies; returned objects are live references and should be changed through application operations.

`createApp()` accepts optional `initialState` and `onChange` parameters. The storage module provides restored objects as the initial state. After each successful data operation, the application calls `onChange` with an independent plain-data snapshot from `getState()`. The browser entry point wires this callback to storage; headless instances without this wiring remain in memory only.

## Persistence

`src/storage.js` owns localStorage access, JSON parsing, saved-data validation, and restoration through the existing factories. It uses the key `odin-todo-list` and a versioned snapshot containing the default project ID, projects, and all todo fields. IDs and completion state are preserved. Methods are recreated by factories rather than stored in JSON.

Missing data starts an empty Inbox. Malformed JSON, unsupported versions, invalid fields, duplicate IDs, or a missing default project produce a visible message and an empty Inbox. Loading does not overwrite invalid saved data; the next successful data change attempts to replace it. Storage access and write failures show feedback while allowing work to continue in memory. A later successful save clears the feedback.

Data belongs to the current browser and origin; different ports, browsers, and devices have separate storage. Clearing site data removes it. Simultaneous tabs are not synchronized, and the last successful save replaces the stored snapshot.

## Testing

```sh
npm test
```

The tests cover application operations, validation, independent snapshots, persistence after every data change, restored methods, invalid saved data, unavailable storage, and failed writes. Storage tests use an in-memory substitute, not browser localStorage. No additional test dependencies are required.

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

## Responsive layout and accessibility

The desktop layout places project navigation beside the todo list. At 700px and below, navigation stacks above the list and controls wrap. Long names and titles wrap instead of expanding the page. The dialog scrolls within the viewport.

The page includes a skip link, semantic landmarks and headings, labeled native controls, visible keyboard focus, an active-project marker, and live feedback for errors and saved/deleted todo actions. Priority and completion are expressed in text as well as styling. Native modal behavior supports Escape and restores focus on cancellation; saving and deleting move focus to the current project heading.

## Browser testing scope

Browser review has covered todo operations, persistence and recovery, dialog
focus behavior, and layouts at 320, 390, 768, and 1280 pixels in Chromium.
Cross-browser and assistive-technology coverage is limited. For UI changes,
also check keyboard navigation, screen-reader use, 200% zoom, and long content.

## Deployment

The repository includes a [GitHub Pages Actions workflow](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages). It runs on pushes to `main` or manual dispatch, tests and builds with Node.js 24, uploads only `dist/`, and deploys through the `github-pages` environment.

To configure publication:

1. In the GitHub repository, open Settings → Pages and select GitHub Actions as the build source.
2. Commit and push the reviewed changes to `main`.
3. Inspect the Deploy to GitHub Pages workflow in Actions. Resolve any repository environment approval if GitHub requests it.
4. Open the URL reported by the deployment job. Verify project creation, todo operations, reload persistence, and mobile layout on the published site.

Localhost and the published site have separate browser storage.

For another static host, run `npm ci` and `npm run build`, then publish the contents of `dist/` over HTTPS.
