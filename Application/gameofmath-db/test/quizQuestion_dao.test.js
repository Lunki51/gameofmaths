jest.setMock('../sqlite_connection.js', require('./sqlite_connection.mock'));
const db = require('../sqlite_connection');
const chapter_dao = require('../chapter_dao')
const question_dao = require('../question_dao');
const quiz_dao = require('../quiz_dao');
const quizQuestion_dao = require('../quizQuestion_dao');

beforeAll(async (done) => {
    await db.reset();
    await chapter_dao.insert({
        chapterID: -1,
        name: 'Chap'
    });
    await question_dao.insert({
        questionID: -1,
        upperText: 'up',
        lowerText: '',
        image: '',
        type: 'QCM',
        level: 1,
        theChapter: 1
    });
    await question_dao.insert({
        questionID: -1,
        upperText: 'up',
        lowerText: '',
        image: '',
        type: 'QCM',
        level: 2,
        theChapter: 1
    });
    await question_dao.insert({
        questionID: -1,
        upperText: 'up',
        lowerText: '',
        image: '',
        type: 'QCM',
        level: 3,
        theChapter: 1
    });
    await quiz_dao.insert({
        quizID: -1,
        theChapter: 1,
        asAnOrder: 'true'
    });
    await quiz_dao.insert({
        quizID: -1,
        theChapter: 1,
        asAnOrder: 'true'
    });
    done();
});

test('insert a link between quiz and question', async (done) => {
    await quizQuestion_dao.insert({
        theQuestion: 1,
        theQuiz: 1,
        qNumber: 1
    }).catch(err => {done(err)});
    await quizQuestion_dao.insert({
        theQuestion: 2,
        theQuiz: 1,
        qNumber: 2
    }).catch(err => {done(err)});
    await quizQuestion_dao.insert({
        theQuestion: 1,
        theQuiz: 2,
        qNumber: 1
    }).catch(err => {done(err)});
    done();
});

test('get all link between quiz and question', async (done) => {
    const data = await quizQuestion_dao.findAll().catch(err => {
        done(err);
    });
    expect(data).toContainEqual({
        theQuestion: 1,
        theQuiz: 1,
        qNumber: 1
    });
    expect(data).toContainEqual({
        theQuestion: 2,
        theQuiz: 1,
        qNumber: 2
    });
    expect(data).toContainEqual({
        theQuestion: 1,
        theQuiz: 2,
        qNumber: 1
    });
    done();
});

test('get all link between quiz an a question', async (done) => {
    const data = await quizQuestion_dao.findAllByQuestion(1).catch(err => {
        done(err);
    });
    expect(data).toContainEqual({
        theQuestion: 1,
        theQuiz: 1,
        qNumber: 1
    });
    expect(data).toContainEqual({
        theQuestion: 1,
        theQuiz: 2,
        qNumber: 1
    });
    done();
});

test('get all link between question an a quiz', async (done) => {
    const data = await quizQuestion_dao.findAllByQuiz(1).catch(err => {
        done(err);
    });
    expect(data).toContainEqual({
        theQuestion: 1,
        theQuiz: 1,
        qNumber: 1
    });
    expect(data).toContainEqual({
        theQuestion: 2,
        theQuiz: 1,
        qNumber: 2
    });
    done();
});

test('get a link between quiz and question by ID', async (done) => {
    const data = await quizQuestion_dao.findByID(1, 2).catch(err => {
        done(err);
    });
    expect(data).toEqual({
        theQuestion: 1,
        theQuiz: 2,
        qNumber: 1
    });
    done();
});

test('update a quizQuestion', async (done) => {
    await quizQuestion_dao.update({
        theQuestion: 1,
        theQuiz: 2,
        qNumber: 3
    }).catch(err => {
        done(err);
    })
    const data = await quizQuestion_dao.findByID(1, 2);
    expect(data).toEqual({
        theQuestion: 1,
        theQuiz: 2,
        qNumber: 3
    });
    done();
});

test('delete a link between quiz and question', async (done) => {
    await quizQuestion_dao.delete(1, 2).catch(err => {
        done(err);
    });
    const data = await quizQuestion_dao.findAll();
    expect(data).toContainEqual({
        theQuestion: 1,
        theQuiz: 1,
        qNumber: 1
    });
    expect(data).not.toContainEqual({
        theQuestion: 1,
        theQuiz: 2,
        qNumber: 3
    });
    expect(data).toContainEqual({
        theQuestion: 2,
        theQuiz: 1,
        qNumber: 2
    });
    done();
});