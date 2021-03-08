jest.setMock('gameofmath-db/sqlite_connection', require('gameofmath-db/test/sqlite_connection.mock'));
const request = require('supertest');
const app = require('../app').app;
const db = require('gameofmath-db').db;
const teacher_dao = require('gameofmath-db').teacher_dao;
const quiz_dao = require('gameofmath-db').quiz_dao;
const answer_dao = require('gameofmath-db').answer_dao;
const question_dao = require('gameofmath-db').question_dao;
const chapter_dao = require('gameofmath-db').chapter_dao;
const quizQuestion_dao = require('gameofmath-db').quizQuestion_dao;
const crypto = require('crypto')

function hash(v) {
    return crypto.createHash('sha512').update(v, 'utf-8').digest('hex')
}

function postC(res, path) {
    const req = request(app).post(path);
    req.cookies = res.headers['set-cookie'][res.headers['set-cookie'].length - 1].split(';')[0];
    return req;
}

beforeAll(async (done) => {
    await db.reset();
    await teacher_dao.insertUser({
        userID: -1,
        login: 'login2',
        password: hash('password2'),
        lastname: 'nom',
        firstname: 'prenom',
        email: 't1@gmail.com'
    }).catch(done);
    await chapter_dao.insert({
        chapterID: -1,
        name: "chap1"
    }).catch(done);
    await chapter_dao.insert({
        chapterID: -1,
        name: "chap2"
    }).catch(done);
    done();
});

let res = null
beforeEach(async (done) => {
    res = await request(app)
        .post('/api/user/auth')
        .send({
            username: 'login2',
            password: 'password2'
        }).catch(done);
    done()
})

// ##########################################################################################
// ################################### CHAPTER MANAGEMENT ###################################
// ##########################################################################################

describe('Test the getChapter path', () => {
    test('A teacher should be able to get the chapter list', async (done) => {
        const rep = await postC(res, '/api/quizManagement/getChapter').send().catch(done);
        rep.body.chapters.sort((a, b) => a.chapterID - b.chapterID)
        expect(rep.body).toEqual({
            returnState: 0,
            chapters: [
                {
                    chapterID: 1,
                    name: 'chap1',
                }, {
                    chapterID: 2,
                    name: 'chap2',
                }
            ]
        })
        done();
    });
});

describe('Test the createChapter path', () => {
    test('A teacher should be able to create a chapter', async (done) => {
        const rep = await postC(res, '/api/quizManagement/createChapter').send({
            name: 'chap3'
        }).catch(done);
        expect(rep.body).toEqual({
            returnState: 0,
            chapter: {
                chapterID: 3,
                name: 'chap3'
            }
        })

        const rep2 = await postC(res, '/api/quizManagement/getChapter').send().catch(done);
        rep2.body.chapters.sort((a, b) => a.chapterID - b.chapterID)
        expect(rep2.body).toEqual({
            returnState: 0,
            chapters: [
                {
                    chapterID: 1,
                    name: 'chap1',
                }, {
                    chapterID: 2,
                    name: 'chap2',
                }, {
                    chapterID: 3,
                    name: 'chap3'
                }
            ]
        })
        done();
    });
});

