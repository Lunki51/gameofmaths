PRAGMA foreign_keys = ON;

DROP TRIGGER  IF EXISTS changeMP;
DROP TRIGGER  IF EXISTS addMP;

DROP TABLE IF EXISTS QuizQuestion;
DROP TABLE IF EXISTS Answer;
DROP TABLE IF EXISTS Question;
DROP TABLE IF EXISTS QuizDone;
DROP TABLE IF EXISTS Quiz;
DROP TABLE IF EXISTS Chapter;
DROP TABLE IF EXISTS MPGain;
DROP TABLE IF EXISTS Student;
DROP TABLE IF EXISTS Class;
DROP TABLE IF EXISTS Teacher;
DROP TABLE IF EXISTS User;

CREATE TABLE User(
     userID INTEGER PRIMARY KEY AUTOINCREMENT,
     login TEXT NOT NULL UNIQUE,
     password TEXT NOT NULL CHECK (LENGTH(password) >= 7),
     lastname TEXT NOT NULL,
     firstname TEXT NOT NULL
);

CREATE TABLE Teacher(
    theUser INTEGER PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,

    FOREIGN KEY(theUser) REFERENCES User(userID)
);

CREATE TABLE Class(
    classID INTEGER PRIMARY KEY AUTOINCREMENT,
    grade TEXT NOT NULL,
    name TEXT NOT NULL
);

CREATE TABLE Student(
    theUser INTEGER PRIMARY KEY,
    theClass INTEGER NOT NULL,
    mp INTEGER NOT NULL DEFAULT 0 CHECK (mp >= 0),

    FOREIGN KEY(theUser) REFERENCES User(userID),
    FOREIGN KEY(theClass) REFERENCES Class(classID)
);

CREATE TABLE MPGain(
    mpGainID INTEGER PRIMARY KEY AUTOINCREMENT,
    amount INTEGER NOT NULL,
    type TEXT CHECK (type IN ('QUIZ')) NOT NULL,
    date NUMERIC NOT NULL,
    theStudent INTEGER NOT NULL,

    FOREIGN KEY(theStudent) REFERENCES Student(theUser)
);

CREATE TABLE Chapter(
    chapterID INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL
);

CREATE TABLE Quiz(
    quizID INTEGER PRIMARY KEY AUTOINCREMENT,
    asAnOrder TEXT CHECK ( asAnOrder IN ('true', 'false', '0', '1')) NOT NULL,
    theChapter INTEGER NOT NULL,
    quizName TEST UNIQUE NOT NULL,

    FOREIGN KEY(theChapter) REFERENCES Chapter(chapterID)
);

CREATE TABLE QuizDone(
    theGain INTEGER,
    theQuiz INTEGER NOT NULL,
    score INTEGER NOT NULL,

    PRIMARY KEY (theGain)
    FOREIGN KEY(theGain) REFERENCES MPGain(mpGainID)
);

CREATE TABLE Question(
    questionID INTEGER PRIMARY KEY AUTOINCREMENT,
    upperText TEXT NOT NULL,
    lowerText TEXT NOT NULL,
    image TEXT NOT NULL,
    type TEXT CHECK (type IN ('QCM', 'QCU', 'OPEN')) NOT NULL,
    level INTEGER NOT NULL,
    theChapter INTEGER NOT NULL,

    FOREIGN KEY(theChapter) REFERENCES Chapter(chapterID)
);

CREATE TABLE Answer(
    answerID  INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    isValid TEXT CHECK ( isValid IN ('true', 'false', '0', '1')) NOT NULL,
    theQuestion INTEGER NOT NULL,

    FOREIGN KEY(theQuestion) REFERENCES Question(questionID)
);

CREATE TABLE QuizQuestion(
    theQuestion INTEGER,
    theQuiz INTEGER,
    qNumber INTEGER NOT NULL,

    FOREIGN KEY(theQuestion) REFERENCES Question(questionID),
    FOREIGN KEY(theQuiz) REFERENCES Quiz(quizID),
    PRIMARY KEY (theQuestion, theQuiz),
    UNIQUE (qNumber, theQuiz)
);