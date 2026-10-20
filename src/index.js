import { createApp } from './app.js';
import { createUI } from './ui.js';

const app = createApp();
const ui = createUI(app);

ui.render();
