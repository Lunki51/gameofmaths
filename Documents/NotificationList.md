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

## knightRequestRefuseNewMaster
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
