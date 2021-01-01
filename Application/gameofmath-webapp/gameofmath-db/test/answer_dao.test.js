jest.setMock('../sqlite_connection.js', require('./sqlite_connection.mock'));
const db = require('../sqlite_connection');
const chapter_dao = require('../chapter_dao');
const question_dao = require('../question_dao');
const answer_dao = require('../answer_dao');

beforeAll(async (done) => {
    await db.reset();
    await chapter_dao.insert({
        chapterID: -1,
        name: 'Chap'
    })
    question_dao.insert({
        questionID: -1,
        upperText: 'up',
        lowerText: '',
        image: '',
        type: 'QCM',
        level: 1,
        theChapter: 1
    })
    question_dao.insert({
        questionID: -1,
        upperText: 'up',
        lowerText: 'low',
        image: 'ima.png',
        type: 'OPEN',
        level: 2,
        theChapter: 1
    })

    done();
});

test('insert a answer', async (done) => {
    expect( await answer_dao.insert({
        answerID: -1,
        text: '18cm',
        isValid: true,
        theQuestion: 1
    }).catch(err => {done(err)})).toBe(1);
    expect(await answer_dao.insert({
        answerID: -1,
        text: '19cm',
        isValid: false,
        theQuestion: 1
    }).catch(err => {done(err)})).toBe(2);
    expect(await answer_dao.insert({
        answerID: -1,
        text: '18.8',
        isValid: true,
        theQuestion: 2
    }).catch(err => {done(err)})).toBe(3);
    done();
});

test('get all answer', async (done) => {
    const data = await answer_dao.findAll().catch(err => {
        done(err);
    });
    expect(data).toContainEqual({
        answerID: 1,
        text: '18cm',
        isValid: '1',
        theQuestion: 1
    });
    expect(data).toContainEqual({
        answerID: 2,
        text: '19cm',
        isValid: '0',
        theQuestion: 1
    });
    expect(data).toContainEqual({
        answerID: 3,
        text: '18.8',
        isValid: '1',
        theQuestion: 2
    });
    done();
});

test('get a answer by ID', async (done) => {
    const data = await answer_dao.findByID(2).catch(err => {
        done(err);
    });
    expect(data).toEqual({
        answerID: 2,
        text: '19cm',
        isValid: '0',
        theQuestion: 1
    });
    done();
});

test('get all answer of a question', async (done) => {
    const data = await answer_dao.findAllInQuestion(1).catch(err => {
        done(err);
    });
    expect(data).toContainEqual({
        answerID: 1,
        text: '18cm',
        isValid: '1',
        theQuestion: 1
    });
    expect(data).toContainEqual({
        answerID: 2,
        text: '19cm',
        isValid: '0',
        theQuestion: 1
    });
    done();
});

test('update a answer', async (done) => {
    await answer_dao.update({
        answerID: 1,
        text: '18.2cm',
        isValid: '1',
        theQuestion: 1
    }).catch(err => {
        done(err);
    })
    const data = await answer_dao.findByID(1);
    expect(data).toEqual({
        answerID: 1,
        text: '18.2cm',
        isValid: '1',
        theQuestion: 1
    });
    done();
});

test('delete a answer', async (done) => {
    await answer_dao.delete(2).catch(err => {
        done(err);
    });
    const data = await answer_dao.findAll();
    expect(data).toContainEqual({
        answerID: 1,
        text: '18.2cm',
        isValid: '1',
        theQuestion: 1
    });
    expect(data).not.toContainEqual({
        answerID: 2,
        text: '19cm',
        isValid: '0',
        theQuestion: 1
    });
    expect(data).toContainEqual({
        answerID: 3,
        text: '18.8',
        isValid: '1',
        theQuestion: 2
    });
    done();
});