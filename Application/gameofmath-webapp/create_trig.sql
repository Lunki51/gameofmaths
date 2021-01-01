PRAGMA foreign_keys = ON;

DROP TRIGGER  IF EXISTS changeMP;
DROP TRIGGER  IF EXISTS addMP;

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