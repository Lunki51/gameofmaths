jest.setMock('gameofmath-db/sqlite_connection', require('gameofmath-db/test/sqlite_connection.mock'));
const request = require('supertest');
const app = require('../app').app;
const db = require('gameofmath-db').db;
const student_dao = require('gameofmath-db').student_dao;
const class_dao = require('gameofmath-db').class_dao;
const chapter_dao = require('gameofmath-db').chapter_dao;
const quiz_dao = require('gameofmath-db').quiz_dao;
const question_dao = require('gameofmath-db').question_dao;
const answer_dao = require('gameofmath-db').answer_dao;
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
    await class_dao.insert({
        classID: -1,
        grade: '6',
        name: 'C'
    }).catch(done);
    await student_dao.insertUser({
        userID: -1,
        login: 'login1',
        password: hash('password1'),
        lastname: 'nom',
        firstname: 'prenom',
        theClass: 1,
        mp: 20
    }).catch(done);
    await chapter_dao.insert({
        chapterID: -1,
        name: 'chap1'
    }).catch(done);
    await chapter_dao.insert({
        chapterID: -1,
        name: 'chap2'
    }).catch(done);
    await quiz_dao.insert({
        quizID: -1,
        theChapter: 1,
        asAnOrder: 'true'
    }).catch(done);
    await question_dao.insert({
        questionID: -1,
        upperText: 'up1',
        lowerText: 'low1',
        image: '',
        type: 'QCM',
        level: 1,
        theChapter: 1
    }).catch(done);
    await question_dao.insert({
        questionID: -1,
        upperText: 'up2',
        lowerText: 'low2',
        image: 'img',
        type: 'OPEN',
        level: 3,
        theChapter: 1
    }).catch(done);
    await answer_dao.insert({
        answerID: -1,
        text: 't1',
        isValid: 'false',
        theQuestion: 1
    }).catch(done);
    await answer_dao.insert({
        answerID: -1,
        text: 't2',
        isValid: 'true',
        theQuestion: 1
    }).catch(done);
    await answer_dao.insert({
        answerID: -1,
        text: 't3',
        isValid: 'true',
        theQuestion: 2
    }).catch(done);
    await quizQuestion_dao.insert({
        theQuestion: 2,
        theQuiz: 1,
        qNumber: 1
    }).catch(done);
    await quizQuestion_dao.insert({
        theQuestion: 1,
        theQuiz: 1,
        qNumber: 2
    }).catch(done);
    done();
});

let res = null
beforeEach(async (done) => {
    res = await request(app)
        .post('/api/user/auth')
        .send({
            username: 'login1',
            password: 'password1'
        }).catch(done);
    done()
})

describe('Test the getChapter path', () => {
    test('A student should be able to get the chapter list', async (done) => {
        const rep = await postC(res, '/api/quiz/getChapter').send().catch(done);
        expect(rep.body).toEqual({
            returnState: 0,
            chapters: ['chap1', 'chap2']
        })
        done();
    });
});

describe('Test the isInQuiz path', () => {
    test('A student shouldn\'t be in a quiz if he isn\'t in a quiz', async (done) => {
        const rep = await postC(res, '/api/quiz/isInQuiz').send().catch(done);
        expect(rep.body).toEqual({
            returnState: 0,
            isInQuiz: false
        })
        done();
    });
});

describe('Test the startQuiz path', () => {
    test('A student should be able to start a quiz', async (done) => {
        const rep = await postC(res, '/api/quiz/startQuiz').send({chapter: 'chap1'}).catch(done);
        expect(rep.body).toEqual({
            returnState: 0,
            nbQuestion: 2
        })
        await postC(res, '/api/quiz/quit').send().catch(done);
        done();
    });
});

describe('Test the isInQuiz path', () => {
    test('A student should be in a quiz if he is in a quiz', async (done) => {
        await postC(res, '/api/quiz/startQuiz').send({chapter: 'chap1'}).catch(done);
        const rep = await postC(res, '/api/quiz/isInQuiz').send().catch(done);
        expect(rep.body).toEqual({
            returnState: 0,
            isInQuiz: true
        })
        await postC(res, '/api/quiz/quit').send().catch(done);
        done();
    });
});

