# Resultats des simulations - 20 executions par simulation

Fichier genere automatiquement par `node scripts/generer-resultats-simulations.js`.

Les tableaux ci-dessous reprennent les valeurs affichees dans les cartes de statistiques des simulations interactives disponibles. Chaque ligne represente une execution avec des valeurs de controles differentes.

Notes de lecture :
- Les simulations animees sont calculees a l'etat initial apres changement des controles.
- Les simulations qui demandent une selection manuelle d'un point indiquent `non selectionne` lorsque la carte de l'application affiche aussi une valeur vide avant selection.
- Les entrees du catalogue marquees comme verrouillees, en preparation ou "Bientot" ne sont pas incluses, car elles n'ont pas de statistiques de simulation exploitables.
- Pour les calculs qui dependent de la taille du graphe, le script utilise une taille representative de 640 x 450.

Entrees exclues du rapport pour cette raison : Collisions elastiques, les cartes "Bientot" de mathematiques et physique, Transtypage, Collisions de hachage et Heritage.


## Derivees

| # | Fonction | x0 | f(x0) | f'(x0) |
| --- | --- | --- | --- | --- |
| 1 | x^2 | -1.00 | 1.0000 | -2.0000 |
| 2 | x^3 | 2.00 | 8.0000 | 12.0000 |
| 3 | sin(x) | -3.10 | -0.0416 | -0.9991 |
| 4 | e^x | -0.10 | 0.9048 | 0.9048 |
| 5 | ln(x) | 0.30 | -1.2040 | 3.3333 |
| 6 | cos(x) | -2.20 | -0.5885 | 0.8085 |
| 7 | x^2 | 0.80 | 0.6400 | 1.6000 |
| 8 | x^3 | 3.80 | 54.8720 | 43.3200 |
| 9 | sin(x) | -1.30 | -0.9636 | 0.2675 |
| 10 | e^x | 1.70 | 5.4739 | 5.4739 |
| 11 | ln(x) | 1.40 | 0.3365 | 0.7143 |
| 12 | cos(x) | -0.40 | 0.9211 | 0.3894 |
| 13 | x^2 | 2.50 | 6.2500 | 5.0000 |
| 14 | x^3 | -2.50 | -15.6250 | 18.7500 |
| 15 | sin(x) | 0.40 | 0.3894 | 0.9211 |
| 16 | e^x | 3.40 | 29.9641 | 29.9641 |
| 17 | ln(x) | 2.40 | 0.8755 | 0.4167 |
| 18 | cos(x) | 1.30 | 0.2675 | -0.9636 |
| 19 | x^2 | -3.80 | 14.4400 | -7.6000 |
| 20 | x^3 | -0.80 | -0.5120 | 1.9200 |


## Integrales

| # | Fonction | Methode | a | b | n | Somme de Riemann | Valeur | Erreur |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | x | gauche | -0.4 | 1.0 | 89 | 0.4090 | 0.4200 | 0.01101 |
| 2 | x^2 | droite | -3.6 | 1.1 | 29 | 15.0641 | 15.9957 | 0.93158 |
| 3 | sin(x) | milieu | -1.7 | 3.8 | 64 | 0.6623 | 0.6621 | 0.00020 |
| 4 | x^3 - x | trapeze | 0.1 | 1.7 | 100 | 0.6482 | 0.6480 | 0.00018 |
| 5 | e^x / 3 | gauche | -3.0 | 2.1 | 40 | 2.5367 | 2.7055 | 0.16881 |
| 6 | cos(x) | droite | -1.2 | -0.4 | 75 | 0.5456 | 0.5426 | 0.00297 |
| 7 | x | milieu | 0.7 | 2.4 | 15 | 2.6350 | 2.6350 | 8.882e-16 |
| 8 | x^2 | trapeze | -2.5 | 2.9 | 50 | 13.3485 | 13.3380 | 0.01050 |
| 9 | sin(x) | gauche | -0.6 | 0.6 | 86 | -0.0079 | 0.0000 | 0.00788 |
| 10 | x^3 - x | droite | -3.8 | 0.8 | 25 | -40.5707 | -45.1260 | 4.55532 |
| 11 | e^x / 3 | milieu | -1.9 | 3.6 | 61 | 12.1454 | 12.1496 | 0.00411 |
| 12 | cos(x) | trapeze | -0.1 | 1.5 | 96 | 1.0973 | 1.0973 | 2.540e-5 |
| 13 | x | gauche | -3.2 | 1.8 | 36 | -3.8472 | -3.5000 | 0.34722 |
| 14 | x^2 | droite | -1.4 | -0.8 | 71 | 0.7384 | 0.7440 | 0.00557 |
| 15 | sin(x) | milieu | 0.5 | 2.2 | 11 | 1.4675 | 1.4661 | 0.00146 |
| 16 | x^3 - x | trapeze | -2.7 | 2.6 | 46 | -1.5984 | -1.5966 | 0.00176 |
| 17 | e^x / 3 | gauche | -0.8 | 0.3 | 82 | 0.2982 | 0.3002 | 0.00201 |
| 18 | cos(x) | droite | -4.0 | 0.4 | 21 | -0.2011 | -0.3674 | 0.16631 |
| 19 | x | milieu | -2.1 | 3.4 | 57 | 3.5750 | 3.5750 | 2.665e-15 |
| 20 | x^2 | trapeze | -0.3 | 1.2 | 92 | 0.5851 | 0.5850 | 6.646e-5 |


## Serie de Taylor

| # | Fonction | Ordre | Approximation en x=10 | Valeur reelle en x=10 |
| --- | --- | --- | --- | --- |
| 1 | sin(x) | 2 | -156.6667 | -0.5440 |
| 2 | cos(x) | 9 | 121.7535 | -0.8391 |
| 3 | e^x | 16 | 20952.8870 | 22026.4658 |
| 4 | ln(1+x) | 4 | -2206.6667 | 2.3979 |
| 5 | 1/(1-x) | 11 | 1.111e+10 | -0.1111 |
| 6 | arctan(x) | 18 | -2.827e+33 | 1.4711 |
| 7 | sin(x) | 6 | -1056.9392 | -0.5440 |
| 8 | cos(x) | 13 | -0.6205 | -0.8391 |
| 9 | e^x | 1 | 1.0000 | 22026.4658 |
| 10 | ln(1+x) | 8 | -1.122e+7 | 2.3979 |
| 11 | 1/(1-x) | 15 | 1.111e+14 | -0.1111 |
| 12 | arctan(x) | 3 | 19676.6667 | 1.4711 |
| 13 | sin(x) | 10 | -16.8119 | -0.5440 |
| 14 | cos(x) | 18 | -0.8391 | -0.8391 |
| 15 | e^x | 5 | 644.3333 | 22026.4658 |
| 16 | ln(1+x) | 13 | 6.941e+11 | 2.3979 |
| 17 | 1/(1-x) | 20 | 1.111e+19 | -0.1111 |
| 18 | arctan(x) | 8 | -6.591e+13 | 1.4711 |
| 19 | sin(x) | 15 | -0.5429 | -0.5440 |
| 20 | cos(x) | 3 | 367.6667 | -0.8391 |


## Limites

| # | Fonction | Approche | f(x gauche) | Limite L | f(x droite ou approchee) |
| --- | --- | --- | --- | --- | --- |
| 1 | sin(x)/x | 1.8 | 0.93515 | 1.00000 | 0.93515 |
| 2 | (x^2-1)/(x-1) | 0.6 | 1.79000 | 2.00000 | 2.21000 |
| 3 | (1+1/n)^n | 1.3 | -- | 2.71828 | 2.64134 |
| 4 | x sin(1/x) | 2.0 | -0.00531 | 0.00000 | -0.00531 |
| 5 | sin(x)/x | 0.8 | 0.98698 | 1.00000 | 0.98698 |
| 6 | (x^2-1)/(x-1) | 1.5 | 1.47500 | 2.00000 | 2.52500 |
| 7 | (1+1/n)^n | 0.3 | -- | 2.71828 | 2.65088 |
| 8 | x sin(1/x) | 1.0 | -0.00531 | 0.00000 | -0.00531 |
| 9 | sin(x)/x | 1.7 | 0.94203 | 1.00000 | 0.94203 |
| 10 | (x^2-1)/(x-1) | 0.5 | 1.82500 | 2.00000 | 2.17500 |
| 11 | (1+1/n)^n | 1.2 | -- | 2.71828 | 2.64241 |
| 12 | x sin(1/x) | 1.9 | -0.00531 | 0.00000 | -0.00531 |
| 13 | sin(x)/x | 0.7 | 0.99003 | 1.00000 | 0.99003 |
| 14 | (x^2-1)/(x-1) | 1.4 | 1.51000 | 2.00000 | 2.49000 |
| 15 | (1+1/n)^n | 0.2 | -- | 2.71828 | 2.65171 |
| 16 | x sin(1/x) | 0.9 | -0.00531 | 0.00000 | -0.00531 |
| 17 | sin(x)/x | 1.6 | 0.94855 | 1.00000 | 0.94855 |
| 18 | (x^2-1)/(x-1) | 0.4 | 1.86000 | 2.00000 | 2.14000 |
| 19 | (1+1/n)^n | 1.1 | -- | 2.71828 | 2.64346 |
| 20 | x sin(1/x) | 1.8 | -0.00531 | 0.00000 | -0.00531 |


