const db_connection = require('./sqlite_connection');
const object_helper = require('./object_helper');
const user_dao = require('./user_dao');
const teacher_dao = require('./teacher_dao');
const class_dao = require('./class_dao');
const student_dao = require('./student_dao');
const mpGain_dao = require('./mpGain_dao');
const chapter_dao = require('./chapter_dao');
const quiz_dao = require('./quiz_dao');
const quizDone_dao = require('./quizDone_dao');
const question_dao = require('./question_dao');
const answer_dao = require('./answer_dao');
const quizQuestion_dao = require('./quizQuestion_dao');

module.exports = {
    db: db_connection,
    object_helper: object_helper,
    user_dao: user_dao,
    teacher_dao: teacher_dao,
    class_dao: class_dao,
    student_dao: student_dao,
    mpGain_dao: mpGain_dao,
    chapter_dao: chapter_dao,
    quiz_dao: quiz_dao,
    quizDone_dao: quizDone_dao,
    question_dao: question_dao,
    answer_dao: answer_dao,
    quizQuestion_dao: quizQuestion_dao
};