describe('Test the getQuestion path', () => {
    test('A student should be able to get all the question in a quiz', async (done) => {
        await postC(res, '/api/quiz/startQuiz').send({chapter: 'chap1'}).catch(done);

        let rep = await postC(res, '/api/quiz/getQuestion').send({questionNb: 0}).catch(done);
        expect(rep.body).toEqual({
            returnState: 0,
            question: {
                questionID: 2,
                upperText: 'up2',
                lowerText: 'low2',
                image: 'img',
                type: 'OPEN',
                level: 3,
                qNumber: 1,
                theChapter: 1,
                theQuiz: 1,
                asAnOrder: "1"
            }
        })
        await postC(res, '/api/quiz/postAnswer').send({questionNb: 0, questionID: 2, answer: "t3"}).catch(done);

        rep = await postC(res, '/api/quiz/getQuestion').send({questionNb: 1}).catch(done);
        expect(rep.body.question.answers).toContainEqual({answerID: 1, text: "t1"})
        expect(rep.body.question.answers).toContainEqual({answerID: 2, text: "t2"})
        delete rep.body.question.answers
        expect(rep.body).toEqual({
            returnState: 0,
            question: {
                questionID: 1,
                upperText: 'up1',
                lowerText: 'low1',
                image: '',
                type: 'QCM',
                level: 1,
                qNumber: 2,
                theChapter: 1,
                theQuiz: 1,
                asAnOrder: "1",
            }
        })

        await postC(res, '/api/quiz/quit').send().catch(done);
        done();
    });

    test('A student should be to able to get an old question', async (done) => {
        await postC(res, '/api/quiz/startQuiz').send({chapter: 'chap1'}).catch(done);
        await postC(res, '/api/quiz/postAnswer').send({questionNb: 0, questionID: 2, answer: "t3"}).catch(done);

        const rep = await postC(res, '/api/quiz/getQuestion').send({questionNb: 0}).catch(done);
        expect(rep.body).toEqual({
            returnState: 0,
            question: {
                questionID: 2,
                upperText: 'up2',
                lowerText: 'low2',
                image: 'img',
                type: 'OPEN',
                level: 3,
                qNumber: 1,
                theChapter: 1,
                theQuiz: 1,
                asAnOrder: "1"
            }
        })

        await postC(res, '/api/quiz/quit').send().catch(done);
        done();
    });
});

describe('Test the postAnswer path', () => {
    test('A student should be able to post an answer', async (done) => {
        await postC(res, '/api/quiz/startQuiz').send({chapter: 'chap1'}).catch(done);
        const rep = await postC(res, '/api/quiz/postAnswer').send({questionNb: 0, questionID: 2, answer: "t3"}).catch(done);

        expect(rep.body).toEqual({
            returnState: 0
        })

        await postC(res, '/api/quiz/quit').send().catch(done);
        done();
    });

    test('When a student answer to the last question, he should get is score', async (done) => {
        await postC(res, '/api/quiz/startQuiz').send({chapter: 'chap1'}).catch(done);
        await postC(res, '/api/quiz/postAnswer').send({questionNb: 0, questionID: 2, answer: "t3"}).catch(done);
        const rep = await postC(res, '/api/quiz/postAnswer').send({questionNb: 1, questionID: 1, answers: [1]}).catch(done);

        expect(rep.body).toEqual({
            returnState: 0,
            score: 3,
            scoreMax: 4,
            mpGain: 30,
            redirect: "quizDone"

        })

        expect((await postC(res, '/api/quiz/isInQuiz').send().catch(done)).body).toEqual({
            returnState:0,
            isInQuiz: false
        })
        done();
    });
});

describe('Test the quit path', () => {
    test('Expect a student to be able to quit a quiz', async (done) => {
        await postC(res, '/api/quiz/startQuiz').send({chapter: 'chap1'}).catch(done);
        await postC(res, '/api/quiz/postAnswer').send({questionNb: 0, questionID: 2, answer: "t3"}).catch(done);
        const rep = await postC(res, '/api/quiz/quit').send().catch(done);

        expect(rep.body).toEqual({
            returnState: 0,
            score: 3,
            scoreMax: 4,
            mpGain: 30,
            redirect: "quizDone"

        })

        expect((await postC(res, '/api/quiz/isInQuiz').send().catch(done)).body).toEqual({
            returnState:0,
            isInQuiz: false
        })
        done();
    });
});

describe('Test the getState path', () => {
    test('Expect a student to be able to get is state in the a quiz', async (done) => {
        await postC(res, '/api/quiz/startQuiz').send({chapter: 'chap1'}).catch(done);

        expect((await postC(res, '/api/quiz/getState').send().catch(done)).body).toEqual({
            returnState:0,
            state: {
                questionNb: 2,
                lastQuestion: 0
            }
        })

        await postC(res, '/api/quiz/postAnswer').send({questionNb: 0, questionID: 2, answer: "t3"}).catch(done);

        expect((await postC(res, '/api/quiz/getState').send().catch(done)).body).toEqual({
            returnState:0,
            state: {
                questionNb: 2,
                lastQuestion: 1
            }
        })

        done();
    });
});