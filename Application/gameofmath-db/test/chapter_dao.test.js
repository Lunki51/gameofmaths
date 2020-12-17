jest.setMock('../sqlite_connection.js', require('./sqlite_connection.mock'));
const db = require('../sqlite_connection');
const chapter_dao = require('../chapter_dao');

beforeAll(async (done) => {
    await db.reset();
    done();
});

test('insert a chapter', async (done) => {
    expect( await chapter_dao.insert({
        chapterID: -1,
        name: 'c'
    }).catch(err => {done(err)})).toBe(1);
    expect(await chapter_dao.insert({
        chapterID: -1,
        name: 'a'
    }).catch(err => {done(err)})).toBe(2);
    done();
});

test('get all chapter', async (done) => {
    const data = await chapter_dao.findAll().catch(err => {
        done(err);
    });
    expect(data).toContainEqual({
        chapterID: 1,
        name: 'c'
    });
    expect(data).toContainEqual({
        chapterID: 2,
        name: 'a'
    });
    done();
});

test('get a chapter by ID', async (done) => {
    const data = await chapter_dao.findByID(2).catch(err => {
        done(err);
    });
    expect(data).toEqual({
        chapterID: 2,
        name: 'a'
    });
    done();
});

test('get a chapter by name', async (done) => {
    const data = await chapter_dao.findByName('c').catch(err => {
        done(err);
    });
    expect(data).toEqual({
        chapterID: 1,
        name: 'c'
    });
    done();
});

test('update a chapter', async (done) => {
    await chapter_dao.update({
        chapterID: 1,
        name: 'b'
    }).catch(err => {
        done(err);
    })
    const data = await chapter_dao.findByID(1);
    expect(data).toEqual({
        chapterID: 1,
        name: 'b'
    });
    done();
});

test('delete a chapter', async (done) => {
    await chapter_dao.delete(2).catch(err => {
        done(err);
    });
    const data = await chapter_dao.findAll();
    expect(data).toContainEqual({
        chapterID: 1,
        name: 'b'
    });
    expect(data).not.toContainEqual({
        chapterID: 2,
        name: 'a'
    });
    done();
});