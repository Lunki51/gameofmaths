jest.setMock('../sqlite_connection.js', require('./sqlite_connection.mock'));
const db = require('../sqlite_connection');
const user_dao = require('../user_dao');
const class_dao = require('../class_dao');
const student_dao = require('../student_dao');

beforeAll(async (done) => {
    await db.reset();
    await user_dao.insert({
        userID: -1,
        login: 'e19',
        password: 'password1234',
        lastname: 'nom',
        firstname: 'prenom'
    });
    await class_dao.insert({
        classID: -1,
        grade: '6',
        name: 'C'
    });
    await class_dao.insert({
        classID: -1,
        grade: '6',
        name: 'A'
    });
    done();
});

test('insert a student', () => {
    return expect(student_dao.insert({
        theUser: 1,
        theClass: 1,
        mp: 0
    })).resolves.toBe(1);
});

test('insert a student with the user', async (done) => {
    expect( await student_dao.insertUser({
        userID: -1,
        login: 'e20',
        password: 'password1234',
        lastname: 'nom2',
        firstname: 'prenom2',
        theClass: 1,
        mp: 50
    }).catch(err => {done(err)})).toBe(2);
    expect(await student_dao.insertUser({
        userID: -1,
        login: 'e21',
        password: 'password1234',
        lastname: 'nom3',
        firstname: 'prenom3',
        theClass: 2,
        mp: 50
    }).catch(err => {done(err)})).toBe(3);
    done();
});

test('get all student', async (done) => {
    const data = await student_dao.findAll().catch(err => {
        done(err);
    });
    expect(data).toContainEqual({
        theUser: 1,
        theClass: 1,
        mp: 0
    });
    expect(data).toContainEqual({
        theUser: 2,
        theClass: 1,
        mp: 50
    });
    expect(data).toContainEqual({
        theUser: 3,
        theClass: 2,
        mp: 50
    });
    done();
});

test('get all student with user', async (done) => {
    const data = await student_dao.findAllUser().catch(err => {
        done(err);
    });
    expect(data).toContainEqual({
        userID: 1,
        login: 'e19',
        password: 'password1234',
        lastname: 'nom',
        firstname: 'prenom',
        theUser: 1,
        theClass: 1,
        mp: 0
    });
    expect(data).toContainEqual({
        userID: 2,
        login: 'e20',
        password: 'password1234',
        lastname: 'nom2',
        firstname: 'prenom2',
        theUser: 2,
        theClass: 1,
        mp: 50
    });
    expect(data).toContainEqual({
        userID: 3,
        login: 'e21',
        password: 'password1234',
        lastname: 'nom3',
        firstname: 'prenom3',
        theUser: 3,
        theClass: 2,
        mp: 50
    });
    done();
});

test('get all student in a class', async (done) => {
    const data = await student_dao.findAllInClass(1).catch(err => {
        done(err);
    });
    expect(data).toContainEqual({
        theUser: 1,
        theClass: 1,
        mp: 0
    });
    expect(data).toContainEqual({
        theUser: 2,
        theClass: 1,
        mp: 50
    });
    done();
});

test('get all student with user in class', async (done) => {
    const data = await student_dao.findAllUserInClass(1).catch(err => {
        done(err);
    });
    expect(data).toContainEqual({
        userID: 1,
        login: 'e19',
        password: 'password1234',
        lastname: 'nom',
        firstname: 'prenom',
        theUser: 1,
        theClass: 1,
        mp: 0
    });
    expect(data).toContainEqual({
        userID: 2,
        login: 'e20',
        password: 'password1234',
        lastname: 'nom2',
        firstname: 'prenom2',
        theUser: 2,
        theClass: 1,
        mp: 50
    });
    done();
});

test('get a student by ID', async (done) => {
    const data = await student_dao.findByID(2).catch(err => {
        done(err);
    });
    expect(data).toEqual({
        theUser: 2,
        theClass: 1,
        mp: 50
    });
    done();
});

test('get a student by ID with the user', async (done) => {
    const data = await student_dao.findUserByID(2).catch(err => {
        done(err);
    });
    expect(data).toEqual({
        userID: 2,
        login: 'e20',
        password: 'password1234',
        lastname: 'nom2',
        firstname: 'prenom2',
        theUser: 2,
        theClass: 1,
        mp: 50
    });
    done();
});

test('get a student with user by login', async (done) => {
    const data = await student_dao.findUserByLogin('e19').catch(err => {
        done(err);
    });
    expect(data).toEqual({
        userID: 1,
        login: 'e19',
        password: 'password1234',
        lastname: 'nom',
        firstname: 'prenom',
        theUser: 1,
        theClass: 1,
        mp: 0
    });
    done();
});

test('update a student', async (done) => {
    await student_dao.update({
        theUser: 1,
        theClass: 1,
        mp: 20
    }).catch(err => {
        done(err);
    });
    const data = await student_dao.findByID(1);
    expect(data).toEqual({
        theUser: 1,
        theClass: 1,
        mp: 20
    });
    done();
});

test('delete a student', async (done) => {
    await student_dao.delete(2).catch(err => {
        done(err);
    });
    const data = await student_dao.findAll();
    expect(data).toContainEqual({
        theUser: 1,
        theClass: 1,
        mp: 20
    });
    expect(data).not.toContainEqual({
        theUser: 2,
        theClass: 1,
        mp: 50
    });
    expect(data).toContainEqual({
        theUser: 3,
        theClass: 2,
        mp: 50
    });
    done();
});