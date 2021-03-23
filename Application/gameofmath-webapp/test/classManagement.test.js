jest.setMock('gameofmath-db/sqlite_connection', require('gameofmath-db/test/sqlite_connection.mock'));
const request = require('supertest');
const app = require('../app').app;
const db = require('gameofmath-db').db;
const teacher_dao = require('gameofmath-db').teacher_dao;
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
    await teacher_dao.insertUser({
        userID: -1,
        login: 'login2',
        password: hash('password2'),
        lastname: 'nom',
        firstname: 'prenom',
        email: 't1@gmail.com'
    }).catch(done);
    await class_dao.insert({
        classID: -1,
        name: 'n1',
        grade: 'g1'
    }).catch(done);
    await class_dao.insert({
        classID: -1,
        name: 'n2',
        grade: 'g2'
    }).catch(done);
    await student_dao.insertUser({
        userID: -1,
        login: 'e1',
        password: hash('pp1'),
        lastname: 'n1',
        firstname: 'p1',
        theClass: 1,
        mp: 0
    }).catch(done);
    await student_dao.insertUser({
        userID: -1,
        login: 'e2',
        password: hash('pp2'),
        lastname: 'n2',
        firstname: 'p2',
        theClass: 2,
        mp: 10
    }).catch(done);
    await student_dao.insertUser({
        userID: -1,
        login: 'e3',
        password: hash('pp3'),
        lastname: 'n3',
        firstname: 'p3',
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
            username: 'login2',
            password: 'password2'
        }).catch(done);
    done()
})

describe('Test the getClasses path', () => {
    test('A teacher should be able to get the classes list', async (done) => {
        const rep = await postC(res, '/api/classManagement/getClasses').send().catch(done);
        rep.body.classes.sort((a, b) => a.classID - b.classID)
        expect(rep.body).toEqual({
            returnState: 0,
            classes: [
                {
                    classID: 1,
                    name: 'n1',
                    grade: 'g1'
                }, {
                    classID: 2,
                    name: 'n2',
                    grade: 'g2'
                }
            ]
        })
        done();
    });
});

describe('Test the getClass path', () => {
    test('A teacher should be able to get a class by id', async (done) => {
        const rep = await postC(res, '/api/classManagement/getClass').send({
            id: 2
        }).catch(done);
        expect(rep.body).toEqual({
            returnState: 0,
            classO: {
                classID: 2,
                name: 'n2',
                grade: 'g2'
            }
        })
        done();
    });
});

//TODO test but prob with map creation on a test

// describe('Test the create path', () => {
//     test('A teacher should be able to create a class', async (done) => {
//         const rep = await postC(res, '/api/classManagement/create').send({
//             name: 'name',
//             grade: 'grade'
//         }).catch(done);
//         expect(rep.body).toEqual({
//             returnState: 0,
//             id: 3,
//             name: 'name',
//             grade: 'grade'
//         })
//
//         const rep2 = await postC(res, '/api/classManagement/getClasses').send().catch(done);
//         rep2.body.classes.sort((a, b) => a.classID - b.classID)
//         expect(rep2.body).toEqual({
//             returnState: 0,
//             classes: [
//                 {
//                     classID: 1,
//                     name: 'n1',
//                     grade: 'g1'
//                 },{
//                     classID: 2,
//                     name: 'n2',
//                     grade: 'g2'
//                 },{
//                     classID: 3,
//                     name: 'name',
//                     grade: 'grade'
//                 }
//             ]
//         })
//         done();
//     });
// });

describe('Test the rename path', () => {
    test('A teacher should be able to rename a class', async (done) => {
        let rep = await postC(res, '/api/classManagement/rename').send({
            id: 2,
            newName: 'second'
        }).catch(done);
        expect(rep.body).toEqual({
            returnState: 0,
            nClass: {
                classID: 2,
                name: 'second',
                grade: 'g2'
            }
        })

        rep = await postC(res, '/api/classManagement/getClasses').send().catch(done);
        rep.body.classes.sort((a, b) => a.classID - b.classID)
        expect(rep.body).toEqual({
            returnState: 0,
            classes: [
                {
                    classID: 1,
                    name: 'n1',
                    grade: 'g1'
                }, {
                    classID: 2,
                    name: 'second',
                    grade: 'g2'
                }
            ]
        })
        done();
    });
});

