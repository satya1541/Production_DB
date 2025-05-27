
// Completely disable all console output before any imports or code execution
(() => {
  const noop = () => {};
  
  // Override console methods on both global scope and window
  const consoleOverride = {
    log: noop,
    warn: noop,
    info: noop,
    error: noop,
    debug: noop,
    trace: noop,
    group: noop,
    groupEnd: noop,
    groupCollapsed: noop,
    time: noop,
    timeEnd: noop,
    count: noop,
    countReset: noop,
    clear: noop,
    table: noop,
    dir: noop,
    dirxml: noop,
    assert: noop,
  };
  
  // Apply to global console
  Object.assign(globalThis.console, consoleOverride);
  
  // Apply to window console if available
  if (typeof window !== 'undefined') {
    Object.assign(window.console, consoleOverride);
    
    // Suppress React DevTools
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
    
    // Override addEventListener to block console-related events
    const originalAddEventListener = window.addEventListener;
    window.addEventListener = function(type, listener, options) {
      // Block beforeinstallprompt events that cause banner warnings
      if (type === 'beforeinstallprompt') {
        return;
      }
      return originalAddEventListener.call(this, type, listener, options);
    };
  }
  
  // Intercept and suppress Vite HMR messages
  if (import.meta.hot) {
    // Override Vite's internal logging
    const originalSend = import.meta.hot.send;
    import.meta.hot.send = noop;
    
    // Suppress HMR connection messages
    import.meta.hot.on = noop;
    import.meta.hot.off = noop;
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
  </React.StrictMode>,
);

// Register service worker for PWA functionality
registerServiceWorker();
