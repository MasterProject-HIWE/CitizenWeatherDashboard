import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import 'leaflet/dist/leaflet.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import store from './components/shared/features/Store';
import { Provider } from 'react-redux';
import { ButtonProvider } from './components/ButtonContext/ButtonContext';
import { UserContextprovider } from './components/UserContext/UserContext';
import { KantonContextProvider } from './components/KantonContext/KantonContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <Provider store={store}>
            <ButtonProvider>
                <UserContextprovider>
                    <KantonContextProvider>
                        <App />
                    </KantonContextProvider>
                </UserContextprovider>
            </ButtonProvider>
        </Provider>
    </React.StrictMode >
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
