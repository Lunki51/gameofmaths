import React from 'react';
import ReactDOM from 'react-dom';
import App from './app';

//ROUTE
import { BrowserRouter } from 'react-router-dom';

//Render the views on the root point
ReactDOM.render(
    <BrowserRouter>
        <App/>
    </BrowserRouter>,
    document.getElementById('root')
);