describe('Test the deleteChapter path', () => {
    test('A teacher should be able to delete an empty chapter', async (done) => {
        const rep = await postC(res, '/api/quizManagement/deleteChapter').send({
            id: 3
        }).catch(done);
        expect(rep.body).toEqual({
            returnState: 0
        })

        const rep2 = await postC(res, '/api/quizManagement/getChapter').send().catch(done);
        rep2.body.chapters.sort((a, b) => a.chapterID - b.chapterID)
        expect(rep2.body).toEqual({
            returnState: 0,
            chapters: [
                {
                    chapterID: 1,
                    name: 'chap1',
                }, {
                    chapterID: 2,
                    name: 'chap2',
                }
            ]
        })
        done();
    });
    test('A teacher should be able to delete an chapter with a quiz associated', async (done) => {
        //INSERT
        await postC(res, '/api/quizManagement/createChapter').send({
            name: 'chap3'
        }).catch(done);
        await quiz_dao.insert({
            quizID: -1,
            asAnOrder: 'true',
            theChapter: 4
        }).catch(done);
        await quiz_dao.insert({
            quizID: -1,
            asAnOrder: 'false',
            theChapter: 4
        }).catch(done);
        await question_dao.insert({
            questionID: -1,
            upperText: '',
            lowerText: '',
            image: '',
            type: 'QCM',
            level: 1,
            theChapter: 4
        }).catch(done);
        await answer_dao.insert({
            answerID: -1,
            text: '',
            isValid: 'true',
            theQuestion: 1
        }).catch(done);
        await quizQuestion_dao.insert({
            theQuestion: 1,
            theQuiz: 1,
            qNumber: 1
        }).catch(done);

        //DELETE
        const rep = await postC(res, '/api/quizManagement/deleteChapter').send({
            id: 4
        }).catch(done);
        expect(rep.body).toEqual({
            returnState: 0
        })

        //CHAPTER
        const rep2 = await postC(res, '/api/quizManagement/getChapter').send().catch(done);
        rep2.body.chapters.sort((a, b) => a.chapterID - b.chapterID)
        expect(rep2.body).toEqual({
            returnState: 0,
            chapters: [
                {
                    chapterID: 1,
                    name: 'chap1',
                }, {
                    chapterID: 2,
                    name: 'chap2',
                }
            ]
        })

        //QUIZ
        const quiz = await quiz_dao.findAll().catch(done);
        expect(quiz).toEqual([]);

        //QUESTION
        const question = await question_dao.findAll().catch(done);
        expect(question).toEqual([]);

        //QUIZ QUESTION
        const quiz_question = await quizQuestion_dao.findAll().catch(done);
        expect(quiz_question).toEqual([]);

        //ANSWER
        const answer = await answer_dao.findAll().catch(done);
        expect(answer).toEqual([]);

        done();
    });
});

describe('Test the setChapterName path', () => {
    test('A teacher should be able to rename a chapter', async (done) => {
        let rep = await postC(res, '/api/quizManagement/setChapterName').send({
            id: 2,
            name: 'chap3'
        }).catch(done);
        expect(rep.body).toEqual({
            returnState: 0,
            chapter: {
                chapterID: 2,
                name: 'chap3',
            }
        })

        rep = await postC(res, '/api/quizManagement/getChapter').send().catch(done);
        rep.body.chapters.sort((a, b) => a.chapterID - b.chapterID)
        expect(rep.body).toEqual({
            returnState: 0,
            chapters: [
                {
                    chapterID: 1,
                    name: 'chap1',
                }, {
                    chapterID: 2,
                    name: 'chap3',
                }
            ]
        })
        done();
    });
});

// #########################################################################################
// #################################### QUIZ MANAGEMENT ####################################
// #########################################################################################

describe('Test the getQuizList path', () => {
    test('A teacher should be able to get the quiz list', async (done) => {

        await quiz_dao.insert({
            quizID: -1,
            asAnOrder: 'false',
            theChapter: 1
        }).catch(done);

        const rep = await postC(res, '/api/quizManagement/getQuizList').send().catch(done);
        rep.body.quizzes.sort((a, b) => a.quizID - b.quizID)
        expect(rep.body).toEqual({
            returnState: 0,
            quizzes: [
                {
                    quizID: 3,
                    asAnOrder: '0',
                    theChapter: 1
                }
            ]
        })
        done();
    });
});

describe('Test the createQuiz path', () => {
    test('A teacher should be able to create a quiz in a chapter', async (done) => {
        const rep = await postC(res, '/api/quizManagement/createQuiz').send({
            ordered: 'true',
            chapter: 2
        }).catch(done);
        expect(rep.body).toEqual({
            returnState: 0,
            quiz: {
                quizID: 4,
                asAnOrder: 'true',
                theChapter: 2
            }
        })

        const rep2 = await postC(res, '/api/quizManagement/getQuizList').send().catch(done);
        rep2.body.quizzes.sort((a, b) => a.quizID - b.quizID)
        expect(rep2.body).toEqual({
            returnState: 0,
            quizzes: [
                {
                    quizID: 3,
                    asAnOrder: '0',
                    theChapter: 1
                }, {
                    quizID: 4,
                    asAnOrder: '1',
                    theChapter: 2
                }
            ]
        })
        done();
    });
});

