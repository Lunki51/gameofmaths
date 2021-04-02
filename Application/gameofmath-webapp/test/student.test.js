jest.setMock('gameofmath-db/sqlite_connection', require('gameofmath-db/test/sqlite_connection.mock'));
const request = require('supertest');
const app = require('../app').app;
const db = require('gameofmath-db').db;
const student_dao = require('gameofmath-db').student_dao;
const class_dao = require('gameofmath-db').class_dao;
const mpGain_dao = require('gameofmath-db').mpGain_dao;
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
    await class_dao.insert({
        classID: -1,
        grade: '6',
        name: 'C'
    }).catch(done);
    await student_dao.insertUser({
        userID: -1,
        login: 'login1',
        password: hash('password1'),
        lastname: 'nom',
        firstname: 'prenom',
        theClass: 1,
        mp: 20
    }).catch(done);
    done();
});

let res = null
beforeEach(async (done) => {
    res = await request(app)
        .post('/api/user/auth')
        .send({
            username: 'login1',
            password: 'password1'
        }).catch(done);
    done()
})

describe('Test the getMP path', () => {
    test('A student should be able to get is mp', async (done) => {
        const rep = await postC(res, '/api/student/getMP').send().catch(done);
        expect(rep.body).toEqual({
            returnState: 0,
            mp: 20
        })
        done();
    });
});

describe('Test the getMPArray path', () => {
    test('A student should be able to change is mp in an array', async (done) => {
        await mpGain_dao.insert({
            mpGainID: -1,
            amount: 10,
            type: 'QUIZ',
            date: new Date(500000),
            theStudent: 1
        }).catch(done)
        await mpGain_dao.insert({
            mpGainID: -1,
            amount: 20,
            type: 'QUIZ',
            date: new Date(550000),
            theStudent: 1
        }).catch(done)
        await mpGain_dao.insert({
            mpGainID: -1,
            amount: -15,
            type: 'BATTLELOST',
            date: new Date(850000),
            theStudent: 1
        }).catch(done)

        const rep = await postC(res, '/api/student/getMPArray').send().catch(done);
        expect(rep.body).toEqual({
            returnState: 0,
            mp: [
                {gain: 10, time: 500000},
                {gain: 20, time: 550000},
                {gain: -15, time: 850000},
            ]
        })
        done();
    });
});

describe('Test the getInfo path', () => {
    test('A student should be able to get is info', async (done) => {
        const rep = await postC(res, '/api/student/getInfo').send().catch(done);
        expect(rep.body).toEqual({
            returnState: 0,
            firstname: 'prenom',
            lastname: 'nom',
            className: 'C',
            classGrade: '6',
            classID: 1,
            mp: 20
        })
        done();
    });
});