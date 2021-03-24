# Châteaux
Un chateau est composé d'un maître et de **X1** chevalier maximum.

### Maître
Le premier maître de chaque château est définit par un quiz au début du jeu. Les **X2** premiers seront donc maître des **X2** chateaux.

### Chevalier
Pour devenir un chevalier, il faut demander à rejoindre un chateaux et être accepté. Un chevalier peut à tout moment demander un autre chateau. <br/>
Un maître peut retirer un chevalier de son château.

### Mécanique
Chaque jour, le maître de chateau doit réaliser un quiz commun à châteaux. Les points de ce quiz seront réparties entre le maître est les chevaliers du château.

###### Répartition des points
Chaque maître choisi la pourcentage de point qu'il prend, le reste sera réparti équitablement avec les chevaliers.

*Exemple:* <br/>
Le maître à choisi de prendre 50% des points. <br/>
Il optient 20 points au quiz. Il prend donc 10PM et les chevaliers se partage les 10PM restant. Si il y a 2 chevaliers, alors ils ont 5PM chaqu'un. <br/>
Dans le cas d'un nombre de PM non divisible par le nombre de chevalier, cela sera arrondi à l'inférieur et le reste sera donné au maître. 

# Attaque
Tout le monde peut démarrer une attaque contre un château. <br/>
Seul le maître de chateau et les chevaliers peuvent participer à la défense. En revanche, tout le monde peut se joindre à l'attaque. (Sauf le maître et les chevaliers attaqués) 

### Déroulement
* Un joueur lance une attaque contre un chateau
* Durant un temps **X3**, d'autre joueur peuvent se joindre à l'attaque
* Après le temps **X3**, l'attaque débute. Tous les joueurs répondent donc à des quiz aléatoires pour déterminer le score de chaque camp. Ils ont un temps **X11** pour répondre au quiz. Tout quiz non répondu sera compté comme entièrement faux. 
* L'équipe avec le plus de point remporte.

### Calcule des points
Les points sont la somme du score du quiz de chaque personne de l'équipe multiplié par son nombre de MP. Pour donner de l'importance au maître du chateau ainsi que au joueur qui a lancé l'attaque est doublé. <br/>
De plus, le score finals des défenseurs est multiplié par **X4**.

### Victoire des attaquants
Si les attaquants sont victorieux, le maître du chateau ainsi que c'est chevalier sont de retour dans la forêt et le joueur qui a lancé l'attaque devient maître du chateau. <br/>
De plus, le maître va perdre des PM relativement à son score avec un coefficient **X5**. De même pour les chevaliers avec un coefficient **X6**. (La perte de PM relative au score est expliqué plus bas)

### Victoire des défenseurs
Si les défenseurs sont victorieux, alors le joueur qui a lancé l'attaque perd des PM relativement à son score avec un coefficient **X7**. De même pour les joueurs qui ont aidé dans l'attaque mais avec un coefficient **X8**.

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
Après avoir été attaqué, le chateau ne peut pas être attaqué de nouveau avant un temps **X9**. Peux importe les vainqueurs. <br/>
Si les attaquant perde, ils ne peuvent plus attaquer qui que se soit pendant un temps **X10**.

#PS
Toutes les variables de type **X** seront remplacé par un variable avec un nom que l'utilisateur pourra modifier.