describe('Test the deleteQuiz path', () => {
    test('A teacher should be able to delete an empty quiz', async (done) => {
        const rep = await postC(res, '/api/quizManagement/deleteQuiz').send({
            id: 4
        }).catch(done);
        expect(rep.body).toEqual({
            returnState: 0
        })

        const rep2 = await postC(res, '/api/quizManagement/getQuizList').send().catch(done);
        rep2.body.quizzes.sort((a, b) => a.quizID - b.quizID)
        expect(rep2.body).toEqual({
            returnState: 0,
            quizzes: [
                {
                    quizID: 3,
                    asAnOrder: '0',
                    theChapter: 1
                }
            ]
        })
        done();
    });
    test('A teacher should be able to delete an quiz with a question associated', async (done) => {
        //INSERT
        await quiz_dao.insert({
            quizID: -1,
            asAnOrder: 'true',
            theChapter: 2
        }).catch(done);
        await question_dao.insert({
            questionID: -1,
            upperText: '',
            lowerText: '',
            image: '',
            type: 'QCM',
            level: 1,
            theChapter: 2
        }).catch(done);
        await answer_dao.insert({
            answerID: -1,
            text: '',
            isValid: 'true',
            theQuestion: 2
        }).catch(done);
        await quizQuestion_dao.insert({
            theQuestion: 2,
            theQuiz: 5,
            qNumber: 1
        }).catch(done);

        //DELETE
        const rep = await postC(res, '/api/quizManagement/deleteQuiz').send({
            id: 5
        }).catch(done);
        expect(rep.body).toEqual({
            returnState: 0
        })

        //QUIZ
        const rep2 = await postC(res, '/api/quizManagement/getQuizList').send().catch(done);
        rep2.body.quizzes.sort((a, b) => a.quizID - b.quizID)
        expect(rep2.body).toEqual({
            returnState: 0,
            quizzes: [
                {
                    quizID: 3,
                    asAnOrder: '0',
                    theChapter: 1
                }
            ]
        })

        //QUESTION
        const question = await question_dao.findAll().catch(done);
        expect(question).toEqual([]);

        //QUIZ QUESTION
        const quiz_question = await quizQuestion_dao.findAll().catch(done);
        expect(quiz_question).toEqual([]);

        //ANSWER
        const answer = await answer_dao.findAll().catch(done);
        expect(answer).toEqual([]);

        done();
    });
});

describe('Test the setOrder path', () => {
    test('A teacher should be able to set if a quiz is ordered', async (done) => {
        let rep = await postC(res, '/api/quizManagement/setOrder').send({
            id: 3,
            isOrder: 'true'
        }).catch(done);
        expect(rep.body).toEqual({
            returnState: 0,
            quiz: {
                quizID: 3,
                asAnOrder: 'true',
                theChapter: 1
            }
        })

        const rep2 = await postC(res, '/api/quizManagement/getQuizList').send().catch(done);
        rep2.body.quizzes.sort((a, b) => a.quizID - b.quizID)
        expect(rep2.body).toEqual({
            returnState: 0,
            quizzes: [
                {
                    quizID: 3,
                    asAnOrder: '1',
                    theChapter: 1
                }
            ]
        })
        done();
    });
});

describe('Test the getQuizListWithChapterId path', () => {
    test('A teacher should be able to get the quiz list of a chapter', async (done) => {
        const rep = await postC(res, '/api/quizManagement/getQuizListWithChapterId').send({id:1}).catch(done);
        rep.body.quizzes.sort((a, b) => a.quizID - b.quizID)
        expect(rep.body).toEqual({
            returnState: 0,
            quizzes: [
                {
                    quizID: 3,
                    asAnOrder: '1',
                    theChapter: 1
                }
            ]
        })
        done();
    });
});

// #############################################################################################
// #################################### QUESTION MANAGEMENT ####################################
// #############################################################################################

