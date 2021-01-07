const express = require('express')
const router = express.Router()

const quiz_dao = require('gameofmath-db').quiz_dao
const question_dao = require('gameofmath-db').question_dao
const quizQuestion_dao = require('gameofmath-db').quizQuestion_dao
const chapter_dao = require('gameofmath-db').chapter_dao
const answer_dao = require('gameofmath-db').answer_dao
const db = require('gameofmath-db').db

// #########################################################################################
// #################################### QUIZ MANAGEMENT ####################################
// #########################################################################################

/**
 * Create new quiz
 *
 * @param ordered If the quiz question have an order
 * @param chapter The chapter of this quiz
 * @return
 *  0: quiz: the quiz
 *  1: if the ordered or/and chapter is incorrect
 */
router.post('/createQuiz', (req, res, next) => {
    if (!req.session.isLogged & !req.session.isTeacher) return next(new Error('Client must be logged on a Teacher account'))

    const isOrder = req.body.ordered
    const chapter = req.body.chapter

    if (isOrder == null || chapter == null || ['0', '1', 'true', 'false'].find(o => o === isOrder) == null) return res.send({
        returnState: 1,
        msg: 'The chapter or order is incorrect'
    })

    quiz_dao.insert({
        quizID: -1,
        isOrder: isOrder,
        chapter: chapter
    }).then(id => {
        res.send({returnState: 0, id: id, isOrder: isOrder, chapter: chapter})
    }).catch(err => next(err))
})

/**
 * Delete quiz
 *
 * @param id The id of quiz
 * @return
 *  0:
 *  1: if the quiz id is incorrect
 */
router.post('/delete', (req, res, next) => {
    if (!req.session.isLogged & !req.session.isTeacher) return next(new Error('Client must be logged on a Teacher account'))

    const id = req.body.id

    if (id == null) return res.send({returnState: 1, msg: 'The quiz id is incorrect'})

    quiz_dao.delete(id).then(() => {
        res.send({returnState: 0})
    }).catch(err => next(err))
})

/**
 * Change if quiz question have an order
 *
 * @param id The id of quiz
 * @param isOrder Define if the quiz question is order
 * @return
 *  0: quiz: The quiz
 *  1: if the quiz id is incorrect
 *  2: if isOrder is incorrect
 */
router.post('/setOrder', (req, res, next) => {
    if (!req.session.isLogged & !req.session.isTeacher) return next(new Error('Client must be logged on a Teacher account'))

    const id = req.body.id
    const isOrder = req.body.isOrder

    if (id == null) return res.send({returnState: 1, msg: 'The quiz id is incorrect'})
    if (isOrder == null || ['0', '1', 'true', 'false'].find(o => o === isOrder) == null) return res.send({
        returnState: 2,
        msg: 'isOrder is incorrect'
    })

    quiz_dao.findByID(id).then(c => {
        if (c == null) res.send({returnState: 1, msg: 'The quiz id is incorrect'})
        else {
            c.isOrder = isOrder
            quiz_dao.update(c).then(() => {
                res.send({returnState: 0, quiz: c})
            }).catch(err => next(err))
        }
    }).catch(err => next(err))
})

/**
 * Get quiz list
 *
 * @return
 *  0: quizzes: List of quiz
 */
router.post('/getQuizList', (req, res, next) => {
    if (!req.session.isLogged & !req.session.isTeacher) return next(new Error('Client must be logged on a Teacher account'))

    quiz_dao.findAll().then(q => {
        res.send({returnState: 0, quizzes: q})
    }).catch(err => next(err))
})

/**
 * Get quiz list with chapter id
 *
 * @param id the id of chapter
 * @return
 *  0: quizzes: List of quiz
 *  1: if the chapter id is incorrect
 */
router.post('/getQuizListWithChapterId', (req, res, next) => {
    if (!req.session.isLogged & !req.session.isTeacher) return next(new Error('Client must be logged on a Teacher account'))

    const id = req.body.id

    if (id == null) return res.send({returnState: 1, msg: 'The chapter id is incorrect'})

    quiz_dao.findAllInChapter(id).then(q => {
        res.send({returnState: 0, quizzes: q})
    }).catch(err => next(err))
})

// #############################################################################################
// #################################### QUESTION MANAGEMENT ####################################
// #############################################################################################

