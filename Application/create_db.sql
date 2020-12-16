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
     login TEXT NOT NULL,
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
    type TEXT CHECK (type IN ('QUIZ')),
    date NUMERIC,
    theStudent INTEGER NOT NULL,

    FOREIGN KEY(theStudent) REFERENCES Student(theUser)
);

CREATE TABLE Chapter(
    chapterID INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE
);

CREATE TABLE Quiz(
    quizID INTEGER PRIMARY KEY AUTOINCREMENT,
    theChapter INTEGER,

    FOREIGN KEY(theChapter) REFERENCES Chapter(chapterID)
);

CREATE TABLE QuizDone(
    theQuiz INTEGER,
    theGain INTEGER,
    score INTEGER,

    FOREIGN KEY(theQuiz) REFERENCES Quiz(quizID),
    FOREIGN KEY(theGain) REFERENCES MPGain(mpGainID),
    PRIMARY KEY (theQuiz, theGain)
);

CREATE TABLE Question(
    questionID INTEGER PRIMARY KEY AUTOINCREMENT,
    upperText TEXT,
    lowerText TEXT,
    image TEXT,
    type TEXT CHECK (type IN ('QCM', 'QCU', 'OPEN')),
    level INTEGER,
    theChapter INTEGER,

    FOREIGN KEY(theChapter) REFERENCES Chapter(chapterID)
);

CREATE TABLE Answer(
    answerID  INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT,
    isValid TEXT CHECK ( isValid IN ('true', 'false', '0', '1')),
    theQuestion INTEGER,

    FOREIGN KEY(theQuestion) REFERENCES Question(questionID)
);

CREATE TABLE QuizQuestion(
    theQuestion INTEGER,
    theQuiz INTEGER,

    FOREIGN KEY(theQuestion) REFERENCES Question(questionID),
    FOREIGN KEY(theQuiz) REFERENCES Quiz(quizID),
    PRIMARY KEY (theQuestion, theQuiz)
);

-- TRIGGER
CREATE TRIGGER addMP
    AFTER INSERT
    ON MPGain
BEGIN
    UPDATE Student SET mp = mp + NEW.amount;
END;

CREATE TRIGGER changeMP
    AFTER UPDATE
    ON MPGain
BEGIN
    UPDATE Student SET mp = mp - OLD.amount + NEW.amount;
END;