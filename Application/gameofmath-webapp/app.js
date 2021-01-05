//server variable
const port_front = 3000;
const port_back = 5000;

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const renderApi = require('gameofmath-3dgraphics')

//Script's args
const script_args = process.argv.slice(2);
const script_dev = script_args.includes('dev');

//Init the App
const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//Init the middleware
app.use(session({
    secret: 'Etalone{58}',
    saveUninitialized: false,
    resave: false,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 1000 * 60 * 30
    },
    store: new SQLiteStore,
}));


app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser('67e45d7987d3566f0890j76567'));
app.use(express.static(path.join(__dirname, 'public')));


//ROUTE
const apiRouter = require('./routes/api');
app.use('/api/', apiRouter);
app.use('/graphics', renderApi.router)


//Open the server
app.listen(port_back, () => {
    console.log('Webapp open on port 5000' + (script_dev ? ' in development mod.' : '.'));
});

//ERROR handler
app.use(function (err, req, res, next) {
    console.error(err.stack);
    if (script_dev) res.status(500).send({returnState: -1, stack: '<pre>' + err.stack + '</pre>'})
    else res.send({returnState: -1})

});


module.exports = app;