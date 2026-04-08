import { readFileSync } from 'fs';
import { JSDOM } from 'jsdom';

const html = readFileSync('./dist/index.html', 'utf8');

const dom = new JSDOM(html, {
  url: 'http://localhost/#/mobile',
  runScripts: "dangerously",
  resources: "usable",
  pretendToBeVisual: true,
  beforeParse(window) {
    window.matchMedia = () => ({
      matches: true,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
    });
    // mock console.error
    const originalError = window.console.error;
    window.console.error = function(...args) {
      console.log("APP_ERROR:", ...args);
      originalError.apply(window.console, args);
    };
  }
});

setTimeout(() => {
  console.log("Body:", dom.window.document.body.innerHTML.substring(0, 200));
  process.exit(0);
}, 3000);