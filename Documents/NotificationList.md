## notMaster 
When a master lose is title. <br/>
* newMasterStudentID : userID of the new master
* castleID : castleID of the castle
* date : date of the notification

## notKnightNewMaster
When a knight is not knight anymore because his master lost is title. <br/>
* oldMasterStudentID : userID of the old master
* newMasterStudentID : userID of the new master
* castleID : castleID of the castle
* date : date of the notification

## knightRequestRefusedNewMaster
When a knight request is refuse because the master lost is title. <br/>
* oldMasterStudentID : userID of the old master
* newMasterStudentID : userID of the new master
* castleID : castleID of the castle
* date : date of the notification
* knightRequestID : knight request ID

## nowMaster
When a student become master. <br/>
* castleID : castleID of the castle
* date : date of the notification

## knightRequestReceive
When a master receive new knight request <br/>
* studentID : userID of the student that request to be knight
* date : date of the notification

## knightRequestAccepted
When a knight request is accepted <br/>
* newMaster : masterID of the master
* knightRequestID : knightRequestID of the request
* date : date of the notification

## knightLeaveForOther
When a knight as been accepted with a new master. <br/>
* knightStudentID : userID of the knight student
* newMasterID : masterID of the new master
* date : date of the notification


## knightRequestTooLate
When a knight as been accepted with a new master so the old request don't old. <br/>
* newMaster : masterID of the master
* knightRequestID : knightRequestID of the request
* date : date of the notification


## knightRequestRefused
When a knight request is refuse. <br/>
* masterID : masterID of the master
* knightRequestID : knight request ID
* date : date of the notification