## Fourier

| # | Signal | Harmoniques | Pn(pi/2) | Coefficient max |
| --- | --- | --- | --- | --- |
| 1 | Carree | 2 | 1.2732 | 1.2732 |
| 2 | Dent de scie | 11 | 0.4737 | 0.6366 |
| 3 | Triangle | 20 | 0.9798 | 0.8106 |
| 4 | Carree | 5 | 1.1035 | 1.2732 |
| 5 | Dent de scie | 14 | 0.5226 | 0.6366 |
| 6 | Triangle | 23 | 0.9831 | 0.8106 |
| 7 | Carree | 8 | 0.9216 | 1.2732 |
| 8 | Dent de scie | 17 | 0.5176 | 0.6366 |
| 9 | Triangle | 1 | 0.8106 | 0.8106 |
| 10 | Carree | 10 | 1.0631 | 1.2732 |
| 11 | Dent de scie | 19 | 0.4841 | 0.6366 |
| 12 | Triangle | 4 | 0.9006 | 0.8106 |
| 13 | Carree | 13 | 1.0452 | 1.2732 |
| 14 | Dent de scie | 22 | 0.5144 | 0.6366 |
| 15 | Triangle | 7 | 0.9496 | 0.8106 |
| 16 | Carree | 16 | 0.9604 | 1.2732 |
| 17 | Dent de scie | 25 | 0.5122 | 0.6366 |
| 18 | Triangle | 9 | 0.9596 | 0.8106 |
| 19 | Carree | 18 | 1.0353 | 1.2732 |
| 20 | Dent de scie | 3 | 0.4244 | 0.6366 |


## Champ de pentes

| # | Equation | y0 | Pente initiale | Densite |
| --- | --- | --- | --- | --- |
| 1 | y' = x | 1.30 | 0.0000 | 8 |
| 2 | y' = y | -2.50 | -2.5000 | 16 |
| 3 | y' = x*y | -0.30 | 0.0000 | 22 |
| 4 | y' = sin(x) | 2.00 | 0.0000 | 10 |
| 5 | y' = -y | -1.80 | 1.8000 | 18 |
| 6 | y' = x-y | 0.40 | -0.4000 | 24 |
| 7 | y' = x | 2.60 | 0.0000 | 12 |
| 8 | y' = y | -1.20 | -1.2000 | 20 |
| 9 | y' = x*y | 1.10 | 0.0000 | 8 |
| 10 | y' = sin(x) | -2.80 | 0.0000 | 14 |
| 11 | y' = -y | -0.50 | 0.5000 | 22 |
| 12 | y' = x-y | 1.70 | -1.7000 | 10 |
| 13 | y' = x | -2.10 | 0.0000 | 16 |
| 14 | y' = y | 0.20 | 0.2000 | 24 |
| 15 | y' = x*y | 2.40 | 0.0000 | 12 |
| 16 | y' = sin(x) | -1.40 | 0.0000 | 18 |
| 17 | y' = -y | 0.80 | -0.8000 | 26 |
| 18 | y' = x-y | -3.00 | 3.0000 | 14 |
| 19 | y' = x | -0.80 | 0.0000 | 20 |
| 20 | y' = y | 1.50 | 1.5000 | 10 |


## Champ vectoriel

| # | Champ | x | y | Norme F | Rotation | Divergence | Particules |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Rotation | 1.3 | -1.7 | 2.1401 | 2 | nul | inactif |
| 2 | Gradient | -2.5 | 0.6 | 2.5710 | nul | 2 | actif |
| 3 | Selle | -0.3 | 2.8 | 2.8160 | nul | nul | actif |
| 4 | Tourbillon | 2.0 | -1.0 | 0.4066 | variable | nul | inactif |
| 5 | Dipole | -1.8 | 1.2 | 0.2089 | variable | variable | actif |
| 6 | Rotation | 0.4 | -2.6 | 2.6306 | 2 | nul | actif |
| 7 | Gradient | 2.6 | -0.3 | 2.6173 | nul | 2 | inactif |
| 8 | Selle | -1.2 | 1.9 | 2.2472 | nul | nul | actif |
| 9 | Tourbillon | 1.1 | -1.9 | 0.4127 | variable | nul | actif |
| 10 | Dipole | -2.8 | 0.3 | 0.1251 | variable | variable | inactif |
| 11 | Rotation | -0.5 | 2.6 | 2.6476 | 2 | nul | actif |
| 12 | Gradient | 1.7 | -1.2 | 2.0809 | nul | 2 | actif |
| 13 | Selle | -2.1 | 1.0 | 2.3259 | nul | nul | inactif |
| 14 | Tourbillon | 0.2 | -2.8 | 0.3350 | variable | nul | actif |
| 15 | Dipole | 2.4 | -0.6 | 0.1612 | variable | variable | actif |
| 16 | Rotation | -1.4 | 1.7 | 2.2023 | 2 | nul | inactif |
| 17 | Gradient | 0.8 | -2.2 | 2.3409 | nul | 2 | actif |
| 18 | Selle | -3.0 | 0.1 | 3.0017 | nul | nul | actif |
| 19 | Tourbillon | -0.8 | 2.3 | 0.3787 | variable | nul | inactif |
| 20 | Dipole | 1.5 | -1.5 | 0.2169 | variable | variable | actif |


## Series

| # | Serie | n | S(n) | Ecart avec limite |
| --- | --- | --- | --- | --- |
| 1 | Geometrique | 60 | 1.00000 | 1.00000 |
| 2 | Harmonique | 95 | 5.13635 | diverge |
| 3 | Bale | 35 | 1.61677 | 0.02817 |
| 4 | Alternee | 70 | 0.68606 | 0.00709 |
| 5 | Leibniz | 10 | -0.19192 | 0.97732 |
| 6 | Geometrique | 45 | 1.00000 | 1.00000 |
| 7 | Harmonique | 80 | 4.96548 | diverge |
| 8 | Bale | 20 | 1.59616 | 0.04877 |
| 9 | Alternee | 55 | 0.70216 | 0.00901 |
| 10 | Leibniz | 90 | -0.21185 | 0.99725 |
| 11 | Geometrique | 30 | 1.00000 | 1.00000 |
| 12 | Harmonique | 65 | 4.75928 | diverge |
| 13 | Bale | 5 | 1.46361 | 0.18132 |
| 14 | Alternee | 40 | 0.68080 | 0.01234 |
| 15 | Leibniz | 75 | -0.21789 | 1.00329 |
| 16 | Geometrique | 15 | 0.99997 | 1.00003 |
| 17 | Harmonique | 50 | 4.49921 | diverge |
| 18 | Bale | 85 | 1.63324 | 0.01170 |
| 19 | Alternee | 25 | 0.71275 | 0.01960 |
| 20 | Leibniz | 60 | -0.21050 | 0.99590 |


## Loi normale standard

