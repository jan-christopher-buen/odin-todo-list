# Odin Todo List

A learning project for [The Odin Project Todo List assignment](https://www.theodinproject.com/lessons/node-path-javascript-todo-list).

## Current status

Phase 1 is implemented: npm and Webpack tooling, an HTML template, and a placeholder page that confirms the JavaScript bundle loads. Todo features and persistence are not implemented yet.

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
