-- password : password1
INSERT INTO USER VALUES(1,'login1','bc547750b92797f955b36112cc9bdd5cddf7d0862151d03a167ada8995aa24a9ad24610b36a68bc02da24141ee51670aea13ed6469099a4453f335cb239db5da','lastname1','firstname1'); 
-- password : password2
INSERT INTO USER VALUES(2,'login2','92a891f888e79d1c2e8b82663c0f37cc6d61466c508ec62b8132588afe354712b20bb75429aa20aa3ab7cfcc58836c734306b43efd368080a2250831bf7f363f','lastname2','firstname2');
-- password : password3
INSERT INTO USER VALUES(3,'login3','2a64d6563d9729493f91bf5b143365c0a7bec4025e1fb0ae67e307a0c3bed1c28cfb259fc6be768ab0a962b1e2c9527c5f21a1090a9b9b2d956487eb97ad4209','lastname3','firstname3');

INSERT INTO TEACHER VALUES(3,'teacherMail@mail.com');

INSERT INTO CLASS VALUES(1,'CE2','Girafe');

INSERT INTO STUDENT VALUES(1,1,0);
INSERT INTO STUDENT VALUES(2,1,0);

INSERT INTO CHAPTER VALUES(1,'Géometrie');
INSERT INTO CHAPTER VALUES(2,'Multiplication');

INSERT INTO QUIZ VALUES(1,'true',1, 'Quiz 1');
INSERT INTO QUIZ VALUES(2,'false',2, 'Quiz 2');

INSERT INTO QUESTION VALUES(1,'Ci dessous un carré','Quelle est la valeur de b ?','/questionImages/i1.png','OPEN',1,1);

INSERT INTO QUESTION VALUES(7,'Ci dessous un carré','Quelles affirmations sont vrai?','/questionImages/i2.png','QCM',2,1);

INSERT INTO QUESTION VALUES(3,'Combien fait 3*3 ?','','','OPEN',2,2);
INSERT INTO QUESTION VALUES(4,'Combien fait 3*(-1*3) ?','','','OPEN',4,2);

INSERT INTO QUESTION VALUES(5,'2^4 est équivalent  ','','','QCU',6,2);

INSERT INTO QUESTION VALUES(6,'Quels calculs donne 15','','','QCM',3,2);

INSERT INTO ANSWER VALUES(1,'5','true',1);

INSERT INTO ANSWER VALUES(3,'9','true',3);
INSERT INTO ANSWER VALUES(4,'-9','true',4);

INSERT INTO ANSWER VALUES(5,'2*2*2*2','true',5);
INSERT INTO ANSWER VALUES(6,'2*2*2','false',5);
INSERT INTO ANSWER VALUES(7,'2*2','false',5);
INSERT INTO ANSWER VALUES(8,'2','false',5);

INSERT INTO ANSWER VALUES(9,'3*5','true',6);
INSERT INTO ANSWER VALUES(10,'2*5+5','true',6);
INSERT INTO ANSWER VALUES(11,'2*7','false',6);
INSERT INTO ANSWER VALUES(12,'2*8-4','false',6);

INSERT INTO ANSWER VALUES(13,'b = 5','true',7);
INSERT INTO ANSWER VALUES(14,'Tout les angles sont égaux','true',7);
INSERT INTO ANSWER VALUES(15,'Un carré est un rectangle spécial','true',7);
INSERT INTO ANSWER VALUES(16,'L''angle c est égal à 65','false',7);


INSERT INTO QUIZQUESTION VALUES(1,1,2);
INSERT INTO QUIZQUESTION VALUES(7,1,1);

INSERT INTO QUIZQUESTION VALUES(3,2,1);
INSERT INTO QUIZQUESTION VALUES(4,2,2);
INSERT INTO QUIZQUESTION VALUES(5,2,3);
INSERT INTO QUIZQUESTION VALUES(6,2,4);