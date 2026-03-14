// src/main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

const root = document.getElementById('root');
if (root == null) throw new Error('Root element not found');

createRoot(root).render(
  <StrictMode>
    <div className="flex min-h-screen items-center justify-center bg-ewb-purple-50">
      <h1 className="text-2xl font-bold text-ewb-purple">
        Welcome to EWB Banking Portal
      </h1>
    </div>
  </StrictMode>,
);