describe('Test the getQuestionList path', () => {
    test('A teacher should be able to get the question list of a quiz', async (done) => {

        await question_dao.insert({
            questionID: -1,
            upperText: '',
            lowerText: '',
            image: '',
            type: 'QCM',
            level: 1,
            theChapter: 1
        }).catch(done);
        await quizQuestion_dao.insert({
            theQuestion: 3,
            theQuiz: 3,
            qNumber: 1
        }).catch(done);

        const rep = await postC(res, '/api/quizManagement/getQuestionList').send({id:3}).catch(done);
        rep.body.questions.sort((a, b) => a.questionID - b.questionID)
        expect(rep.body).toEqual({
            returnState: 0,
            questions: [
                {
                    questionID: 3,
                    upperText: '',
                    lowerText: '',
                    image: '',
                    type: 'QCM',
                    level: 1,
                    theChapter: 1,
                    qNumber: 1,
                    theQuestion: 3,
                    theQuiz: 3
                }
            ]
        })
        done();
    });
});

describe('Test the createQuestion path', () => {
    test('A teacher should be able to create a question in a quiz', async (done) => {
        const rep = await postC(res, '/api/quizManagement/createQuestion').send({
            chapterId: 1,
            quizId: 3
        }).catch(done);
        expect(rep.body).toEqual({
            returnState: 0,
            question: {
                questionID: 4,
                upperText: '',
                lowerText: '',
                image: '',
                type: 'QCM',
                level: 1,
                theChapter: 1,
                qNumber: 2,
                theQuestion: 4,
                theQuiz: 3
            }
        })

        const rep2 = await postC(res, '/api/quizManagement/getQuestionList').send({id:3}).catch(done);
        rep2.body.questions.sort((a, b) => a.questionID - b.questionID)
        expect(rep2.body).toEqual({
            returnState: 0,
            questions: [
                {
                    questionID: 3,
                    upperText: '',
                    lowerText: '',
                    image: '',
                    type: 'QCM',
                    level: 1,
                    theChapter: 1,
                    qNumber: 1,
                    theQuestion: 3,
                    theQuiz: 3
                },{
                    questionID: 4,
                    upperText: '',
                    lowerText: '',
                    image: '',
                    type: 'QCM',
                    level: 1,
                    theChapter: 1,
                    qNumber: 2,
                    theQuestion: 4,
                    theQuiz: 3
                }
            ]
        })

        //QUIZ QUESTION
        const quiz_question = await quizQuestion_dao.findAllByQuestion(4).catch(done);
        expect(quiz_question).toEqual([
            {
                theQuiz: 3,
                theQuestion: 4,
                qNumber: 2
            }
        ]);
        done();
    });
});

describe('Test the deleteQuestion path', () => {
    test('A teacher should be able to delete an empty question', async (done) => {
        const rep = await postC(res, '/api/quizManagement/deleteQuestion').send({
            questionId: 4,
            quizId: 3
        }).catch(done);
        expect(rep.body).toEqual({
            returnState: 0
        })

        const rep2 = await postC(res, '/api/quizManagement/getQuestionList').send({id:3}).catch(done);
        rep2.body.questions.sort((a, b) => a.questionID - b.questionID)
        expect(rep2.body).toEqual({
            returnState: 0,
            questions: [
                {
                    questionID: 3,
                    upperText: '',
                    lowerText: '',
                    image: '',
                    type: 'QCM',
                    level: 1,
                    theChapter: 1,
                    qNumber: 1,
                    theQuestion: 3,
                    theQuiz: 3
                }
            ]
        })

        //QUIZ QUESTION
        const quiz_question = await quizQuestion_dao.findAllByQuestion(4).catch(done);
        expect(quiz_question).toEqual([]);
        done();
    });
    test('A teacher should be able to delete a question with an answer associated', async (done) => {
        //INSERT
        await question_dao.insert({
            questionID: -1,
            upperText: '',
            lowerText: '',
            image: '',
            type: 'QCM',
            level: 1,
            theChapter: 1
        }).catch(done);
        await answer_dao.insert({
            answerID: -1,
            text: '',
            isValid: 'true',
            theQuestion: 5
        }).catch(done);
        await quizQuestion_dao.insert({
            theQuestion: 5,
            theQuiz: 3,
            qNumber: 2
        }).catch(done);

        //DELETE
        const rep = await postC(res, '/api/quizManagement/deleteQuestion').send({
            questionId: 5,
            quizId: 3
        }).catch(done);
        expect(rep.body).toEqual({
            returnState: 0
        })

        const rep2 = await postC(res, '/api/quizManagement/getQuestionList').send({id:3}).catch(done);
        rep2.body.questions.sort((a, b) => a.questionID - b.questionID)
        expect(rep2.body).toEqual({
            returnState: 0,
            questions: [
                {
                    questionID: 3,
                    upperText: '',
                    lowerText: '',
                    image: '',
                    type: 'QCM',
                    level: 1,
                    theChapter: 1,
                    qNumber: 1,
                    theQuestion: 3,
                    theQuiz: 3
                }
            ]
        })

        //QUIZ QUESTION
        const quiz_question = await quizQuestion_dao.findAllByQuestion(5).catch(done);
        expect(quiz_question).toEqual([]);

        //ANSWER
        const answer = await answer_dao.findAll().catch(done);
        expect(answer).toEqual([]);

        done();
    });
});