| # | mu | sigma | a | b | P(a <= X <= b) | Variance |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1.3 | 0.9 | 0.31 | 3.37 | 85.36% | 0.81 |
| 2 | -2.5 | 1.9 | -2.88 | -0.98 | 36.74% | 3.61 |
| 3 | -0.3 | 2.9 | -5.52 | 4.63 | 91.95% | 8.41 |
| 4 | 2.0 | 1.2 | 0.92 | 2.12 | 35.58% | 1.44 |
| 5 | -1.8 | 2.2 | -7.08 | 0.40 | 83.31% | 4.84 |
| 6 | 0.4 | 0.5 | -0.35 | 1.35 | 90.45% | 0.25 |
| 7 | 2.6 | 1.5 | 1.70 | 3.20 | 38.12% | 2.25 |
| 8 | -1.2 | 2.5 | -6.45 | 2.05 | 88.53% | 6.25 |
| 9 | 1.1 | 0.8 | 0.14 | 2.86 | 87.10% | 0.64 |
| 10 | -2.8 | 1.8 | -3.34 | -1.54 | 37.59% | 3.24 |
| 11 | -0.5 | 2.8 | -5.82 | 3.98 | 91.65% | 7.84 |
| 12 | 1.7 | 1.1 | 0.60 | 4.45 | 83.51% | 1.21 |
| 13 | -2.1 | 2.1 | -7.35 | -0.21 | 80.97% | 4.41 |
| 14 | 0.2 | 0.4 | -0.44 | 0.92 | 90.93% | 0.16 |
| 15 | 2.4 | 1.4 | 1.42 | 2.82 | 37.59% | 1.96 |
| 16 | -1.4 | 2.4 | -6.68 | 1.48 | 87.10% | 5.76 |
| 17 | 0.8 | 0.7 | -0.11 | 2.27 | 88.53% | 0.49 |
| 18 | -3.0 | 1.7 | -3.68 | -1.98 | 38.12% | 2.89 |
| 19 | -0.8 | 2.7 | -6.20 | 3.25 | 91.04% | 7.29 |
| 20 | 1.5 | 1.0 | 0.40 | 3.90 | 85.61% | 1.00 |


## Loi de Student

| # | nu | alpha | t critique | P centrale estimee | Variance | Kurtosis |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 27 | 0.08 | +/- 1.705 | 90.04% | 1.080 | 0.261 |
| 2 | 8 | 0.16 | +/- 1.893 | 90.50% | 1.333 | 1.500 |
| 3 | 19 | 0.03 | +/- 2.100 | 95.07% | 1.118 | 0.400 |
| 4 | 30 | 0.11 | +/- 1.697 | 90.00% | 1.071 | 0.231 |
| 5 | 12 | 0.18 | +/- 1.795 | 90.21% | 1.200 | 0.750 |
| 6 | 22 | 0.06 | +/- 2.077 | 95.03% | 1.100 | 0.333 |
| 7 | 4 | 0.13 | +/- 2.184 | 90.57% | 2.000 | infini |
| 8 | 15 | 0.20 | +/- 1.768 | 90.27% | 1.154 | 0.545 |
| 9 | 26 | 0.08 | +/- 1.708 | 90.05% | 1.083 | 0.273 |
| 10 | 7 | 0.15 | +/- 1.934 | 90.56% | 1.400 | 2.000 |
| 11 | 18 | 0.03 | +/- 2.114 | 95.13% | 1.125 | 0.429 |
| 12 | 29 | 0.10 | +/- 1.700 | 90.02% | 1.074 | 0.240 |
| 13 | 10 | 0.17 | +/- 1.812 | 89.99% | 1.250 | 1.000 |
| 14 | 21 | 0.05 | +/- 2.082 | 95.02% | 1.105 | 0.353 |
| 15 | 3 | 0.12 | +/- 2.353 | 90.00% | 3.000 | infini |
| 16 | 14 | 0.19 | +/- 1.777 | 90.27% | 1.167 | 0.600 |
| 17 | 24 | 0.07 | +/- 2.068 | 95.05% | 1.091 | 0.300 |
| 18 | 6 | 0.14 | +/- 1.974 | 90.42% | 1.500 | 3.000 |
| 19 | 17 | 0.02 | +/- 2.942 | 99.09% | 1.133 | 0.462 |
| 20 | 28 | 0.09 | +/- 1.703 | 90.03% | 1.077 | 0.250 |


## Gravite

| # | m1 kg | m2 kg | distance m | Force | a1 | a2 | Etat |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 4.364e+8 | 4.041e+7 | 39395 | 0.0008 N | 1.738e-12 | 1.877e-11 | Force faible |
| 2 | 7.354e+8 | 3.394e+8 | 76768 | 0.0028 N | 3.844e-12 | 8.328e-12 | Force faible |
| 3 | 2.263e+8 | 6.384e+8 | 13132 | 0.0559 N | 2.471e-10 | 8.757e-11 | Force faible |
| 4 | 5.253e+8 | 1.293e+8 | 50506 | 0.0018 N | 3.383e-12 | 1.374e-11 | Force faible |
| 5 | 1.617e+7 | 4.283e+8 | 87879 | 5.986e-5 N | 3.701e-12 | 1.398e-13 | Force faible |
| 6 | 3.152e+8 | 7.273e+8 | 24243 | 0.0260 N | 8.259e-11 | 3.579e-11 | Force faible |
| 7 | 6.141e+8 | 2.182e+8 | 61617 | 0.0024 N | 3.836e-12 | 1.080e-11 | Force faible |
| 8 | 1.051e+8 | 5.172e+8 | 98990 | 0.0004 N | 3.523e-12 | 7.156e-13 | Force faible |
| 9 | 4.040e+8 | 8.091e+6 | 35354 | 0.0002 N | 4.320e-13 | 2.158e-11 | Force faible |
| 10 | 7.030e+8 | 3.071e+8 | 72728 | 0.0027 N | 3.875e-12 | 8.871e-12 | Force faible |
| 11 | 1.939e+8 | 6.061e+8 | 9092 | 0.0949 N | 4.893e-10 | 1.566e-10 | Force faible |
| 12 | 4.929e+8 | 9.698e+7 | 46465 | 0.0015 N | 2.998e-12 | 1.524e-11 | Force faible |
| 13 | 7.919e+8 | 3.960e+8 | 83839 | 0.0030 N | 3.760e-12 | 7.520e-12 | Force faible |
| 14 | 2.828e+8 | 6.950e+8 | 20203 | 0.0321 N | 1.136e-10 | 4.625e-11 | Force faible |
| 15 | 5.818e+8 | 1.859e+8 | 57576 | 0.0022 N | 3.742e-12 | 1.171e-11 | Force faible |
| 16 | 7.274e+7 | 4.849e+8 | 94950 | 0.0003 N | 3.589e-12 | 5.385e-13 | Force faible |
| 17 | 3.717e+8 | 7.838e+8 | 31314 | 0.0198 N | 5.335e-11 | 2.530e-11 | Force faible |
| 18 | 6.707e+8 | 2.748e+8 | 68687 | 0.0026 N | 3.887e-12 | 9.488e-12 | Force faible |
| 19 | 1.616e+8 | 5.737e+8 | 5051 | 0.2426 N | 1.501e-9 | 4.228e-10 | Force faible |
| 20 | 4.606e+8 | 6.466e+7 | 42425 | 0.0011 N | 2.398e-12 | 1.708e-11 | Force faible |


## Pendule

| # | Longueur cm | Gravite | Angle initial | Cycle complet | Vitesse ang. | Angle |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 150 | 2.0 | 47.0 deg | 5.44 s | 0.00 rad/s | 47.0 deg |
| 2 | 230 | 9.1 | 75.0 deg | 3.16 s | 0.00 rad/s | 75.0 deg |
| 3 | 90 | 16.2 | 28.0 deg | 1.48 s | 0.00 rad/s | 28.0 deg |
| 4 | 175 | 4.1 | 56.0 deg | 4.10 s | 0.00 rad/s | 56.0 deg |
| 5 | 35 | 11.2 | 8.0 deg | 1.11 s | 0.00 rad/s | 8.0 deg |
| 6 | 115 | 18.3 | 36.0 deg | 1.58 s | 0.00 rad/s | 36.0 deg |
| 7 | 200 | 6.2 | 64.0 deg | 3.57 s | 0.00 rad/s | 64.0 deg |
| 8 | 60 | 13.3 | 16.0 deg | 1.33 s | 0.00 rad/s | 16.0 deg |
| 9 | 140 | 1.2 | 44.0 deg | 6.79 s | 0.00 rad/s | 44.0 deg |
| 10 | 225 | 8.3 | 72.0 deg | 3.27 s | 0.00 rad/s | 72.0 deg |
| 11 | 85 | 15.4 | 25.0 deg | 1.48 s | 0.00 rad/s | 25.0 deg |
| 12 | 165 | 3.3 | 53.0 deg | 4.44 s | 0.00 rad/s | 53.0 deg |
| 13 | 250 | 10.4 | 5.0 deg | 3.08 s | 0.00 rad/s | 5.0 deg |
| 14 | 110 | 17.5 | 33.0 deg | 1.58 s | 0.00 rad/s | 33.0 deg |
| 15 | 190 | 5.4 | 61.0 deg | 3.73 s | 0.00 rad/s | 61.0 deg |
| 16 | 50 | 12.5 | 13.0 deg | 1.26 s | 0.00 rad/s | 13.0 deg |
| 17 | 130 | 19.6 | 41.0 deg | 1.62 s | 0.00 rad/s | 41.0 deg |
| 18 | 215 | 7.5 | 69.0 deg | 3.36 s | 0.00 rad/s | 69.0 deg |
| 19 | 75 | 14.6 | 22.0 deg | 1.42 s | 0.00 rad/s | 22.0 deg |
| 20 | 155 | 2.5 | 50.0 deg | 4.95 s | 0.00 rad/s | 50.0 deg |


