jest.setMock('../sqlite_connection.js', require('./sqlite_connection.mock'));
const db = require('../sqlite_connection');
const user_dao = require('../user_dao');
const teacher_dao = require('../teacher_dao');

beforeAll(async (done) => {
    await db.reset();
    await user_dao.insert({
        userID: -1,
        login: 'e19',
        password: 'password1234',
        lastname: 'nom',
        firstname: 'prenom'
    });
    done();
});

test('insert a teacher', () => {
    return expect(teacher_dao.insert({
        theUser: 1,
        email: 't@gmail.com'
    })).resolves.toBe(1);
});

test('insert a teacher with the user', () => {
    return expect(teacher_dao.insertUser({
        userID: -1,
        login: 'e20',
        password: 'password1234',
        lastname: 'nom2',
        firstname: 'prenom2',
        email: 't2@gmail.com'
    })).resolves.toBe(2);
});

test('get all teacher', async (done) => {
    const data = await teacher_dao.findAll().catch(err => {
        done(err);
    });
    expect(data).toContainEqual({
        theUser: 1,
        email: 't@gmail.com'
    });
    expect(data).toContainEqual({
        theUser: 2,
        email: 't2@gmail.com'
    });
    done();
});

test('get all teacher with user', async (done) => {
    const data = await teacher_dao.findAllUser().catch(err => {
        done(err);
    });
    expect(data).toContainEqual({
        userID: 1,
        login: 'e19',
        password: 'password1234',
        lastname: 'nom',
        firstname: 'prenom',
        theUser: 1,
        email: 't@gmail.com'
    });
    expect(data).toContainEqual({
        userID: 2,
        login: 'e20',
        password: 'password1234',
        lastname: 'nom2',
        firstname: 'prenom2',
        theUser: 2,
        email: 't2@gmail.com'
    });
    done();
});

test('get a teacher by ID', async (done) => {
    const data = await teacher_dao.findByID(2).catch(err => {
        done(err);
    });
    expect(data).toEqual({
        theUser: 2,
        email: 't2@gmail.com'
    });
    done();
});

test('get a teacher by ID with the user', async (done) => {
    const data = await teacher_dao.findUserByID(2).catch(err => {
        done(err);
    });
    expect(data).toEqual({
        userID: 2,
        login: 'e20',
        password: 'password1234',
        lastname: 'nom2',
        firstname: 'prenom2',
        theUser: 2,
        email: 't2@gmail.com'
    });
    done();
});

test('get a teacher with user by login', async (done) => {
    const data = await teacher_dao.findUserByLogin('e19').catch(err => {
        done(err);
    });
    expect(data).toEqual({
        userID: 1,
        login: 'e19',
        password: 'password1234',
        lastname: 'nom',
        firstname: 'prenom',
        theUser: 1,
        email: 't@gmail.com'
    });
    done();
});

test('update a teacher', async (done) => {
    await teacher_dao.update({
        theUser: 1,
        email: 't3@gmail.com'
    }).catch(err => {
        done(err);
    });
    const data = await teacher_dao.findByID(1);
    expect(data).toEqual({
        theUser: 1,
        email: 't3@gmail.com'
    });
    done();
});

test('delete a teacher', async (done) => {
    await teacher_dao.delete(2).catch(err => {
        done(err);
    });
    const data = await teacher_dao.findAll();
    expect(data).toContainEqual({
        theUser: 1,
        email: 't3@gmail.com'
    });
    expect(data).not.toContainEqual({
        theUser: 2,
        email: 't2@gmail.com'
    });
    done();
});