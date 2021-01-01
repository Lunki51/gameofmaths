jest.setMock('../sqlite_connection.js', require('./sqlite_connection.mock'));
const db = require('../sqlite_connection');
const user_dao = require('../user_dao');

beforeAll(async (done) => {
    await db.reset();
    done();
});

test('insert a user', async (done) => {
    expect( await user_dao.insert({
        userID: -1,
        login: 'e19',
        password: 'password1234',
        lastname: 'nom',
        firstname: 'prenom'
    }).catch(err => {done(err)})).toBe(1);
    expect(await user_dao.insert({
        userID: -1,
        login: 'e20',
        password: 'password1234',
        lastname: 'nom2',
        firstname: 'prenom2'
    }).catch(err => {done(err)})).toBe(2);
    done();
});

test('get all user', async (done) => {
    const data = await user_dao.findAll().catch(err => {
        done(err);
    });
    expect(data).toContainEqual({
        userID: 1,
        login: 'e19',
        password: 'password1234',
        lastname: 'nom',
        firstname: 'prenom'
    });
    expect(data).toContainEqual({
        userID: 2,
        login: 'e20',
        password: 'password1234',
        lastname: 'nom2',
        firstname: 'prenom2'
    });
    done();
});

test('get a user by ID', async (done) => {
    const data = await user_dao.findByID(2).catch(err => {
        done(err);
    });
    expect(data).toEqual({
        userID: 2,
        login: 'e20',
        password: 'password1234',
        lastname: 'nom2',
        firstname: 'prenom2'
    });
    done();
});

test('get a user by login', async (done) => {
    const data = await user_dao.findByLogin('e19').catch(err => {
        done(err);
    });
    expect(data).toEqual({
        userID: 1,
        login: 'e19',
        password: 'password1234',
        lastname: 'nom',
        firstname: 'prenom'
    });
    done();
});

test('update a user', async (done) => {
    await user_dao.update({
        userID: 1,
        login: 'e19',
        password: 'MotDePasse456',
        lastname: 'BUCHE',
        firstname: 'Guillaume'
    }).catch(err => {
        done(err);
    })
    const data = await user_dao.findByID(1);
    expect(data).toEqual({
        userID: 1,
        login: 'e19',
        password: 'MotDePasse456',
        lastname: 'buche',
        firstname: 'guillaume'
    });
    done();
});

test('delete a user', async (done) => {
    await user_dao.delete(2).catch(err => {
        done(err);
    });
    const data = await user_dao.findAll();
    expect(data).toContainEqual({
        userID: 1,
        login: 'e19',
        password: 'MotDePasse456',
        lastname: 'buche',
        firstname: 'guillaume'
    });
    expect(data).not.toContainEqual({
        userID: 2,
        login: 'e20',
        password: 'password1234',
        lastname: 'nom2',
        firstname: 'prenom2'
    });
    done();
});