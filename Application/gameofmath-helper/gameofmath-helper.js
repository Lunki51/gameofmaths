const notification_dao = require('./notification_dao')
const dailyQuiz_dao = require('./dailyQuiz_dao')
const castle_dao = require('./quiz_helper')
const master_dao = require('./master_dao')
const knight_dao = require('./knight_dao')
const knightRequest_dao = require('./knightRequest_dao')
const attack_dao = require('./attack_dao')
const soldier_dao = require('./soldier_dao')

module.exports = {
    notification_dao: notification_dao,
    dailyQuiz_dao: dailyQuiz_dao,
    castle_dao: castle_dao,
    master_dao: master_dao,
    knight_dao: knight_dao,
    knightRequest_dao: knightRequest_dao,
    attack_dao: attack_dao,
    soldier_dao: soldier_dao,
}