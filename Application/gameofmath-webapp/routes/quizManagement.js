const express = require('express')
const router = express.Router()

const quiz_dao = require('gameofmath-db').quiz_dao
const question_dao = require('gameofmath-db').question_dao
const quizQuestion_dao = require('gameofmath-db').quizQuestion_dao
const chapter_dao = require('gameofmath-db').chapter_dao
const answer_dao = require('gameofmath-db').answer_dao
const db = require('gameofmath-db').db
const multer = require('multer')
const path = require('path')
const fs = require('fs')

// ##########################################################################################
// ################################### CHAPTER MANAGEMENT ###################################
// ##########################################################################################

/**
 * Get all the chapter in the DB.
 *
 * @return
 *  0: chapters: an array with all the chapters
 */
router.post('/getChapters', (req, res, next) => {
    if (!req.session.isLogged || !req.session.isTeacher) next(-1, 'The client must be logged on a teacher account')

    chapter_dao.findAll().then(rep => {
        res.send({returnState: 0, chapters: rep})
    }).catch(err => {
        next(err)
    })
})

/**
 * Get a chapter by ID
 *
 * @param id chapter id
 * @return
 *  0: chapter: the chapter
 *  1: if the chapter id is incorrect
 */
router.post('/getChapter', (req, res, next) => {
    if (!req.session.isLogged & !req.session.isTeacher) return next(new Error('Client must be logged on a Teacher account'))

    const id = req.body.id

    if (id == null) return res.send({returnState: 1, msg: 'The chapter id is incorrect'})

    chapter_dao.findByID(id).then(chapter => {
        if (chapter == null) res.send({returnState: 1, msg: 'The chapter id is incorrect'})
        else res.send({returnState: 0, chapter: chapter})
    }).catch(err => next(err))
})

/**
 * Create new chapter
 *
 * @param name The chapter's name
 * @return
 *  0: chapter: the chapter
 *  1: if the chapter's name is incorrect
 */
router.post('/createChapter', (req, res, next) => {
    if (!req.session.isLogged && !req.session.isTeacher) return next(new Error('Client must be logged on a Teacher account'))

    const name = req.body.name

    if (name == null) return res.send({
        returnState: 1,
        msg: 'The chapter\'s name is incorrect'
    })

    chapter_dao.insert({
        chapterID: -1,
        name: name
    }).then(id => {
        res.send({returnState: 0, chapter: {chapterID: id, name: name}})
    }).catch(err => next(err))
})

/**
 * Delete a chapter
 *
 * @param id The id of the chapter
 * @return
 *  0:
 *  1: if the chapter id is incorrect
 */
router.post('/deleteChapter', (req, res, next) => {
    if (!req.session.isLogged && !req.session.isTeacher) return next(new Error('Client must be logged on a Teacher account'))

    const id = req.body.id

    if (id == null) return res.send({returnState: 1, msg: 'The chapter id is incorrect'})

    db.beginTransaction(function (err, t) {

        quiz_dao.findAllInChapter(id, t).then(rows => {
            const quizzes = rows.map(o => o.quizID).join(',')

            t.run('DELETE FROM Answer WHERE theQuestion IN (SELECT theQuestion FROM QuizQuestion WHERE theQuiz IN (' + quizzes + '))', [], function (err) {
                if (err) {
                    t.rollback()
                    next(err)
                } else {

                    t.all('SELECT * FROM QuizQuestion WHERE theQuiz IN (' + quizzes + ')', [], (err, rows) => {
                        if (err) {
                            t.rollback()
                            next(err)
                        } else {
                            t.run('DELETE FROM QuizQuestion WHERE theQuiz IN (' + quizzes + ')', [], function (err) {
                                if (err) {
                                    t.rollback()
                                    next(err)
                                } else {
                                    const ids = rows.map(o => o.theQuestion).join(',')

                                    t.run('DELETE FROM Question WHERE questionID IN (' + ids + ')', [], async function (err) {
                                        if (err) {
                                            t.rollback()
                                            next(err)
                                        } else {

                                            t.run('DELETE FROM Quiz WHERE quizID IN (' + quizzes + ')', [], function (err) {
                                                if (err) {
                                                    t.rollback()
                                                    next(err)
                                                } else {
                                                    t.run('DELETE FROM Chapter WHERE chapterID = ?', [id], function (err) {
                                                        if (err) {
                                                            t.rollback()
                                                            next(err)
                                                        } else {
                                                            t.commit(err => {
                                                                if (err) next(err);
                                                                else res.send({returnState: 0});
                                                            });
                                                        }
                                                    })
                                                }
                                            })

                                        }
                                    })

                                }
                            })
                        }
                    })
                }
            })

        }).catch(err => {
            t.rollback()
            next(err)
        })
    })
})