describe('Test the setGrade path', () => {
    test('A teacher should be able to set the grade a class', async (done) => {
        let rep = await postC(res, '/api/classManagement/setGrade').send({
            id: 1,
            newGrade: 'grade'
        }).catch(done);
        expect(rep.body).toEqual({
            returnState: 0,
            nClass: {
                classID: 1,
                name: 'n1',
                grade: 'grade'
            }
        })

        rep = await postC(res, '/api/classManagement/getClasses').send().catch(done);
        rep.body.classes.sort((a, b) => a.classID - b.classID)
        expect(rep.body).toEqual({
            returnState: 0,
            classes: [
                {
                    classID: 1,
                    name: 'n1',
                    grade: 'grade'
                }, {
                    classID: 2,
                    name: 'second',
                    grade: 'g2'
                }
            ]
        })
        done();
    });
});

//TODO test regenerateMap

//TODO test delete

describe('Test the getStudents path', () => {
    test('A teacher should be able to get the student list of a class', async (done) => {
        const rep = await postC(res, '/api/classManagement/getStudents').send({id: 1}).catch(done);
        rep.body.students.sort((a, b) => a.userID - b.userID)
        expect(rep.body).toEqual({
            returnState: 0,
            class: 1,
            students: [
                {
                    firstname: 'p1',
                    lastname: 'n1',
                    login: 'e1',
                    mp: 0,
                    theClass: 1,
                    userID: 2
                },
                {
                    firstname: 'p3',
                    lastname: 'n3',
                    login: 'e3',
                    mp: 20,
                    theClass: 1,
                    userID: 4
                }
            ]
        })
        done();
    });
});

describe('Test the getStudent path', () => {
    test('A teacher should be able to get a student by id', async (done) => {
        const rep = await postC(res, '/api/classManagement/getStudent').send({
            id: 2
        }).catch(done);
        expect(rep.body).toEqual({
            returnState: 0,
            student: {
                firstname: 'p1',
                lastname: 'n1',
                login: 'e1',
                mp: 0,
                theClass: 1,
                userID: 2,
                theUser:2
            }
        })
        done();
    });
});

describe('Test the setLastname path', () => {
    test('A teacher should be able to set the lastname of a student', async (done) => {
        let rep = await postC(res, '/api/classManagement/setLastname').send({
            classId: 1,
            userId: 2,
            newName: 'l1'
        }).catch(done);
        expect(rep.body).toEqual({
            returnState: 0,
            student: {
                firstname: 'p1',
                lastname: 'l1',
                login: 'e1',
                mp: 0,
                theClass: 1,
                userID: 2,
                theUser: 2
            }
        })

        rep = await postC(res, '/api/classManagement/getStudents').send({id: 1}).catch(done);
        rep.body.students.sort((a, b) => a.userID - b.userID)
        expect(rep.body).toEqual({
            returnState: 0,
            class: 1,
            students: [
                {
                    firstname: 'p1',
                    lastname: 'l1',
                    login: 'e1',
                    mp: 0,
                    theClass: 1,
                    userID: 2
                },
                {
                    firstname: 'p3',
                    lastname: 'n3',
                    login: 'e3',
                    mp: 20,
                    theClass: 1,
                    userID: 4
                }
            ]
        })
        done();
    });
});

describe('Test the setFirstname path', () => {
    test('A teacher should be able to set the firstname of a student', async (done) => {
        let rep = await postC(res, '/api/classManagement/setFirstname').send({
            classId: 2,
            userId: 3,
            newName: 'f2'
        }).catch(done);
        expect(rep.body).toEqual({
            returnState: 0,
            student: {
                firstname: 'f2',
                lastname: 'n2',
                login: 'e2',
                mp: 10,
                theClass: 2,
                userID: 3,
                theUser: 3
            }
        })

        rep = await postC(res, '/api/classManagement/getStudents').send({id: 2}).catch(done);
        rep.body.students.sort((a, b) => a.userID - b.userID)
        expect(rep.body).toEqual({
            returnState: 0,
            class: 2,
            students: [
                {
                    firstname: 'f2',
                    lastname: 'n2',
                    login: 'e2',
                    mp: 10,
                    theClass: 2,
                    userID: 3
                }
            ]
        })
        done();
    });
});