describe('Test the setQNumber path', () => {
    test('A teacher should be able to place question at the first position', async (done) => {
        await postC(res, '/api/quizManagement/createQuestion').send({
            chapterId: 1,
            quizId: 3
        }).catch(done);
        await postC(res, '/api/quizManagement/createQuestion').send({
            chapterId: 1,
            quizId: 3
        }).catch(done);

        const rep = await postC(res, '/api/quizManagement/setQNumber').send({
            questionId: 6,
            quizId: 3,
            newQNumber: 1
        }).catch(done);
        expect(rep.body).toEqual({
            returnState: 0
        })

        const quiz_question = await quizQuestion_dao.findAllByQuiz(3).catch(done);
        expect(quiz_question).toEqual([
            {
                theQuiz: 3,
                theQuestion: 3,
                qNumber: 2
            },{
                theQuiz: 3,
                theQuestion: 6,
                qNumber: 1
            },{
                theQuiz: 3,
                theQuestion: 7,
                qNumber: 3
            }
        ]);
        done();
    });
    test('A teacher should be able to place question at the last position', async (done) => {
        const rep = await postC(res, '/api/quizManagement/setQNumber').send({
            questionId: 3,
            quizId: 3,
            newQNumber: 3
        }).catch(done);
        expect(rep.body).toEqual({
            returnState: 0
        })

        const quiz_question = await quizQuestion_dao.findAllByQuiz(3).catch(done);
        expect(quiz_question).toEqual([
            {
                theQuiz: 3,
                theQuestion: 3,
                qNumber: 3
            },{
                theQuiz: 3,
                theQuestion: 6,
                qNumber: 1
            },{
                theQuiz: 3,
                theQuestion: 7,
                qNumber: 2
            }
        ]);
        done();
    });
    test('A teacher should be able to place question at a normal position', async (done) => {
        const rep = await postC(res, '/api/quizManagement/setQNumber').send({
            questionId: 6,
            quizId: 3,
            newQNumber: 2
        }).catch(done);
        expect(rep.body).toEqual({
            returnState: 0
        })

        const quiz_question = await quizQuestion_dao.findAllByQuiz(3).catch(done);
        expect(quiz_question).toEqual([
            {
                theQuiz: 3,
                theQuestion: 3,
                qNumber: 3
            },{
                theQuiz: 3,
                theQuestion: 6,
                qNumber: 2
            },{
                theQuiz: 3,
                theQuestion: 7,
                qNumber: 1
            }
        ]);
        done();
    });
});

describe('Test the setUpperText path', () => {
    test('A teacher should be able to set the upper text of a question', async (done) => {
        const rep = await postC(res, '/api/quizManagement/setUpperText').send({
            id: 6,
            quizId: 3,
            upperText: 'up'
        }).catch(done);
        expect(rep.body).toEqual({
            returnState: 0,
            question: {
                questionID: 6,
                upperText: 'up',
                lowerText: '',
                image: '',
                type: 'QCM',
                level: 1,
                theChapter: 1,
                qNumber: 2,
                theQuestion: 6,
                theQuiz: 3
            }
        })

        const quiz_question = await question_dao.findByID(6).catch(done);
        expect(quiz_question).toEqual({
            questionID: 6,
            upperText: 'up',
            lowerText: '',
            image: '',
            type: 'QCM',
            level: 1,
            theChapter: 1
        });
        done();
    });
});

