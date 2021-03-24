const express = require('express')
const router = express.Router()

const chapter_dao = require('gameofmath-db').chapter_dao
const quiz_dao = require('gameofmath-db').quiz_dao
const quizDone_dao = require('gameofmath-db').quizDone_dao
const mpGain_dao = require('gameofmath-db').mpGain_dao
const db = require('gameofmath-db').db

/**
 * Get all the chapter in the DB.
 *
 * @return
 *  0: the chapter name in an array (chapters)
 */
router.post('/getChapter', (req, res, next) => {
    if (!req.session.isLogged) next(new Error('The client must be logged'))

    chapter_dao.findAll().then(rep => {
        res.send({returnState: 0, chapters: rep.map(c => c.name)})
    }).catch(err => {
        next(err)
    })
})

/**
 * Start a quiz a random quiz in a chapter.
 *
 * @param chapter the chapter of the quiz
 * @return
 *  0: the number of question in the quiz (nbQuestion)
 *  1: if there isn't any quiz in the chapter
 */
router.post('/startQuiz', (req, res, next) => {
    if (!req.session.isLogged || !req.session.isStudent) return next(new Error('Client must be logged and a student'))
    if (req.session.currentQuiz != null && req.session.currentQuiz.quizID > 0) return next(new Error('The student is already on a quiz'))
    if (req.body.chapter == null) return next(new Error('No chapter param in the body'))

    chapter_dao.findByName(req.body.chapter).then(chapter => {
        if (chapter) {

            quiz_dao.findAllInChapter(chapter.chapterID).then(quizs => {
                if (quizs.length === 0) res.send({returnState: 1, msg: 'Pas de quizz disponible pour ce chapitre.'})
                else {
                    const quiz = quizs[Math.floor(Math.random() * quizs.length)]

                    db.all('SELECT questionID, upperText, lowerText, image, type, level, U.theChapter, answerID, text, isValid, theQuiz, qNumber, asAnOrder FROM Question U, Answer A, QuizQuestion Q, Quiz Z WHERE questionID = A.theQuestion AND questionID = Q.theQuestion AND theQuiz = quizID AND quizID = ?', [quiz.quizID], function (err, questions) {
                        if (err) next(err)
                        else if (questions.length === 0) next(new Error('The quiz don\'t have any question'))
                        else {

                            req.session.currentQuiz = {}
                            req.session.currentQuiz.quizID = quiz.quizID
                            req.session.currentQuiz.quizLastQuestion = 0
                            req.session.currentQuiz.score = 0
                            req.session.currentQuiz.questions = questions.reduce((o, cur) => {

                                const index = o.findIndex(q => q.questionID === cur.questionID)
                                const answer = {answerID: cur.answerID, text: cur.text, isValid: cur.isValid}

                                if (index >= 0) {
                                    o[index].answers = o[index].answers.concat(answer)
                                } else {
                                    const obj = {...cur}
                                    obj.answers = [answer]

                                    delete obj.answerID
                                    delete obj.text
                                    delete obj.isValid

                                    o = o.concat(obj)
                                }

                                return o
                            }, [])

                            //Shuffle answer
                            req.session.currentQuiz.questions.forEach(q => {
                                for (let i = 0; i < q.answers.length; i++) {
                                    let p = Math.floor(Math.random() * q.answers.length)
                                    let t = q.answers[p]
                                    q.answers[p] = q.answers[i]
                                    q.answers[i] = t
                                }
                            })

                            if (['true', '1'].find(o => o === quiz.asAnOrder) != null) { //Order question
                                req.session.currentQuiz.questions.sort((a, b) => a.qNumber - b.qNumber)
                            } else { //Shuffle question
                                for (let i = 0; i < req.session.currentQuiz.questions.length; i++) {
                                    let p = Math.floor(Math.random() * req.session.currentQuiz.questions.length)
                                    let t = req.session.currentQuiz.questions[p]
                                    req.session.currentQuiz.questions[p] = req.session.currentQuiz.questions[i]
                                    req.session.currentQuiz.questions[i] = t
                                }
                            }

                            req.session.currentQuiz.maxScore = req.session.currentQuiz.questions.reduce((a, b) => a + b.level, 0)
                            req.session.currentQuiz.date = new Date()
                            quizDone_dao.insertMPGain({
                                mpGainID: -1,
                                amount: 0,
                                type: 'QUIZ',
                                date: req.session.currentQuiz.date,
                                theStudent: req.session.user.userID,
                                theQuiz: req.session.currentQuiz.quizID,
                                score: 0
                            }).then(id => {
                                req.session.currentQuiz.theGain = id
                                res.send({returnState: 0, nbQuestion: req.session.currentQuiz.questions.length})
                            }).catch(
                                err => {
                                    next(err)
                                }
                            )

                        }
                    })

                }
            }).catch(err => {
                next(err)
            })

        } else {
            next(new Error('Can\'t find the chapter'))
        }
    }).catch(err => {
        next(err)
    })

})

/**
 * Check if the student is in a quiz.
 *
 * @param chapter the chapter of the quiz
 * @return
 *  0: true if the student is in a quiz (isInQuiz)
 */
router.post('/isInQuiz', (req, res, next) => {
    if (!req.session.isLogged || !req.session.isStudent) return next(new Error('Client must be logged and a student'))

    res.send({returnState: 0, isInQuiz: req.session.currentQuiz != null && req.session.currentQuiz.quizID > 0})

})

/**
 * Get a question by is number.
 *
 * @param questionNb number of the question
 * @return
 *  0: the question (question)
 */