## Mouvement projectile

| # | Vitesse | Angle | Gravite | Portee | Hauteur max | Temps vol |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 59 m/s | 37 deg | 15.0 | 223.08 m | 42.03 m | 4.73 s |
| 2 | 11 m/s | 66 deg | 2.9 | 31.01 m | 17.41 m | 6.93 s |
| 3 | 39 m/s | 16 deg | 10.0 | 80.60 m | 5.78 m | 2.15 s |
| 4 | 67 m/s | 45 deg | 17.1 | 262.51 m | 65.63 m | 5.54 s |
| 5 | 19 m/s | 75 deg | 5.0 | 36.10 m | 33.68 m | 7.34 s |
| 6 | 47 m/s | 24 deg | 12.1 | 135.67 m | 15.10 m | 3.16 s |
| 7 | 75 m/s | 54 deg | 19.2 | 278.63 m | 95.88 m | 6.32 s |
| 8 | 28 m/s | 84 deg | 7.1 | 22.96 m | 54.61 m | 7.84 s |
| 9 | 56 m/s | 33 deg | 14.2 | 201.75 m | 32.75 m | 4.30 s |
| 10 | 8 m/s | 63 deg | 2.2 | 23.54 m | 11.55 m | 6.48 s |
| 11 | 36 m/s | 12 deg | 9.3 | 56.68 m | 3.01 m | 1.61 s |
| 12 | 64 m/s | 42 deg | 16.4 | 248.39 m | 55.91 m | 5.22 s |
| 13 | 16 m/s | 72 deg | 4.3 | 34.99 m | 26.92 m | 7.08 s |
| 14 | 44 m/s | 21 deg | 11.4 | 113.63 m | 10.91 m | 2.77 s |
| 15 | 72 m/s | 51 deg | 18.5 | 274.09 m | 84.62 m | 6.05 s |
| 16 | 25 m/s | 81 deg | 6.4 | 30.18 m | 47.63 m | 7.72 s |
| 17 | 53 m/s | 30 deg | 13.5 | 180.20 m | 26.01 m | 3.93 s |
| 18 | 5 m/s | 60 deg | 1.4 | 15.46 m | 6.70 m | 6.19 s |
| 19 | 33 m/s | 9 deg | 8.5 | 39.59 m | 1.57 m | 1.21 s |
| 20 | 61 m/s | 39 deg | 15.6 | 233.31 m | 47.23 m | 4.92 s |


## Ressort et loi de Hooke

| # | k | m | Amplitude | Amortissement | Deplacement actuel | Force de rappel | Periode |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 11.5 N/m | 4.5 kg | 30 px | 0.28 | 0.30 m | -3.45 N | 3.931 s |
| 2 | 18.5 N/m | 1.4 kg | 65 px | 0.47 | 0.65 m | -12.03 N | 1.730 s |
| 3 | 6.5 N/m | 3.2 kg | 95 px | 0.15 | 0.95 m | -6.17 N | 4.409 s |
| 4 | 13.5 N/m | 5.0 kg | 40 px | 0.34 | 0.40 m | -5.40 N | 3.825 s |
| 5 | 1.5 N/m | 1.9 kg | 75 px | 0.02 | 0.75 m | -1.13 N | 7.072 s |
| 6 | 8.5 N/m | 3.7 kg | 15 px | 0.21 | 0.15 m | -1.27 N | 4.146 s |
| 7 | 15.5 N/m | 0.7 kg | 50 px | 0.39 | 0.50 m | -7.75 N | 1.338 s |
| 8 | 3.5 N/m | 2.5 kg | 85 px | 0.08 | 0.85 m | -2.98 N | 5.311 s |
| 9 | 10.5 N/m | 4.3 kg | 25 px | 0.26 | 0.25 m | -2.63 N | 4.022 s |
| 10 | 17.5 N/m | 1.2 kg | 60 px | 0.45 | 0.60 m | -10.50 N | 1.647 s |
| 11 | 5.5 N/m | 3.0 kg | 95 px | 0.13 | 0.95 m | -5.22 N | 4.641 s |
| 12 | 12.5 N/m | 4.8 kg | 35 px | 0.32 | 0.35 m | -4.38 N | 3.894 s |
| 13 | 20.0 N/m | 1.8 kg | 70 px | 0.00 | 0.70 m | -14.00 N | 1.885 s |
| 14 | 7.5 N/m | 3.5 kg | 15 px | 0.19 | 0.15 m | -1.13 N | 4.293 s |
| 15 | 15.0 N/m | 0.5 kg | 45 px | 0.37 | 0.45 m | -6.75 N | 1.150 s |
| 16 | 2.5 N/m | 2.3 kg | 80 px | 0.06 | 0.80 m | -2.00 N | 6.027 s |
| 17 | 10.0 N/m | 4.1 kg | 25 px | 0.24 | 0.25 m | -2.50 N | 4.024 s |
| 18 | 17.0 N/m | 1.0 kg | 55 px | 0.43 | 0.55 m | -9.35 N | 1.526 s |
| 19 | 5.0 N/m | 2.8 kg | 90 px | 0.11 | 0.90 m | -4.50 N | 4.702 s |
| 20 | 12.0 N/m | 4.6 kg | 35 px | 0.30 | 0.35 m | -4.20 N | 3.891 s |


## Mouvement circulaire

| # | omega | rayon | masse | Force centripete | Vitesse | Periode | Acceleration |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 4.4 rad/s | 35 cm | 2.0 kg | 13.55 N | 1.54 m/s | 1.43 s | 6.78 m/s2 |
| 2 | 0.9 rad/s | 70 cm | 3.9 kg | 2.21 N | 0.63 m/s | 6.98 s | 0.57 m/s2 |
| 3 | 3.0 rad/s | 100 cm | 0.7 kg | 6.30 N | 3.00 m/s | 2.09 s | 9.00 m/s2 |
| 4 | 5.1 rad/s | 45 cm | 2.6 kg | 30.43 N | 2.30 m/s | 1.23 s | 11.70 m/s2 |
| 5 | 1.6 rad/s | 80 cm | 4.4 kg | 9.01 N | 1.28 m/s | 3.93 s | 2.05 m/s2 |
| 6 | 3.6 rad/s | 110 cm | 1.3 kg | 18.53 N | 3.96 m/s | 1.75 s | 14.26 m/s2 |
| 7 | 5.7 rad/s | 55 cm | 3.1 kg | 55.40 N | 3.14 m/s | 1.10 s | 17.87 m/s2 |
| 8 | 2.2 rad/s | 90 cm | 5.0 kg | 21.78 N | 1.98 m/s | 2.86 s | 4.36 m/s2 |
| 9 | 4.2 rad/s | 30 cm | 1.8 kg | 9.53 N | 1.26 m/s | 1.50 s | 5.29 m/s2 |
| 10 | 0.7 rad/s | 65 cm | 3.7 kg | 1.18 N | 0.46 m/s | 8.98 s | 0.32 m/s2 |
| 11 | 2.8 rad/s | 100 cm | 0.5 kg | 3.92 N | 2.80 m/s | 2.24 s | 7.84 m/s2 |
| 12 | 4.8 rad/s | 40 cm | 2.4 kg | 22.12 N | 1.92 m/s | 1.31 s | 9.22 m/s2 |
| 13 | 1.3 rad/s | 75 cm | 4.2 kg | 5.32 N | 0.98 m/s | 4.83 s | 1.27 m/s2 |
| 14 | 3.4 rad/s | 110 cm | 1.1 kg | 13.99 N | 3.74 m/s | 1.85 s | 12.72 m/s2 |
| 15 | 5.4 rad/s | 50 cm | 2.9 kg | 42.28 N | 2.70 m/s | 1.16 s | 14.58 m/s2 |
| 16 | 1.9 rad/s | 85 cm | 4.8 kg | 14.73 N | 1.61 m/s | 3.31 s | 3.07 m/s2 |
| 17 | 4.0 rad/s | 120 cm | 1.6 kg | 30.72 N | 4.80 m/s | 1.57 s | 19.20 m/s2 |
| 18 | 0.5 rad/s | 60 cm | 3.5 kg | 0.53 N | 0.30 m/s | 12.57 s | 0.15 m/s2 |
| 19 | 2.6 rad/s | 95 cm | 0.3 kg | 1.93 N | 2.47 m/s | 2.42 s | 6.42 m/s2 |
| 20 | 4.6 rad/s | 35 cm | 2.2 kg | 16.29 N | 1.61 m/s | 1.37 s | 7.41 m/s2 |


