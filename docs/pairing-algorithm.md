# How the Swiss pairing engine works

This document explains, step by step and with a worked example, how
EloChessPlanner decides who plays whom, with which color, in every round of
a home tournament. The engine lives in `src/domain/tournament/` and is
directly inspired by the FIDE Swiss (Dutch) system, simplified for the small
group sizes typical of a family tournament (2 to 8 players).

*La version française suit plus bas.*

## 1. The idea behind a Swiss tournament

In a Swiss tournament, players are not eliminated. Every round, players with
similar scores are paired against each other, so the event stays meaningful
and close even if someone loses early. Nobody plays the same opponent twice
if it can be avoided, and colors (White/Black) are balanced as fairly as
possible over the rounds.

## 2. Round 1: seeding and the split-half method

Before any game is played, every player has a score of 0, so they all belong
to one single group. The engine:

1. Ranks the group by rating, highest first (using the rating snapshot taken
   when the tournament was created: FIDE, then FFE, then chess.com, then
   unrated players last, sorted alphabetically among themselves).
2. Splits that ranking into a top half and a bottom half.
3. Pairs the first player of the top half with the first player of the
   bottom half, the second with the second, and so on.

**Example.** Riadh (1522 FIDE), Seji (1738 FIDE), Sany (1597 FIDE) and Syma
(1399 FFE) register for a tournament. Ranked by rating: Seji, Sany, Riadh,
Syma. Split in half: top = [Seji, Sany], bottom = [Riadh, Syma]. Round 1
pairings:

- Board 1: Seji vs Riadh
- Board 2: Sany vs Syma

This is exactly the standard FIDE Dutch system method for a first round,
since with everyone at 0 points the whole field is one score group.

## 3. Colors

Colors matter: playing White too often, or the same color three times in a
row, is considered unfair over a tournament. Each player has a "color
balance" (times played White minus times played Black) and a "last color
played". Before every pairing, the engine works out who is "owed" which
color:

- If a player's balance is positive (more White games than Black), they are
  owed Black next.
- If a player's balance is negative, they are owed White next.
- If the balance is even, the player prefers the opposite of their last
  color (simple alternation).
- With no history at all (typically round 1), there is no preference.

When two paired players want the same color, the higher-ranked player of the
pair gets their preference and the other one takes the opposite color. When
nobody has a preference (round 1), the higher-ranked player of the pair gets
White by convention.

**Example (continued).** In round 1, nobody has history, so Seji (higher
ranked than Riadh) gets White on board 1, and Sany (higher ranked than Syma)
gets White on board 2.

## 4. Round 2 and beyond: score groups

Once round 1 is played, players are grouped by their current score
(descending), and the split-half method from step 2 is applied again,
**inside each score group**. This naturally pushes winners to play winners
and losers to play losers.

**Example (continued).** Say Seji beats Riadh on board 1, and Syma beats
Sany on board 2. After round 1: Seji = 1, Syma = 1, Riadh = 0, Sany = 0. Two
score groups form: {Seji, Syma} at 1 point, and {Sany, Riadh} at 0 points.
Each group is split in half and paired the same way as round 1:

- Board 1: Syma vs Seji (1-point group)
- Board 2: Riadh vs Sany (0-point group)

Colors for round 2 follow the balance rule from step 3: Seji played White in
round 1, so is owed Black; Syma played Black, so is owed White. Riadh played
Black, so is owed White; Sany played White, so is owed Black. That is why
the board 1 pairing above is written "Syma vs Seji" (Syma has White) and
board 2 is "Riadh vs Sany" (Riadh has White).

## 5. Odd number of players: the bye

If the field has an odd number of players, one player cannot be paired that
round and receives a "bye": a free full point, and no game to play. The bye
always goes to the lowest-ranked player (by current score, then by seed
rating) who has not already had a bye this tournament. If every remaining
player has already had one, the bye is given again to the lowest-ranked
player available; with a very small and short tournament this is
unavoidable.

**Example.** With 5 players (add a guest, Marc, unrated), round 1 splits
into a group of 5. The lowest-ranked player (Marc, unrated, alphabetically
last among the unrated) sits out with a bye, and the remaining 4 players are
paired as in the earlier example.

## 6. Avoiding repeat opponents (and the rare exception)

Within a score group, the engine tries every possible way of matching the
top half against the bottom half, and picks the pairing that avoids repeat
opponents. With the small groups this app targets, checking every
possibility is fast and guarantees the best result.

Sometimes, especially with very few players and many rounds, there is no way
to avoid a repeat: for example, with only 2 players in the whole tournament,
round 2 has no other option than pairing them against each other again. In
that case the engine allows the repeat rather than failing to produce a
round, exactly as FIDE rules allow as a last resort.

If a score group has an odd number of players (which can happen once
players are split across groups), the lowest-ranked player of that group
"floats" down into the next group instead, and is paired there.

## 7. Standings and tie-breaks

The main ranking criterion is the score (1 point per win, 0.5 per draw, 0
per loss, 1 full point for a bye). When several players are tied on score,
two tie-break numbers are computed and shown:

