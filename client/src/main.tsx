// Completely disable all console output before any imports or code execution
(() => {
  const noop = () => {};

  // Override all common console methods with no-ops
  const consoleMethods = [
    "log", "warn", "info", "error", "debug", "trace",
    "group", "groupEnd", "groupCollapsed", "time", "timeEnd",
    "count", "countReset", "clear", "table", "dir", "dirxml", "assert",
  ];

  consoleMethods.forEach(method => {
    if (console[method]) {
      console[method] = noop;
    }
  });

  // Also override window.console if present
  if (typeof window !== "undefined" && window.console) {
    consoleMethods.forEach(method => {
      if (window.console[method]) {
        window.console[method] = noop;
      }
    });
  }

  // Disable React DevTools global hook
  if (typeof window !== "undefined") {
    window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
      onCommitFiberRoot: noop,
      onCommitFiberUnmount: noop,
      supportsFiber: true,
      inject: noop,
      onComponentCreated: noop,
      onComponentUpdated: noop,
      onComponentWillMount: noop,
      onComponentDidMount: noop,
      onComponentWillUnmount: noop,
    };
  }
})();

import React from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { registerServiceWorker } from "./lib/pwa";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster />
    </QueryClientProvider>
  </React.StrictMode>
);

registerServiceWorker();

