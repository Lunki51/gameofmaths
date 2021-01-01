jest.setMock('../sqlite_connection.js', require('./sqlite_connection.mock'));
const db = require('../sqlite_connection');
const chapter_dao = require('../chapter_dao');
const question_dao = require('../question_dao');

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

test('insert a question', async (done) => {
    expect( await question_dao.insert({
        questionID: -1,
        upperText: 'up',
        lowerText: '',
        image: '',
        type: 'QCM',
        level: 1,
        theChapter: 1
    }).catch(err => {done(err)})).toBe(1);
    expect(await question_dao.insert({
        questionID: -1,
        upperText: 'up',
        lowerText: 'low',
        image: 'ima.png',
        type: 'QCU',
        level: 2,
        theChapter: 1
    }).catch(err => {done(err)})).toBe(2);
    expect(await question_dao.insert({
        questionID: -1,
        upperText: 'up',
        lowerText: 'low',
        image: '',
        type: 'OPEN',
        level: 1,
        theChapter: 2
    }).catch(err => {done(err)})).toBe(3);
    done();
});

test('get all question', async (done) => {
    const data = await question_dao.findAll().catch(err => {
        done(err);
    });
    expect(data).toContainEqual({
        questionID: 1,
        upperText: 'up',
        lowerText: '',
        image: '',
        type: 'QCM',
        level: 1,
        theChapter: 1
    });
    expect(data).toContainEqual({
        questionID: 2,
        upperText: 'up',
        lowerText: 'low',
        image: 'ima.png',
        type: 'QCU',
        level: 2,
        theChapter: 1
    });
    expect(data).toContainEqual({
        questionID: 3,
        upperText: 'up',
        lowerText: 'low',
        image: '',
        type: 'OPEN',
        level: 1,
        theChapter: 2
    });
    done();
});

test('get all question in chapter', async (done) => {
    const data = await question_dao.findAllInChapter(1).catch(err => {
        done(err);
    });
    expect(data).toContainEqual({
        questionID: 1,
        upperText: 'up',
        lowerText: '',
        image: '',
        type: 'QCM',
        level: 1,
        theChapter: 1
    });
    expect(data).toContainEqual({
        questionID: 2,
        upperText: 'up',
        lowerText: 'low',
        image: 'ima.png',
        type: 'QCU',
        level: 2,
        theChapter: 1
    });
    done();
});

test('get all question by level', async (done) => {
    const data = await question_dao.findAllByLevel(1).catch(err => {
        done(err);
    });
    expect(data).toContainEqual({
        questionID: 1,
        upperText: 'up',
        lowerText: '',
        image: '',
        type: 'QCM',
        level: 1,
        theChapter: 1
    });
    expect(data).toContainEqual({
        questionID: 3,
        upperText: 'up',
        lowerText: 'low',
        image: '',
        type: 'OPEN',
        level: 1,
        theChapter: 2
    });
    done();
});

test('get a question by ID', async (done) => {
    const data = await question_dao.findByID(2).catch(err => {
        done(err);
    });
    expect(data).toEqual({
        questionID: 2,
        upperText: 'up',
        lowerText: 'low',
        image: 'ima.png',
        type: 'QCU',
        level: 2,
        theChapter: 1
    });
    done();
});

test('update a question', async (done) => {
    await question_dao.update({
        questionID: 1,
        upperText: 'up',
        lowerText: 'Text',
        image: '',
        type: 'QCM',
        level: 3,
        theChapter: 1
    }).catch(err => {
        done(err);
    })
    const data = await question_dao.findByID(1);
    expect(data).toEqual({
        questionID: 1,
        upperText: 'up',
        lowerText: 'Text',
        image: '',
        type: 'QCM',
        level: 3,
        theChapter: 1
    });
    done();
});

test('delete a question', async (done) => {
    await question_dao.delete(2).catch(err => {
        done(err);
    });
    const data = await question_dao.findAll();
    expect(data).toContainEqual({
        questionID: 1,
        upperText: 'up',
        lowerText: 'Text',
        image: '',
        type: 'QCM',
        level: 3,
        theChapter: 1
    });
    expect(data).not.toContainEqual({
        questionID: 2,
        upperText: 'up',
        lowerText: 'low',
        image: 'ima.png',
        type: 'QCU',
        level: 2,
        theChapter: 1
    });
    expect(data).toContainEqual({
        questionID: 3,
        upperText: 'up',
        lowerText: 'low',
        image: '',
        type: 'OPEN',
        level: 1,
        theChapter: 2
    });
    done();
});