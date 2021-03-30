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
     * @returns {Promise} A promise that resolve the quiz id
     */
    this.makeRandomQuiz = function (numberOfQuestion, chapter = null, db = dbD) {
        return new Promise((resolve, reject) => {

            // Get all the question
            let request = 'SELECT * FROM QUESTION WHERE questionID NOT IN (SELECT theQuestion FROM Quiz, QuizQuestion WHERE theQuiz = quizID AND (asAnOrder = \'1\' OR asAnOrder = \'true\'))'
            let params = []

            if (chapter != null) {
                request += ' AND theChapter = ?'
                params.push(chapter)
            }

            db.all(request, params, function (err, rows) {
                if (err) reject(err)
                else {
                    if(rows.length < numberOfQuestion) throw new Error('Not enough question in the DB')

                    let questions = []

                    // Select the question
                    while (questions.length < numberOfQuestion) {
                        let index = -1
                        while (index == -1 || questions.indexOf(index) >= 0)
                            index = Math.floor(Math.random()*rows.length)

                        questions.push(rows.id)
                    }

                    // Add to the db
                    db.beginTransaction(function (err, t) {

                        // Insert the quiz
                        quiz_dao.insert({
                            quizID: -1,
                            asAnOrder: false,
                            theChapter: chapter,
                            quizName: 'randomQuiz',
                            quizType: 'RANDOM'
                        }, t)
                            // Insert the quizQuestion
                            .then(id => {

                                return Promise.allSettled(questions.map(item => {
                                    return promises.push(quizQuestion_dao.insert({
                                        theQuestion: item,
                                        theQuiz: id,
                                        qNumber: index+1
                                    }, t))
                                }))

                            })
                            // Commit
                            .then(results => {
                                let resError = results.find(e => e.status === 'rejected')
                                if (resError) throw resError
                                else {
                                    t.commit(err => {
                                        if (err) throw err
                                        else resolve(id)
                                    })
                                }
                            })
                            // Catch
                            .catch(err => {
                                t.rollback()
                                reject(err)
                            })

                    })
                }
            })

        })
    }

   /**
     * Get the max score of a quiz.
     *
     * @param quizID quiz id
     * @param db db instance to use
     * @returns {Promise} A promise that resolve the max score
     */
    this.getQuizMaxScore = function (quizID, db = dbD) {
        return new Promise((resolve, reject) => {

            // Get all the question
            let request = 'SELECT SUM(level) AS sum FROM Quiz, QuizQuestion, Question WHERE theQuiz = quizID AND theQuestion = questionID AND quizID = ?'
            db.all(request, [quizID], function (err, rows) {
                if (err) reject(err)
                else resolve(rows[0].sum)
            })

        })
    }
}

var helper = new QuizHelper()
module.exports = helper