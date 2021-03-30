# To master/exMaster

### notMaster 
When a master lose is title. <br/>
* newMasterStudentID : userID of the new master
* castleID : castleID of the castle
* date : date of the notification

### nowMaster
When a student become master. <br/>
* castleID : castleID of the castle
* date : date of the notification

### knightQuit
When a knight quit is master. <br/>
* knightID : knightID of the old knight
* date : date of the notification

### knightRequestReceive
When a master receive new knight request <br/>
* studentID : userID of the student that request to be knight
* date : date of the notification

### knightLeaveForOther
When a knight as been accepted with a new master. <br/>
* knightStudentID : userID of the knight student
* newMasterID : masterID of the new master
* date : date of the notification

### knightRequestTooLate
When a knight as been accepted with a new master so the old request don't old. <br/>
* newMaster : masterID of the master
* knightRequestID : knightRequestID of the request
* date : date of the notification

# To knight/knightRequest

### notKnightNewMaster
When a knight is not knight anymore because his master lost is title. <br/>
* oldMasterStudentID : userID of the old master
* newMasterStudentID : userID of the new master
* castleID : castleID of the castle
* date : date of the notification

### knightRequestRefusedNewMaster
When a knight request is refuse because the master lost is title. <br/>
* oldMasterStudentID : userID of the old master
* newMasterStudentID : userID of the new master
* castleID : castleID of the castle
* date : date of the notification
* knightRequestID : knight request ID

### knightRequestAccepted
When a knight request is accepted <br/>
* newMaster : masterID of the master
* knightRequestID : knightRequestID of the request
* date : date of the notification

### knightRequestRefused
When a knight request is refuse. <br/>
* masterID : masterID of the master
* knightRequestID : knight request ID
* date : date of the notification

### knightRemove
When a knight lose is title (fired). <br/>
* masterID : masterID of the old master
* date : date of the notification

# To team

### castleUnderAttack
When an attack start on a castle. <br/>
* castleID : castleID of the castle under attack
* originStudentID : userID of the student that launch the attack
* battleDate : date of the futur battle
* date : date of the notification

### BattleWin
When a team win a battle. <br/>
* castleID : castleID of the castle under attack
* date : date of the notification

### BattleLost
When a team lost a battle. <br/>
* castleID : castleID of the castle under attack
* date : date of the notification
