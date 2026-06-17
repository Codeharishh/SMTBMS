import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import { GoogleOAuthProvider } from '@react-oauth/google';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <GoogleOAuthProvider clientId="291403377955-5rht5sc1eki5irt44e7cihf85jm1kj04.apps.googleusercontent.com"></GoogleOAuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
