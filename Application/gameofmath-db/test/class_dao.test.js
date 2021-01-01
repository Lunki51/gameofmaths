jest.setMock('../sqlite_connection.js', require('./sqlite_connection.mock'));
const db = require('../sqlite_connection');
const class_dao = require('../class_dao');

beforeAll(async (done) => {
    await db.reset();
    done();
});

test('insert a class', async (done) => {
    expect( await class_dao.insert({
        classID: -1,
        grade: '6',
        name: 'C'
    }).catch(err => {done(err)})).toBe(1);
    expect(await class_dao.insert({
        classID: -1,
        grade: '6',
        name: 'A'
    }).catch(err => {done(err)})).toBe(2);
    done();
});

test('get all class', async (done) => {
    const data = await class_dao.findAll().catch(err => {
        done(err);
    });
    expect(data).toContainEqual({
        classID: 1,
        grade: '6',
        name: 'C'
    });
    expect(data).toContainEqual({
        classID: 2,
        grade: '6',
        name: 'A'
    });
    done();
});

test('get a class by ID', async (done) => {
    const data = await class_dao.findByID(2).catch(err => {
        done(err);
    });
    expect(data).toEqual({
        classID: 2,
        grade: '6',
        name: 'A'
    });
    done();
});

test('get a class by grade and name', async (done) => {
    const data = await class_dao.findByGradeName('6', 'C').catch(err => {
        done(err);
    });
    expect(data).toEqual({
        classID: 1,
        grade: '6',
        name: 'C'
    });
    done();
});

test('update a class', async (done) => {
    await class_dao.update({
        classID: 1,
        grade: '6',
        name: 'B'
    }).catch(err => {
        done(err);
    })
    const data = await class_dao.findByID(1);
    expect(data).toEqual({
        classID: 1,
        grade: '6',
        name: 'B'
    });
    done();
});

test('delete a class', async (done) => {
    await class_dao.delete(2).catch(err => {
        done(err);
    });
    const data = await class_dao.findAll();
    expect(data).toContainEqual({
        classID: 1,
        grade: '6',
        name: 'B'
    });
    expect(data).not.toContainEqual({
        classID: 2,
        grade: '6',
        name: 'A'
    });
    done();
});