- **Buchholz**: the sum of the final scores of every opponent a player has
  faced (byes are not counted). A higher Buchholz means a player faced
  tougher opposition on average.
- **Sonneborn-Berger**: similar, but each opponent's final score only
  counts fully if the player beat them, half if they drew, and not at all
  if they lost to them. It rewards beating strong players more than simply
  facing them.

**Example (continued).** After round 2 (Seji beats Syma again, Riadh and
Sany draw), final scores are: Seji = 2, Syma = 1, Riadh = 0.5, Sany = 0.5.
Riadh and Sany are tied at 0.5 and need a tie-break. Riadh's opponents were
Seji (final score 2) and Sany (final score 0.5): Buchholz = 2.5. Sany's
opponents were Syma (final score 1) and Riadh (final score 0.5): Buchholz =
1.5. Riadh's Buchholz is higher, so Riadh ranks 3rd and Sany 4th.

## 8. What this engine deliberately does not do

This is a simplified engine built for small home tournaments, not a FIDE
arbiter certification tool. In particular it does not implement the full
Dutch system's acceleration rules, elaborate floating priority rules for
large fields, or the complete FIDE color allocation rule set (which has
several more tie-breaking criteria for edge cases). For 2 to 8 players over
a handful of rounds, the rules above cover every situation correctly.

---

# Comment fonctionne le moteur d'appariement Swiss

Ce document explique, étape par étape et avec un exemple concret, comment
EloChessPlanner décide qui affronte qui, avec quelle couleur, à chaque ronde
d'un tournoi maison. Le moteur se trouve dans `src/domain/tournament/` et
s'inspire directement du système Swiss FIDE (système hollandais), simplifié
pour les petits groupes typiques d'un tournoi familial (2 à 8 joueurs).

## 1. L'idée d'un tournoi Swiss

Dans un tournoi Swiss, les joueurs ne sont jamais éliminés. À chaque ronde,
les joueurs ayant un score proche sont appariés ensemble, pour que le
tournoi reste intéressant même en cas de défaite précoce. On évite autant
que possible de rejouer deux fois le même adversaire, et les couleurs
(Blancs/Noirs) sont équilibrées le plus justement possible sur l'ensemble
des rondes.

## 2. Ronde 1 : le seeding et la méthode de la moitié haute/basse

Avant la première partie, tous les joueurs ont un score de 0 : ils forment
donc tous un seul groupe. Le moteur :

1. Classe le groupe par rating décroissant (en utilisant le rating figé au
   moment de la création du tournoi : FIDE, puis FFE, puis chess.com, puis
   les joueurs non classés en dernier, triés par ordre alphabétique entre
   eux).
2. Divise ce classement en une moitié haute et une moitié basse.
3. Apparie le premier de la moitié haute avec le premier de la moitié basse,
   le deuxième avec le deuxième, et ainsi de suite.

**Exemple.** Riadh (1522 FIDE), Seji (1738 FIDE), Sany (1597 FIDE) et Syma
(1399 FFE) s'inscrivent à un tournoi. Classement par rating : Seji, Sany,
Riadh, Syma. Division en deux : haut = [Seji, Sany], bas = [Riadh, Syma].
Appariements de la ronde 1 :

- Échiquier 1 : Seji contre Riadh
- Échiquier 2 : Sany contre Syma

C'est exactement la méthode standard du système hollandais FIDE pour une
première ronde, puisqu'avec tout le monde à 0 point, tout le groupe forme un
seul groupe de score.

## 3. Les couleurs

Les couleurs comptent : jouer trop souvent les Blancs, ou la même couleur
trois fois de suite, est considéré injuste sur la durée d'un tournoi. Chaque
joueur a une "balance de couleur" (nombre de parties aux Blancs moins nombre
de parties aux Noirs) et une "dernière couleur jouée". Avant chaque
appariement, le moteur détermine qui est "dû" pour quelle couleur :

- Si la balance d'un joueur est positive (plus de parties aux Blancs), il
  est dû pour les Noirs la fois suivante.
- Si la balance est négative, il est dû pour les Blancs.
- Si la balance est équilibrée, le joueur préfère l'inverse de sa dernière
  couleur jouée (alternance simple).
- Sans aucun historique (typiquement en ronde 1), il n'y a pas de
  préférence.

Quand les deux joueurs d'un appariement veulent la même couleur, le mieux
classé des deux obtient sa préférence et l'autre prend la couleur opposée.
Quand personne n'a de préférence (ronde 1), le mieux classé des deux obtient
les Blancs par convention.

**Exemple (suite).** En ronde 1, personne n'a d'historique, donc Seji (mieux
classé que Riadh) obtient les Blancs à l'échiquier 1, et Sany (mieux classée
que Syma) obtient les Blancs à l'échiquier 2.

## 4. Ronde 2 et suivantes : les groupes de score

Une fois la ronde 1 jouée, les joueurs sont regroupés par score actuel
(décroissant), et la méthode de la moitié haute/basse de l'étape 2 est
réappliquée, **à l'intérieur de chaque groupe de score**. Cela fait
naturellement s'affronter les gagnants entre eux et les perdants entre eux.

