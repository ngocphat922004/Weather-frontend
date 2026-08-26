import {
  createRoot,
} from 'react-dom/client';

import App from './App';

import {
  WeatherProvider,
} from './stores/WeatherContext';

import './index.css';
import './styles/global.scss';

const rootElement =
  document.getElementById('root');

if (!rootElement) {
  throw new Error(
    'Không tìm thấy phần tử #root.',
  );
}

createRoot(rootElement).render(
  <WeatherProvider>
    <App />
  </WeatherProvider>,
);