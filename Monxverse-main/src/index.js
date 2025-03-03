import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import {AuthContextProvider} from './context/authContext.jsx'
import { ChatContextProvider } from './context/chatContext.jsx';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthContextProvider>
    <ChatContextProvider>
      <App/>
    </ChatContextProvider>
    </AuthContextProvider>
  </React.StrictMode>
);


