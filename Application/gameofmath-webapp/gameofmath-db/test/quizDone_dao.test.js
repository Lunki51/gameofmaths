jest.setMock('../sqlite_connection.js', require('./sqlite_connection.mock'));
const db = require('../sqlite_connection');
const chapter_dao = require('../chapter_dao')
const quiz_dao = require('../quiz_dao');
const student_dao = require('../student_dao');
const class_dao = require('../class_dao');
const mpGain_dao = require('../mpGain_dao');
const quizDone_dao = require('../quizDone_dao');

beforeAll(async (done) => {
    await db.reset();
    await chapter_dao.insert({
        chapterID: -1,
        name: 'Chap'
    });
    await quiz_dao.insert({
        quizID: -1,
        theChapter: 1
    });
    await quiz_dao.insert({
        quizID: -1,
        theChapter: 1
    });

    await class_dao.insert({
        classID: 1,
        grade: '6',
        name: 'C'
    });

    await student_dao.insertUser({
        userID: -1,
        login: 'e1',
        password: 'password456',
        lastname: 'n',
        firstname: 'p',
        theClass: 1,
        mp: 0
    });
    await student_dao.insertUser({
        userID: -1,
        login: 'e2',
        password: 'password456',
        lastname: 'n',
        firstname: 'p',
        theClass: 1,
        mp: 0
    });

    await mpGain_dao.insert({
        mpGainID: -1,
        amount: 10,
        type: 'QUIZ',
        date: 0,
        theStudent: 1
    });

    done();
});

test('insert a quiz Done', async (done) => {
    await quizDone_dao.insert({
        theQuiz: 1,
        theGain: 1,
        score: 10
    }).catch(err => {done(err)});
    done();
});

test('insert a quiz Done with a MPGain', async (done) => {
    expect( await quizDone_dao.insertMPGain({
        mpGainID: -1,
        amount: 20,
        type: 'QUIZ',
        date: 0,
        theStudent: 2,
        theQuiz: 1,
        score: 2
    }).catch(err => {done(err)})).toBe(2);
    expect( await quizDone_dao.insertMPGain({
        mpGainID: -1,
        amount: 30,
        type: 'QUIZ',
        date: 0,
        theStudent: 1,
        theQuiz: 2,
        score: 5
    }).catch(err => {done(err)})).toBe(3);
    done();
});

test('get all quiz Done', async (done) => {
    const data = await quizDone_dao.findAll().catch(err => {
        done(err);
    });
    expect(data).toContainEqual({
        theQuiz: 1,
        theGain: 1,
        score: 10
    });
    expect(data).toContainEqual({
        theQuiz: 1,
        theGain: 2,
        score: 2
    });
    expect(data).toContainEqual({
        theQuiz: 2,
        theGain: 3,
        score: 5
    });
    done();
});

test('get all quizDone_dao for a quiz', async (done) => {
    const data = await quizDone_dao.findAllByQuiz(1).catch(err => {
        done(err);
    });
    expect(data).toContainEqual({
        theQuiz: 1,
        theGain: 1,
        score: 10
    });
    expect(data).toContainEqual({
        theQuiz: 1,
        theGain: 2,
        score: 2
    });
    done();
});

test('get all quizDone_dao for a student', async (done) => {
    const data = await quizDone_dao.findAllByStudent(1).catch(err => {
        done(err);
    });
    expect(data).toContainEqual({
        mpGainID: 1,
        amount: 10,
        type: 'QUIZ',
        date: 'Thu Jan 01 1970 01:00:00 GMT+0100 (Central European Standard Time)',
        theStudent: 1,
        theQuiz: 1,
        theGain: 1,
        score: 10
    });
    expect(data).toContainEqual({
        mpGainID: 3,
        amount: 30,
        type: 'QUIZ',
        date: 'Thu Jan 01 1970 01:00:00 GMT+0100 (Central European Standard Time)',
        theStudent: 1,
        theQuiz: 2,
        theGain: 3,
        score: 5
    });
    done();
});

test('get a quiz Done by ID', async (done) => {
    const data = await quizDone_dao.findByID(2).catch(err => {
        done(err);
    });
    expect(data).toEqual({
        theGain: 2,
        theQuiz: 1,
        score: 2
    });
    done();
});

test('update a quizDone', async (done) => {
    await quizDone_dao.update({
        theGain: 1,
        theQuiz: 1,
        score: 1
    }).catch(err => {
        done(err);
    })
    const data = await quizDone_dao.findByID(1);
    expect(data).toEqual({
        theGain: 1,
        theQuiz: 1,
        score: 1
    });
    done();
});

test('delete a quiz Done', async (done) => {
    await quizDone_dao.delete(2).catch(err => {
        done(err);
    });
    const data = await quizDone_dao.findAll();
    expect(data).toContainEqual({
        theGain: 1,
        theQuiz: 1,
        score: 1
    });
    expect(data).not.toContainEqual({
        theGain: 2,
        theQuiz: 1,
        score: 2
    });
    expect(data).toContainEqual({
        theGain: 3,
        theQuiz: 2,
        score: 5
    });
    done();
});