/**
 * Change the chapter's name
 *
 * @param id The id of the chapter
 * @param name new name of the chapter
 * @return
 *  0: chapter: The chapter
 *  1: if the chapter id is incorrect
 *  2: if the name is incorrect
 */
router.post('/setChapterName', (req, res, next) => {
    if (!req.session.isLogged && !req.session.isTeacher) return next(new Error('Client must be logged on a Teacher account'))

    const id = req.body.id
    const name = req.body.name

    if (id == null) return res.send({returnState: 1, msg: 'The chapter id is incorrect'})
    if (name == null) return res.send({
        returnState: 2,
        msg: 'The name is incorrect'
    })

    chapter_dao.findByID(id).then(c => {
        if (c == null) res.send({returnState: 1, msg: 'The chapter id is incorrect'})
        else {
            c.name = name
            chapter_dao.update(c).then(() => {
                res.send({returnState: 0, chapter: c})
            }).catch(err => next(err))
        }
    }).catch(err => next(err))
})

// #########################################################################################
// #################################### QUIZ MANAGEMENT ####################################
// #########################################################################################

/**
 * Create new quiz
 *
 * @param ordered If the quiz question have an order
 * @param chapter The chapter of this quiz
 * @param quizName The quiz name of this quiz
 * @return
 *  0: quiz: the quiz
 *  1: if the ordered or/and chapter is incorrect
 *  : if the quizName is incorrect
 */
