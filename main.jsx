import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

// The App component was originally built for Claude's artifact sandbox,
// which provides a built-in `window.storage` API. That API doesn't exist
// on a normally-hosted site, so we provide a matching implementation
// backed by the browser's localStorage. This keeps every save/load call
// in App.jsx working exactly the same way, with no changes to that file.
if (!window.storage) {
  const PREFIX = "hanyu-app:";
  window.storage = {
    async get(key) {
      const raw = localStorage.getItem(PREFIX + key);
      if (raw === null) return null;
      return { key, value: raw, shared: false };
    },
    async set(key, value) {
      localStorage.setItem(PREFIX + key, value);
      return { key, value, shared: false };
    },
    async delete(key) {
      const existed = localStorage.getItem(PREFIX + key) !== null;
      localStorage.removeItem(PREFIX + key);
      return { key, deleted: existed, shared: false };
    },
    async list(prefix = "") {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(PREFIX + prefix)) keys.push(k.slice(PREFIX.length));
      }
      return { keys, prefix, shared: false };
    },
  };
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