## Champs magnetiques

| # | Nombre de fils | Courant | Champ d un fil a 8 cm | Superposition | Champ total selectionne |
| --- | --- | --- | --- | --- | --- |
| 1 | 4 | 0.6 A | 1.50 uT | 4 fils | non selectionne |
| 2 | 6 | 1.6 A | 4.00 uT | 6 fils | non selectionne |
| 3 | 2 | 2.5 A | 6.25 uT | 2 fils | non selectionne |
| 4 | 4 | 0.9 A | 2.25 uT | 4 fils | non selectionne |
| 5 | 1 | 1.8 A | 4.50 uT | 1 fils | non selectionne |
| 6 | 3 | 2.8 A | 7.00 uT | 3 fils | non selectionne |
| 7 | 5 | 1.2 A | 3.00 uT | 5 fils | non selectionne |
| 8 | 2 | 2.1 A | 5.25 uT | 2 fils | non selectionne |
| 9 | 4 | 0.5 A | 1.25 uT | 4 fils | non selectionne |
| 10 | 5 | 1.5 A | 3.75 uT | 5 fils | non selectionne |
| 11 | 2 | 2.4 A | 6.00 uT | 2 fils | non selectionne |
| 12 | 4 | 0.8 A | 2.00 uT | 4 fils | non selectionne |
| 13 | 6 | 1.7 A | 4.25 uT | 6 fils | non selectionne |
| 14 | 3 | 2.7 A | 6.75 uT | 3 fils | non selectionne |
| 15 | 5 | 1.1 A | 2.75 uT | 5 fils | non selectionne |
| 16 | 1 | 2.0 A | 5.00 uT | 1 fils | non selectionne |
| 17 | 3 | 2.9 A | 7.25 uT | 3 fils | non selectionne |
| 18 | 5 | 1.4 A | 3.50 uT | 5 fils | non selectionne |
| 19 | 2 | 2.3 A | 5.75 uT | 2 fils | non selectionne |
| 20 | 4 | 0.7 A | 1.75 uT | 4 fils | non selectionne |


## Champs electriques

| # | Configuration | Charges + | Charges - | Champ total au centre | Champ total selectionne |
| --- | --- | --- | --- | --- | --- |
| 1 | Dipole | 1 | 1 | 1.600e+6 N/C | non selectionne |
| 2 | Deux positives | 2 | 0 | 0.00 N/C | non selectionne |
| 3 | Quadrupole | 2 | 2 | 0.00 N/C | non selectionne |
| 4 | Charge seule | 1 | 0 | 3.200e+6 N/C | non selectionne |
| 5 | Dipole | 1 | 1 | 1.600e+6 N/C | non selectionne |
| 6 | Deux positives | 2 | 0 | 0.00 N/C | non selectionne |
| 7 | Quadrupole | 2 | 2 | 0.00 N/C | non selectionne |
| 8 | Charge seule | 1 | 0 | 3.200e+6 N/C | non selectionne |
| 9 | Dipole | 1 | 1 | 1.600e+6 N/C | non selectionne |
| 10 | Deux positives | 2 | 0 | 0.00 N/C | non selectionne |
| 11 | Quadrupole | 2 | 2 | 0.00 N/C | non selectionne |
| 12 | Charge seule | 1 | 0 | 3.200e+6 N/C | non selectionne |
| 13 | Dipole | 1 | 1 | 1.600e+6 N/C | non selectionne |
| 14 | Deux positives | 2 | 0 | 0.00 N/C | non selectionne |
| 15 | Quadrupole | 2 | 2 | 0.00 N/C | non selectionne |
| 16 | Charge seule | 1 | 0 | 3.200e+6 N/C | non selectionne |
| 17 | Dipole | 1 | 1 | 1.600e+6 N/C | non selectionne |
| 18 | Deux positives | 2 | 0 | 0.00 N/C | non selectionne |
| 19 | Quadrupole | 2 | 2 | 0.00 N/C | non selectionne |
| 20 | Charge seule | 1 | 0 | 3.200e+6 N/C | non selectionne |


## Optique et refraction

| # | n1 | n2 | Angle incident | Angle refracte | Angle critique | Etat | Angle reflechi | Deviation | Direction |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 1.80 | 1.10 | 66 deg | -- | 37.7 deg | Reflexion totale interne | 66.0 deg | -- | Reflexion totale interne |
| 2 | 2.40 | 1.65 | 10 deg | 14.6 deg | 43.4 deg | Refraction | 10.0 deg | 4.6 deg | Loin de la normale |
| 3 | 1.40 | 2.20 | 43 deg | 25.7 deg | Aucun | Refraction | 43.0 deg | 17.3 deg | Vers la normale |
| 4 | 2.00 | 1.25 | 76 deg | -- | 38.7 deg | Reflexion totale interne | 76.0 deg | -- | Reflexion totale interne |
| 5 | 1.05 | 1.80 | 20 deg | 11.5 deg | Aucun | Refraction | 20.0 deg | 8.5 deg | Vers la normale |
| 6 | 1.60 | 2.35 | 53 deg | 32.9 deg | Aucun | Refraction | 53.0 deg | 20.1 deg | Vers la normale |
| 7 | 2.15 | 1.40 | 85 deg | -- | 40.6 deg | Reflexion totale interne | 85.0 deg | -- | Reflexion totale interne |
| 8 | 1.20 | 1.95 | 29 deg | 17.4 deg | Aucun | Refraction | 29.0 deg | 11.6 deg | Vers la normale |
| 9 | 1.75 | 1.00 | 62 deg | -- | 34.8 deg | Reflexion totale interne | 62.0 deg | -- | Reflexion totale interne |
| 10 | 2.30 | 1.60 | 6 deg | 8.6 deg | 44.1 deg | Refraction | 6.0 deg | 2.6 deg | Loin de la normale |
| 11 | 1.35 | 2.15 | 39 deg | 23.3 deg | Aucun | Refraction | 39.0 deg | 15.7 deg | Vers la normale |
| 12 | 1.90 | 1.20 | 72 deg | -- | 39.2 deg | Reflexion totale interne | 72.0 deg | -- | Reflexion totale interne |
| 13 | 2.50 | 1.75 | 16 deg | 23.2 deg | 44.4 deg | Refraction | 16.0 deg | 7.2 deg | Loin de la normale |
| 14 | 1.55 | 2.30 | 49 deg | 30.6 deg | Aucun | Refraction | 49.0 deg | 18.4 deg | Vers la normale |
| 15 | 2.10 | 1.35 | 82 deg | -- | 40.0 deg | Reflexion totale interne | 82.0 deg | -- | Reflexion totale interne |
| 16 | 1.15 | 1.90 | 26 deg | 15.4 deg | Aucun | Refraction | 26.0 deg | 10.6 deg | Vers la normale |
| 17 | 1.70 | 2.45 | 59 deg | 36.5 deg | Aucun | Refraction | 59.0 deg | 22.5 deg | Vers la normale |
| 18 | 2.25 | 1.50 | 3 deg | 4.5 deg | 41.8 deg | Refraction | 3.0 deg | 1.5 deg | Loin de la normale |
| 19 | 1.30 | 2.10 | 36 deg | 21.3 deg | Aucun | Refraction | 36.0 deg | 14.7 deg | Vers la normale |
| 20 | 1.85 | 1.10 | 69 deg | -- | 36.5 deg | Reflexion totale interne | 69.0 deg | -- | Reflexion totale interne |


