# Châteaux
Un château est composé d'un maître et de **X** chevaliers maximum. **X** pouvant être ajusté pour équilibrage.

### Maître
Le premier maître de chaque château est définit par un quiz au début du jeu. Les premiers se veront donc attribué un château ainsi que des 
points de math.

### Chevalier
Pour devenir un chevalier, il faut demander à rejoindre un château et être accepté. Un chevalier peut à tout moment demander à rejoindre un autre chateau. <br/>
Un maître peut retirer un chevalier de son château.

### Mécanique
Chaque jour, le maître de château doit réaliser un quiz sur un sujet aléatoire. Les points de ce quiz seront répartis entre le maître et les chevaliers du château.

###### Répartition des points
Chaque maître choisi sa part des points gagné en pourcentage, le reste est répartis équitablement entre les chevaliers.

*Exemple:* <br/>
Le maître a choisi de prendre 50% des points. <br/>
Il optient 20 points au quiz. Il prend donc 10PM et les chevaliers se partagent les 10PM restant. Si il y a 2 chevaliers, alors ils reçoivent 5PM chacun. <br/>
Dans le cas d'un nombre de PM non divisible par le nombre de chevaliers, le reste de la division entière sera reversée au maître. 

# Attaque
Tout le monde peut démarrer une attaque contre un château. <br/>
Seul le maître de château et les chevaliers peuvent participer à la défense. En revanche, tout le monde peut se joindre à l'attaque. (Sauf le maître et les chevaliers attaqués)

### Déroulement
* Un joueur lance une attaque contre un château
* D'autres joueurs peuvent rejoindre l'attaque pendant un temps définit au préalable
* Ensuite, l'attaque débute. Tous les joueurs répondent donc à un quiz aléatoire pour déterminer leur score dans la bataille. Après un certain moment défini, le combat se finit, tous quiz non répondus sera alors compté comme entièrement faux. 
* L'équipe avec le plus de point remporte la bataille.

### Calcul des points
Les points de chaque équipe dans un combat sont calculés de la manière suivante :
    * Le score de chaque joueur au quiz est multiplié par son nombre de MP
    * Si le joueur est le maître du château ou l'attaquant, son score est doublé
    * On ajoute ensuite un pourcentage de leur score à l'équipe qui défend afin de représenter leurs fortifications
 <br/>

### Victoire des attaquants
Si les attaquants sont victorieux, le maître du château ainsi que ses chevaliers sont renvoyés dans la forêt et le joueur qui a lancé l'attaque devient maître du château. <br/>
De plus, le maître et les chevaliers perdant perdent des PM relatifs à leur PM initiaux et à leur statut.(La perte de PM relative au score est expliquée plus bas)

### Victoire des défenseurs
Si les défenseurs sont victorieux, alors le joueur qui a lancé l'attaque et ces alliés perdent des PM relatifs à leur score de PM

### Perte de PM relative à son score
Le joueur perd des PM en fonction du nombre d'erreurs qu'il a effectué dans le quiz.

Soit : 
* P le nombre de PM que le joueur perd
* s le score du joueur au quiz
* t le score maximal du quiz
* m le nombre de PM du joueur
* c un coefficient appliqué au calcul

<img src="https://render.githubusercontent.com/render/math?math=\P = \frac{t - s}{t} * m * c">

### Temps entre les attaques
Peu importe les vainqueurs, après avoir été attaqué le château ne peut pas être attaqué de nouveau avant un temps définit.<br/>
