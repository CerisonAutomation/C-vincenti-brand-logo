import { createRoot } from "react-dom/client";
import * as Sentry from "@sentry/react";
import { onCLS, onINP, onFCP, onLCP, onTTFB } from 'web-vitals';
import { ClerkProvider } from '@clerk/clerk-react';
import App from "./App.tsx";
import "./index.css";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [
    Sentry.browserTracingIntegration(),
  ],
  tracesSampleRate: 1.0,
});

// Web Vitals monitoring for enterprise performance tracking
onCLS((metric) => console.log('CLS:', metric));
onINP((metric) => console.log('INP:', metric));
onFCP((metric) => console.log('FCP:', metric));
onLCP((metric) => console.log('LCP:', metric));
onTTFB((metric) => console.log('TTFB:', metric));

createRoot(document.getElementById("root")!).render(
  <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
    <App />
  </ClerkProvider>
);
