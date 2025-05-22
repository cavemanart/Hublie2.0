import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';       // changed from '@/App'
import './index.css';          // changed from '@/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
