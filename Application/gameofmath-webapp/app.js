const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('cookie-session');


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
    name:"session",
    secret: 'Etalone{58}',
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    saveUninitialized: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser('67e45d7987d3566f0890j76567'));
app.use(express.static(path.join(__dirname, 'public')));



//ROUTE
const indexRouter = require('./routes/index');
app.use('/', indexRouter);


//Open the server
app.listen(5000, () => {
    console.log('Webapp open on port 5000' + (script_dev ? ' in development mod.' : '.'));
});

//ERROR handler
app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.status(500).send(script_dev ? '<pre>'+err.stack+'</pre>' : 'Something broke!');
});

module.exports = app;