describe('Test the setLowerText path', () => {
    test('A teacher should be able to set the lower text of a question', async (done) => {
        const rep = await postC(res, '/api/quizManagement/setLowerText').send({
            id: 6,
            quizId: 3,
            lowerText: 'low'
        }).catch(done);
        expect(rep.body).toEqual({
            returnState: 0,
            question: {
                questionID: 6,
                upperText: 'up',
                lowerText: 'low',
                image: '',
                type: 'QCM',
                level: 1,
                theChapter: 1,
                qNumber: 2,
                theQuestion: 6,
                theQuiz: 3
            }
        })

        const quiz_question = await question_dao.findByID(6).catch(done);
        expect(quiz_question).toEqual({
            questionID: 6,
            upperText: 'up',
            lowerText: 'low',
            image: '',
            type: 'QCM',
            level: 1,
            theChapter: 1
        });
        done();
    });
});

describe('Test the setType path', () => {
    test('A teacher should be able to set the type of a question', async (done) => {
        const rep = await postC(res, '/api/quizManagement/setType').send({
            id: 6,
            quizId: 3,
            type: 'QCU'
        }).catch(done);
        expect(rep.body).toEqual({
            returnState: 0,
            question: {
                questionID: 6,
                upperText: 'up',
                lowerText: 'low',
                image: '',
                type: 'QCU',
                level: 1,
                theChapter: 1,
                qNumber: 2,
                theQuestion: 6,
                theQuiz: 3
            }
        })

        const quiz_question = await question_dao.findByID(6).catch(done);
        expect(quiz_question).toEqual({
            questionID: 6,
            upperText: 'up',
            lowerText: 'low',
            image: '',
            type: 'QCU',
            level: 1,
            theChapter: 1
        });
        done();
    });
});

describe('Test the setLevel path', () => {
    test('A teacher should be able to set the level of a question', async (done) => {
        const rep = await postC(res, '/api/quizManagement/setLevel').send({
            id: 6,
            quizId: 3,
            level: 3
        }).catch(done);
        expect(rep.body).toEqual({
            returnState: 0,
            question: {
                questionID: 6,
                upperText: 'up',
                lowerText: 'low',
                image: '',
                type: 'QCU',
                level: 3,
                theChapter: 1,
                qNumber: 2,
                theQuestion: 6,
                theQuiz: 3
            }
        })

        const quiz_question = await question_dao.findByID(6).catch(done);
        expect(quiz_question).toEqual({
            questionID: 6,
            upperText: 'up',
            lowerText: 'low',
            image: '',
            type: 'QCU',
            level: 3,
            theChapter: 1
        });
        done();
    });
});

//TODO set image
//TODO delete image

// #############################################################################################
// #################################### ANSWER MANAGEMENT ####################################
// #############################################################################################

describe('Test the getAnswersList path', () => {
    test('A teacher should be able to get the answer list of a question', async (done) => {

        await answer_dao.insert({
            answerID: -1,
            text: '',
            isValid: 'true',
            theQuestion:3
        }).catch(done);

        const rep = await postC(res, '/api/quizManagement/getAnswersList').send({
            quizId:3,
            questionId: 3
        }).catch(done);
        rep.body.answers.sort((a, b) => a.answerID - b.answerID)
        expect(rep.body).toEqual({
            returnState: 0,
            answers: [
                {
                    answerID: 4,
                    text: '',
                    isValid: '1',
                    theQuestion:3
                }
            ]
        })
        done();
    });
});