router.post('/getQuestion', (req, res, next) => {
    if (!req.session.isLogged || !req.session.isStudent) return next(new Error('Client must be logged and a student'))
    if (req.session.currentQuiz == null || req.session.currentQuiz.quizID <= 0) return next(new Error('The student don\'t have a current quiz'))

    const questionNb = req.body.questionNb
    if (questionNb == null || questionNb < 0) return next(new Error('No questionNb param in the body or invalid questionNb'))
    if (questionNb > req.session.currentQuiz.quizLastQuestion) return next(new Error('QuestionNb superior to the last quiz question'))

    const question = {...req.session.currentQuiz.questions[questionNb]}
    question.answers = [...question.answers]

    if (question.type === 'OPEN') delete question.answers
    else {
        for (let i = 0; i < question.answers.length; i++) {
            question.answers[i] = {answerID: question.answers[i].answerID, text: question.answers[i].text}
        }
    }

    res.send({returnState: 0, question: question})
})

/**
 * Get the answer to a question to validate the question
 *
 * @param questionNb number of the question
 * @param questionID id of the question
 * @param ->
 *  answer the answer for an open question
 *  or
 *  answers the array of id of the answer for a QCM or a QCU
 * @return
 *  0: nothing except if it was the last question in which case it return the score (score), the mpGain (mpGain), the max score (scoreMaxe) and the redirection (redirect)
 */
router.post('/postAnswer', (req, res, next) => {
    if (!req.session.isLogged || !req.session.isStudent) return next(new Error('Client must be logged and a student'))
    if (req.session.currentQuiz == null || req.session.currentQuiz.quizID <= 0) return next(new Error('The student don\'t have a current quiz'))

    const questionNb = req.body.questionNb
    const questionID = req.body.questionID
    if (questionNb == null || questionID == null) return next(new Error('QuestionNb or/and questionID param missing'))
    if (questionNb !== req.session.currentQuiz.quizLastQuestion && questionID !== req.session.currentQuiz.questions[questionNb].questionID) return next(new Error('The question don\'t match with the last question')) //TODO error ?

    const q = req.session.currentQuiz.questions[questionNb]
    if (q.type === 'OPEN') {
        const answer = req.body.answer
        if (answer != null && q.answers.find(o => ['1', 'true'].find(i => i === o.isValid) && answer === o.text)) req.session.currentQuiz.score += q.level

    } else { //TODO Upgrade the system for QCM and QCU
        const answers = req.body.answers
        if (Array.isArray(answers)) {
            if (answers.length === q.answers.filter(o => ['1', 'true'].find(i => i === o.isValid)).length) {
                let i = 0
                let stillValid = true
                while (i < answers.length && stillValid) {

                    const a = q.answers.find(o => o.answerID === answers[i])
                    if (a == null) return next(new Error('Answer not in the list of available answer'))

                    if (['0', 'false'].find(i => i === a.isValid)) stillValid = false
                    i++
                }

                if (stillValid) req.session.currentQuiz.score += q.level
            }

        }
    }

    quizDone_dao.update({
        theQuiz: req.session.currentQuiz.quizID,
        theGain: req.session.currentQuiz.theGain,
        score: req.session.currentQuiz.score
    }).catch(err => next(err))
    mpGain_dao.update({
        mpGainID: req.session.currentQuiz.theGain,
        amount: req.session.currentQuiz.score * 10,
        type: 'QUIZ',
        date: req.session.currentQuiz.date,
        theStudent: req.session.user.userID,
    }).catch(err => next(err))

    req.session.currentQuiz.quizLastQuestion++
    if (req.session.currentQuiz.quizLastQuestion >= req.session.currentQuiz.questions.length) {
        const currentQuiz = req.session.currentQuiz
        delete req.session.currentQuiz
        return res.send({
            returnState: 0,
            redirect: 'quizDone',
            score: currentQuiz.score,
            mpGain: currentQuiz.score * 10,
            scoreMax: currentQuiz.maxScore
        })
    }
    res.send({returnState: 0})
})

/**
 * Allow the student to quit the quiz.
 *
 * @return
 *  0: the score (score), the mpGain (mpGain), the max score (scoreMaxe) and the redirection (redirect)
 */
router.post('/quit', (req, res, next) => {
    if (!req.session.isLogged || !req.session.isStudent) return next(new Error('Client must be logged and a student'))
    if (req.session.currentQuiz == null || req.session.currentQuiz.quizID <= 0) return next(new Error('The student don\'t have a current quiz'))

    const currentQuiz = req.session.currentQuiz
    delete req.session.currentQuiz
    return res.send({
        returnState: 0,
        redirect: 'quizDone',
        score: currentQuiz.score,
        mpGain: currentQuiz.score * 10,
        scoreMax: currentQuiz.maxScore
    })
})

/**
 * Get the state in the quiz.
 *
 * @return
 *  0: state: { questionNb: the number of question, lastQuestion: the question where the student is }
 */
router.post('/getState', (req, res, next) => {
    if (!req.session.isLogged || !req.session.isStudent) return next(new Error('Client must be logged and a student'))
    if (req.session.currentQuiz == null || req.session.currentQuiz.quizID <= 0) return next(new Error('The student don\'t have a current quiz'))

    res.send({
        returnState: 0,
        state: {
            questionNb: req.session.currentQuiz.questions.length,
            lastQuestion: req.session.currentQuiz.quizLastQuestion
        }
    })
})

module.exports = router;