## Mecanique orbitale

| # | Masse astre | Excentricite | Phase | Perihelie | Aphelie | Demi-grand axe | Distance actuelle | Vitesse actuelle | Periode orbitale |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 59 u | 0.80 | 1.40 | 30.6 u | 275.4 u | 153.0 u | 48.5 u | 1.43 u/s | 1548.1 s |
| 2 | 93 u | 0.25 | 3.74 | 114.8 u | 191.3 u | 153.0 u | 180.8 u | 0.65 u/s | 1233.0 s |
| 3 | 35 u | 0.55 | 6.09 | 68.8 u | 237.2 u | 153.0 u | 69.3 u | 0.88 u/s | 2009.9 s |
| 4 | 69 u | 0.90 | 2.09 | 15.3 u | 290.7 u | 153.0 u | 52.5 u | 1.48 u/s | 1431.5 s |
| 5 | 12 u | 0.35 | 4.44 | 99.4 u | 206.6 u | 153.0 u | 148.2 u | 0.29 u/s | 3432.6 s |
| 6 | 45 u | 0.65 | 0.44 | 53.5 u | 252.4 u | 153.0 u | 55.6 u | 1.15 u/s | 1772.6 s |
| 7 | 79 u | 0.10 | 2.79 | 137.7 u | 168.3 u | 153.0 u | 167.2 u | 0.65 u/s | 1337.8 s |
| 8 | 22 u | 0.45 | 5.14 | 84.2 u | 221.8 u | 153.0 u | 102.8 u | 0.53 u/s | 2535.2 s |
| 9 | 55 u | 0.75 | 1.14 | 38.3 u | 267.8 u | 153.0 u | 51.0 u | 1.34 u/s | 1603.4 s |
| 10 | 89 u | 0.20 | 3.49 | 122.4 u | 183.6 u | 153.0 u | 180.9 u | 0.63 u/s | 1260.4 s |
| 11 | 32 u | 0.55 | 5.84 | 68.8 u | 237.2 u | 153.0 u | 71.3 u | 0.83 u/s | 2102.0 s |
| 12 | 65 u | 0.85 | 1.84 | 22.9 u | 283.1 u | 153.0 u | 54.9 u | 1.39 u/s | 1474.9 s |
| 13 | 99 u | 0.30 | 4.19 | 107.1 u | 198.9 u | 153.0 u | 163.7 u | 0.75 u/s | 1195.1 s |
| 14 | 42 u | 0.65 | 0.19 | 53.5 u | 252.4 u | 153.0 u | 53.9 u | 1.13 u/s | 1834.8 s |
| 15 | 75 u | 0.05 | 2.54 | 145.3 u | 160.7 u | 153.0 u | 159.2 u | 0.67 u/s | 1373.1 s |
| 16 | 18 u | 0.40 | 4.89 | 91.8 u | 214.2 u | 153.0 u | 120.0 u | 0.43 u/s | 2802.7 s |
| 17 | 52 u | 0.75 | 0.89 | 38.3 u | 267.8 u | 153.0 u | 45.5 u | 1.40 u/s | 1649.0 s |
| 18 | 85 u | 0.15 | 3.24 | 130.0 u | 175.9 u | 153.0 u | 175.8 u | 0.64 u/s | 1289.8 s |
| 19 | 28 u | 0.50 | 5.59 | 76.5 u | 229.5 u | 153.0 u | 82.9 u | 0.70 u/s | 2247.2 s |
| 20 | 62 u | 0.85 | 1.59 | 22.9 u | 283.1 u | 153.0 u | 43.2 u | 1.57 u/s | 1510.2 s |


## Frottement

| # | Masse | Force appliquee | mu_s | mu_k | Force normale | Force minimale | Frottement actuel | Force nette | Acceleration | Etat |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 27.5 kg | 25.0 N | 0.40 | 0.40 | 269.5 N | 107.8 N | 25.0 N | 0.0 N | 0.00 m/s2 | Au repos |
| 2 | 46.0 kg | 210.0 N | 0.80 | 0.10 | 450.8 N | 360.6 N | 210.0 N | 0.0 N | 0.00 m/s2 | Au repos |
| 3 | 15.0 kg | 400.0 N | 0.15 | 0.15 | 147.0 N | 22.1 N | 22.1 N | 377.9 N | 25.20 m/s2 | En mouvement |
| 4 | 33.0 kg | 80.0 N | 0.55 | 0.55 | 323.4 N | 177.9 N | 80.0 N | 0.0 N | 0.00 m/s2 | Au repos |
| 5 | 2.0 kg | 270.0 N | 0.90 | 0.20 | 19.6 N | 17.6 N | 3.9 N | 266.1 N | 133.04 m/s2 | En mouvement |
| 6 | 20.5 kg | 455.0 N | 0.30 | 0.30 | 200.9 N | 60.3 N | 60.3 N | 394.7 N | 19.26 m/s2 | En mouvement |
| 7 | 38.5 kg | 135.0 N | 0.65 | 0.65 | 377.3 N | 245.2 N | 135.0 N | 0.0 N | 0.00 m/s2 | Au repos |
| 8 | 7.5 kg | 325.0 N | 1.00 | 0.25 | 73.5 N | 73.5 N | 18.4 N | 306.6 N | 40.88 m/s2 | En mouvement |
| 9 | 25.5 kg | 5.0 N | 0.40 | 0.40 | 249.9 N | 100.0 N | 5.0 N | 0.0 N | 0.00 m/s2 | Au repos |
| 10 | 44.0 kg | 190.0 N | 0.75 | 0.05 | 431.2 N | 323.4 N | 190.0 N | 0.0 N | 0.00 m/s2 | Au repos |
| 11 | 13.0 kg | 380.0 N | 0.15 | 0.15 | 127.4 N | 19.1 N | 19.1 N | 360.9 N | 27.76 m/s2 | En mouvement |
| 12 | 31.0 kg | 60.0 N | 0.50 | 0.50 | 303.8 N | 151.9 N | 60.0 N | 0.0 N | 0.00 m/s2 | Au repos |
| 13 | 49.5 kg | 245.0 N | 0.85 | 0.15 | 485.1 N | 412.3 N | 245.0 N | 0.0 N | 0.00 m/s2 | Au repos |
| 14 | 18.5 kg | 435.0 N | 0.25 | 0.25 | 181.3 N | 45.3 N | 45.3 N | 389.7 N | 21.06 m/s2 | En mouvement |
| 15 | 36.5 kg | 115.0 N | 0.60 | 0.60 | 357.7 N | 214.6 N | 115.0 N | 0.0 N | 0.00 m/s2 | Au repos |
| 16 | 5.5 kg | 305.0 N | 0.95 | 0.25 | 53.9 N | 51.2 N | 13.5 N | 291.5 N | 53.00 m/s2 | En mouvement |
| 17 | 24.0 kg | 490.0 N | 0.35 | 0.35 | 235.2 N | 82.3 N | 82.3 N | 407.7 N | 16.99 m/s2 | En mouvement |
| 18 | 42.0 kg | 170.0 N | 0.70 | 0.05 | 411.6 N | 288.1 N | 170.0 N | 0.0 N | 0.00 m/s2 | Au repos |
| 19 | 11.0 kg | 360.0 N | 0.10 | 0.10 | 107.8 N | 10.8 N | 10.8 N | 349.2 N | 31.75 m/s2 | En mouvement |
| 20 | 29.0 kg | 40.0 N | 0.45 | 0.45 | 284.2 N | 127.9 N | 40.0 N | 0.0 N | 0.00 m/s2 | Au repos |


## Tri a bulles

| # | Taille | Cas | Comparaisons | Echanges/deplacements |
| --- | --- | --- | --- | --- |
| 1 | 11 | aleatoire | 55 | 27 |
| 2 | 16 | meilleur | 120 | 0 |
| 3 | 8 | pire | 28 | 28 |
| 4 | 13 | aleatoire | 78 | 45 |
| 5 | 18 | meilleur | 153 | 0 |
| 6 | 9 | pire | 36 | 36 |
| 7 | 14 | aleatoire | 91 | 21 |
| 8 | 20 | meilleur | 190 | 0 |
| 9 | 11 | pire | 55 | 55 |
| 10 | 16 | aleatoire | 120 | 56 |
| 11 | 7 | meilleur | 21 | 0 |
| 12 | 12 | pire | 66 | 66 |
| 13 | 17 | aleatoire | 136 | 63 |
| 14 | 9 | meilleur | 36 | 0 |
| 15 | 14 | pire | 91 | 91 |
| 16 | 19 | aleatoire | 171 | 90 |
| 17 | 10 | meilleur | 45 | 0 |
| 18 | 15 | pire | 105 | 105 |
| 19 | 6 | aleatoire | 15 | 0 |
| 20 | 12 | meilleur | 66 | 0 |