describe('Test the setLogin path', () => {
    test('A teacher should be able to set the login of a student', async (done) => {
        let rep = await postC(res, '/api/classManagement/setLogin').send({
            classId: 1,
            userId: 2,
            newLogin: 'e21'
        }).catch(done);
        expect(rep.body).toEqual({
            returnState: 0,
            student: {
                firstname: 'p1',
                lastname: 'l1',
                login: 'e21',
                mp: 0,
                theClass: 1,
                userID: 2,
                theUser: 2
            }
        })

        rep = await postC(res, '/api/classManagement/getStudents').send({id: 1}).catch(done);
        rep.body.students.sort((a, b) => a.userID - b.userID)
        expect(rep.body).toEqual({
            returnState: 0,
            class: 1,
            students: [
                {
                    firstname: 'p1',
                    lastname: 'l1',
                    login: 'e21',
                    mp: 0,
                    theClass: 1,
                    userID: 2
                },
                {
                    firstname: 'p3',
                    lastname: 'n3',
                    login: 'e3',
                    mp: 20,
                    theClass: 1,
                    userID: 4
                }
            ]
        })
        done();
    });
});

describe('Test the regeneratePassword path', () => {
    test('A teacher should be able to reset the password of a student', async (done) => {
        let rep = await postC(res, '/api/classManagement/regeneratePassword').send({
            classId: 2,
            userId: 3
        }).catch(done);
        expect(rep.body.returnState).toBe(0);
        done();
    });
});

describe('Test the createStudent path', () => {
    test('A teacher should be able to create a student', async (done) => {
        let rep = await postC(res, '/api/classManagement/createStudent').send({
            classId: 2,
            login: 'e4',
            lastname: 'l4',
            firstname: 'f4',
        }).catch(done);
        expect(rep.body.returnState).toBe(0);
        expect(rep.body.student).toEqual({
            firstname: 'f4',
            lastname: 'l4',
            login: 'e4',
            mp: 0,
            theClass: 2,
            userID: 5
        })

        rep = await postC(res, '/api/classManagement/getStudents').send({id: 2}).catch(done);
        rep.body.students.sort((a, b) => a.userID - b.userID)
        expect(rep.body).toEqual({
            returnState: 0,
            class: 2,
            students: [
                {
                    firstname: 'f2',
                    lastname: 'n2',
                    login: 'e2',
                    mp: 10,
                    theClass: 2,
                    userID: 3
                }, {
                    firstname: 'f4',
                    lastname: 'l4',
                    login: 'e4',
                    mp: 0,
                    theClass: 2,
                    userID: 5
                }
            ]
        })
        done();
    });
});

describe('Test the deleteStudent path', () => {
    test('A teacher should be able to delete a student', async (done) => {
        let rep = await postC(res, '/api/classManagement/deleteStudent').send({
            classId: 2,
            studentId: 3
        }).catch(done);
        expect(rep.body).toEqual({
            returnState: 0
        });

        rep = await postC(res, '/api/classManagement/getStudents').send({id: 2}).catch(done);
        rep.body.students.sort((a, b) => a.userID - b.userID)
        expect(rep.body).toEqual({
            returnState: 0,
            class: 2,
            students: [
                {
                    firstname: 'f4',
                    lastname: 'l4',
                    login: 'e4',
                    mp: 0,
                    theClass: 2,
                    userID: 5
                }
            ]
        })
        done();
    });
});

describe('Test the getMP path', () => {
    test('A teacher should be able to get the MP of a student', async (done) => {
        let rep = await postC(res, '/api/classManagement/getMP').send({
            classId: 1,
            studentId: 4
        }).catch(done);
        expect(rep.body).toEqual({
            returnState: 0,
            mp: 20
        });

        done();
    });
});

describe('Test the getMPArray path', () => {
    test('A teacher should be able to get the MP array of a student', async (done) => {
        await mpGain_dao.insert({
            mpGainID: -1,
            amount: 10,
            type: 'QUIZ',
            date: new Date(500000),
            theStudent: 5
        }).catch(done)
        await mpGain_dao.insert({
            mpGainID: -1,
            amount: 20,
            type: 'QUIZ',
            date: new Date(550000),
            theStudent: 5
        }).catch(done)
        await mpGain_dao.insert({
            mpGainID: -1,
            amount: 15,
            type: 'QUIZ',
            date: new Date(850000),
            theStudent: 5
        }).catch(done)

        let rep = await postC(res, '/api/classManagement/getMPArray').send({
            classId: 2,
            studentId: 5
        }).catch(done);
        expect(rep.body).toEqual({
            returnState: 0,
            mp: [
                {gain: 10, time: 500000},
                {gain: 20, time: 550000},
                {gain: 15, time: 850000},
            ]
        });

        done();
    });
});