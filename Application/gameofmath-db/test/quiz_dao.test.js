jest.setMock('../sqlite_connection.js', require('./sqlite_connection.mock'));
const db = require('../sqlite_connection');
const chapter_dao = require('../chapter_dao');
const quiz_dao = require('../quiz_dao');

beforeAll(async (done) => {
    await db.reset();
    await chapter_dao.insert({
        chapterID: -1,
        name: 'Chap'
    })
    await chapter_dao.insert({
        chapterID: -1,
        name: 'Chap2'
    })
    done();
});

test('insert a quiz', async (done) => {
    expect( await quiz_dao.insert({
        quizID: -1,
        theChapter: 1,
        asAnOrder: 'true',
        quizName: 'q1'
    }).catch(err => {done(err)})).toBe(1);
    expect(await quiz_dao.insert({
        quizID: -1,
        theChapter: 1,
        asAnOrder: 'true',
        quizName: 'q2'
    }).catch(err => {done(err)})).toBe(2);
    expect(await quiz_dao.insert({
        quizID: -1,
        theChapter: 2,
        asAnOrder: 'false',
        quizName: 'q3'
    }).catch(err => {done(err)})).toBe(3);
    done();
});

test('get all quiz', async (done) => {
    const data = await quiz_dao.findAll().catch(err => {
        done(err);
    });
    expect(data).toContainEqual({
        quizID: 1,
        theChapter: 1,
        asAnOrder: '1',
        quizName: 'q1'
    });
    expect(data).toContainEqual({
        quizID: 2,
        theChapter: 1,
        asAnOrder: '1',
        quizName: 'q2'
    });
    expect(data).toContainEqual({
        quizID: 3,
        theChapter: 2,
        asAnOrder: '0',
        quizName: 'q3'
    });
    done();
});

test('get a quiz by ID', async (done) => {
    const data = await quiz_dao.findByID(2).catch(err => {
        done(err);
    });
    expect(data).toEqual({
        quizID: 2,
        theChapter: 1,
        asAnOrder: '1',
        quizName: 'q2'
    });
    done();
});

test('get a quiz by name', async (done) => {
    const data = await quiz_dao.findByName('q3').catch(err => {
        done(err);
    });
    expect(data).toEqual({
        quizID: 3,
        theChapter: 2,
        asAnOrder: '0',
        quizName: 'q3'
    });
    done();
});

test('get all quiz in a chapter', async (done) => {
    const data = await quiz_dao.findAllInChapter(1).catch(err => {
        done(err);
    });
    expect(data).toContainEqual({
        quizID: 1,
        theChapter: 1,
        asAnOrder: '1',
        quizName: 'q1'
    });
    expect(data).toContainEqual({
        quizID: 2,
        theChapter: 1,
        asAnOrder: '1',
        quizName: 'q2'
    });
    done();
});

test('update a quiz', async (done) => {
    await quiz_dao.update({
        quizID: 1,
        theChapter: 2,
        asAnOrder: '1',
        quizName: 'q1b'
    }).catch(err => {
        done(err);
    })
    const data = await quiz_dao.findByID(1);
    expect(data).toEqual({
        quizID: 1,
        theChapter: 2,
        asAnOrder: '1',
        quizName: 'q1b'
    });
    done();
});

test('delete a quiz', async (done) => {
    await quiz_dao.delete(2).catch(err => {
        done(err);
    });
    const data = await quiz_dao.findAll();
    expect(data).toContainEqual({
        quizID: 1,
        theChapter: 2,
        asAnOrder: '1',
        quizName: 'q1b'
    });
    expect(data).not.toContainEqual({
        quizID: 2,
        theChapter: 1,
        asAnOrder: '1',
        quizName: 'q2'
    });
    expect(data).toContainEqual({
        quizID: 3,
        theChapter: 2,
        asAnOrder: '0',
        quizName: 'q3'
    });
    done();
});