## Tri par selection

| # | Taille | Cas | Comparaisons | Echanges/deplacements |
| --- | --- | --- | --- | --- |
| 1 | 14 | aleatoire | 91 | 6 |
| 2 | 19 | meilleur | 171 | 0 |
| 3 | 10 | pire | 45 | 5 |
| 4 | 15 | aleatoire | 105 | 9 |
| 5 | 6 | meilleur | 15 | 0 |
| 6 | 12 | pire | 66 | 6 |
| 7 | 17 | aleatoire | 136 | 15 |
| 8 | 8 | meilleur | 28 | 0 |
| 9 | 13 | pire | 78 | 6 |
| 10 | 18 | aleatoire | 153 | 13 |
| 11 | 9 | meilleur | 36 | 0 |
| 12 | 15 | pire | 105 | 7 |
| 13 | 20 | aleatoire | 190 | 13 |
| 14 | 11 | meilleur | 55 | 0 |
| 15 | 16 | pire | 120 | 8 |
| 16 | 7 | aleatoire | 21 | 0 |
| 17 | 13 | meilleur | 78 | 0 |
| 18 | 18 | pire | 153 | 9 |
| 19 | 9 | aleatoire | 36 | 4 |
| 20 | 14 | meilleur | 91 | 0 |


## Tri par insertion

| # | Taille | Cas | Comparaisons | Echanges/deplacements |
| --- | --- | --- | --- | --- |
| 1 | 16 | aleatoire | 72 | 57 |
| 2 | 7 | meilleur | 6 | 0 |
| 3 | 12 | pire | 66 | 66 |
| 4 | 18 | aleatoire | 95 | 81 |
| 5 | 9 | meilleur | 8 | 0 |
| 6 | 14 | pire | 91 | 91 |
| 7 | 19 | aleatoire | 105 | 90 |
| 8 | 10 | meilleur | 9 | 0 |
| 9 | 15 | pire | 105 | 105 |
| 10 | 7 | aleatoire | 6 | 0 |
| 11 | 12 | meilleur | 11 | 0 |
| 12 | 17 | pire | 136 | 136 |
| 13 | 8 | aleatoire | 16 | 13 |
| 14 | 13 | meilleur | 12 | 0 |
| 15 | 19 | pire | 171 | 171 |
| 16 | 10 | aleatoire | 30 | 23 |
| 17 | 15 | meilleur | 14 | 0 |
| 18 | 6 | pire | 15 | 15 |
| 19 | 11 | aleatoire | 43 | 37 |
| 20 | 16 | meilleur | 15 | 0 |


## Tri fusion

| # | Taille | Cas | Comparaisons | Echanges/deplacements |
| --- | --- | --- | --- | --- |
| 1 | 18 | aleatoire | 58 | 58 |
| 2 | 10 | meilleur | 15 | 15 |
| 3 | 15 | pire | 31 | 31 |
| 4 | 20 | aleatoire | 67 | 67 |
| 5 | 11 | meilleur | 17 | 17 |
| 6 | 16 | pire | 32 | 32 |
| 7 | 7 | aleatoire | 9 | 9 |
| 8 | 13 | meilleur | 22 | 22 |
| 9 | 18 | pire | 41 | 41 |
| 10 | 9 | aleatoire | 21 | 21 |
| 11 | 14 | meilleur | 25 | 25 |
| 12 | 19 | pire | 45 | 45 |
| 13 | 11 | aleatoire | 28 | 28 |
| 14 | 16 | meilleur | 32 | 32 |
| 15 | 7 | pire | 11 | 11 |
| 16 | 12 | aleatoire | 30 | 30 |
| 17 | 17 | meilleur | 33 | 33 |
| 18 | 8 | pire | 12 | 12 |
| 19 | 14 | aleatoire | 36 | 36 |
| 20 | 19 | meilleur | 37 | 37 |


## Tri rapide

| # | Taille | Cas | Comparaisons | Echanges/deplacements |
| --- | --- | --- | --- | --- |
| 1 | 7 | aleatoire | 21 | 27 |
| 2 | 12 | meilleur | 66 | 77 |
| 3 | 17 | pire | 136 | 80 |
| 4 | 8 | aleatoire | 18 | 14 |
| 5 | 13 | meilleur | 78 | 90 |
| 6 | 19 | pire | 171 | 99 |
| 7 | 10 | aleatoire | 25 | 18 |
| 8 | 15 | meilleur | 105 | 119 |
| 9 | 6 | pire | 15 | 11 |
| 10 | 11 | aleatoire | 31 | 26 |
| 11 | 17 | meilleur | 136 | 152 |
| 12 | 8 | pire | 28 | 19 |
| 13 | 13 | aleatoire | 38 | 22 |
| 14 | 18 | meilleur | 153 | 170 |
| 15 | 9 | pire | 36 | 24 |
| 16 | 14 | aleatoire | 55 | 61 |
| 17 | 20 | meilleur | 190 | 209 |
| 18 | 11 | pire | 55 | 35 |
| 19 | 16 | aleatoire | 58 | 52 |
| 20 | 7 | meilleur | 21 | 27 |


## ArrayList

| # | Taille | Capacite | Occupation | Prochain ajout | Operation simulee |
| --- | --- | --- | --- | --- | --- |
| 1 | 23 | 32 | 71.9% | capacite disponible | add |
| 2 | 3 | 8 | 37.5% | capacite disponible | insert(index) |
| 3 | 15 | 16 | 93.8% | capacite disponible | remove(index) |
| 4 | 27 | 32 | 84.4% | capacite disponible | get(index) |
| 5 | 6 | 8 | 75.0% | capacite disponible | add |
| 6 | 18 | 32 | 56.3% | capacite disponible | insert(index) |
| 7 | 30 | 32 | 93.8% | capacite disponible | remove(index) |
| 8 | 10 | 16 | 62.5% | capacite disponible | get(index) |
| 9 | 22 | 32 | 68.8% | capacite disponible | add |
| 10 | 1 | 8 | 12.5% | capacite disponible | insert(index) |
| 11 | 13 | 16 | 81.3% | capacite disponible | remove(index) |
| 12 | 25 | 32 | 78.1% | capacite disponible | get(index) |
| 13 | 5 | 8 | 62.5% | capacite disponible | add |
| 14 | 17 | 32 | 53.1% | capacite disponible | insert(index) |
| 15 | 29 | 32 | 90.6% | capacite disponible | remove(index) |
| 16 | 8 | 16 | 50.0% | capacite disponible | get(index) |
| 17 | 20 | 32 | 62.5% | capacite disponible | add |
| 18 | 0 | 8 | 0.0% | capacite disponible | insert(index) |
| 19 | 12 | 16 | 75.0% | capacite disponible | remove(index) |
| 20 | 24 | 32 | 75.0% | capacite disponible | get(index) |


## Pile - LIFO

| # | Taille initiale | Operation | Taille apres | Sommet concerne | Complexite |
| --- | --- | --- | --- | --- | --- |
| 1 | 7 | push | 8 | index 7 | O(1) |
| 2 | 1 | pop | 0 | pile vide | O(1) |
| 3 | 5 | peek | 5 | index 4 | O(1) |
| 4 | 8 | push | 9 | index 8 | O(1) |
| 5 | 2 | pop | 1 | index 0 | O(1) |
| 6 | 6 | peek | 6 | index 5 | O(1) |
| 7 | 9 | push | 10 | index 9 | O(1) |
| 8 | 3 | pop | 2 | index 1 | O(1) |
| 9 | 7 | peek | 7 | index 6 | O(1) |
| 10 | 0 | push | 1 | index 0 | O(1) |
| 11 | 4 | pop | 3 | index 2 | O(1) |
| 12 | 8 | peek | 8 | index 7 | O(1) |
| 13 | 2 | push | 3 | index 2 | O(1) |
| 14 | 5 | pop | 4 | index 3 | O(1) |
| 15 | 9 | peek | 9 | index 8 | O(1) |
| 16 | 3 | push | 4 | index 3 | O(1) |
| 17 | 6 | pop | 5 | index 4 | O(1) |
| 18 | 0 | peek | 0 | pile vide | O(1) |
| 19 | 4 | push | 5 | index 4 | O(1) |
| 20 | 7 | pop | 6 | index 5 | O(1) |


