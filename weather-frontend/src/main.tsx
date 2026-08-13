import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';
import { WeatherProvider } from './stores/WeatherContext';

import './index.css';
import './styles/global.scss';

createRoot(
  document.getElementById('root')!,
).render(
  <StrictMode>
    <WeatherProvider>
      <App />
    </WeatherProvider>
  </StrictMode>,
);