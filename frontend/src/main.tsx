import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { BrowserRouter } from 'react-router-dom';
import { AdProvider } from './context/AdContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AdProvider>
        <App />
      </AdProvider>
    </BrowserRouter>
  </StrictMode>,
);
