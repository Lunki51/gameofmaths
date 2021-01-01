jest.setMock('../sqlite_connection.js', require('./sqlite_connection.mock'));
const db = require('../sqlite_connection');
const student_dao = require('../student_dao');
const class_dao = require('../class_dao');
const mpGain_dao = require('../mpGain_dao');

beforeAll(async (done) => {
    await db.reset();

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
    done();
});

test('insert a mpGain', async (done) => {
    expect( await mpGain_dao.insert({
        mpGainID: -1,
        amount: 10,
        type: 'QUIZ',
        date: 'Thu Jan 01 1970 01:00:00 GMT+0100 (Central European Standard Time)',
        theStudent: 1
    }).catch(err => {done(err)})).toBe(1);
    expect(await mpGain_dao.insert({
        mpGainID: -1,
        amount: 20,
        type: 'QUIZ',
        date: 'Thu Jan 01 1970 01:00:00 GMT+0100 (Central European Standard Time)',
        theStudent: 2
    }).catch(err => {done(err)})).toBe(2);
    expect(await mpGain_dao.insert({
        mpGainID: -1,
        amount: 30,
        type: 'QUIZ',
        date: 'Thu Jan 01 1970 01:00:00 GMT+0100 (Central European Standard Time)',
        theStudent: 1
    }).catch(err => {done(err)})).toBe(3);
    done();
});

test('get all mpGain', async (done) => {
    const data = await mpGain_dao.findAll().catch(err => {
        done(err);
    });
    expect(data).toContainEqual({
        mpGainID: 1,
        amount: 10,
        type: 'QUIZ',
        date: 'Thu Jan 01 1970 01:00:00 GMT+0100 (Central European Standard Time)',
        theStudent: 1
    });
    expect(data).toContainEqual({
        mpGainID: 2,
        amount: 20,
        type: 'QUIZ',
        date: 'Thu Jan 01 1970 01:00:00 GMT+0100 (Central European Standard Time)',
        theStudent: 2
    });
    expect(data).toContainEqual({
        mpGainID: 3,
        amount: 30,
        type: 'QUIZ',
        date: 'Thu Jan 01 1970 01:00:00 GMT+0100 (Central European Standard Time)',
        theStudent: 1
    });
    done();
});

test('get all mpGain by student', async (done) => {
    const data = await mpGain_dao.findAllByStudent(1).catch(err => {
        done(err);
    });
    expect(data).toContainEqual({
        mpGainID: 1,
        amount: 10,
        type: 'QUIZ',
        date: 'Thu Jan 01 1970 01:00:00 GMT+0100 (Central European Standard Time)',
        theStudent: 1
    });
    expect(data).toContainEqual({
        mpGainID: 3,
        amount: 30,
        type: 'QUIZ',
        date: 'Thu Jan 01 1970 01:00:00 GMT+0100 (Central European Standard Time)',
        theStudent: 1
    });
    done();
});

test('get a mpGain by ID', async (done) => {
    const data = await mpGain_dao.findByID(2).catch(err => {
        done(err);
    });
    expect(data).toEqual({
        mpGainID: 2,
        amount: 20,
        type: 'QUIZ',
        date: 'Thu Jan 01 1970 01:00:00 GMT+0100 (Central European Standard Time)',
        theStudent: 2
    });
    done();
});

test('update a mpGain', async (done) => {
    await mpGain_dao.update({
        mpGainID: 1,
        amount: 5,
        type: 'QUIZ',
        date: 'Thu Jan 01 1970 01:00:00 GMT+0100 (Central European Standard Time)',
        theStudent: 1
    }).catch(err => {
        done(err);
    })
    const data = await mpGain_dao.findByID(1);
    expect(data).toEqual({
        mpGainID: 1,
        amount: 5,
        type: 'QUIZ',
        date: 'Thu Jan 01 1970 01:00:00 GMT+0100 (Central European Standard Time)',
        theStudent: 1
    });
    done();
});

test('delete a mpGain', async (done) => {
    await mpGain_dao.delete(2).catch(err => {
        done(err);
    });
    const data = await mpGain_dao.findAll();
    expect(data).toContainEqual({
        mpGainID: 1,
        amount: 5,
        type: 'QUIZ',
        date: 'Thu Jan 01 1970 01:00:00 GMT+0100 (Central European Standard Time)',
        theStudent: 1
    });
    expect(data).not.toContainEqual({
        mpGainID: 2,
        amount: 20,
        type: 'QUIZ',
        date: 'Thu Jan 01 1970 01:00:00 GMT+0100 (Central European Standard Time)',
        theStudent: 2
    });
    expect(data).toContainEqual({
        mpGainID: 3,
        amount: 30,
        type: 'QUIZ',
        date: 'Thu Jan 01 1970 01:00:00 GMT+0100 (Central European Standard Time)',
        theStudent: 1
    });
    done();
});