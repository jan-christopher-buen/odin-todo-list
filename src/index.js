import { createApp } from './app.js';
import { createUI } from './ui.js';
import { createStorage } from './storage.js';

const storageStatus = document.querySelector('#storage-status');
const storage = createStorage({
  onStatus(message) {
    storageStatus.textContent = message;
    storageStatus.hidden = message === '';
  },
});
const app = createApp({
  initialState: storage.load(),
  onChange: (state) => storage.save(state),
});
const ui = createUI(app);

ui.render();
