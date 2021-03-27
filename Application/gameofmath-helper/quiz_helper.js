const dbD = require('gameofmath-db').db
const quiz_dao = require('gameofmath-db').quiz_dao
const quizQuestion_dao = require('gameofmath-db').quizQuestion_dao

const QuizHelper = function () {
   /**
     * Make a ramdom quiz.
     *
     * @param numberOfQuestion the number of question
     * @param chapter the topic chapter (null by default)
     * @param db db instance to use
     * @returns {Promise} A promise that resolve the castle with this id if it's found
     */
    this.makeRandomQuiz = function (numberOfQuestion, chapter = null, db = dbD) {
        return new Promise((resolve, reject) => {

            let request = 'SELECT * FROM QUESTION WHERE questionID NOT IN (SELECT theQuestion FROM Quiz, QuizQuestion WHERE theQuiz = quizID AND (asAnOrder = \'1\' OR asAnOrder = \'true\'))'
            let params = []

            if (chapter != null) {
                request += ' AND theChapter = ?'
                params.push(chapter)
            }

            db.all(request, params, function (err, rows) {
                if (err) reject(err)
                else if(rows.length < numberOfQuestion) reject(new Error('Not enough question in the DB'))
                else {

                    let questions = []

                    // select the question
                    while (questions.length < numberOfQuestion) {
                        let index = -1
                        while (index == -1 || questions.indexOf(index) >= 0)
                            index = Math.floor(Math.random()*rows.length)

                        questions.push(rows.id)
                    }

                    // add to the db
                    db.beginTransaction(function (err, t) {

                        quiz_dao.insert({
                            quizID: -1,
                            asAnOrder: false,
                            theChapter: chapter,
                            quizName: 'randomQuiz',
                            quizType: 'RANDOM'
                        }, t)
                            .then(async id => {

                                let i = 0
                                let good = true
                                while (good && i < numberOfQuestion) {

                                    await quizQuestion_dao.insert({
                                        theQuestion: questions[i],
                                        theQuiz: id,
                                        qNumber: i+1
                                    }, t).catch(err => {
                                        good = false
                                        t.rollback()
                                        reject(err)
                                    })

                                }

                            })
                            .catch(err => {
                            t.rollback()
                            reject(err)
                        })

                    })
                }
            })

        })
    }
}

var helper = new QuizHelper()
module.exports = helper