describe('Test the createAnswer path', () => {
    test('A teacher should be able to create an answer in a question', async (done) => {
        const rep = await postC(res, '/api/quizManagement/createAnswer').send({
            questionId: 3,
            quizId: 3
        }).catch(done);
        expect(rep.body).toEqual({
            returnState: 0,
            answer: {
                answerID: 5,
                text: '',
                isValid: 'false',
                theQuestion:3
            }
        })

        const rep2 = await postC(res, '/api/quizManagement/getAnswersList').send({
            quizId:3,
            questionId: 3
        }).catch(done);
        rep2.body.answers.sort((a, b) => a.answerID - b.answerID)
        expect(rep2.body).toEqual({
            returnState: 0,
            answers: [
                {
                    answerID: 4,
                    text: '',
                    isValid: '1',
                    theQuestion:3
                },{
                    answerID: 5,
                    text: '',
                    isValid: '0',
                    theQuestion:3
                }
            ]
        })
        done();
    });
    test('an answer should be true by default if the question is open', async (done) => {
        await question_dao.insert({
            questionID: -1,
            upperText: '',
            lowerText: '',
            image: '',
            type: 'OPEN',
            level: 1,
            theChapter: 1
        }).catch(done)

        await quizQuestion_dao.insert({
            theQuestion: 8,
            theQuiz: 3,
            qNumber: 4
        }).catch(done);

        const rep = await postC(res, '/api/quizManagement/createAnswer').send({
            questionId: 8,
            quizId: 3
        }).catch(done);
        expect(rep.body).toEqual({
            returnState: 0,
            answer: {
                answerID: 6,
                text: '',
                isValid: 'true',
                theQuestion:8
            }
        })

        const rep2 = await postC(res, '/api/quizManagement/getAnswersList').send({
            quizId:3,
            questionId: 8
        }).catch(done);
        rep2.body.answers.sort((a, b) => a.answerID - b.answerID)
        expect(rep2.body).toEqual({
            returnState: 0,
            answers: [
                {
                    answerID: 6,
                    text: '',
                    isValid: '1',
                    theQuestion:8
                }
            ]
        })
        done();
    });
});

describe('Test the deleteAnswer path', () => {
    test('A teacher should be able to delete an answer', async (done) => {
        const rep = await postC(res, '/api/quizManagement/deleteAnswer').send({
            questionId: 8,
            quizId: 3,
            id: 6
        }).catch(done);
        expect(rep.body).toEqual({
            returnState: 0
        })

        const rep2 = await postC(res, '/api/quizManagement/getAnswersList').send({
            quizId:3,
            questionId: 8
        }).catch(done);
        //rep2.body.answers.sort((a, b) => a.answerID - b.answerID)
        expect(rep2.body).toEqual({
            returnState: 0,
            answers: []
        })
        done();
    });
});

describe('Test the setText path', () => {
    test('A teacher should be able to set the text of an answer', async (done) => {
        const rep = await postC(res, '/api/quizManagement/setText').send({
            id: 4,
            quizId: 3,
            questionId: 3,
            text: 'text t'
        }).catch(done);
        expect(rep.body).toEqual({
            returnState: 0,
            answer: {
                answerID: 4,
                text: 'text t',
                isValid: '1',
                theQuestion:3
            }
        })

        const rep2 = await postC(res, '/api/quizManagement/getAnswersList').send({
            quizId:3,
            questionId: 3
        }).catch(done);
        rep2.body.answers.sort((a, b) => a.answerID - b.answerID)
        expect(rep2.body).toEqual({
            returnState: 0,
            answers: [
                {
                    answerID: 4,
                    text: 'text t',
                    isValid: '1',
                    theQuestion:3
                },{
                    answerID: 5,
                    text: '',
                    isValid: '0',
                    theQuestion:3
                }
            ]
        })
        done();
    });
});

