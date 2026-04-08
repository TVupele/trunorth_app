import { render } from '@testing-library/react';
import React from 'react';
import App from './src/App';
import { window } from 'jsdom';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: true,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

try {
  render(<App />);
  console.log("RENDERED SUCCESSFULLY!");
} catch (e) {
  console.error("ERROR RENDERING APP:", e);
}