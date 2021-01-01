
//server variable
const port_front = 3000;
const port_back = 5000;

const express         = require('express');
const path            = require('path');
const cookieParser    = require('cookie-parser');

const session         = require('express-session');

const SQLiteStore = require('connect-sqlite3')(session);

//dao
const userDao = require('./gameofmath-db/user_dao')
const teacherDao = require('./gameofmath-db/teacher_dao')
const chapterDao = require('./gameofmath-db/chapter_dao')
const questionDao = require('./gameofmath-db/question_dao')
const quizDao = require("./gameofmath-db/quiz_dao")

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
    cookie:{
        secure : false,
        httpOnly : true,
        maxAge : 1000 * 60 * 30
    },
    store: new SQLiteStore,
}));


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser('67e45d7987d3566f0890j76567'));
app.use(express.static(path.join(__dirname, 'public')));


//ROUTE

const indexRouter = require('./routes');
app.use('/', indexRouter);


//authentication

app.post('/api/auth', (req,res) => {


    const username = req.body.username;
    const password = req.body.password;

   const user = {
        username : "user1",
        password : "12345"
    };


    //TODO make dao works
   /* userDao.findByLogin(username)
        .then(res => {
           const user = res;




        })
*/

    if(user && user.username === username && user.password === password){

        req.session.login = username

        res.send(true)
    }else{
        res.send(false)
    }


})


app.post('/api/question', (req ,res) => {

    const nbQuestion = req.body.nbQuestion;
    const chapter = req.body.chapter;

    findAllInChapter().then((response) => {

    })


});



app.get('/api/getChapter', (req,res) => {

    res.send(["Chap1","Chap2","Chap3","Chap4","Chap5","Chap6","Chap7","Chap8","Chap9","Chap10"])

})


app.get('/api/isAuth',(req, res) => {

    if(req.session.login){
        res.send(true)
    }else{
        res.send(false)
    }

})


app.get('/api/sessionUsername',(req, res) => {

    res.send(req.session.login)

})



app.get('/api/logout', (req, res) => {

    delete req.session.login

    res.header('Content-type: xml/plain').send('logged out')

})


app.post('/api/setCurrentPage', (req,res)=>{

    req.session.currentPage = req.body.currentPage

    res.send('ok')

})

app.get('/api/getCurrentPage', (req,res)=>{

    res.send()  

})


app.post('/api/getQuiz', (req, res) =>{

    const chapter = req.body.chapter;

    switch (chapter){
        case "chap1":
            res.send(["quiz1","quiz2","quiz3","quiz4","quiz5","quiz6","quiz7","quiz7","quiz9","quiz10",])
            break
        case "chap2":
            res.send(["quiz1","quiz2","quiz3","quiz4","quiz5","quiz6","quiz7","quiz7","quiz9","quiz10",])
            break
        case "chap3":
            res.send(["quiz1","quiz2","quiz3","quiz4","quiz5","quiz6","quiz7","quiz7","quiz9","quiz10",])
            break
        case "chap4":
            res.send(["quiz1","quiz2","quiz3","quiz4","quiz5","quiz6","quiz7","quiz7","quiz9","quiz10",])
            break
        case "chap5":
            res.send(["quiz1","quiz2","quiz3","quiz4","quiz5","quiz6","quiz7","quiz7","quiz9","quiz10",])
            break
        case "chap6":
            res.send(["quiz1","quiz2","quiz3","quiz4","quiz5","quiz6","quiz7","quiz7","quiz9","quiz10",])
            break
        case "chap7":
            res.send(["quiz1","quiz2","quiz3","quiz4","quiz5","quiz6","quiz7","quiz7","quiz9","quiz10",])
            break
    }








    /*
    quizDao.findAllInChapter(chapter)
        .then((response) => {
            res.send(response)
        })

    */

})


//Open the server
app.listen(port_back, () => {
    console.log('Webapp open on port 5000' + (script_dev ? ' in development mod.' : '.'));
});

//ERROR handler
app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.status(500).send(script_dev ? '<pre>'+err.stack+'</pre>' : 'Something broke!');
});


module.exports = app;