/**
 * Create new question
 *
 * @param chapterId The if of chapter
 * @param quizzId the id of quiz
 * @return
 *  0: question: THe question
 *  1: if the chapterId is incorrect
 *  2: if the quizId is incorrect
 *  3: if quizId and chapterId dont match
 */
router.post('/createQuestion', (req, res, next) => {
    if (!req.session.isLogged & !req.session.isTeacher) return next(new Error('Client must be logged on a Teacher account'))

    const chapterId = req.body.chapterId
    const quizId = req.body.quizId

    if (chapterId == null) res.send({returnState: 1, msg: 'ChapterId is incorrect'})
    if (quizId == null) res.send({returnState: 2, msg: 'QuizId is incorrect'})

    quiz_dao.findByID(quizId).then(quiz => {
        if (quiz == null) res.send({returnState: 2, msg: 'QuizId is incorrect'})
        else if (quiz.theChapter === chapterId) res.send({returnState: 3, msg: 'QuizId and chapterId dont match'})
        else {
            db.all('SELECT MAX(qNumber)+1 AS next FROM QuizQuestion WHERE theQuiz = ?', [quizId], function (err, rows) {
                if (err) next(err)
                else {

                    const nb = rows.length === 0 ? 1 : rows[0].next
                    db.beginTransaction(function (err, transaction) {
                        if (err) reject(err);
                        else {
                            const clone = {
                                questionId: -1,
                                upperText: '',
                                lowerText: '',
                                image: '',
                                type: 'QCM',
                                level: '1',
                                theChapter: chapterId,
                                theQuiz: quizId,
                                qNumber: nb
                            }
                            question_dao.insert(clone, transaction).then(id => {
                                clone.theQuestion = id;
                                quizQuestion_dao.insert(clone, transaction).then(_ => {
                                    transaction.commit(err => {
                                        if (err) next(err);
                                        else res.send({returnState: 0, question: clone})
                                    });
                                }).catch(err => {
                                    transaction.rollback();
                                    next(err);
                                });
                            }).catch(err => {
                                transaction.rollback();
                                next(err);
                            });
                        }
                    });

                }
            })
        }
    })
})

/**
 * Delete question
 *
 * @param id The id of quiz
 * @param qNumber The number of this question
 * @return
 *  0:
 *  1: if the question id is incorrect
 *  2: if The qNumber is incorrect
 */
router.post('/deleteQuestion', (req, res, next) => {
    if (!req.session.isLogged & !req.session.isTeacher) return next(new Error('Client must be logged on a Teacher account'))

    const id = req.body.id
    const qNumber = req.body.qNumber

    if (id == null) return res.send({returnState: 1, msg: 'The question id is incorrect'})
    if (qNumber == null) return res.send({returnState: 2, msg: 'The qNumber is incorrect'})

    quiz_dao.delete(id).then(() => {
        db.run('UPDATE QuizQuestion SET qNumber = qNumber - 1 WHERE theQuiz = ? AND qNumber > ?', [id,qNumber], function(err) {
            if(err) next(err)
            else res.send({returnState: 0})
        })
    }).catch(err => next(err))
})

/**
 * Change upperText
 *
 * @param id The id of question
 * @param upperText THe new upperText text
 * @return
 *  0: question: The question
 *  1: if the question id is incorrect
 *  2: if the quizId is incorrect
 *  3: if the upperText is incorrect
 *  4: if The quizId and quizId of question dont match
 */
router.post('/setUpperText', (req, res, next) => {
    if (!req.session.isLogged & !req.session.isTeacher) return next(new Error('Client must be logged on a Teacher account'))

    const id = req.body.id
    const quizId = req.body.quizId
    const upperText = req.body.upperText

    if (id == null) return res.send({returnState: 1, msg: 'The question id is incorrect'})
    if (quizId == null) return res.send({returnState: 2, msg: 'The quizId is incorrect'})
    if (upperText == null) return res.send({returnState: 3, msg: 'The upperText is incorrect'})

    db.all('SELECT * FROM QuizQuestion, Question WHERE theQuestion = questionID AND questionID = ?', [id], function (err, questions) {
        if (err) next(err)
        else {
            const q = questions[0]
            if (q == null) res.send({returnState: 1, msg: 'The quiz id is incorrect'})
            else if (q.theQuiz !== quizId) res.send({
                returnState: 4,
                msg: 'The quizId and quizId of question dont match'
            })
            else {
                q.upperText = upperText
                question_dao.update(q).then(() => {
                    res.send({returnState: 0, question: q})
                }).catch(err => next(err))
            }
        }
    })
})