**Exemple (suite).** Seji bat Riadh à l'échiquier 1, et Syma bat Sany à
l'échiquier 2. Après la ronde 1 : Seji = 1, Syma = 1, Riadh = 0, Sany = 0.
Deux groupes de score se forment : {Seji, Syma} à 1 point, et {Sany, Riadh}
à 0 point. Chaque groupe est divisé en deux et apparié comme en ronde 1 :

- Échiquier 1 : Syma contre Seji (groupe à 1 point)
- Échiquier 2 : Riadh contre Sany (groupe à 0 point)

Les couleurs de la ronde 2 suivent la règle de balance de l'étape 3 : Seji a
joué les Blancs en ronde 1, il est donc dû pour les Noirs ; Syma a joué les
Noirs, elle est donc due pour les Blancs. Riadh a joué les Noirs, il est dû
pour les Blancs ; Sany a joué les Blancs, elle est due pour les Noirs. C'est
pourquoi l'appariement de l'échiquier 1 ci-dessus s'écrit "Syma contre Seji"
(Syma a les Blancs) et l'échiquier 2 "Riadh contre Sany" (Riadh a les
Blancs).

## 5. Nombre impair de joueurs : l'exemption (bye)

Si le nombre de joueurs est impair, un joueur ne peut pas être apparié cette
ronde-là et reçoit une "exemption" (bye) : un point complet gratuit, sans
partie à jouer. L'exemption revient toujours au joueur le moins bien classé
(par score actuel, puis par rating de seeding) qui n'a pas déjà eu
d'exemption ce tournoi. Si tous les joueurs restants en ont déjà eu une,
elle est redonnée au moins bien classé disponible ; sur un tout petit
tournoi, ce cas devient inévitable.

**Exemple.** Avec 5 joueurs (en ajoutant un invité, Marc, non classé), la
ronde 1 forme un groupe de 5. Le joueur le moins bien classé (Marc, non
classé, dernier par ordre alphabétique parmi les non classés) est exempté,
et les 4 joueurs restants sont appariés comme dans l'exemple précédent.

## 6. Éviter les répétitions d'adversaires (et la rare exception)

À l'intérieur d'un groupe de score, le moteur essaie toutes les façons
possibles d'apparier la moitié haute avec la moitié basse, et retient celle
qui évite les répétitions d'adversaires. Avec les petits groupes ciblés par
cette application, tester toutes les possibilités est rapide et garantit le
meilleur résultat.

Parfois, surtout avec très peu de joueurs et beaucoup de rondes, il est
impossible d'éviter une répétition : par exemple, avec seulement 2 joueurs
dans tout le tournoi, la ronde 2 n'a pas d'autre option que de les réapparier
ensemble. Dans ce cas, le moteur autorise la répétition plutôt que d'échouer
à produire une ronde, exactement comme les règles FIDE l'autorisent en
dernier recours.

Si un groupe de score compte un nombre impair de joueurs (ce qui peut
arriver une fois les joueurs répartis en groupes), le joueur le moins bien
classé de ce groupe "flotte" vers le groupe suivant, où il est apparié.

## 7. Classement et départages

Le critère de classement principal est le score (1 point par victoire, 0,5
par match nul, 0 par défaite, 1 point complet pour une exemption). Quand
plusieurs joueurs sont à égalité de score, deux critères de départage sont
calculés et affichés :

- **Buchholz** : la somme des scores finaux de tous les adversaires
  affrontés par un joueur (les exemptions ne comptent pas). Un Buchholz plus
  élevé signifie une opposition en moyenne plus relevée.
- **Sonneborn-Berger** : similaire, mais le score final de chaque adversaire
  ne compte en entier que si le joueur l'a battu, pour moitié en cas de nul,
  et pas du tout en cas de défaite face à lui. Ce critère valorise le fait
  de battre des adversaires forts plus que de simplement les affronter.

**Exemple (suite).** Après la ronde 2 (Seji rebat Syma, Riadh et Sany font
match nul), les scores finaux sont : Seji = 2, Syma = 1, Riadh = 0,5, Sany =
0,5. Riadh et Sany sont à égalité à 0,5 et ont besoin d'un départage. Les
adversaires de Riadh étaient Seji (score final 2) et Sany (score final 0,5)
: Buchholz = 2,5. Les adversaires de Sany étaient Syma (score final 1) et
Riadh (score final 0,5) : Buchholz = 1,5. Le Buchholz de Riadh est plus
élevé, donc Riadh termine 3ème et Sany 4ème.

## 8. Ce que ce moteur ne fait volontairement pas

Il s'agit d'un moteur simplifié conçu pour de petits tournois maison, pas
d'un outil de certification d'arbitre FIDE. En particulier, il n'implémente
pas les règles d'accélération du système hollandais complet, les règles de
priorité de floating élaborées pour les grands groupes, ni l'ensemble
complet des règles FIDE d'attribution des couleurs (qui comportent plusieurs
critères de départage supplémentaires pour les cas limites). Pour 2 à 8
joueurs sur quelques rondes, les règles décrites ci-dessus couvrent
correctement toutes les situations.
