jest.setMock('gameofmath-db/sqlite_connection', require('gameofmath-db/test/sqlite_connection.mock'));
const request = require('supertest');
const app = require('../app').app;
const db = require('gameofmath-db').db;
const teacher_dao = require('gameofmath-db').teacher_dao;
const crypto = require('crypto')

function hash(v) {
    return crypto.createHash('sha512').update(v, 'utf-8').digest('hex')
}

function postC(res, path) {
    const req = request(app).post(path);
    req.cookies = res.headers['set-cookie'][res.headers['set-cookie'].length - 1].split(';')[0];
    return req;
}

beforeAll(async (done) => {
    await db.reset();
    await teacher_dao.insertUser({
        userID: -1,
        login: 'login2',
        password: hash('password2'),
        lastname: 'nom',
        firstname: 'prenom',
        email: 't1@gmail.com'
    });
    done();
});

let res = null
beforeEach(async (done) => {
    res = await request(app)
        .post('/api/user/auth')
        .send({
            username: 'login2',
            password: 'password2'
        }).catch(done);
    done()
})

describe('Test the changeMail path', () => {
    test('A teacher should be able to change is mail', async (done) => {
        const rep = await postC(res, '/api/teacher/changeMail').send({
            newMail: 't12@gmail.com'
        }).catch(done);
        expect(rep.body).toEqual({
            returnState: 0
        })
        const teacher = await teacher_dao.findUserByLogin('login2').catch(done)
        expect(teacher.mail === 't12@gmail.com')
        done();
    });
    test('A teacher shouldn\'t be able to change is mail is the mail is incorrect', async (done) => {
        const rep = await postC(res, '/api/teacher/changeMail').send({
            newMail: 't13.gmail.com'
        }).catch(done);
        expect(rep.body.returnState).toEqual(1)
        const teacher = await teacher_dao.findUserByLogin('login2').catch(done)
        expect(teacher.mail === 't12@gmail.com')
        done();
    });
});

describe('Test the changeLastname path', () => {
    test('A teacher should be able to change is lastname', async (done) => {
        const rep = await postC(res, '/api/teacher/changeLastname').send({
            newName: 'nom2'
        }).catch(done);
        expect(rep.body).toEqual({
            returnState: 0
        })
        const teacher = await teacher_dao.findUserByLogin('login2').catch(done)
        expect(teacher.lastname === 'nom2')
        done();
    });
    test('A teacher shouldn\'t be able to change is lastname is the lastname is incorrect', async (done) => {
        const rep = await postC(res, '/api/teacher/changeLastname').send({
            newName: ''
        }).catch(done);
        expect(rep.body.returnState).toEqual(1)
        const teacher = await teacher_dao.findUserByLogin('login2').catch(done)
        expect(teacher.lastname === 'nom2')
        done();
    });
});

describe('Test the changeFirstname path', () => {
    test('A teacher should be able to change is firstname', async (done) => {
        const rep = await postC(res, '/api/teacher/changeLastname').send({
            newName: 'prenom2'
        }).catch(done);
        expect(rep.body).toEqual({
            returnState: 0
        })
        const teacher = await teacher_dao.findUserByLogin('login2').catch(done)
        expect(teacher.firstname === 'prenom2')
        done();
    });
    test('A teacher shouldn\'t be able to change is firstname is the firstname is incorrect', async (done) => {
        const rep = await postC(res, '/api/teacher/changeLastname').send({
            newName: ''
        }).catch(done);
        expect(rep.body.returnState).toEqual(1)
        const teacher = await teacher_dao.findUserByLogin('login2').catch(done)
        expect(teacher.firstname === 'prenom2')
        done();
    });
});