/**
 * Change lowerText
 *
 * @param id The id of question
 * @param lowerText THe new lowerText text
 * @return
 *  0: question: The question
 *  1: if the question id is incorrect
 *  2: if the quizId is incorrect
 *  3: if the lowerText is incorrect
 *  4: if The quizId and quizId of question dont match
 */
router.post('/setLowerText', (req, res, next) => {
    if (!req.session.isLogged & !req.session.isTeacher) return next(new Error('Client must be logged on a Teacher account'))

    const id = req.body.id
    const quizId = req.body.quizId
    const lowerText = req.body.lowerText

    if (id == null) return res.send({returnState: 1, msg: 'The question id is incorrect'})
    if (quizId == null) return res.send({returnState: 2, msg: 'The quizId is incorrect'})
    if (lowerText == null) return res.send({returnState: 3, msg: 'The lowerText is incorrect'})

    db.all('SELECT * FROM QuizQuestion, Question WHERE theQuestion = questionID AND questionID = ?', [id], function (err, questions) {
        if (err) next(err)
        else {
            const q = questions[0]
            if (q == null) res.send({returnState: 1, msg: 'The quiz id is incorrect'})
            else if (q.theQuiz !== quizId) res.send({
                returnState: 4,
                msg: 'The quizId and quizId of question dont match'
            })
            else {
                q.lowerText = lowerText
                question_dao.update(q).then(() => {
                    res.send({returnState: 0, question: q})
                }).catch(err => next(err))
            }
        }
    })
})

/**
 * Change image
 *
 * @param id The id of question
 * @param image THe new image
 * @return
 *  0: question: The question
 *  1: if the question id is incorrect
 *  2: if the quizId is incorrect
 *  3: if the image is incorrect
 *  4: if The quizId and quizId of question dont match
 */
router.post('/setImage', (req, res, next) => {
    if (!req.session.isLogged & !req.session.isTeacher) return next(new Error('Client must be logged on a Teacher account'))
    //TODO Change IMAGE
/*
    const id = req.body.id
    const quizId = req.body.quizId
    const image = req.body.image

    if (id == null) return res.send({returnState: 1, msg: 'The question id is incorrect'})
    if (quizId == null) return res.send({returnState: 2, msg: 'The quizId is incorrect'})
    if (image == null) return res.send({returnState: 3, msg: 'The image is incorrect'})

    db.all('SELECT * FROM QuizQuestion, Question WHERE theQuestion = questionID AND questionID = ?', [id], function (err, questions) {
        if (err) next(err)
        else {
            const q = questions[0]
            if (q == null) res.send({returnState: 1, msg: 'The quiz id is incorrect'})
            else if (q.theQuiz !== quizId) res.send({
                returnState: 4,
                msg: 'The quizId and quizId of question dont match'
            })
            else {
                q.image = image
                question_dao.update(q).then(() => {
                    res.send({returnState: 0, question: q})
                }).catch(err => next(err))
            }
        }
    })*/
})

/**
 * Change type
 *
 * @param id The id of question
 * @param type THe new type
 * @return
 *  0: question: The question
 *  1: if the question id is incorrect
 *  2: if the quizId is incorrect
 *  3: if the image is incorrect
 *  4: if The quizId and quizId of question dont match
 */
router.post('/setType', (req, res, next) => {
    if (!req.session.isLogged & !req.session.isTeacher) return next(new Error('Client must be logged on a Teacher account'))

    const id = req.body.id
    const quizId = req.body.quizId
    const type = req.body.type

    if (id == null) return res.send({returnState: 1, msg: 'The question id is incorrect'})
    if (quizId == null) return res.send({returnState: 2, msg: 'The quizId is incorrect'})
    if (type == null || ['QCM', 'QCU', 'OPEN'].find(o => o === type) == null) return res.send({
        returnState: 3,
        msg: 'The type is incorrect'
    })

    db.all('SELECT * FROM QuizQuestion, Question WHERE theQuestion = questionID AND questionID = ?', [id], function (err, questions) {
        if (err) next(err)
        else {
            const q = questions[0]
            if (q == null) res.send({returnState: 2, msg: 'The quiz id is incorrect'})
            else if (q.theQuiz !== quizId) res.send({
                returnState: 4,
                msg: 'The quizId and quizId of question dont match'
            })
            else {
                q.type = type
                question_dao.update(q).then(() => {
                    res.send({returnState: 0, question: q})
                }).catch(err => next(err))
            }
        }
    })
})

