jest.setMock('gameofmath-db/sqlite_connection', require('gameofmath-db/test/sqlite_connection.mock'));
const request = require('supertest');
const app = require('../app').app;
const db = require('gameofmath-db').db;
const student_dao = require('gameofmath-db').student_dao;
const teacher_dao = require('gameofmath-db').teacher_dao;
const user_dao = require('gameofmath-db').user_dao;
const class_dao = require('gameofmath-db').class_dao;
const crypto = require('crypto')

function hash(v) {
    return crypto.createHash('sha512').update(v, 'utf-8').digest('hex')
}

function postC(res, path) {
    const req = request(app).post(path);
    req.cookies = res.headers['set-cookie'][res.headers['set-cookie'].length-1].split(';')[0];
    return req;
}

beforeAll(async (done) => {
    await db.reset();
    await class_dao.insert({
        classID: -1,
        grade: '6',
        name: 'C'
    });
    await student_dao.insertUser({
        userID: -1,
        login: 'login1',
        password: hash('password1'),
        lastname: 'nom',
        firstname: 'prenom',
        theClass: 1,
        mp: 0
    });
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

describe('Test the auth path', () => {
    test('A student should be able to connect with the right login and password', async (done) => {
        const rep = await request(app)
            .post('/api/user/auth')
            .send({
                username: 'login1',
                password: 'password1'
            }).catch(done);

        expect(rep.body).toEqual({
            returnState: 0,
            username: 'login1',
            type: 'student'
        });
        done();
    });
    test('A teacher should be able to connect with the right login and password', async (done) => {
        const rep = await request(app)
            .post('/api/user/auth')
            .send({
                username: 'login2',
                password: 'password2'
            }).catch(done);

        expect(rep.body).toEqual({
            returnState: 0,
            username: 'login2',
            type: 'teacher'
        });
        done();
    });
    test('A student shouldn\'t be able to connect with the wrong password', async (done) => {
        const rep = await request(app)
            .post('/api/user/auth')
            .send({
                username: 'login1',
                password: 'password3'
            }).catch(done);

        expect(rep.body.returnState).toEqual(1);
        done();
    });
    test('A student shouldn\'t be able to connect with the wrong login', async (done) => {
        const rep = await request(app)
            .post('/api/user/auth')
            .send({
                username: 'login0',
                password: 'password1'
            }).catch(done);

        expect(rep.body.returnState).toEqual(1);
        done();
    });
    test('A teacher shouldn\'t be able to connect with the wrong password', async (done) => {
        const rep = await request(app)
            .post('/api/user/auth')
            .send({
                username: 'login2',
                password: 'password3'
            }).catch(done);

        expect(rep.body.returnState).toEqual(1);
        done();
    });
    test('A teacher shouldn\'t be able to connect with the wrong login', async (done) => {
        const rep = await request(app)
            .post('/api/user/auth')
            .send({
                username: 'login0',
                password: 'password2'
            }).catch(done);

        expect(rep.body.returnState).toEqual(1);
        done();
    });
});

describe('Test the isLogged path', () => {
    test('A non connected user shouldn\'t be logged', async (done) => {
        const rep = await request(app)
            .post('/api/user/isLogged').send().catch(done);

        expect(rep.body).toEqual({
            returnState: 0,
            isLogged: false
        });
        done();
    });
    test('A connected student should be logged', async (done) => {
        const res = await request(app)
            .post('/api/user/auth')
            .send({
                username: 'login1',
                password: 'password1'
            }).catch(done);
        const rep = await postC(res,'/api/user/isLogged').send().catch(done);

        expect(rep.body).toEqual({
            returnState: 0,
            isLogged: true
        });
        done();
    });
    test('A connected teacher should be logged', async (done) => {
        const res = await request(app)
            .post('/api/user/auth')
            .send({
                username: 'login2',
                password: 'password2'
            }).catch(done);
        const rep = await postC(res,'/api/user/isLogged').send().catch(done);

        expect(rep.body).toEqual({
            returnState: 0,
            isLogged: true
        });
        done();
    });
    test('A disconnected user shouldn\'t be logged', async (done) => {
        let res = await request(app)
            .post('/api/user/auth')
            .send({
                username: 'login1',
                password: 'password1'
            }).catch(done);
        await postC(res,'/api/user/logout').send().catch(done);
        const rep = await postC(res,'/api/user/isLogged').send().catch(done);

        expect(rep.body).toEqual({
            returnState: 0,
            isLogged: false
        });
        done();
    });
});

describe('Test the username path', () => {
    test('A student should be able to get is username', async (done) => {
        const res = await request(app)
            .post('/api/user/auth')
            .send({
                username: 'login1',
                password: 'password1'
            }).catch(done);
        const rep = await postC(res,'/api/user/username').send().catch(done);

        expect(rep.body).toEqual({
            returnState: 0,
            username: 'login1'
        });
        done();
    });
    test('A teacher should be able to get is username', async (done) => {
        const res = await request(app)
            .post('/api/user/auth')
            .send({
                username: 'login2',
                password: 'password2'
            }).catch(done);
        const rep = await postC(res,'/api/user/username').send().catch(done);

        expect(rep.body).toEqual({
            returnState: 0,
            username: 'login2'
        });
        done();
    });
});

describe('Test the getType path', () => {
    test('A student should be able to get is type', async (done) => {
        const res = await request(app)
            .post('/api/user/auth')
            .send({
                username: 'login1',
                password: 'password1'
            }).catch(done);
        const rep = await postC(res,'/api/user/getType').send().catch(done);

        expect(rep.body).toEqual({
            returnState: 0,
            type: 'student'
        });
        done();
    });
    test('A teacher should be able to get is type', async (done) => {
        const res = await request(app)
            .post('/api/user/auth')
            .send({
                username: 'login2',
                password: 'password2'
            }).catch(done);
        const rep = await postC(res,'/api/user/getType').send().catch(done);

        expect(rep.body).toEqual({
            returnState: 0,
            type: 'teacher'
        });
        done();
    });
});

describe('Test the logout path', () => {
    test('A student should be able to logout', async (done) => {
        const res = await request(app)
            .post('/api/user/auth')
            .send({
                username: 'login1',
                password: 'password1'
            }).catch(done);
        const rep = await postC(res,'/api/user/logout').send().catch(done);

        expect(rep.body.returnState).toEqual(0);
        const rep2 = await postC(res,'/api/user/isLogged').send().catch(done);

        expect(rep2.body).toEqual({
            returnState: 0,
            isLogged: false
        });
        done();
    });
    test('A teacher should be able to logout', async (done) => {
        const res = await request(app)
            .post('/api/user/auth')
            .send({
                username: 'login2',
                password: 'password2'
            }).catch(done);
        const rep = await postC(res,'/api/user/logout').send().catch(done);

        expect(rep.body.returnState).toEqual(0);
        const rep2 = await postC(res,'/api/user/isLogged').send().catch(done);

        expect(rep2.body).toEqual({
            returnState: 0,
            isLogged: false
        });
        done();
    });
});

describe('Test the changePassword path', () => {
    test('A student should be able to change is password', async (done) => {
        const res = await request(app)
            .post('/api/user/auth')
            .send({
                username: 'login1',
                password: 'password1'
            }).catch(done);
        const rep = await postC(res,'/api/user/changePassword').send({oldPassword: 'password1', newPassword:'password3'}).catch(done);
        expect(rep.body).toEqual({
            returnState: 0
        })
        const user = await user_dao.findByLogin('login1').catch(done)
        expect(user.password === hash('password3'))

        done();
    });
    test('A teacher should be able to change is password', async (done) => {
        const res = await request(app)
            .post('/api/user/auth')
            .send({
                username: 'login2',
                password: 'password2'
            }).catch(done);
        const rep = await postC(res,'/api/user/changePassword').send({oldPassword: 'password2', newPassword:'password4'}).catch(done);
        expect(rep.body).toEqual({
            returnState: 0
        })
        const user = await user_dao.findByLogin('login2').catch(done)
        expect(user.password === hash('password4'))
        done();
    });
    test('The returnState should be 1 if the old password is incorrect', async (done) => {
        const res = await request(app)
            .post('/api/user/auth')
            .send({
                username: 'login2',
                password: 'password4'
            }).catch(done);
        const rep = await postC(res,'/api/user/changePassword').send({oldPassword: 'password2', newPassword:'password5'}).catch(done);
        expect(rep.body.returnState).toEqual(1)
        const user = await user_dao.findByLogin('login2').catch(done)
        expect(user.password === hash('password4'))
        done();
    });
    test('The returnState should be 1 if the new password is incorrect', async (done) => {
        const res = await request(app)
            .post('/api/user/auth')
            .send({
                username: 'login2',
                password: 'password4'
            }).catch(done);
        const rep = await postC(res,'/api/user/changePassword').send({oldPassword: 'password4', newPassword:'toto'}).catch(done);
        expect(rep.body.returnState).toEqual(2)
        const user = await user_dao.findByLogin('login2').catch(done)
        expect(user.password === hash('password4'))
        done();
    });
});