describe('Test the setIsValid path', () => {
    test('A teacher should be able to set if a QCM answer is valid or not', async (done) => {
        //Insert
        await question_dao.insert({
            questionID: -1,
            upperText: '',
            lowerText: '',
            image: '',
            type: 'QCM',
            level: 1,
            theChapter: 1
        }).catch(done)

        await quizQuestion_dao.insert({
            theQuestion: 9,
            theQuiz: 3,
            qNumber: 5
        }).catch(done);

        await answer_dao.insert({
            answerID: -1,
            text: '1',
            isValid: 'true',
            theQuestion:9
        }).catch(done);

        await answer_dao.insert({
            answerID: -1,
            text: '2',
            isValid: 'false',
            theQuestion:9
        }).catch(done);

        //TEST
        var rep = await postC(res, '/api/quizManagement/setIsValid').send({
            id: 8,
            quizId: 3,
            questionId: 9,
            isValid: 'true'
        }).catch(done);
        expect(rep.body).toEqual({
            returnState: 0,
            answer: {
                answerID: 8,
                text: '2',
                isValid: 'true',
                theQuestion:9
            }
        })

        rep = await postC(res, '/api/quizManagement/getAnswersList').send({
            quizId:3,
            questionId: 9
        }).catch(done);
        rep.body.answers.sort((a, b) => a.answerID - b.answerID)
        expect(rep.body).toEqual({
            returnState: 0,
            answers: [
                {
                    answerID: 7,
                    text: '1',
                    isValid: '1',
                    theQuestion:9
                }, {
                    answerID: 8,
                    text: '2',
                    isValid: '1',
                    theQuestion: 9
                }
            ]
        })

        rep = await postC(res, '/api/quizManagement/setIsValid').send({
            id: 7,
            quizId: 3,
            questionId: 9,
            isValid: 'false'
        }).catch(done);
        expect(rep.body).toEqual({
            returnState: 0,
            answer: {
                answerID: 7,
                text: '1',
                isValid: 'false',
                theQuestion:9
            }
        })

        rep = await postC(res, '/api/quizManagement/getAnswersList').send({
            quizId:3,
            questionId: 9
        }).catch(done);
        rep.body.answers.sort((a, b) => a.answerID - b.answerID)
        expect(rep.body).toEqual({
            returnState: 0,
            answers: [
                {
                    answerID: 7,
                    text: '1',
                    isValid: '0',
                    theQuestion:9
                }, {
                    answerID: 8,
                    text: '2',
                    isValid: '1',
                    theQuestion: 9
                }
            ]
        })

        done();
    });
    test('if the question is a QCU, there should be only one good answer', async (done) => {
        //Insert
        await question_dao.insert({
            questionID: -1,
            upperText: '',
            lowerText: '',
            image: '',
            type: 'QCU',
            level: 1,
            theChapter: 1
        }).catch(done)

        await quizQuestion_dao.insert({
            theQuestion: 10,
            theQuiz: 3,
            qNumber: 6
        }).catch(done);

        await answer_dao.insert({
            answerID: -1,
            text: '1',
            isValid: 'true',
            theQuestion:10
        }).catch(done);

        await answer_dao.insert({
            answerID: -1,
            text: '2',
            isValid: 'false',
            theQuestion:10
        }).catch(done);

        //TEST
        var rep = await postC(res, '/api/quizManagement/setIsValid').send({
            id: 10,
            quizId: 3,
            questionId: 10,
            isValid: 'true'
        }).catch(done);
        expect(rep.body).toEqual({
            returnState: 0,
            answer: {
                answerID: 10,
                text: '2',
                isValid: 'true',
                theQuestion:10
            }
        })

        rep = await postC(res, '/api/quizManagement/getAnswersList').send({
            quizId:3,
            questionId: 10
        }).catch(done);
        rep.body.answers.sort((a, b) => a.answerID - b.answerID)
        expect(rep.body).toEqual({
            returnState: 0,
            answers: [
                {
                    answerID: 9,
                    text: '1',
                    isValid: '0',
                    theQuestion:10
                }, {
                    answerID: 10,
                    text: '2',
                    isValid: '1',
                    theQuestion: 10
                }
            ]
        })

        done();
    });
    test('if the question is OPEN, you can\'t call this path', async (done) => {
        //Insert
        await question_dao.insert({
            questionID: -1,
            upperText: '',
            lowerText: '',
            image: '',
            type: 'OPEN',
            level: 1,
            theChapter: 1
        }).catch(done)

        await quizQuestion_dao.insert({
            theQuestion: 11,
            theQuiz: 3,
            qNumber: 7
        }).catch(done);

        await answer_dao.insert({
            answerID: -1,
            text: '1',
            isValid: 'true',
            theQuestion:11
        }).catch(done);

        //TEST
        var rep = await postC(res, '/api/quizManagement/setIsValid').send({
            id: 11,
            quizId: 3,
            questionId: 11,
            isValid: 'true'
        }).catch(done);
        expect(rep.body).toEqual({
            returnState: 5,
            msg: 'can\'t be call on an OPEN question'
        })

        done();
    });
});