/**
 * Change level
 *
 * @param id The id of question
 * @param level The new level
 * @return
 *  0: question: The question
 *  1: if the question id is incorrect
 *  2: if the quizId is incorrect
 *  3: if the level is incorrect
 *  4: if The quizId and quizId of question dont match
 */
router.post('/setType', (req, res, next) => {
    if (!req.session.isLogged & !req.session.isTeacher) return next(new Error('Client must be logged on a Teacher account'))

    const id = req.body.id
    const quizId = req.body.quizId
    const level = req.body.level

    if (id == null) return res.send({returnState: 1, msg: 'The question id is incorrect'})
    if (quizId == null) return res.send({returnState: 2, msg: 'The quizId is incorrect'})
    if (level == null || level > 0) return res.send({returnState: 3, msg: 'The level is incorrect'})

    db.all('SELECT * FROM QuizQuestion, Question WHERE theQuestion = questionID AND questionID = ?', [id], function (err, questions) {
        if (err) next(err)
        else {
            const q = questions[0]
            if (q == null) res.send({returnState: 2, msg: 'The quiz id is incorrect'})
            else if (q.theQuiz !== quizId) res.send({
                returnState: 4,
                msg: 'The quizId and quizId of question dont match'
            })
            else {
                q.level = level
                question_dao.update(q).then(() => {
                    res.send({returnState: 0, question: q})
                }).catch(err => next(err))
            }
        }
    })
})

/**
 * Get list of question
 *
 * @param id the id of quiz
 * @return
 *  0: questions: list of questions in this quiz
 *  1: if The quiz id is incorrect
 */
router.post('/getQuestionList', (req, res, next) => {
    if (!req.session.isLogged & !req.session.isTeacher) return next(new Error('Client must be logged on a Teacher account'))

    const id = req.body.id

    if (id == null) return res.send({returnState: 1, msg: 'The quiz id is incorrect'})

    db.all('SELECT * FROM QuizQuestion, Question WHERE theQuestion = questionID AND theQuiz = ?', [id], function (err, questions) {
        if (err) next(err)
        else res.send({returnState: 0, questions: questions})
    }).catch(err => next(err))
})

// #############################################################################################
// #################################### ANSWER MANAGEMENT ####################################
// #############################################################################################

/**
 * Create new answer
 *
 * @param chapterId The if of chapter
 * @param quizzId the id of quiz
 * @param questionId the id of question
 * @return
 *  0: answer: THe answer
 *  1: if the questionId is incorrect
 *  2: if the chapterId is incorrect
 *  3: if the quizId is incorrect
 *  4: if quizId and chapterId dont match
 *  5: if QuestionId and chapterId dont match
 */
router.post('/createAnswer', (req, res, next) => {
    if (!req.session.isLogged & !req.session.isTeacher) return next(new Error('Client must be logged on a Teacher account'))

    const questionId = req.body.questionId
    const chapterId = req.body.chapterId
    const quizId = req.body.quizId

    if (questionId == null) res.send({returnState: 1, msg: 'questionId is incorrect'})
    if (chapterId == null) res.send({returnState: 2, msg: 'ChapterId is incorrect'})
    if (quizId == null) res.send({returnState: 3, msg: 'QuizId is incorrect'})

    quiz_dao.findByID(quizId).then(quiz => {
        if (quiz == null) res.send({returnState: 3, msg: 'QuizId is incorrect'})
        else if (quiz.theChapter === chapterId) res.send({returnState: 4, msg: 'QuizId and chapterId dont match'})
        else {
            question_dao.findByID(questionId).then(question => {
                if (question == null) res.send({returnState: 1, msg: 'QuestionId is incorrect'})
                else if (question.theChapter === chapterId) res.send({
                    returnState: 5,
                    msg: 'QuestionId and chapterId dont match'
                })
                else {
                    const answer = {answerId: -1, text: '', isValid: 'false', questionId: questionId}
                    answer_dao.insert(answer).then(() => {
                        res.send({returnState: 0, answer: answer})
                    }).catch(err => next(err))
                }
            }).catch(err => next(err))
        }
    }).catch(err => next(err))
})

