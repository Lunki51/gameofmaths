const dbD = require('gameofmath-db').db
const mpGain_dao = require('gameofmath-db').mpGain_dao
const notification_helper = require('notification_helper')
const quiz_helper = require('quiz_helper')
const knight_dao = require('gameofmath-castle').knight_dao
const master_dao = require('gameofmath-castle').master_dao
const attack_dao = require('gameofmath-castle').attack_dao
const soldier_dao = require('gameofmath-castle').soldier_dao

const AttackHelper = function () {

    /**
     * Check if an attack is possible
     *
     * @param originStudentID id of the origin student
     * @param castleID id of the target castle
     * @param db db instance to use
     * @returns {Promise} A promise
     */
    this.canStartAnAttack = function (originStudentID, castleID, db = dbD) {
        return new Promise((resolve, reject) => {

            // Get the master
            master_dao.findCurrentForCastle(castleID)
                .then(master => {

                    // Check that the castle hasn't been attack recently
                    return new Promise((resolve1, reject1) => {
                        let from = new Date()
                        from.setDate(from.getDate() - 2)
                        let to = new Date()
                        let request = 'SELECT * FROM Attack, master WHERE attackTarget = masterID AND masterCastle = ? AND attackStart BETWEEN ? AND ?'
                        db.all(request, [castleID, from, to], function (err, rows) {
                            if (err) reject1(err)
                            else resolve1(rows.length === 0)
                        })
                    })
                        // Check that the student isn't a master
                        .then(prevRes => {
                            if (!prevRes) return prevRes

                            return master_dao.findCurrent()
                                .then(masters => {
                                    return masters.find(e => e.masterStudent === originStudentID) === undefined
                                })
                        })
                        // Check that the student isn't a knight of the castle
                        .then(prevRes => {
                            if (!prevRes) return prevRes

                            return knight_dao.findCurrentOfMaster(master.masterID)
                                .then(knights => {
                                    return knights.find(e => e.masterStudent === originStudentID) === undefined
                                })
                        })

                })
                .then(response => {
                    resolve(response)
                })
                .catch(err => {
                    reject(err)
                })

        })
    }

    /**
     * Start an Attack.
     *
     * @param originStudentID id of the origin student
     * @param castleID id of the target castle
     * @param db db instance to use
     * @returns {Promise} A promise with the attack ID
     */
    this.startAnAttack = function (originStudentID, castleID, db = dbD) {
        return new Promise((resolve, reject) => {
            let currentDate = new Date()

            db.beginTransaction(function (err, t) {

                // Create the quiz
                quiz_helper.makeRandomQuiz(20, null, t)
                    .then(quizID => {

                        // Get target
                        return master_dao.findCurrentForCastle(castleID, t)
                            .then(master => {

                                // Add the attack
                                return attack_dao.insert({
                                    attackID: -1,
                                    attackStart: currentDate,
                                    attackResult: 0,
                                    attackQuiz: quizID,
                                    attackOrigin: originStudentID,
                                    attackTarget: master.masterID
                                }, t)
                                    .then(attackID => {

                                        // Add the origin to the soldier
                                        return soldier_dao.insert({
                                            soldierScore: -1,
                                            soldierAttack: attackID,
                                            soldierStudent: originStudentID
                                        }, t)
                                            // Notifie the master and his knight
                                            .then(_ => {

                                                // Notifie the master
                                                return notification_helper.sendTo(master.masterStudent, 'castleUnderAttack', {
                                                    castleID: castleID,
                                                    originStudentID: originStudentID,
                                                    battleDate: new Date(currentDate.getDate() + 1),
                                                    date: currentDate
                                                }, t)
                                                    // Add the master to the soldier
                                                    .then(_ => soldier_dao.insert({
                                                        soldierScore: -1,
                                                        soldierAttack: attackID,
                                                        soldierStudent: master.masterStudent
                                                    }))
                                                    // Get the knight
                                                    .then(_ => knight_dao.findCurrentOfMaster(master.masterID, t))
                                                    // Notifie all the knight
                                                    .then(knights => Promise.allSettled(knights.map(item => {
                                                        return notification_helper.sendTo(item.knightStudent, 'castleUnderAttack', {
                                                            castleID: castleID,
                                                            originStudentID: originStudentID,
                                                            battleDate: new Date(currentDate.getDate() + 1),
                                                            date: currentDate
                                                        }, t)
                                                            // Add the knight to the soldier
                                                            .then(_ => soldier_dao.insert({
                                                                soldierScore: -1,
                                                                soldierAttack: attackID,
                                                                soldierStudent: item.knightStudent
                                                            }))
                                                    })))
                                                    // Check
                                                    .then(results => {
                                                        let resError = results.find(e => e.status === 'rejected')
                                                        if (resError) throw resError
                                                    })

                                            })
                                            // Resolve
                                            .then(_ => {
                                                t.commit(err => {
                                                    if (err) throw err
                                                    else resolve(attackID)
                                                })
                                            })

                                    })
                            })

                    })
                    .catch(err => {
                        t.rollback()
                        reject(err)
                    })


            })

        })
    }

    /**
     * Allow a student to join an attack
     *
     * @param studentID id of the student
     * @param attackID id of the attack
     * @param db db instance to use
     * @returns {Promise} A promise
     */
    this.joinAnAttack = function (studentID, attackID, db = dbD) {
        return new Promise((resolve, reject) => {
            let currentDate = new Date()

            db.beginTransaction(function (err, t) {

                // Insert the student
                soldier_dao.insert({
                    soldierScore: -1,
                    soldierAttack: attackID,
                    soldierStudent: studentID
                }, t)
                    .then(_ => {
                        t.commit(err => {
                            if (err) throw err
                            else resolve()
                        })
                    })
                    .catch(err => {
                        t.rollback()
                        reject(err)
                    })


            })

        })
    }

    /**
     * Calcule the result of an attack.
     *
     * @param attackID id of the attack
     * @param db db instance to use
     * @returns {Promise} A promise
     */
    this.attackEnd = function (attackID, db = dbD) {
        return new Promise((resolve, reject) => {
            let currentDate = new Date()

            db.beginTransaction(function (err, t) {

                // Get the attack
                attack_dao.findByID(attackID, t)
                    .then(attack => {

                        // Get the knights
                        return knight_dao.findCurrentOfMaster(attack.attackTarget, t)
                            .then(knights => {

                                // Get the master
                                return master_dao.findByID(attack.attackTarget, t)
                                    .then(master => {

                                        // Get the soldiers
                                        return soldier_dao.findAllOfAttackWithStudent(attackID, t)
                                            .then(soldiers => {

                                                let pointA = 0
                                                let pointD = 0

                                                let attackSoldier = []
                                                let defenseSoldier = []

                                                soldiers.forEach(soldier => {

                                                    let knight = knights.find(e => e.knightStudent === soldier.soldierStudent)

                                                    // defense
                                                    if (soldier.soldierStudent === master.masterStudent) {
                                                        defenseSoldier.push({
                                                            score: soldier.soldierScore,
                                                            studentID: soldier.soldierStudent,
                                                            isCommandant: true,
                                                            mp: soldier.mp
                                                        })
                                                        pointD += soldier.soldierScore * soldier.mp * 2
                                                    } else if (knight) {
                                                        defenseSoldier.push({
                                                            score: soldier.soldierScore,
                                                            studentID: soldier.soldierStudent,
                                                            isCommandant: false,
                                                            mp: soldier.mp
                                                        })
                                                        pointD += soldier.soldierScore * soldier.mp
                                                    }
                                                    // Attack
                                                    else if (soldier.soldierStudent === attack.attackOrigin) {
                                                        attackSoldier.push({
                                                            score: soldier.soldierScore,
                                                            studentID: soldier.soldierStudent,
                                                            isCommandant: true,
                                                            mp: soldier.mp
                                                        })
                                                        pointA += soldier.soldierScore * soldier.mp * 2
                                                    } else {
                                                        attackSoldier.push({
                                                            score: soldier.soldierScore,
                                                            studentID: soldier.soldierStudent,
                                                            isCommandant: false,
                                                            mp: soldier.mp
                                                        })
                                                        pointA += soldier.soldierScore * soldier.mp * 2
                                                    }
                                                })

                                                // Defense bonus
                                                pointD = pointD * 1.5

                                                // 1 attack win, -1 defense win
                                                let result = pointD < pointA ? 1 : -1
                                                let losingEquip = result === 1 ? defenseSoldier : attackSoldier
                                                let winningEquip = result === -1 ? defenseSoldier : attackSoldier

                                                // Get quiz max score
                                                return quiz_helper.getQuizMaxScore(attack.attackQuiz, t)
                                                    .then(maxScore => {

                                                        // Update attack
                                                        attack.attackResult = result
                                                        return attack_dao.update(attack, t)
                                                            // Manage attack consequence
                                                            .then(_ => {

                                                                // Insert new master
                                                                if (result === 1) return master_dao.insert({
                                                                    masterID: -1,
                                                                    masterStart: currentDate,
                                                                    masterTaxe: 0.5,
                                                                    masterCastle: master.masterCastle,
                                                                    masterStudent: attack.attackOrigin
                                                                }, t)
                                                                    // remove the knight
                                                                    .then(newMasterID => Promise.allSettled(knights.map(item => {
                                                                        item.knightEnd = currentDate
                                                                        return knight_dao.update(item, t)
                                                                    })))
                                                                    // Check
                                                                    .then(results => {
                                                                        let resError = results.find(e => e.status === 'rejected')
                                                                        if (resError) throw resError
                                                                    })

                                                                else return 1

                                                            })
                                                            // reduce score
                                                            .then(_ => Promise.allSettled(losingEquip.map(soldier => {
                                                                let deltaMP = (maxScore - soldier.soldierScore) / maxScore * soldier.mp * 0.2

                                                                // Add mpGain
                                                                return mpGain_dao.insert({
                                                                    mpGainID: -1,
                                                                    amount: -deltaMP,
                                                                    type: 'BATTLELOST',
                                                                    date: currentDate,
                                                                    theStudent: soldier.studentID
                                                                }, t)
                                                                    // Check
                                                                    .then(results => {
                                                                        let resError = results.find(e => e.status === 'rejected')
                                                                        if (resError) throw resError
                                                                    })
                                                            })))
                                                            // Notifie winning team
                                                            .then(_ => Promise.allSettled(winningEquip.map(item => {
                                                                return notification_helper.sendTo(item.studentID, 'BattleWin', {
                                                                    castleID: master.masterCastle,
                                                                    date: currentDate
                                                                }, t)
                                                            })))
                                                            // Check
                                                            .then(results => {
                                                                let resError = results.find(e => e.status === 'rejected')
                                                                if (resError) throw resError
                                                            })
                                                            // Notifie losing team
                                                            .then(_ => Promise.allSettled(losingEquip.map(item => {
                                                                return notification_helper.sendTo(item.studentID, 'BattleLost', {
                                                                    castleID: master.masterCastle,
                                                                    date: currentDate
                                                                }, t)
                                                            })))
                                                            // Check
                                                            .then(results => {
                                                                let resError = results.find(e => e.status === 'rejected')
                                                                if (resError) throw resError
                                                            })
                                                    })


                                            })
                                    })
                            })

                    })
                    .then(_ => {
                        t.commit(err => {
                            if (err) throw err
                            else resolve()
                        })
                    })
                    .catch(err => {
                        t.rollback()
                        reject(err)
                    })


            })

        })
    }
}

var helper = new AttackHelper()
module.exports = helper