router.post('/createQuiz', (req, res, next) => {
    if (!req.session.isLogged && !req.session.isTeacher) return next(new Error('Client must be logged on a Teacher account'))

    const isOrder = req.body.ordered
    const chapter = req.body.chapter
    const quizName = req.body.quizName

    if (isOrder == null || chapter == null || ['0', '1', 'true', 'false'].find(o => o === isOrder) == null) return res.send({
        returnState: 1,
        msg: 'The chapter or order is incorrect'
    })
    if (quizName == null) return res.send({
        returnState: 2,
        msg: 'The quizName is incorrect'
    })

    quiz_dao.insert({
        quizID: -1,
        asAnOrder: isOrder,
        theChapter: chapter,
        quizName: quizName
    }).then(id => {
        res.send({returnState: 0, quiz: {quizID: id, asAnOrder: isOrder, theChapter: chapter, quizName: quizName}})
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
router.post('/deleteQuiz', (req, res, next) => {
    if (!req.session.isLogged && !req.session.isTeacher) return next(new Error('Client must be logged on a Teacher account'))

    const id = req.body.id

    if (id == null) return res.send({returnState: 1, msg: 'The quiz id is incorrect'})

    db.beginTransaction(function (err, t) {

        t.run('DELETE FROM Answer WHERE theQuestion IN (SELECT theQuestion FROM QuizQuestion WHERE theQuiz = ?)', [id], function (err) {
            if (err) {
                t.rollback()
                next(err)
            } else {

                quizQuestion_dao.findAllByQuiz(id, t).then(rows => {

                    t.run('DELETE FROM QuizQuestion WHERE theQuiz = ?', [id], function (err) {
                        if (err) {
                            t.rollback()
                            next(err)
                        } else {
                            const ids = rows.map(o => o.theQuestion).join(',')

                            t.run('DELETE FROM Question WHERE questionID IN (' + ids + ')', [], async function (err) {
                                if (err) {
                                    t.rollback()
                                    next(err)
                                } else {

                                    t.run('DELETE FROM Quiz WHERE quizID = ?', [id], function (err) {
                                        if (err) {
                                            t.rollback()
                                            next(err)
                                        } else {
                                            t.commit(err => {
                                                if (err) next(err);
                                                else res.send({returnState: 0});
                                            });

                                        }
                                    })

                                }
                            })

                        }
                    })
                }).catch(err => {
                    t.rollback()
                    next(err)
                })
            }
        })
    })
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
    if (!req.session.isLogged && !req.session.isTeacher) return next(new Error('Client must be logged on a Teacher account'))

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
            c.asAnOrder = isOrder
            quiz_dao.update(c).then(() => {
                res.send({returnState: 0, quiz: c})
            }).catch(err => next(err))
        }
    }).catch(err => next(err))
})

/**
 * Change the quiz name
 *
 * @param id The id of quiz
 * @param quizName new quizName
 * @return
 *  0: quiz: The quiz
 *  1: if the quiz id is incorrect
 *  2: if quizName is incorrect
 */
router.post('/setQuizName', (req, res, next) => {
    if (!req.session.isLogged && !req.session.isTeacher) return next(new Error('Client must be logged on a Teacher account'))

    const id = req.body.id
    const quizName = req.body.quizName

    if (id == null) return res.send({returnState: 1, msg: 'The quiz id is incorrect'})
    if (quizName == null ) return res.send({
        returnState: 2,
        msg: 'quizName is incorrect'
    })

    quiz_dao.findByID(id).then(c => {
        if (c == null) res.send({returnState: 1, msg: 'The quiz id is incorrect'})
        else {
            c.quizName = quizName
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
    if (!req.session.isLogged && !req.session.isTeacher) return next(new Error('Client must be logged on a Teacher account'))

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
    if (!req.session.isLogged && !req.session.isTeacher) return next(new Error('Client must be logged on a Teacher account'))

    const id = req.body.id

    if (id == null) return res.send({returnState: 1, msg: 'The chapter id is incorrect'})

    quiz_dao.findAllInChapter(id).then(q => {
        res.send({returnState: 0, quizzes: q})
    }).catch(err => next(err))
})

/**
 * Get a quiz by ID
 *
 * @param id quiz id
 * @return
 *  0: quiz: the quiz
 *  1: if the quiz id is incorrect
 */
router.post('/getQuiz', (req, res, next) => {
    if (!req.session.isLogged & !req.session.isTeacher) return next(new Error('Client must be logged on a Teacher account'))

    const id = req.body.id

    if (id == null) return res.send({returnState: 1, msg: 'The quiz id is incorrect'})

    quiz_dao.findByID(id).then(quiz => {
        if (quiz == null) res.send({returnState: 1, msg: 'The quiz id is incorrect'})
        else res.send({returnState: 0, quiz: quiz})
    }).catch(err => next(err))
})

/**
 * Get a quiz by name
 *
 * @param name quiz name
 * @return
 *  0: quiz: the quiz
 *  1: if the quiz name is incorrect
 */
router.post('/getQuizByName', (req, res, next) => {
    if (!req.session.isLogged & !req.session.isTeacher) return next(new Error('Client must be logged on a Teacher account'))

    const name = req.body.name

    if (name == null) return res.send({returnState: 1, msg: 'The name id is incorrect'})

    quiz_dao.findByName(name).then(quiz => {
        if (quiz == null) res.send({returnState: 1, msg: 'The name id is incorrect'})
        else res.send({returnState: 0, quiz: quiz})
    }).catch(err => next(err))
})

// #############################################################################################
// #################################### QUESTION MANAGEMENT ####################################
// #############################################################################################

/**
 * Create new question
 *
 * @param chapterId The if of chapter
 * @param quizId the id of quiz
 * @return
 *  0: question: The question
 *  1: if the chapterId is incorrect
 *  2: if the quizId is incorrect
 *  3: if quizId and chapterId dont match
 */
router.post('/createQuestion', (req, res, next) => {
    if (!req.session.isLogged && !req.session.isTeacher) return next(new Error('Client must be logged on a Teacher account'))

    const chapterId = req.body.chapterId
    const quizId = req.body.quizId

    if (chapterId == null) res.send({returnState: 1, msg: 'ChapterId is incorrect'})
    if (quizId == null) res.send({returnState: 2, msg: 'QuizId is incorrect'})

    quiz_dao.findByID(quizId).then(quiz => {
        if (quiz == null) res.send({returnState: 2, msg: 'QuizId is incorrect'})
        else if (quiz.theChapter !== chapterId) res.send({returnState: 3, msg: 'QuizId and chapterId dont match'})
        else {
            db.all('SELECT MAX(qNumber)+1 AS next FROM QuizQuestion WHERE theQuiz = ?', [quizId], function (err, rows) {
                if (err) next(err)
                else {

                    const nb = rows[0].next == null ? 1 : rows[0].next
                    db.beginTransaction(function (err, transaction) {
                        if (err) reject(err);
                        else {
                            const clone = {
                                questionID: -1,
                                upperText: '',
                                lowerText: '',
                                image: '',
                                type: 'QCM',
                                level: 1,
                                theChapter: chapterId,
                                theQuiz: quizId,
                                qNumber: nb
                            }
                            question_dao.insert(clone, transaction).then(id => {
                                clone.theQuestion = id;
                                clone.questionID = id;
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
 * @param questionId The id of question
 * @param quizId The id of the quiz
 * @return
 *  0:
 *  1: if the question id is incorrect
 *  2: if the quizId is incorrect
 */
router.post('/deleteQuestion', (req, res, next) => {
    if (!req.session.isLogged && !req.session.isTeacher) return next(new Error('Client must be logged on a Teacher account'))

    const questionId = req.body.questionId
    const quizId = req.body.quizId

    if (questionId == null) return res.send({returnState: 1, msg: 'The question id is incorrect'})
    if (quizId == null) return res.send({returnState: 2, msg: 'The id of the quiz is incorrect'})

    db.all('SELECT * FROM QuizQuestion, Question WHERE theQuestion = questionID AND questionID = ?', [questionId], function (err, questions) {
        if (err) next(err)
        else {
            const q = questions[0]
            if (q == null) res.send({returnState: 1, msg: 'The quiz id is incorrect'})
            else if (q.theQuiz !== Number(quizId)) res.send({
                returnState: 4,
                msg: 'The quizId don\'t match'
            })
            else {

                db.beginTransaction(function (err, t) {

                    t.run('DELETE FROM QuizQuestion WHERE theQuestion = ?', [questionId], function (err) {
                        if (err) {
                            t.rollback()
                            next(err)
                        } else {

                            t.run('DELETE FROM Answer WHERE theQuestion = ?', [questionId], function (err) {
                                if (err) {
                                    t.rollback()
                                    next(err)
                                } else {

                                    t.run('DELETE FROM Question WHERE questionID = ?', [questionId], function (err) {
                                        if (err) {
                                            t.rollback()
                                            next(err)
                                        } else {

                                            t.run('UPDATE QuizQuestion SET qNumber = qNumber - 1 WHERE theQuiz = ? AND qNumber > ?', [quizId, q.qNumber], function (err) {
                                                if (err) {
                                                    t.rollback()
                                                    next(err)
                                                } else {
                                                    t.commit(err => {
                                                        if (err) next(err);
                                                        else res.send({returnState: 0});
                                                    });
                                                }
                                            })

                                        }
                                    })

                                }
                            })

                        }
                    })
                })

            }
        }
    })
})

/**
 * Delete question
 *
 * @param questionId The id of question
 * @param quizId The id of the quiz
 * @param newQNumber the new place of the question
 * @return
 *  0:
 *  1: if the question id is incorrect
 *  2: if the quizId is incorrect
 */
router.post('/setQNumber', (req, res, next) => {
    if (!req.session.isLogged && !req.session.isTeacher) return next(new Error('Client must be logged on a Teacher account'))

    const questionId = req.body.questionId
    const quizId = req.body.quizId
    const newQNumber = req.body.newQNumber

    if (questionId == null) return res.send({returnState: 1, msg: 'The question id is incorrect'})
    if (quizId == null) return res.send({returnState: 2, msg: 'The id of the quiz is incorrect'})
    if (newQNumber == null || Number(newQNumber) < 1) return res.send({returnState: 3, msg: 'The qNumber is incorrect'})

    db.all('SELECT * FROM QuizQuestion, Question WHERE theQuestion = questionID AND questionID = ?', [questionId], function (err, questions) {
        if (err) next(err)
        else {
            const q = questions[0]
            if (q == null) res.send({returnState: 1, msg: 'The question id is incorrect'})
            else if (q.theQuiz !== Number(quizId)) res.send({
                returnState: 4,
                msg: 'The quizId don\'t match'
            })
            else {

                db.beginTransaction(function (err, t) {

                    t.run('UPDATE QuizQuestion SET qNumber = 0 WHERE theQuiz = ? AND theQuestion = ?', [quizId, questionId], function (err) {
                        if (err) {
                            t.rollback()
                            next(err)
                        } else {
                            t.run('UPDATE QuizQuestion SET qNumber = -(qNumber + ?) WHERE theQuiz = ? AND ((qNumber BETWEEN ? AND ?) OR (qNumber BETWEEN ? AND ?))', [q.qNumber > newQNumber ? 1 : -1, quizId, q.qNumber, newQNumber, newQNumber, q.qNumber], function (err) {
                                if (err) {
                                    t.rollback()
                                    next(err)
                                } else {
                                    t.run('UPDATE QuizQuestion SET qNumber = -qNumber WHERE theQuiz = ? AND qNumber < 0', [quizId], function (err) {
                                        if (err) {
                                            t.rollback()
                                            next(err)
                                        } else {
                                            t.run('UPDATE QuizQuestion SET qNumber = ? WHERE theQuiz = ? AND qNumber = 0', [newQNumber, quizId], function (err) {
                                                if (err) {
                                                    t.rollback()
                                                    next(err)
                                                } else {
                                                    t.commit(err => {
                                                        if (err) next(err);
                                                        else res.send({returnState: 0});
                                                    });
                                                }
                                            })
                                        }
                                    })
                                }
                            })
                        }
                    })

                })

            }
        }
    })
})

/**
 * Change upperText
 *
 * @param id The id of question
 * @param quizId The id of the quiz
 * @param upperText THe new upperText text
 * @return
 *  0: question: The question
 *  1: if the question id is incorrect
 *  2: if the quizId is incorrect
 *  3: if the upperText is incorrect
 *  4: if the quizId and quizId of question dont match
 */
router.post('/setUpperText', (req, res, next) => {
    if (!req.session.isLogged && !req.session.isTeacher) return next(new Error('Client must be logged on a Teacher account'))

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
            else if (q.theQuiz !== Number(quizId)) res.send({
                returnState: 4,
                msg: 'The quizId don\'t match'
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
 * @param quizId The id of the quiz
 * @param lowerText THe new lowerText text
 * @return
 *  0: question: The question
 *  1: if the question id is incorrect
 *  2: if the quizId is incorrect
 *  3: if the lowerText is incorrect
 *  4: if the quizId and quizId of question dont match
 */
router.post('/setLowerText', (req, res, next) => {
    if (!req.session.isLogged && !req.session.isTeacher) return next(new Error('Client must be logged on a Teacher account'))

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
            else if (q.theQuiz !== Number(quizId)) res.send({
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

const upload = multer({
    dest: './tmp/',
    limits: {
        fileSize: 1024 * 1024
    }
})

/**
 * Change image
 *
 * @param questionId The id of question
 * @param quizId The id of the quiz
 * @param image THe new image
 * @return
 *  0: question: The question
 *  1: if the question id is incorrect
 *  2: if the quizId is incorrect
 *  3: if the image is incorrect
 *  4: if the quizId and quizId of question dont match
 */
router.post('/setImage', upload.single('image'), (req, res, next) => {
    if (!req.session.isLogged && !req.session.isTeacher) return next(new Error('Client must be logged on a Teacher account'))

    const questionId = req.body.questionId
    const quizId = req.body.quizId

    if (questionId == null) return res.send({returnState: 1, msg: 'The question id is incorrect'})
    if (quizId == null) return res.send({returnState: 2, msg: 'The quizId is incorrect'})

    db.all('SELECT * FROM QuizQuestion, Question WHERE theQuestion = questionID AND questionID = ?', [questionId], function (err, questions) {
        if (err) next(err)
        else {
            const q = questions[0]
            if (q == null) res.send({returnState: 1, msg: 'The quiz id is incorrect'})
            else if (q.theQuiz !== Number(quizId)) res.send({
                returnState: 4,
                msg: 'The quizId and quizId of question dont match'
            })
            else {
                const tempPath = req.file.path
                const extension = path.extname(req.file.originalname).toLowerCase()
                const targetPath = './client/public/questionImages/i' + questionId + extension

                if (['.png', '.jpg', '.gif'].find(o => o === extension) == null) {
                    fs.unlink(tempPath, err1 => {
                        if (err1) next(err1)
                        else res.send({returnState: 3, msg: 'The image is incorrect'})
                    })
                } else {
                    fs.rename(tempPath, targetPath, err => {
                        if (err) {
                            fs.unlink(tempPath, err1 => {
                                if (err1) next(err1)
                                else next(err)
                            })
                        } else {

                            q.image = '/questionImages/i' + questionId + extension
                            question_dao.update(q).then(() => {
                                res.send({returnState: 0, question: q})
                            }).catch(err => next(err))

                        }
                    })
                }
            }
        }
    })
})

/**
 * Delete image
 *
 * @param questionId The id of question
 * @param quizId The id of the quiz
 * @return
 *  0: question: The question
 *  1: if the question id is incorrect
 *  2: if the quizId is incorrect
 *  3: if the quizId and quizId of question dont match
 */
router.post('/deleteImage', (req, res, next) => {
    if (!req.session.isLogged && !req.session.isTeacher) return next(new Error('Client must be logged on a Teacher account'))

    const questionId = req.body.questionId
    const quizId = req.body.quizId

    if (questionId == null) return res.send({returnState: 1, msg: 'The question id is incorrect'})
    if (quizId == null) return res.send({returnState: 2, msg: 'The quizId is incorrect'})

    db.all('SELECT * FROM QuizQuestion, Question WHERE theQuestion = questionID AND questionID = ?', [questionId], function (err, questions) {
        if (err) next(err)
        else {
            const q = questions[0]
            if (q == null) res.send({returnState: 1, msg: 'The quiz id is incorrect'})
            else if (q.theQuiz !== Number(quizId)) res.send({
                returnState: 3,
                msg: 'The quizId and quizId of question dont match'
            })
            else {

                const img = q.image
                q.image = ''
                question_dao.update(q).then(() => {
                    if (fs.existsSync(path.join('./client/public/', img))) {
                        fs.unlink(path.join('./client/public/', img), err => {
                        })
                    }
                    res.send({returnState: 0, question: q})
                }).catch(err => next(err))
            }
        }
    })
})

/**
 * Change type
 *
 * @param id The id of question
 * @param quizId The id of the quiz
 * @param type THe new type
 * @return
 *  0: question: The question
 *  1: if the question id is incorrect
 *  2: if the quizId is incorrect
 *  3: if the image is incorrect
 *  4: if the quizId and quizId of question dont match
 */
router.post('/setType', (req, res, next) => {
    if (!req.session.isLogged && !req.session.isTeacher) return next(new Error('Client must be logged on a Teacher account'))

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
            else if (q.theQuiz !== Number(quizId)) res.send({
                returnState: 4,
                msg: 'The quizId and quizId of question dont match'
            })
            else { //TODO nage answer depending of the type
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
 * @param quizId The id of the quiz
 * @param level The new level
 * @return
 *  0: question: The question
 *  1: if the question id is incorrect
 *  2: if the quizId is incorrect
 *  3: if the level is incorrect
 *  4: if the quizId and quizId of question dont match
 */
router.post('/setLevel', (req, res, next) => {
    if (!req.session.isLogged && !req.session.isTeacher) return next(new Error('Client must be logged on a Teacher account'))

    const id = req.body.id
    const quizId = req.body.quizId
    const level = req.body.level

    if (id == null) return res.send({returnState: 1, msg: 'The question id is incorrect'})
    if (quizId == null) return res.send({returnState: 2, msg: 'The quizId is incorrect'})
    if (level == null || Number(level) < 0) return res.send({returnState: 3, msg: 'The level is incorrect'})

    db.all('SELECT * FROM QuizQuestion, Question WHERE theQuestion = questionID AND questionID = ?', [id], function (err, questions) {
        if (err) next(err)
        else {
            const q = questions[0]
            if (q == null) res.send({returnState: 2, msg: 'The quiz id is incorrect'})
            else if (q.theQuiz !== Number(quizId)) res.send({
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
 *  1: if the quiz id is incorrect
 */
router.post('/getQuestionList', (req, res, next) => {
    if (!req.session.isLogged && !req.session.isTeacher) return next(new Error('Client must be logged on a Teacher account'))

    const id = req.body.id

    if (id == null) return res.send({returnState: 1, msg: 'The quiz id is incorrect'})

    db.all('SELECT * FROM QuizQuestion, Question WHERE theQuestion = questionID AND theQuiz = ?', [id], function (err, questions) {
        if (err) next(err)
        else res.send({returnState: 0, questions: questions})
    })
})

/**
 * Get a question by ID
 *
 * @param id question id
 * @return
 *  0: question: the question
 *  1: if the question id is incorrect
 */
router.post('/getQuestion', (req, res, next) => {
    if (!req.session.isLogged & !req.session.isTeacher) return next(new Error('Client must be logged on a Teacher account'))

    const id = req.body.id

    if (id == null) return res.send({returnState: 1, msg: 'The question id is incorrect'})

    question_dao.findByID(id).then(question => {
        if (question == null) res.send({returnState: 1, msg: 'The question id is incorrect'})
        else res.send({returnState: 0, question: question})
    }).catch(err => next(err))
})

// #############################################################################################
// #################################### ANSWER MANAGEMENT ####################################
// #############################################################################################

/**
 * Create new answer
 *
 * @param quizId the id of quiz
 * @param questionId the id of question
 * @return
 *  0: answer: The answer
 *  1: if the questionId is incorrect
 *  2: if the quizId is incorrect
 *  3: if quizId dont match the question
 */
router.post('/createAnswer', (req, res, next) => {
    if (!req.session.isLogged && !req.session.isTeacher) return next(new Error('Client must be logged on a Teacher account'))

    const questionId = req.body.questionId
    const quizId = req.body.quizId

    if (questionId == null) return res.send({returnState: 1, msg: 'questionId is incorrect'})
    if (quizId == null) return res.send({returnState: 2, msg: 'QuizId is incorrect'})

    db.all('SELECT * FROM QuizQuestion, Question WHERE theQuestion = questionID AND questionID = ?', [questionId], function (err, questions) {
        if (err) next(err)
        else {
            const q = questions[0]
            if (q == null) res.send({returnState: 2, msg: 'The quiz id is incorrect'})
            else if (q.theQuiz !== Number(quizId)) res.send({
                returnState: 3,
                msg: 'The quizId and quizId of question dont match'
            })
            else {
                const answer = {answerID: -1, text: '', isValid: 'false', theQuestion: questionId}
                if (q.type === 'OPEN') answer.isValid = 'true'
                answer_dao.insert(answer).then(id => {
                    answer.answerID = id
                    res.send({returnState: 0, answer: answer})
                }).catch(err => next(err))
            }
        }
    })
})

/**
 * Delete answer
 *
 * @param id The id of answer
 * @param quizId the id of quiz
 * @param questionId the id of question
 * @return
 *  0:
 *  1: if the answer id is incorrect
 *  2: if the quizId is incorrect
 *  3: if the questionId is incorrect
 */
router.post('/deleteAnswer', (req, res, next) => {
    if (!req.session.isLogged && !req.session.isTeacher) return next(new Error('Client must be logged on a Teacher account'))

    const id = req.body.id
    const quizId = req.body.quizId
    const questionId = req.body.questionId

    if (id == null) return res.send({returnState: 1, msg: 'The answer id is incorrect'})
    if (questionId == null) return res.send({returnState: 2, msg: 'questionId is incorrect'})
    if (quizId == null) return res.send({returnState: 3, msg: 'QuizId is incorrect'})

    db.all('SELECT * FROM QuizQuestion Q, Question, Answer A WHERE Q.theQuestion = questionID AND questionID = A.theQuestion AND answerID = ?', [id], function (err, answers) {
        if (err) next(err)
        else {
            const a = answers[0]
            if (a == null) res.send({returnState: 1, msg: 'The answer id is incorrect'})
            else if (a.theQuestion !== Number(questionId)) res.send({returnState: 2, msg: 'questionId is incorrect'})
            else if (a.theQuiz !== Number(quizId)) res.send({returnState: 3, msg: 'QuizId is incorrect'})
            else {

                answer_dao.delete(id).then(() => {
                    res.send({returnState: 0})
                }).catch(err => next(err))

            }
        }
    })
})

/**
 * Change text
 *
 * @param id The id of answer
 * @param text the text
 * @param quizId the id of quiz
 * @param questionId the question id
 * @return
 *  0: answer: The answer
 *  1: if the answer id is incorrect
 *  2: if the quizId is incorrect
 *  3: if the questionId is incorrect
 *  4: if the text is incorrect
 */
router.post('/setText', (req, res, next) => {
    if (!req.session.isLogged && !req.session.isTeacher) return next(new Error('Client must be logged on a Teacher account'))

    const text = req.body.text
    const id = req.body.id
    const quizId = req.body.quizId
    const questionId = req.body.questionId

    if (id == null) return res.send({returnState: 1, msg: 'The answer id is incorrect'})
    if (questionId == null) return res.send({returnState: 2, msg: 'questionId is incorrect'})
    if (text == null) return res.send({returnState: 4, msg: 'The text is incorrect'})
    if (quizId == null) return res.send({returnState: 3, msg: 'QuizId is incorrect'})

    db.all('SELECT * FROM QuizQuestion Q, Question, Answer A WHERE Q.theQuestion = questionID AND questionID = A.theQuestion AND answerID = ?', [id], function (err, answers) {
        if (err) next(err)
        else {
            const a = answers[0]
            if (a == null) res.send({returnState: 1, msg: 'The answer id is incorrect'})
            else if (a.theQuestion !== Number(questionId)) res.send({returnState: 2, msg: 'questionId is incorrect'})
            else if (a.theQuiz !== Number(quizId)) res.send({returnState: 3, msg: 'QuizId is incorrect'})
            else {

                a.text = text
                answer_dao.update(a).then(() => {
                    res.send({
                        returnState: 0,
                        answer: {answerID: a.answerID, text: a.text, isValid: a.isValid, theQuestion: a.theQuestion}
                    })
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
 * @param quizId the id of quiz
 * @param questionId the question id
 * @return
 *  0: answer: The answer
 *  1: if the answer id is incorrect
 *  2: if isValid is incorrect
 *  3: if the questionId is incorrect
 *  4: if the the question is a QCU and isValid is false
 *  5: can't be call on an OPEN question
 */
router.post('/setIsValid', (req, res, next) => {
    if (!req.session.isLogged && !req.session.isTeacher) return next(new Error('Client must be logged on a Teacher account'))

    const isValid = req.body.isValid
    const id = req.body.id
    const quizId = req.body.quizId
    const questionId = req.body.questionId

    if (id == null) return res.send({returnState: 1, msg: 'The answer id is incorrect'})
    if (questionId == null) return res.send({returnState: 2, msg: 'questionId is incorrect'})
    if (isValid == null || ['0', '1', 'true', 'false'].find(o => o === isValid) == null) return res.send({
        returnState: 2,
        msg: 'isValid is incorrect'
    })
    if (quizId == null) return res.send({returnState: 3, msg: 'QuizId is incorrect'})

    db.all('SELECT * FROM QuizQuestion Q, Question, Answer A WHERE Q.theQuestion = questionID AND questionID = A.theQuestion AND answerID = ?', [id], function (err, answers) {
        if (err) next(err)
        else {
            const a = answers[0]
            if (a == null) res.send({returnState: 1, msg: 'The answer id is incorrect'})
            else if (a.theQuestion !== Number(questionId)) res.send({returnState: 2, msg: 'questionId is incorrect'})
            else if (a.theQuiz !== Number(quizId)) res.send({returnState: 3, msg: 'QuizId is incorrect'})
            else {

                a.isValid = isValid

                if (a.type === 'OPEN') {
                    return res.send({
                        returnState: 5,
                        msg: 'can\'t be call on an OPEN question'
                    })
                } else if (a.type === 'QCU') {

                    if (['0', 'false'].find(o => o === isValid) != null) return res.send({
                        returnState: 4,
                        msg: 'isValid can\'t be false on a QCU'
                    })

                    db.beginTransaction((err, t) => {
                        if (err) {
                            next(err)
                            t.rollback()
                        } else {
                            t.run('UPDATE Answer SET isValid = \'0\' WHERE theQuestion = ?', [questionId], (err) => {
                                if (err) {
                                    next(err)
                                    t.rollback()
                                } else {
                                    answer_dao.update(a, t).then(() => {
                                        t.commit(err => {
                                            if (err) {
                                                next(err);
                                                t.rollback()
                                            } else {
                                                res.send({
                                                    returnState: 0,
                                                    answer: {
                                                        answerID: a.answerID,
                                                        text: a.text,
                                                        isValid: a.isValid,
                                                        theQuestion: a.theQuestion
                                                    }
                                                })
                                            }
                                        });
                                    }).catch(err => {
                                        next(err)
                                        t.rollback()
                                    })
                                }
                            })
                        }
                    })

                } else {
                    answer_dao.update(a).then(() => {
                        res.send({
                            returnState: 0,
                            answer: {answerID: a.answerID, text: a.text, isValid: a.isValid, theQuestion: a.theQuestion}
                        })
                    }).catch(err => {
                        next(err)
                    })
                }

            }
        }
    })
})

/**
 * Get list of answer
 *
 * @param quizId the id of quiz
 * @param questionId the question id
 * @return
 *  0: answers: list of answers in this question
 *  1: if the theQuestion is incorrect
 *  2: if the quizId is incorrect
 */
router.post('/getAnswersList', (req, res, next) => {
    if (!req.session.isLogged && !req.session.isTeacher) return next(new Error('Client must be logged on a Teacher account'))

    const quizId = req.body.quizId
    const questionId = req.body.questionId

    if (questionId == null) return res.send({returnState: 1, msg: 'questionId is incorrect'})
    if (quizId == null) return res.send({returnState: 2, msg: 'QuizId is incorrect'})

    db.all('SELECT * FROM QuizQuestion Q, Question, Answer A WHERE Q.theQuestion = questionID AND A.theQuestion = questionID AND questionID = ?', [questionId], function (err, answers) {
        if (err) next(err)
        else {
            const a = answers[0]
            if (a == null) {
                res.send({
                    returnState: 0, answers: []
                })
            }
            else if (a.theQuiz !== Number(quizId)) res.send({returnState: 2, msg: 'QuizId is incorrect'})
            else {

                res.send({
                    returnState: 0, answers: answers.map(o => {
                        return {answerID: o.answerID, text: o.text, isValid: o.isValid, theQuestion: o.theQuestion}
                    })
                })

            }
        }
    })
})

/**
 * Get a answer by ID
 *
 * @param id answer id
 * @return
 *  0: answer: the answer
 *  1: if the answer id is incorrect
 */
router.post('/getAnswer', (req, res, next) => {
    if (!req.session.isLogged & !req.session.isTeacher) return next(new Error('Client must be logged on a Teacher account'))

    const id = req.body.id

    if (id == null) return res.send({returnState: 1, msg: 'The answer id is incorrect'})

    answer_dao.findByID(id).then(answer => {
        if (answer == null) res.send({returnState: 1, msg: 'The answer id is incorrect'})
        else res.send({returnState: 0, answer: answer})
    }).catch(err => next(err))
})

module.exports = router;