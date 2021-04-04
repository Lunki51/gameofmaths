PRAGMA foreign_keys = ON;

DROP TRIGGER  IF EXISTS changeMP;
DROP TRIGGER  IF EXISTS addMP;

CREATE TRIGGER addMP
    AFTER INSERT
    ON MPGain
BEGIN
    UPDATE Student SET mp = mp + NEW.amount WHERE NEW.theStudent = theUser;
END;

CREATE TRIGGER changeMP
    AFTER UPDATE
    ON MPGain
    WHEN OLD.amount <> NEW.amount
BEGIN
    UPDATE Student SET mp = mp - OLD.amount + NEW.amount WHERE NEW.theStudent = theUser;
END;

CREATE TRIGGER quizDoneUpdate
    AFTER UPDATE
    ON QuizDone
    WHEN NEW.theGain <> OLD.theGain OR NEW.theQuiz <> OLD.theQuiz
BEGIN
    SELECT RAISE (ABORT, 'This value can''t be update');
END;
CREATE TRIGGER quizQuestionUpdate
    AFTER UPDATE
    ON QuizQuestion
    WHEN NEW.theQuestion <> OLD.theQuestion OR NEW.theQuiz <> OLD.theQuiz
BEGIN
    SELECT RAISE (ABORT, 'This value can''t be update');
END;