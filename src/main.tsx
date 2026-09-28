import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { HeliosDataProvider } from './context/HeliosDataContext';
import { ConvexProvider, ConvexReactClient } from 'convex/react';

// Optional live Convex client if configured
const convexUrl = import.meta.env.VITE_CONVEX_URL;
const hasLiveConvex = convexUrl && !convexUrl.includes('placeholder');
const convexClient = hasLiveConvex ? new ConvexReactClient(convexUrl) : null;

function Root() {
  const content = (
    <HeliosDataProvider>
      <App />
    </HeliosDataProvider>
  );

  if (convexClient) {
    return <ConvexProvider client={convexClient}>{content}</ConvexProvider>;
  }

  return content;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>
);
