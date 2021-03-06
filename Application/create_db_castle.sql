PRAGMA foreign_keys = ON;

DROP TABLE IF EXISTS Soldier;
DROP TABLE IF EXISTS Attack;

DROP TABLE IF EXISTS KnightRequest;
DROP TABLE IF EXISTS Knight;
DROP TABLE IF EXISTS Master;
DROP TABLE IF EXISTS Castle;
DROP TABLE IF EXISTS DailyQuiz;

DROP TABLE IF EXISTS Notification;

-- OTHER

CREATE TABLE Notification(
    notifID INTEGER PRIMARY KEY AUTOINCREMENT,
    notifType TEXT NOT NULL,
    notifData TEXT NOT NULL,
    notifDate NUMERIC NOT NULL,
    notifUser INTEGER NOT NULL
);

-- Castle

CREATE TABLE DailyQuiz(
    dailyQuizID INTEGER PRIMARY KEY AUTOINCREMENT,
    dailyQuizDate NUMERIC NOT NULL,
    dailyQuizQuiz INTEGER NOT NULL
);

CREATE TABLE Castle(
    castleID INTEGER PRIMARY KEY AUTOINCREMENT,
    castleName TEXT NOT NULL,
    castleClass INTEGER NOT NULL
);

CREATE TABLE Master(
    masterID INTEGER PRIMARY KEY AUTOINCREMENT,
    masterStart NUMERIC NOT NULL,
    masterTaxe REAL NOT NULL,
    masterCastle INTEGER NOT NULL,
    masterStudent INTEGER NOT NULL,

    FOREIGN KEY(masterCastle) REFERENCES Castle(castleID)
);

CREATE TABLE Knight(
    knightID INTEGER PRIMARY KEY AUTOINCREMENT,
    knightStart NUMERIC NOT NULL,
    knightEnd NUMERIC,
    knightMaster INTEGER NOT NULL,
    knightStudent INTEGER NOT NULL,

    FOREIGN KEY(knightMaster) REFERENCES Master(masterID)
);

CREATE TABLE KnightRequest(
    knightRequestID INTEGER PRIMARY KEY AUTOINCREMENT,
    knightRequestDate NUMERIC NOT NULL,
    knightRequestResult INTEGER NOT NULL CHECK (knightRequestResult BETWEEN -1 AND 1),
    knightRequestMaster INTEGER NOT NULL,
    knightRequestStudent INTEGER NOT NULL,

    FOREIGN KEY(knightRequestMaster) REFERENCES Master(masterID)
);

-- Attack

CREATE TABLE Attack(
    attackID INTEGER PRIMARY KEY AUTOINCREMENT,
    attackStart NUMERIC NOT NULL,
    attackResult INTEGER NOT NULL CHECK (attackResult BETWEEN -1 AND 1),
    attackQuiz INTEGER NOT NULL,
    attackOrigin INTEGER NOT NULL,
    attackTarget INTEGER NOT NULL,

    FOREIGN KEY(attackTarget) REFERENCES Master(masterID)
);

CREATE TABLE Soldier(
    soldierScore INTEGER NOT NULL,
    soldierAttack INTEGER NOT NULL,
    soldierStudent INTEGER NOT NULL,

    FOREIGN KEY(soldierAttack) REFERENCES Attack(attackID),
    PRIMARY KEY (soldierAttack, soldierStudent)
);