/**
 * Delete answer
 *
 * @param id The id of answer
 * @return
 *  0:
 *  1: if the answer id is incorrect
 */
router.post('/deleteAnswer', (req, res, next) => {
    if (!req.session.isLogged & !req.session.isTeacher) return next(new Error('Client must be logged on a Teacher account'))

    const id = req.body.id

    if (id == null) return res.send({returnState: 1, msg: 'The answer id is incorrect'})

    answer_dao.delete(id).then(() => {
        res.send({returnState: 0})
    }).catch(err => next(err))
})

/**
 * Change text
 *
 * @param id The id of answer
 * @param text the text
 * @param theQuestion the question id
 * @return
 *  0: answer: The answer
 *  1: if The answer id is incorrect
 *  2: if The text is incorrect
 *  3: if The theQuestion is incorrect
 */
router.post('/setText', (req, res, next) => {
    if (!req.session.isLogged & !req.session.isTeacher) return next(new Error('Client must be logged on a Teacher account'))

    const id = req.body.id
    const text = req.body.text
    const theQuestion = req.body.theQuestion

    if (id == null) return res.send({returnState: 1, msg: 'The answer id is incorrect'})
    if (text == null) return res.send({returnState: 2, msg: 'The text is incorrect'})
    if (theQuestion == null) return res.send({returnState: 3, msg: 'The theQuestion is incorrect'})

    db.all('SELECT * FROM ANSWER WHERE theQuestion = ? AND answerID = ?', [theQuestion,id], function (err, answers) {
        if (err) next(err)
        else {
            const a = answers[0]
            if (a == null) res.send({returnState: 1, msg: 'The answer id is incorrect'})
            else {
                a.text = text
                answer_dao.update(a).then(() => {
                    res.send({returnState: 0, answer: a})
                }).catch(err => next(err))
            }
        }
    })
})

/**
 * Change isValid
 *
 * @param id The id of answer
 * @param isValid the isValis value
 * @param theQuestion the question id
 * @return
 *  0: answer: The answer
 *  1: if The answer id is incorrect
 *  2: if The isValid is incorrect
 *  3: if The theQuestion is incorrect
 */
router.post('/setText', (req, res, next) => {
    if (!req.session.isLogged & !req.session.isTeacher) return next(new Error('Client must be logged on a Teacher account'))

    const id = req.body.id
    const isValid = req.body.isValid
    const theQuestion = req.body.theQuestion

    if (id == null) return res.send({returnState: 1, msg: 'The answer id is incorrect'})
    if (isValid == null || ['0','1','false','true'].find(o => o === isValid) == null) return res.send({returnState: 2, msg: 'The isValid is incorrect'})
    if (theQuestion == null) return res.send({returnState: 3, msg: 'The theQuestion is incorrect'})

    db.all('SELECT * FROM ANSWER WHERE theQuestion = ? AND answerID = ?', [theQuestion,id], function (err, answers) {
        if (err) next(err)
        else {
            const a = answers[0]
            if (a == null) res.send({returnState: 1, msg: 'The answer id is incorrect'})
            else {
                a.isValid = isValid
                answer_dao.update(a).then(() => {
                    res.send({returnState: 0, answer: a})
                }).catch(err => next(err))
            }
        }
    })
})

/**
 * Get list of answer
 *
 * @param id the id of question
 * @return
 *  0: answers: list of answers in this question
 *  1: if The question id is incorrect
 */
router.post('/getAnswersList', (req, res, next) => {
    if (!req.session.isLogged & !req.session.isTeacher) return next(new Error('Client must be logged on a Teacher account'))

    const id = req.body.id

    if (id == null) return res.send({returnState: 1, msg: 'The question id is incorrect'})

    answer_dao.findAllInQuestion(id).then(a => {
        res.send({returnState: 0, answers: a})
    }).catch(err => next(err))
})

module.exports = router;