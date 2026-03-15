import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

console.log('🚀 App initializing...');

// Force unregister all service workers to fix loading issues
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister().then(() => {
        console.log('Service Worker unregistered:', registration);
      });
    }
  });
}

console.log('📱 Rendering React app...');
const rootElement = document.getElementById("root");
console.log('Root element:', rootElement);
if (rootElement) {
  createRoot(rootElement).render(<App />);
  console.log('✅ App rendered successfully');
} else {
  console.error('❌ Root element not found!');
}
