#!/bin/bash

echo -ne '|                     |  (00%) -> INSTALL DB           \r'
npm install --prefix Application/gameofmath-db > /dev/null 2>&1
echo -ne '|###                  |  (14%) -> INSTALL Castle       \r'
npm install --prefix Application/gameofmath-castle > /dev/null 2>&1
echo -ne '|######               |  (29%) -> INSTALL Helper       \r'
npm install --prefix Application/gameofmath-helper > /dev/null 2>&1
echo -ne '|#########            |  (43%) -> INSTALL MapGeneration\r'
npm install --prefix Application/gameofmath-mapGeneration > /dev/null 2>&1
echo -ne '|############         |  (57%) -> INSTALL WebApp       \r'
npm install --prefix Application/gameofmath-webapp > /dev/null 2>&1
echo -ne '|###############      |  (71%) -> INSTALL WebApp Client\r'
npm install --prefix Application/gameofmath-webapp/client > /dev/null 2>&1

echo -ne '|##################   |  (86%) -> INIT Database        \r'
rm Application/gameofmath.db
sqlite3 Application/gameofmath.db < Application/create_db.sql
sqlite3 Application/gameofmath.db < Application/create_trig.sql
sqlite3 Application/gameofmath.db < Application/create_db_castle.sql
echo -ne '|#####################|  (100%) -> DONE                \r'

echo

read -p 'Nom utilisateur: ' username
while true; do
    read -s -p "Mot de passe: " password
    echo
    read -s -p "Mot de passe (encore): " password2
    echo
    [ "$password" = "$password2" ] && [ "${#password}" -gt "6" ] && break
    echo "Mot de passe non identique ou taille insufisante (7 minimum)"
done

hpassword=`echo -n $password | openssl dgst -sha512 | sed 's/^.*= //'`

read -p 'nom: ' lastname
read -p 'prenom: ' firstname
read -p 'email: ' mail

sqlite3 Application/gameofmath.db "INSERT INTO User VALUES(1, '$username', '$hpassword', '$lastname', '$firstname')"
sqlite3 Application/gameofmath.db "INSERT INTO Teacher VALUES(1, '$mail')"

chmod  +x Application/gameofmath-webapp/app.js 
sudo cp Application/gameofmath.service /etc/systemd/system/
sudo rm -r /var/www/gameofmath
sudo mkdir /var/www/gameofmath -p
sudo chown $USER /var/www/gameofmath
cp -r Application/ /var/www/gameofmath
chmod 777 /var/www/gameofmath/Application/gameofmath.db
chmod 777 /var/www/gameofmath/Application

sleep 1s
sudo systemctl daemon-reload
sleep 1s
sudo systemctl start gameofmath.service
sleep 1s
sudo systemctl enable gameofmath.service

echo 'Le serveur est ouvert!'