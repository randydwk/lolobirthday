drop table if exists player,gamestep,photo,karaoke,params cascade;

CREATE TABLE player (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    step INTEGER DEFAULT 0,
    score INTEGER DEFAULT 0,
    votes INTEGER DEFAULT 0,
    hasVoted BOOLEAN DEFAULT false
);

CREATE TABLE gamestep (
    id INTEGER PRIMARY KEY,
    code VARCHAR(255) UNIQUE NOT NULL,
    place VARCHAR(255),
    title VARCHAR(255),
    enigm TEXT
);

CREATE TABLE photo (
    id SERIAL PRIMARY KEY,
    filename TEXT,
    author INTEGER REFERENCES player(id),
    url TEXT
);

CREATE TABLE karaoke (
    id SERIAL PRIMARY KEY,
    song TEXT,
    submitter INTEGER REFERENCES player(id)
);

CREATE TABLE params (
    id SERIAL PRIMARY KEY,
    karaoke BOOLEAN,
    votes BOOLEAN
);

INSERT INTO player (name) VALUES ('Carole');
INSERT INTO player (name) VALUES ('Damien');
INSERT INTO player (name) VALUES ('Dylan');
INSERT INTO player (name) VALUES ('Erwan');
INSERT INTO player (name) VALUES ('Feurlote');
INSERT INTO player (name) VALUES ('Léo');
INSERT INTO player (name) VALUES ('Lolo');
INSERT INTO player (name) VALUES ('Lucie');
INSERT INTO player (name) VALUES ('Lucy');
INSERT INTO player (name) VALUES ('Maddy');
INSERT INTO player (name) VALUES ('Maely');
INSERT INTO player (name) VALUES ('Maxime');
INSERT INTO player (name) VALUES ('Matt');
INSERT INTO player (name) VALUES ('Morgane');
INSERT INTO player (name) VALUES ('Nora');
INSERT INTO player (name) VALUES ('Oriane');
INSERT INTO player (name) VALUES ('Pauline');
INSERT INTO player (name) VALUES ('Shyshy');
INSERT INTO player (name) VALUES ('Steeve');
INSERT INTO player (name) VALUES ('Thibz');

INSERT INTO gamestep (id,code,place,title,enigm) VALUES (0 ,'s6gf4bnv9d8b1','Oklahoma City, Oklahoma','Bienvenue aux États-Unis !','Pour commencer ce road trip américain, nous allons emprunter la route mère des États-Unis, traversant huits États, des villes poussiéreuses aux néons brillants ! Tu vois de quelle route je parle ? Très bien, va chercher la voiture, et en route mauvaise troupe !');
INSERT INTO gamestep (id,code,place,title,enigm) VALUES (1 ,'58g7r44sgr1dz','Albuquerque, Nouveau-Mexique','Route 66','Cool cette route 66 non ? Elle nous amène tout droit vers notre prochaine destination, là où nous pourrons visiter le fameux Walk of Fame !');
INSERT INTO gamestep (id,code,place,title,enigm) VALUES (2 ,'f2efs4fs6f8h7','Los Angeles, Californie','Hollywood','Ahhh Hollywood, quel quartier emblématique de Los Angeles ! J''espère que tu apprécie les étoiles du Walk of Fame, surtout celle de Lolo La Star, l''une des plus grandes célébrités aux États-Unis ! Notre prochaine destination est un endroit suspendu au dessus de l''Océan Pacifique...');
INSERT INTO gamestep (id,code,place,title,enigm) VALUES (3 ,'l6pof54fse1k2','San Francisco, Californie','Golden Gate Bridge','Waw ! Nous voilà sur le Golden Gate Bridge, le plus long pont suspendu des États-Unis, avec une longueur de 2737 mètres ! Après avoir passé ce pont, nous nous rendrons dans un endroit qui brille de mille feux, en plein milieu du désert... Dans cet endroit rempli de jeux d''argent, allons tenter notre chance sur un jeu de cartes !');
INSERT INTO gamestep (id,code,place,title,enigm) VALUES (4 ,'87qzef5gt12ji','Las Vegas, Nevada','Casino','Bienvenue dans ce prestigieux casino de Las Vegas ! Restons un petit moment ici, on pourrait peut-être y devenir riches... Mais fais bien attention à l''endroit où tu planques ton argent !');
INSERT INTO gamestep (id,code,place,title,enigm) VALUES (5 ,'45lougtktd58y','Las Vegas, Nevada','$$$$$$$','Belle cachette ! Utilisons tout cet argent pour continuer notre route. Le prochain endroit où j''aimerais t''emmener est une montagne où l''on peut rencontrer quatre anciens présidents américains...');
INSERT INTO gamestep (id,code,place,title,enigm) VALUES (6 ,'u5j4htffs6r2d','Keystone, Dakota du Sud','Mont Rushmore','George Washington, Thomas Jefferson, Théodore Roosevelt et Abraham Lincoln, c''est dingue de les voir aussi grands ! Évidemment, Roosevelt n''a jamais connu l''ordinateur, c''était donc l''intru ! Après ce petit détour en Dakota du Sud, nous allons nous rendre dans la ville d''enfance de l''une des plus grande célébrités de tous les temps (sans compter Lolo La Star évidemment). Quand la nuit tombe et que les créatures rôdent, elle mène la danse dans la rue, sous la pleine lune. Alors, tu vois de qui je parle ?');
INSERT INTO gamestep (id,code,place,title,enigm) VALUES (7 ,'b4tr6g8gf75fr','Gary, Indiana','Michael Jackson','Nous voici dans l''Indiana, à Gary, la ville d''enfance du célèbre Michael Jackson. Pour la prochaine destination, je te propose un lieu assez atypique pour notre époque... Derrière ses portes battantes, l''or coule à flots et les verres tintent. Un shot de whisky ferait de toi un vrai cowboy !');
INSERT INTO gamestep (id,code,place,title,enigm) VALUES (8 ,'es6f5g4cvb2t1','Louisville, Kentucky','Saloon','Nous voici dans un saloon au beau milieu du Kentucky. Alors cowboy, comment était ce whisky ? Tu te doutes bien que ce n''est pas bien de boire et de reprendre la route juste après ! Restons donc un peu ici, j''ai une devinette pour toi : "J''ai changé depuis ma naissance mais mon symbole reste le même. Des étoiles me composent, pourtant je ne viens pas du ciel. Qui suis-je ?"');
INSERT INTO gamestep (id,code,place,title,enigm) VALUES (9 ,'rzf6bdg1bhf48','Louisville, Kentucky','Drapeau Américain','C''est sans doute l''un des drapeaux les plus connus du monde. Allez, c''est reparti, dirigeons-nous maintenant vers un célèbre monument, cadeau de la France, éclairant le chemin vers la liberté.');
INSERT INTO gamestep (id,code,place,title,enigm) VALUES (10,'s6e4fesf9v41o','New York, État de New York','Statue de la Liberté','Elle est jolie n''est-ce pas ? C''est ici que se termine notre super Road Trip à travers les États-Unis, j''espère que ça t''a plu ! Si tu fais partie des premiers a être arrivés au bout de ce voyage, tu gagneras un cadeau ! Alors fais bien attention à tes points, car ils en determineront la valeur ! Bon courage !');

INSERT INTO params (karaoke,votes) VALUES (true,false);