## File - FIFO

| # | Taille initiale | Operation | Taille apres | Position concernee | Complexite |
| --- | --- | --- | --- | --- | --- |
| 1 | 1 | offer | 2 | arriere | O(1) |
| 2 | 5 | poll | 4 | avant | O(1) |
| 3 | 10 | peek | 10 | avant | O(1) |
| 4 | 2 | offer | 3 | arriere | O(1) |
| 5 | 6 | poll | 5 | avant | O(1) |
| 6 | 11 | peek | 11 | avant | O(1) |
| 7 | 3 | offer | 4 | arriere | O(1) |
| 8 | 8 | poll | 7 | avant | O(1) |
| 9 | 0 | peek | 0 | file vide | O(1) |
| 10 | 5 | offer | 6 | arriere | O(1) |
| 11 | 9 | poll | 8 | avant | O(1) |
| 12 | 1 | peek | 1 | avant | O(1) |
| 13 | 6 | offer | 7 | arriere | O(1) |
| 14 | 10 | poll | 9 | avant | O(1) |
| 15 | 3 | peek | 3 | avant | O(1) |
| 16 | 7 | offer | 8 | arriere | O(1) |
| 17 | 12 | poll | 11 | avant | O(1) |
| 18 | 4 | peek | 4 | avant | O(1) |
| 19 | 9 | offer | 10 | arriere | O(1) |
| 20 | 1 | poll | 0 | avant | O(1) |


## Liste chainee

| # | Noeuds initiaux | Operation | Index | Noeuds apres | Pointeurs modifies | Complexite |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 7 | insertFirst | 0 | 8 | 1 | O(1) |
| 2 | 11 | insertAt | 6 | 12 | 2 | O(n) |
| 3 | 3 | removeAt | 2 | 2 | 2 | O(n) |
| 4 | 8 | find | 2 | 8 | 0 | O(n) |
| 5 | 0 | insertFirst | 0 | 1 | 0 | O(1) |
| 6 | 5 | insertAt | 0 | 6 | 2 | O(1) |
| 7 | 9 | removeAt | 4 | 8 | 2 | O(n) |
| 8 | 2 | find | 1 | 2 | 0 | O(1) |
| 9 | 6 | insertFirst | 0 | 7 | 1 | O(1) |
| 10 | 11 | insertAt | 6 | 12 | 2 | O(n) |
| 11 | 3 | removeAt | 2 | 2 | 2 | O(n) |
| 12 | 7 | find | 2 | 7 | 0 | O(n) |
| 13 | 12 | insertFirst | 0 | 12 | 1 | O(1) |
| 14 | 4 | insertAt | 0 | 5 | 2 | O(1) |
| 15 | 9 | removeAt | 3 | 8 | 2 | O(n) |
| 16 | 1 | find | 0 | 1 | 0 | O(1) |
| 17 | 6 | insertFirst | 0 | 7 | 1 | O(1) |
| 18 | 10 | insertAt | 5 | 11 | 2 | O(n) |
| 19 | 2 | removeAt | 1 | 1 | 2 | O(1) |
| 20 | 7 | find | 2 | 7 | 0 | O(n) |


## Tableaux

| # | Taille | Index | Operation | Valeur lue/ecrite | Cases decalees | Complexite |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 18 | 4 | lecture | 28 | 0 | O(1) |
| 2 | 8 | 4 | ecriture | 29 | 0 | O(1) |
| 3 | 14 | 13 | insertion visuelle | 93 | 0 | O(1) |
| 4 | 20 | 6 | suppression visuelle | 45 | 13 | O(n) |
| 5 | 10 | 6 | lecture | 46 | 0 | O(1) |
| 6 | 16 | 1 | ecriture | 12 | 0 | O(1) |
| 7 | 6 | 2 | insertion visuelle | 20 | 3 | O(n) |
| 8 | 12 | 9 | suppression visuelle | 70 | 2 | O(n) |
| 9 | 18 | 3 | lecture | 29 | 0 | O(1) |
| 10 | 7 | 3 | ecriture | 30 | 0 | O(1) |
| 11 | 13 | 11 | insertion visuelle | 87 | 1 | O(n) |
| 12 | 19 | 5 | suppression visuelle | 46 | 13 | O(n) |
| 13 | 9 | 5 | lecture | 47 | 0 | O(1) |
| 14 | 15 | 0 | ecriture | 13 | 0 | O(1) |
| 15 | 5 | 2 | insertion visuelle | 28 | 2 | O(n) |
| 16 | 11 | 8 | suppression visuelle | 71 | 2 | O(n) |
| 17 | 17 | 2 | lecture | 30 | 0 | O(1) |
| 18 | 7 | 3 | ecriture | 38 | 0 | O(1) |
| 19 | 13 | 11 | insertion visuelle | 95 | 1 | O(n) |
| 20 | 19 | 5 | suppression visuelle | 54 | 13 | O(n) |


## Chaines et caracteres

| # | Texte | Index | Caractere | Sous-chaine | Longueur |
| --- | --- | --- | --- | --- | --- |
| 1 | Evidexe | 4 | e | ex | 7 |
| 2 | JavaString | 1 | a | ava | 10 |
| 3 | Simulation | 4 | l | l | 10 |
| 4 | Apprendre | 7 | r | re | 9 |
| 5 | Algorithme | 2 | g | gori | 10 |
| 6 | Evidexe | 3 | d | de | 7 |
| 7 | JavaString | 8 | n | ng | 10 |
| 8 | Simulation | 3 | u | ulat | 10 |
| 9 | Apprendre | 5 | n | nd | 9 |
| 10 | Algorithme | 0 | A | Alg | 10 |
| 11 | Evidexe | 2 | i | i | 7 |
| 12 | JavaString | 7 | i | in | 10 |
| 13 | Simulation | 1 | i | imul | 10 |
| 14 | Apprendre | 4 | e | en | 9 |
| 15 | Algorithme | 8 | m | me | 10 |
| 16 | Evidexe | 2 | i | idex | 7 |
| 17 | JavaString | 6 | r | ri | 10 |
| 18 | Simulation | 0 | S | Sim | 10 |
| 19 | Apprendre | 3 | r | r | 9 |
| 20 | Algorithme | 7 | h | hm | 10 |


## Multithreading

| # | Threads | Iterations/thread | Operations totales | Risque partage | Synchronisation | Etat final |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 5 | 20 | 100 | controle | synchronized | deterministe |
| 2 | 8 | 90 | 720 | condition de course possible | aucune | non deterministe |
| 3 | 4 | 160 | 640 | controle | synchronized | deterministe |
| 4 | 6 | 40 | 240 | condition de course possible | aucune | non deterministe |
| 5 | 2 | 110 | 220 | controle | synchronized | deterministe |
| 6 | 4 | 180 | 720 | condition de course possible | aucune | non deterministe |
| 7 | 7 | 60 | 420 | controle | synchronized | deterministe |
| 8 | 3 | 130 | 390 | condition de course possible | aucune | non deterministe |
| 9 | 5 | 10 | 50 | controle | synchronized | deterministe |
| 10 | 7 | 80 | 560 | condition de course possible | aucune | non deterministe |
| 11 | 3 | 150 | 450 | controle | synchronized | deterministe |
| 12 | 6 | 30 | 180 | condition de course possible | aucune | non deterministe |
| 13 | 8 | 100 | 800 | controle | synchronized | deterministe |
| 14 | 4 | 180 | 720 | condition de course possible | aucune | non deterministe |
| 15 | 6 | 50 | 300 | controle | synchronized | deterministe |
| 16 | 3 | 130 | 390 | condition de course possible | aucune | non deterministe |
| 17 | 5 | 200 | 1000 | controle | synchronized | deterministe |
| 18 | 7 | 80 | 560 | condition de course possible | aucune | non deterministe |
| 19 | 3 | 150 | 450 | controle | synchronized | deterministe |
| 20 | 5 | 30 | 150 | condition de course possible | aucune | non deterministe |

