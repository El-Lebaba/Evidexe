import { donneesLocales } from '@/db/donnees-principales';

/**
 * Catalogue central des cours.
 *
 * Les cours de Java, mathématiques et physique sont gardés ici pour éviter
 * d'éparpiller le contenu pédagogique dans chaque écran. Un cours contient
 * des diapositives, un exemple affiché dans la carte de formule/code et un
 * quiz final. Les écrans lisent ce catalogue, puis la progression est prise
 * dans `donneesLocales`.
 *
 * Pour ajouter un cours:
 * 1. créer un objet dans la bonne matière;
 * 2. ajouter ses diapositives;
 * 3. ajouter le quiz dans `QUIZ_PAR_COURS`;
 * 4. garder le même `id` entre le cours, le quiz et la progression.
 */

export type MatiereCours = 'java' | 'mathematiques' | 'physique';

export type DiapositiveCours = {
    animation?: unknown;
    code?: string;
    theory: string;
    title: string;
};
export type QuizCours = {
    answerIndex: number;
    choices: string[];
    question: string;
};
export type CoursApprentissage = {
    color?: string;
    description: string;
    icon?: string;
    id: string;
    slides: DiapositiveCours[];
    subtitle: string;
    title: string;
    totalSlides: number;
};
export type CarteProgressionCours = Record<string, number>;
export type DetailsProgressionCours = {
    completed: boolean;
    exerciseCompleted: boolean;
    highestSlideIndex: number;
    progress: number;
};
export type CoursApprentissageRecent = {
    id: string;
    courseId: string;
    subject: MatiereCours;
    name: string;
    progress: number;
    completed: boolean;
    totalSlides: number;
    highestSlideIndex: number;
    exerciseCompleted: boolean;
};

const mathCourses: CoursApprentissage[] = [
    {
        id: "derivee_fondations",
        title: "Fondations algébriques et fonctions",
        subtitle: "Préparer le terrain",
        description: "Consolider les outils d’algèbre, de fonctions et de graphes nécessaires avant la dérivation.",
        totalSlides: 3,
        slides: [
            {
                title: "Outils algébriques essentiels",
                theory: "Avant de dériver, il faut être solide en algèbre, car la plupart des erreurs viennent d’une simplification mal faite. Les priorités d’opérations, les exposants, la factorisation et la résolution d’équations servent à rendre les expressions plus faciles à analyser. En pratique, quand une limite ou une dérivée semble bloquée, on commence presque toujours par transformer l’expression.",
                code: `Mini-problème
Résoudre : 2(x - 3)^2 = 18

Méthode
1. Diviser par 2 : (x - 3)^2 = 9
2. Prendre la racine carrée : x - 3 = ±3
3. Isoler x : x = 3 ± 3

Réponse
x = 0 ou x = 6`,
            },
            {
                title: "Fonction, domaine et image",
                theory: "Une fonction associe à chaque valeur permise de x une seule valeur de y. Le domaine indique les valeurs de x autorisées, tandis que l’image décrit les valeurs que la fonction peut produire. Pour trouver le domaine, on vérifie surtout les divisions par zéro, les racines paires et les logarithmes.",
                code: `Mini-problème
Trouver le domaine de f(x) = √(5 - x) / (x + 1)

Méthode
1. Pour la racine : 5 - x ≥ 0, donc x ≤ 5
2. Pour le dénominateur : x + 1 ≠ 0, donc x ≠ -1
3. Combiner les conditions

Réponse
Domaine : (-∞, -1) ∪ (-1, 5]`,
            },
            {
                title: "Graphes, variations et transformations",
                theory: "Le graphe d’une fonction permet de voir rapidement où elle augmente, diminue ou change de comportement. Les transformations graphiques déplacent, étirent ou réfléchissent une courbe de base. Cette lecture visuelle est importante, car la dérivée servira plus tard à justifier ces observations avec des calculs.",
                code: `Mini-problème
Décrire g(x) = |x - 2| + 1

Méthode
1. Partir de y = |x|
2. x - 2 déplace la courbe de 2 unités vers la droite
3. +1 déplace la courbe de 1 unité vers le haut

Réponse
Le sommet passe de (0,0) à (2,1).`,
            },
        ],
    },
    {
        id: "derivee_limites_continuite",
        title: "Limites et continuité",
        subtitle: "Approcher avant de dériver",
        description: "Comprendre le comportement d’une fonction près d’un point et à l’infini.",
        totalSlides: 3,
        slides: [
            {
                title: "Limites à gauche et à droite",
                theory: "Une limite décrit la valeur vers laquelle une fonction se rapproche, même si la fonction n’atteint pas exactement cette valeur. Pour qu’une limite existe en un point, la limite à gauche et la limite à droite doivent être identiques. Si les deux côtés mènent vers des valeurs différentes, on dit que la limite n’existe pas.",
                code: `Mini-problème
On sait que :
lim(x→2⁻) f(x) = 3
lim(x→2⁺) f(x) = 5

Méthode
1. Lire la limite à gauche : 3
2. Lire la limite à droite : 5
3. Comparer : 3 ≠ 5

Réponse
lim(x→2) f(x) n’existe pas.`,
            },
            {
                title: "Formes indéterminées",
                theory: "Une forme comme 0/0 ne donne pas une réponse finale. Elle indique plutôt qu’il faut transformer l’expression avec une factorisation, une simplification ou une rationalisation. Le bon réflexe est donc de simplifier avant de remplacer à nouveau la valeur de x.",
                code: `Mini-problème
Calculer lim(x→3) (x² - 9)/(x - 3)

Méthode
1. Factoriser : x² - 9 = (x - 3)(x + 3)
2. Simplifier : (x - 3)(x + 3)/(x - 3) = x + 3
3. Remplacer x par 3

Réponse
La limite vaut 6.`,
            },
            {
                title: "Continuité",
                theory: "Une fonction est continue en un point si elle est définie, si sa limite existe et si la limite est égale à la valeur de la fonction. Si une de ces trois conditions échoue, la fonction n’est pas continue à cet endroit. La continuité est importante, parce qu’une fonction qui n’est pas continue ne peut pas être dérivable au même point.",
                code: `Mini-problème
f(x) = (x² - 1)/(x - 1), si x ≠ 1
f(1) = 0
Étudier la continuité en x = 1.

Méthode
1. Simplifier : (x² - 1)/(x - 1) = x + 1
2. Calculer la limite : lim(x→1) x + 1 = 2
3. Comparer avec f(1) = 0

Réponse
La fonction n’est pas continue en x = 1.`,
            },
        ],
    },
    {
        id: "derivee_definition",
        title: "Définition de la dérivée",
        subtitle: "Du taux moyen au taux instantané",
        description: "Comprendre la dérivée comme une pente instantanée ou un taux de variation local.",
        totalSlides: 3,
        slides: [
            {
                title: "Taux de variation moyen",
                theory: "Le taux de variation moyen mesure le changement global d’une fonction entre deux points. Géométriquement, il correspond à la pente de la droite sécante qui relie ces deux points. C’est la première étape pour comprendre la dérivée, car le taux instantané apparaît lorsque les deux points se rapprochent.",
                code: `Mini-problème
Trouver le taux de variation moyen de f(x)=x² sur [1,3]

Méthode
1. Calculer f(3)=9 et f(1)=1
2. Faire Δy = 9 - 1 = 8
3. Faire Δx = 3 - 1 = 2
4. Diviser : Δy/Δx = 8/2

Réponse
Le taux moyen vaut 4.`,
            },
            {
                title: "Dérivée en un point",
                theory: "La dérivée en un point est la limite du taux de variation moyen lorsque l’écart entre les deux points devient très petit. Elle donne la pente de la tangente à la courbe au point choisi. En contexte réel, elle peut représenter une vitesse instantanée, un taux de croissance ou une variation locale.",
                code: `Mini-problème
Trouver f'(2) pour f(x)=x² avec la définition

Méthode
1. Écrire : [f(2+h)-f(2)]/h
2. Remplacer : [(2+h)² - 4]/h
3. Développer : (4 + 4h + h² - 4)/h
4. Simplifier : 4 + h
5. Faire h → 0

Réponse
f'(2) = 4`,
            },
            {
                title: "Non-dérivabilité",
                theory: "Une fonction n’est pas toujours dérivable, même si elle est définie. Les cas classiques sont les discontinuités, les coins, les pointes et les tangentes verticales. Pour être dérivable, une courbe doit avoir un comportement local assez lisse autour du point étudié.",
                code: `Mini-problème
La fonction f(x)=|x| est-elle dérivable en x=0 ?

Méthode
1. À gauche de 0, la pente vaut -1
2. À droite de 0, la pente vaut 1
3. Les deux pentes ne sont pas égales

Réponse
f n’est pas dérivable en 0.`,
            },
        ],
    },
    {
        id: "derivee_regles",
        title: "Règles de dérivation",
        subtitle: "Calculer efficacement",
        description: "Utiliser les règles de base, du produit, du quotient et de la chaîne.",
        totalSlides: 3,
        slides: [
            {
                title: "Règles de base et polynômes",
                theory: "Les règles de base permettent de dériver rapidement les constantes, les puissances, les sommes et les multiples constants. Pour un polynôme, on dérive terme par terme. Cette méthode est mécanique, mais elle doit être faite avec attention pour éviter les erreurs de coefficient ou d’exposant.",
                code: `Mini-problème
Dériver f(x)=4x³ - 5x² + 7x - 9

Méthode
1. (4x³)' = 12x²
2. (-5x²)' = -10x
3. (7x)' = 7
4. (-9)' = 0

Réponse
f'(x)=12x² - 10x + 7`,
            },
            {
                title: "Produit et quotient",
                theory: "La dérivée d’un produit n’est pas simplement le produit des dérivées. On utilise la règle (uv)' = u'v + uv', et pour un quotient, on utilise (u/v)' = (u'v - uv')/v². Le plus important est d’identifier clairement u et v avant de commencer.",
                code: `Mini-problème
Dériver f(x)=x² sin(x)

Méthode
1. Poser u=x² et v=sin(x)
2. Calculer u'=2x et v'=cos(x)
3. Appliquer : f'=u'v+uv'

Réponse
f'(x)=2x sin(x)+x² cos(x)`,
            },
            {
                title: "Règle de la chaîne",
                theory: "La règle de la chaîne sert à dériver une fonction composée. On dérive la fonction extérieure, puis on multiplie par la dérivée de la fonction intérieure. Chaque fois qu’une fonction est placée dans une autre, il faut vérifier si cette règle est nécessaire.",
                code: `Mini-problème
Dériver f(x)=(3x²+1)^5

Méthode
1. Fonction extérieure : u^5
2. Fonction intérieure : u=3x²+1
3. Dériver : 5u^4 · u'
4. u'=6x

Réponse
f'(x)=30x(3x²+1)^4`,
            },
        ],
    },
    {
        id: "derivee_applications",
        title: "Applications de la dérivée",
        subtitle: "Analyser et optimiser",
        description: "Utiliser la dérivée pour étudier les fonctions, les extremums et les problèmes concrets.",
        totalSlides: 3,
        slides: [
            {
                title: "Croissance, décroissance et points critiques",
                theory: "Le signe de la dérivée première indique si une fonction augmente ou diminue. Un point critique apparaît quand la dérivée vaut zéro ou n’existe pas. En étudiant le signe de la dérivée autour de ces points, on peut déterminer les extremums relatifs.",
                code: `Mini-problème
Étudier f(x)=x³-3x

Méthode
1. Dériver : f'(x)=3x²-3
2. Résoudre f'(x)=0 : 3(x²-1)=0
3. Points critiques : x=-1 et x=1
4. Étudier le signe de f'

Réponse
Maximum local en x=-1 et minimum local en x=1.`,
            },
            {
                title: "Concavité et dérivée seconde",
                theory: "La dérivée seconde décrit la courbure de la fonction. Si f'' est positive, la courbe est concave vers le haut; si f'' est négative, elle est concave vers le bas. Un point d’inflexion apparaît lorsqu’il y a un changement de concavité.",
                code: `Mini-problème
Étudier la concavité de f(x)=x³-3x

Méthode
1. f'(x)=3x²-3
2. f''(x)=6x
3. Si x<0, f''<0 : concave vers le bas
4. Si x>0, f''>0 : concave vers le haut

Réponse
Point d’inflexion en x=0.`,
            },
            {
                title: "Optimisation",
                theory: "L’optimisation consiste à trouver une valeur maximale ou minimale dans une situation réelle. On commence par écrire une fonction à optimiser, puis on cherche ses points critiques avec la dérivée. Il faut ensuite vérifier que la réponse respecte le contexte du problème.",
                code: `Mini-problème
Un rectangle a un périmètre de 20. Maximiser son aire.

Méthode
1. 2x + 2y = 20, donc y = 10 - x
2. Aire : A(x)=x(10-x)=10x-x²
3. Dériver : A'(x)=10-2x
4. Résoudre A'(x)=0 : x=5
5. Alors y=5

Réponse
L’aire maximale est obtenue avec un carré 5 par 5.`,
            },
        ],
    },
    {
        id: "integrale_sens",
        title: "Sens de l’intégrale",
        subtitle: "Accumuler, mesurer, approcher",
        description: "Construire le sens de l’intégrale avec les primitives, les aires et les sommes de Riemann.",
        totalSlides: 3,
        slides: [
            {
                title: "Primitive et intégrale indéfinie",
                theory: "Une primitive de f est une fonction F dont la dérivée redonne f. L’intégrale indéfinie représente donc toute une famille de primitives, ce qui explique la constante +C. Il faut toujours ajouter +C, parce que plusieurs fonctions différentes peuvent avoir la même dérivée.",
                code: `Mini-problème
Calculer ∫(6x - 4) dx

Méthode
1. Intégrer 6x : 3x²
2. Intégrer -4 : -4x
3. Ajouter +C

Réponse
∫(6x - 4) dx = 3x² - 4x + C`,
            },
            {
                title: "Sommes de Riemann",
                theory: "Une somme de Riemann approche une aire avec des rectangles. Plus on utilise de rectangles, plus l’approximation devient précise. Cette idée prépare la définition de l’intégrale définie comme limite d’une somme d’aires très petites.",
                code: `Mini-problème
Approcher ∫ de 0 à 2 de x dx avec 4 rectangles à droite

Méthode
1. Δx = (2 - 0)/4 = 0,5
2. Points droits : 0,5 ; 1 ; 1,5 ; 2
3. Hauteurs : 0,5 ; 1 ; 1,5 ; 2
4. Somme : 0,5(0,5+1+1,5+2)

Réponse
Approximation = 2,5`,
            },
            {
                title: "Aire algébrique",
                theory: "L’intégrale définie mesure une aire signée. Les régions au-dessus de l’axe des x sont positives, tandis que celles sous l’axe sont négatives. Une intégrale peut donc valoir zéro même si la région dessinée existe, car les contributions peuvent se compenser.",
                code: `Mini-problème
Calculer ∫ de -1 à 1 de x dx

Méthode
1. y=x est impaire
2. L’intervalle [-1,1] est symétrique
3. Les aires négative et positive se compensent

Réponse
∫ de -1 à 1 de x dx = 0`,
            },
        ],
    },
    {
        id: "integrale_tfc_substitution",
        title: "Théorème fondamental et substitution",
        subtitle: "Relier dériver et intégrer",
        description: "Évaluer des intégrales définies et simplifier des intégrales avec un changement de variable.",
        totalSlides: 3,
        slides: [
            {
                title: "Théorème fondamental du calcul",
                theory: "Le théorème fondamental relie l’intégrale définie à la primitive. Au lieu de revenir à une somme de Riemann, on trouve une primitive puis on calcule F(b)-F(a). C’est l’outil principal pour transformer une aire accumulée en calcul direct.",
                code: `Mini-problème
Calculer ∫ de 1 à 3 de 2x dx

Méthode
1. Une primitive de 2x est F(x)=x²
2. Appliquer F(3)-F(1)
3. Calculer 9 - 1

Réponse
L’intégrale vaut 8.`,
            },
            {
                title: "Fonction définie par une intégrale",
                theory: "Une fonction peut être définie comme une accumulation variable. Si F(x)=∫ de a à x de f(t)dt, alors F'(x)=f(x), lorsque f est continue. Autrement dit, dériver une accumulation redonne le taux instantané qui était accumulé.",
                code: `Mini-problème
Soit F(x)=∫ de 0 à x de (t²+1) dt. Trouver F'(x).

Méthode
1. Reconnaître la forme ∫ de a à x de f(t)dt
2. Identifier f(t)=t²+1
3. Remplacer t par x

Réponse
F'(x)=x²+1`,
            },
            {
                title: "Changement de variable",
                theory: "Le changement de variable sert à simplifier une intégrale composée. On choisit une nouvelle variable u pour représenter la partie intérieure de l’expression. Cette méthode fonctionne bien quand la dérivée de cette partie intérieure apparaît aussi dans l’intégrale.",
                code: `Mini-problème
Calculer ∫ 2x cos(x²) dx

Méthode
1. Poser u=x²
2. Alors du=2x dx
3. Remplacer : ∫ cos(u) du
4. Intégrer : sin(u)+C
5. Revenir à x

Réponse
sin(x²)+C`,
            },
        ],
    },
    {
        id: "integrale_techniques",
        title: "Techniques d’intégration",
        subtitle: "Choisir la bonne méthode",
        description: "Utiliser les parties, la trigonométrie et les substitutions trigonométriques.",
        totalSlides: 3,
        slides: [
            {
                title: "Intégration par parties",
                theory: "L’intégration par parties vient de la règle du produit en dérivation. Elle est utile quand un facteur devient plus simple en le dérivant et que l’autre facteur s’intègre facilement. La difficulté principale est de choisir correctement u et dv.",
                code: `Mini-problème
Calculer ∫ x e^x dx

Méthode
1. Choisir u=x, donc du=dx
2. Choisir dv=e^x dx, donc v=e^x
3. Appliquer ∫u dv = uv - ∫v du
4. Obtenir x e^x - ∫e^x dx

Réponse
∫ x e^x dx = e^x(x - 1) + C`,
            },
            {
                title: "Intégrales trigonométriques",
                theory: "Les intégrales trigonométriques utilisent souvent des identités. Quand une puissance impaire apparaît, on isole parfois un facteur pour faire une substitution. Quand les puissances sont paires, les identités de demi-angle deviennent souvent plus utiles.",
                code: `Mini-problème
Calculer ∫ sin³(x)cos(x) dx

Méthode
1. Poser u=sin(x)
2. Alors du=cos(x)dx
3. Remplacer : ∫u³ du
4. Intégrer : u⁴/4 + C

Réponse
sin⁴(x)/4 + C`,
            },
            {
                title: "Substitution trigonométrique",
                theory: "La substitution trigonométrique est utile quand une racine contient une expression comme a²-x², a²+x² ou x²-a². On remplace x par une expression trigonométrique pour utiliser une identité connue. Cette méthode demande de bien choisir la substitution selon la forme de la racine.",
                code: `Mini-problème
Pour simplifier √(9-x²), choisir une substitution.

Méthode
1. Reconnaître la forme a²-x² avec a=3
2. Poser x=3sin(θ)
3. Alors √(9-x²)=√(9-9sin²θ)
4. Utiliser 1-sin²θ=cos²θ

Réponse
√(9-x²)=3cos(θ), selon le contexte de θ.`,
            },
        ],
    },
    {
        id: "integrale_impropres_series",
        title: "Intégrales impropres et séries",
        subtitle: "Étudier convergence et approximation",
        description: "Comprendre les intégrales impropres, les séries et les approximations de Taylor.",
        totalSlides: 3,
        slides: [
            {
                title: "Intégrales impropres",
                theory: "Une intégrale est impropre si une borne est infinie ou si la fonction devient non définie sur l’intervalle. On ne la calcule pas directement : on la transforme en limite. La conclusion dépend de cette limite, qui peut converger vers une valeur finie ou diverger.",
                code: `Mini-problème
Calculer ∫ de 1 à ∞ de 1/x² dx

Méthode
1. Remplacer ∞ par b : ∫ de 1 à b x⁻² dx
2. Une primitive est -1/x
3. Évaluer : [-1/x] de 1 à b = -1/b + 1
4. Faire b → ∞

Réponse
L’intégrale converge et vaut 1.`,
            },
            {
                title: "Séries géométriques et convergence",
                theory: "Une série additionne une infinité de termes. La série géométrique est l’un des modèles les plus importants, car elle converge seulement si la raison r vérifie |r|<1. Quand elle converge, sa somme vaut a/(1-r), où a est le premier terme.",
                code: `Mini-problème
Trouver la somme de 3 + 3/2 + 3/4 + 3/8 + ...

Méthode
1. Premier terme : a=3
2. Raison : r=1/2
3. Comme |r|<1, la série converge
4. Somme : a/(1-r)=3/(1-1/2)

Réponse
La somme vaut 6.`,
            },
            {
                title: "Polynômes et séries de Taylor",
                theory: "Un polynôme de Taylor approxime une fonction près d’un point. Plus on ajoute de termes, plus l’approximation peut devenir précise près de ce point. Les séries de Maclaurin sont des séries de Taylor centrées en 0, par exemple pour e^x, sin(x), cos(x) et 1/(1-x).",
                code: `Mini-problème
Approximer e^x près de 0 avec les 3 premiers termes.

Méthode
1. Rappeler : e^x = 1 + x + x²/2! + x³/3! + ...
2. Garder les 3 premiers termes
3. Remplacer si nécessaire x par la valeur donnée

Réponse
e^x ≈ 1 + x + x²/2 près de 0.`,
            },
        ],
    },
    {
        id: "integrale_applications",
        title: "Applications de l’intégrale",
        subtitle: "Aire, volume et modélisation",
        description: "Utiliser l’intégrale pour calculer des aires, des volumes et résoudre des modèles simples.",
        totalSlides: 3,
        slides: [
            {
                title: "Aire entre deux courbes",
                theory: "Pour trouver l’aire entre deux courbes, on intègre la fonction du haut moins la fonction du bas. Si les courbes se croisent, il faut découper l’intervalle en plusieurs parties. Le dessin est très important, car il permet d’éviter d’inverser les fonctions.",
                code: `Mini-problème
Trouver l’aire entre y=2x et y=x² sur [0,2]

Méthode
1. Sur [0,2], 2x ≥ x²
2. Écrire A=∫ de 0 à 2 (2x-x²) dx
3. Intégrer : [x² - x³/3] de 0 à 2
4. Calculer : 4 - 8/3

Réponse
A = 4/3`,
            },
            {
                title: "Volumes de révolution",
                theory: "Un volume de révolution apparaît lorsqu’une région tourne autour d’un axe. La méthode des disques ou des rondelles additionne des sections circulaires. On utilise généralement une intégrale de la forme π∫rayon² dx ou π∫(R²-r²) dx.",
                code: `Mini-problème
Faire tourner y=√x sur [0,4] autour de l’axe des x.

Méthode
1. Rayon : r=√x
2. Volume : V=π∫ de 0 à 4 (√x)² dx
3. Simplifier : V=π∫ de 0 à 4 x dx
4. Calculer : π[x²/2] de 0 à 4

Réponse
V = 8π`,
            },
            {
                title: "Équations différentielles simples",
                theory: "Une équation différentielle relie une fonction à ses dérivées. Dans les modèles simples, on peut souvent séparer les variables et intégrer chaque côté. Ce type d’équation sert à modéliser une croissance, une décroissance ou une accumulation dépendante de l’état actuel.",
                code: `Mini-problème
Résoudre dy/dx = 3x² avec y(0)=2

Méthode
1. Intégrer les deux côtés : y=∫3x² dx
2. Obtenir y=x³+C
3. Utiliser y(0)=2 : 2=0+C
4. Donc C=2

Réponse
y=x³+2`,
            },
        ],
    },
    {
        id: "stats_description",
        title: "Statistique descriptive",
        subtitle: "Observer avant de conclure",
        description: "Résumer et interpréter des données avec des mesures de centre et de dispersion.",
        totalSlides: 3,
        slides: [
            {
                title: "Population, échantillon et variable",
                theory: "Avant de calculer, il faut savoir exactement ce qu’on étudie. La population est l’ensemble visé, l’échantillon est la partie observée, et la variable est la caractéristique mesurée. Une bonne analyse statistique commence toujours par une bonne définition du contexte.",
                code: `Mini-problème
On relève les notes de 5 élèves : 12, 15, 13, 17, 15.

Méthode
1. Population observée : les 5 élèves
2. Variable : la note
3. Taille de l’échantillon : n=5

Réponse
Variable : note
n = 5`,
            },
            {
                title: "Moyenne, médiane et mode",
                theory: "La moyenne résume les données par compensation. La médiane coupe la série triée en deux parties, alors que le mode donne la valeur la plus fréquente. Ces trois mesures décrivent le centre, mais elles ne racontent pas exactement la même chose.",
                code: `Mini-problème
Pour 2, 3, 3, 7, 10, trouver moyenne, médiane et mode.

Méthode
1. Moyenne : (2+3+3+7+10)/5 = 5
2. Médiane : valeur centrale = 3
3. Mode : valeur la plus fréquente = 3

Réponse
Moyenne = 5, médiane = 3, mode = 3`,
            },
            {
                title: "Variance et écart-type",
                theory: "La variance et l’écart-type mesurent la dispersion autour de la moyenne. Plus l’écart-type est grand, plus les valeurs sont éloignées du centre. La moyenne seule ne suffit donc pas pour décrire une série de données.",
                code: `Mini-problème
Pour 2, 4, 4, 6, calculer la variance de population.

Méthode
1. Moyenne : (2+4+4+6)/4 = 4
2. Écarts : -2, 0, 0, 2
3. Carrés : 4, 0, 0, 4
4. Variance : (4+0+0+4)/4 = 2
5. Écart-type : √2 ≈ 1,41

Réponse
Variance = 2, écart-type ≈ 1,41`,
            },
        ],
    },
    {
        id: "proba_fondements",
        title: "Fondements des probabilités",
        subtitle: "Compter pour raisonner",
        description: "Utiliser les événements, les ensembles et le dénombrement pour calculer des probabilités.",
        totalSlides: 3,
        slides: [
            {
                title: "Univers et événements",
                theory: "L’univers contient toutes les issues possibles d’une expérience aléatoire. Un événement est un sous-ensemble de cet univers. Les opérations comme le complément, l’union et l’intersection permettent de traduire précisément les phrases d’un problème.",
                code: `Mini-problème
On lance un dé. A = obtenir un nombre pair.

Méthode
1. Univers : Ω={1,2,3,4,5,6}
2. Événement A={2,4,6}
3. Complément Aᶜ={1,3,5}

Réponse
A={2,4,6} et Aᶜ={1,3,5}`,
            },
            {
                title: "Règles d’addition et de multiplication",
                theory: "La règle d’addition sert à traiter le “ou”. La règle de multiplication sert à traiter le “et”, surtout lorsque l’expérience se déroule en plusieurs étapes. La première question à poser est donc : est-ce que je choisis entre des cas ou est-ce que j’enchaîne des étapes ?",
                code: `Mini-problème
On lance une pièce puis un dé. Trouver P(Pile et nombre pair).

Méthode
1. P(Pile)=1/2
2. P(nombre pair)=3/6=1/2
3. Les expériences sont indépendantes
4. Multiplier : 1/2 × 1/2

Réponse
P = 1/4`,
            },
            {
                title: "Permutations et combinaisons",
                theory: "Quand l’ordre compte, on utilise des permutations ou des arrangements. Quand l’ordre ne compte pas, on utilise des combinaisons. Le test simple est de demander si ABC et CBA représentent le même résultat ou deux résultats différents.",
                code: `Mini-problème
Choisir 3 élèves parmi 10 pour former un comité.

Méthode
1. L’ordre ne compte pas
2. Utiliser une combinaison : C(10,3)
3. Calculer : 10×9×8 / (3×2×1)

Réponse
Il y a 120 comités possibles.`,
            },
        ],
    },
    {
        id: "proba_conditionnelle",
        title: "Probabilité conditionnelle",
        subtitle: "Raisonner avec information",
        description: "Comprendre les probabilités conditionnelles, l’indépendance et Bayes.",
        totalSlides: 3,
        slides: [
            {
                title: "Probabilité conditionnelle",
                theory: "Une probabilité conditionnelle mesure la probabilité d’un événement sachant qu’un autre est déjà réalisé. Elle change donc l’univers de référence. Pour bien la calculer, on doit toujours identifier clairement ce qui est donné dans le “sachant que”.",
                code: `Mini-problème
Dans une classe de 20 élèves, 12 sont des filles et 3 filles font du basket. Trouver P(Basket | Fille).

Méthode
1. Le groupe de référence est les filles : 12
2. Parmi elles, 3 font du basket
3. Calculer 3/12

Réponse
P(Basket | Fille)=1/4`,
            },
            {
                title: "Indépendance",
                theory: "Deux événements sont indépendants si connaître l’un ne change pas la probabilité de l’autre. On ne doit pas décider cela seulement avec l’intuition. La vérification se fait avec une égalité comme P(A|B)=P(A) ou P(A∩B)=P(A)P(B).",
                code: `Mini-problème
P(A)=0,4, P(B)=0,5 et P(A∩B)=0,2. A et B sont-ils indépendants ?

Méthode
1. Calculer P(A)P(B)=0,4×0,5=0,2
2. Comparer avec P(A∩B)=0,2
3. Les deux valeurs sont égales

Réponse
A et B sont indépendants.`,
            },
            {
                title: "Formule de Bayes",
                theory: "La formule de Bayes sert à inverser une probabilité conditionnelle. Elle est très utile quand on observe un résultat et qu’on veut estimer la probabilité de la cause. Dans les problèmes de tests ou de diagnostics, elle évite des conclusions trop rapides.",
                code: `Mini-problème
Une maladie touche 2 % des gens. Le test est positif chez 90 % des malades et 5 % des non-malades. Trouver P(Malade | +).

Méthode
1. P(+)=0,90×0,02 + 0,05×0,98 = 0,067
2. P(Malade et +)=0,90×0,02 = 0,018
3. Diviser : 0,018/0,067

Réponse
P(Malade | +) ≈ 26,9 %`,
            },
        ],
    },
    {
        id: "lois_probabilite",
        title: "Lois de probabilité",
        subtitle: "Modéliser le hasard",
        description: "Utiliser les lois discrètes et continues pour modéliser des situations aléatoires.",
        totalSlides: 3,
        slides: [
            {
                title: "Bernoulli et binomiale",
                theory: "Une loi de Bernoulli modélise un seul essai avec succès ou échec. Une loi binomiale compte le nombre de succès dans plusieurs essais indépendants ayant la même probabilité de succès. On l’utilise souvent pour les lancers répétés, les sondages simples et les tests oui/non.",
                code: `Mini-problème
On lance 5 fois une pièce équilibrée. Trouver P(exactement 2 piles).

Méthode
1. X suit B(5,0,5)
2. P(X=2)=C(5,2)(0,5)^2(0,5)^3
3. C(5,2)=10
4. P=10/32

Réponse
P=5/16=0,3125`,
            },
            {
                title: "Poisson et géométrique",
                theory: "La loi géométrique modélise le rang du premier succès. La loi de Poisson modélise souvent un nombre d’occurrences dans un intervalle de temps ou d’espace. Il faut choisir la loi selon la question posée, pas seulement selon les nombres donnés.",
                code: `Mini-problème
Le nombre moyen d’appels par minute est 3. Trouver P(X=2) avec une loi de Poisson.

Méthode
1. λ=3
2. Utiliser P(X=k)=e^(-λ)λ^k/k!
3. P(X=2)=e^(-3)3²/2!

Réponse
P(X=2)≈0,224`,
            },
            {
                title: "Loi normale",
                theory: "La loi normale est une loi continue en forme de cloche. Elle est définie par une moyenne μ et un écart-type σ. Pour calculer des probabilités, on standardise souvent avec z=(x-μ)/σ afin d’utiliser la table normale.",
                code: `Mini-problème
X suit N(100, 15). Trouver le z-score de x=130.

Méthode
1. μ=100 et σ=15
2. z=(x-μ)/σ
3. z=(130-100)/15

Réponse
z=2`,
            },
        ],
    },
    {
        id: "inference_statistique",
        title: "Inférence statistique",
        subtitle: "Estimer et tester",
        description: "Utiliser les échantillons pour estimer une population et prendre des décisions statistiques.",
        totalSlides: 3,
        slides: [
            {
                title: "Échantillonnage et intervalle de confiance",
                theory: "Un échantillon sert à estimer une caractéristique inconnue d’une population. Un intervalle de confiance donne une plage plausible pour cette caractéristique. Plus l’échantillon est grand, plus la marge d’erreur a tendance à diminuer.",
                code: `Mini-problème
Une moyenne observée est 50, avec erreur-type 2. Construire un intervalle de confiance à 95 % avec z≈1,96.

Méthode
1. Marge = 1,96 × 2 = 3,92
2. Borne basse = 50 - 3,92
3. Borne haute = 50 + 3,92

Réponse
IC ≈ [46,08 ; 53,92]`,
            },
            {
                title: "Test d’hypothèse",
                theory: "Un test d’hypothèse compare une affirmation de départ avec les données observées. On commence par formuler H0 et H1, puis on calcule une statistique de test. La décision dépend de la p-valeur ou d’une région critique choisie à l’avance.",
                code: `Mini-problème
On teste H0 : μ=50 contre H1 : μ>50. On obtient z=2 et p-valeur=0,0228 avec α=0,05.

Méthode
1. Comparer p-valeur à α
2. 0,0228 < 0,05
3. Rejeter H0

Réponse
Les données soutiennent l’idée que μ>50.`,
            },
            {
                title: "Corrélation et régression",
                theory: "La corrélation mesure la force et le sens d’un lien linéaire entre deux variables. La régression linéaire cherche une droite qui décrit approximativement ce lien. Il faut toujours rappeler qu’une corrélation forte ne prouve pas automatiquement une relation de cause à effet.",
                code: `Mini-problème
On obtient r=0,82 entre deux variables. Interpréter.

Méthode
1. Le signe est positif : le lien va dans le même sens
2. |r| est proche de 1 : le lien est fort
3. Ne pas conclure automatiquement à une causalité

Réponse
Il y a une forte corrélation linéaire positive.`,
            },
        ],
    },
    {
        id: "discrete_logique",
        title: "Logique mathématique",
        subtitle: "Formaliser pour raisonner",
        description: "Lire et manipuler les propositions, connecteurs, prédicats et quantificateurs.",
        totalSlides: 3,
        slides: [
            {
                title: "Propositions et connecteurs",
                theory: "Une proposition est un énoncé qui peut être vrai ou faux. Les connecteurs comme et, ou, non, implication et équivalence permettent de construire des phrases logiques plus complexes. Pour éviter les erreurs, il faut d’abord identifier les propositions simples avant d’analyser l’énoncé complet.",
                code: `Mini-problème
Étudier p ∨ q lorsque p=vrai et q=faux.

Méthode
1. ∨ signifie “ou”
2. Un “ou” est vrai si au moins une proposition est vraie
3. Ici p est vraie

Réponse
p ∨ q est vraie.`,
            },
            {
                title: "Implication et contraposée",
                theory: "L’implication p → q signifie que si p est vraie, alors q doit être vraie. Sa contraposée est ¬q → ¬p, et elle a toujours la même valeur logique. Cette équivalence est très utile, car la contraposée est parfois plus simple à démontrer que l’énoncé original.",
                code: `Mini-problème
Écrire la contraposée : Si n est multiple de 4, alors n est pair.

Méthode
1. p : n est multiple de 4
2. q : n est pair
3. Contraposée : ¬q → ¬p

Réponse
Si n n’est pas pair, alors n n’est pas multiple de 4.`,
            },
            {
                title: "Prédicats et quantificateurs",
                theory: "Un prédicat est une propriété qui dépend d’une variable. Les quantificateurs ∀ et ∃ indiquent si la propriété vaut pour tous les éléments ou pour au moins un élément. La négation des quantificateurs est importante : nier ∀ donne ∃, et nier ∃ donne ∀.",
                code: `Mini-problème
Nier : ∀x ∈ ℝ, x² ≥ 0

Méthode
1. Nier “pour tout” donne “il existe”
2. Nier x² ≥ 0 donne x² < 0
3. Garder le même univers

Réponse
∃x ∈ ℝ tel que x² < 0`,
            },
        ],
    },
    {
        id: "discrete_preuves_ensembles",
        title: "Preuves, ensembles et fonctions",
        subtitle: "Structurer une démonstration",
        description: "Utiliser les preuves, les ensembles et les fonctions pour raisonner rigoureusement.",
        totalSlides: 3,
        slides: [
            {
                title: "Preuve directe",
                theory: "Une preuve directe commence avec l’hypothèse et avance logiquement vers la conclusion. Elle est souvent la méthode la plus naturelle quand les définitions donnent rapidement le résultat. L’idée est de ne rien supposer de plus que ce qui est donné.",
                code: `Mini-problème
Montrer : si n est pair, alors n² est pair.

Méthode
1. n pair signifie n=2k
2. n²=(2k)²=4k²
3. 4k²=2(2k²), donc n² est multiple de 2

Réponse
n² est pair.`,
            },
            {
                title: "Preuve par récurrence",
                theory: "La récurrence sert à prouver une propriété pour tous les entiers à partir d’un point de départ. On vérifie d’abord un cas initial, puis on montre que si la propriété est vraie au rang n, elle est vraie au rang n+1. C’est comme une suite de dominos qui tombent les uns après les autres.",
                code: `Mini-problème
Montrer que 1+2+...+n = n(n+1)/2.

Méthode
1. Initialisation : pour n=1, 1=1(2)/2
2. Supposer vrai au rang n
3. Ajouter n+1 des deux côtés
4. Simplifier pour obtenir (n+1)(n+2)/2

Réponse
La formule est vraie pour tout n≥1.`,
            },
            {
                title: "Ensembles et fonctions",
                theory: "Les ensembles regroupent des objets, tandis que les fonctions associent des éléments d’un ensemble à ceux d’un autre. Les opérations comme l’union, l’intersection et la différence permettent de manipuler les ensembles. Les notions d’injection, de surjection et de bijection servent ensuite à comparer la structure des fonctions.",
                code: `Mini-problème
A={1,2,3,4}, B={3,4,5}. Trouver A∪B et A∩B.

Méthode
1. Union : tous les éléments sans répétition
2. Intersection : éléments communs
3. Écrire les ensembles obtenus

Réponse
A∪B={1,2,3,4,5}
A∩B={3,4}`,
            },
        ],
    },
    {
        id: "discrete_nombres_modulaire",
        title: "Nombres, bases et modulo",
        subtitle: "Calculer dans des systèmes discrets",
        description: "Comprendre les bases numériques, la divisibilité et l’arithmétique modulaire.",
        totalSlides: 3,
        slides: [
            {
                title: "Représentation en base b",
                theory: "Un nombre peut être écrit dans différentes bases, comme la base 2, la base 10 ou la base 16. La valeur ne change pas, mais les symboles et les puissances utilisées changent. Pour convertir vers la base 2, on utilise souvent les divisions successives par 2.",
                code: `Mini-problème
Écrire 13 en base 2.

Méthode
1. 13 = 2×6 + 1
2. 6 = 2×3 + 0
3. 3 = 2×1 + 1
4. 1 = 2×0 + 1
5. Lire les restes de bas en haut

Réponse
13₁₀ = 1101₂`,
            },
            {
                title: "Divisibilité et pgcd",
                theory: "La divisibilité permet de savoir quand un entier se partage exactement par un autre. Le pgcd donne le plus grand diviseur commun entre deux entiers. L’algorithme d’Euclide est une méthode rapide pour le trouver avec des divisions successives.",
                code: `Mini-problème
Calculer pgcd(84,30).

Méthode
1. 84 = 30×2 + 24
2. 30 = 24×1 + 6
3. 24 = 6×4 + 0
4. Le dernier reste non nul est 6

Réponse
pgcd(84,30)=6`,
            },
            {
                title: "Arithmétique modulaire",
                theory: "Le calcul modulo garde seulement le reste d’une division. Dire que a est congru à b modulo n signifie que a et b ont le même reste quand on les divise par n. Cette idée est utilisée dans les horloges, les cycles, les bases informatiques et la cryptographie.",
                code: `Mini-problème
Résoudre 3x ≡ 1 (mod 7).

Méthode
1. Tester les restes possibles
2. 3×5=15
3. 15 laisse un reste 1 modulo 7

Réponse
x ≡ 5 (mod 7)`,
            },
        ],
    },
    {
        id: "discrete_denombrer_recurrence",
        title: "Dénombrement et récurrence",
        subtitle: "Compter et construire",
        description: "Utiliser les principes de comptage, les combinaisons et les relations de récurrence.",
        totalSlides: 3,
        slides: [
            {
                title: "Principes d’addition et de multiplication",
                theory: "Le principe d’addition s’applique quand on choisit entre des cas séparés. Le principe de multiplication s’applique quand un choix se fait en étapes successives. Bien distinguer ces deux situations est la base de presque tous les problèmes de dénombrement.",
                code: `Mini-problème
Un code est formé d’une lettre parmi 3 et d’un chiffre parmi 4.

Méthode
1. 3 choix pour la lettre
2. 4 choix pour le chiffre
3. Les choix sont successifs, donc on multiplie

Réponse
3×4 = 12 codes`,
            },
            {
                title: "Permutations, combinaisons et remise",
                theory: "Une permutation compte les résultats où l’ordre est important. Une combinaison compte les groupes où l’ordre n’a pas d’importance. Avec remise, un objet peut être choisi plusieurs fois, alors que sans remise le nombre de choix diminue à chaque étape.",
                code: `Mini-problème
Combien de groupes de 3 peut-on former avec 8 élèves ?

Méthode
1. L’ordre ne compte pas
2. Utiliser C(8,3)
3. C(8,3)=8!/(3!5!)
4. Calculer : 56

Réponse
56 groupes`,
            },
            {
                title: "Principe des tiroirs et suites de récurrence",
                theory: "Le principe des tiroirs affirme qu’en plaçant plus d’objets que de tiroirs, au moins un tiroir contient plusieurs objets. Les suites de récurrence, elles, définissent un terme à partir des précédents. Ces deux outils permettent de prouver l’existence d’un résultat ou de construire une suite étape par étape.",
                code: `Mini-problème
Tour de Hanoï : T(1)=1 et T(n)=2T(n-1)+1. Calculer T(4).

Méthode
1. T(1)=1
2. T(2)=2×1+1=3
3. T(3)=2×3+1=7
4. T(4)=2×7+1=15

Réponse
T(4)=15`,
            },
        ],
    },
    {
        id: "discrete_graphes",
        title: "Graphes et matrices",
        subtitle: "Relier et représenter",
        description: "Introduire les graphes, leurs familles, l’isomorphisme et les matrices d’adjacence.",
        totalSlides: 3,
        slides: [
            {
                title: "Sommets, arêtes et degrés",
                theory: "Un graphe est formé de sommets reliés par des arêtes ou des arcs. Le degré d’un sommet compte le nombre de liaisons qui le touchent. Le lemme de la poignée de main dit que la somme des degrés vaut deux fois le nombre d’arêtes dans un graphe non orienté.",
                code: `Mini-problème
Les degrés sont 2, 2, 3, 3. Trouver le nombre d’arêtes.

Méthode
1. Somme des degrés : 2+2+3+3=10
2. Chaque arête compte deux fois
3. Diviser par 2

Réponse
Il y a 5 arêtes.`,
            },
            {
                title: "Familles et isomorphisme",
                theory: "Les familles de graphes comme les chemins, cycles, graphes complets et arbres reviennent souvent. Deux graphes sont isomorphes s’ils ont la même structure, même si leur dessin est différent. Pour vérifier cela, on compare des invariants comme le nombre de sommets, d’arêtes et les degrés.",
                code: `Mini-problème
G a les degrés 1,1,2,2 et H a les degrés 1,1,1,3. Sont-ils isomorphes ?

Méthode
1. Comparer les suites de degrés
2. G : 1,1,2,2
3. H : 1,1,1,3
4. Les suites sont différentes

Réponse
Non, ils ne sont pas isomorphes.`,
            },
            {
                title: "Matrice d’adjacence",
                theory: "La matrice d’adjacence transforme un graphe en tableau de nombres. Dans un graphe simple, on écrit 1 si deux sommets sont reliés et 0 sinon. Les puissances de cette matrice peuvent aussi compter les chemins d’une certaine longueur entre les sommets.",
                code: `Mini-problème
Construire la matrice du chemin 1—2—3.

Méthode
1. 1 est relié à 2
2. 2 est relié à 1 et 3
3. 3 est relié à 2
4. Remplir la matrice

Réponse
A = [
 [0,1,0],
 [1,0,1],
 [0,1,0]
]`,
            },
        ],
    },
];

const physicsCourses: CoursApprentissage[] = [
    {
        id: "si-vecteurs",
        title: "SI et vecteurs",
        subtitle: "Physique mécanique",
        icon: "📐",
        color: "from-blue-500 to-cyan-600",
        description: "Comprendre les unités du SI, les transformations d’unités et les bases des vecteurs.",
        totalSlides: 6,
        slides: [
            {
                title: "Le système international d’unités (SI)",
                theory: "Le SI standardise les unités physiques: mètre pour la distance, kilogramme pour la masse, seconde pour le temps et newton pour la force.",
                code: "distance: m\nmasse: kg\ntemps: s\nforce: N\nvitesse: m/s\naccélération: m/s²",
                animation: {
                    type: "flow",
                    paths: [
                        { label: "Identifier", result: true },
                        { label: "Calculer", result: true },
                        { label: "Conclure", result: true },
                    ],
                    label: "On applique la méthode étape par étape.",
                },
            },
            {
                title: "Transformer des unités",
                theory: "Transformer une unité revient à exprimer la même grandeur autrement. Pour passer de km/h à m/s, on divise par 3,6.",
                code: "3 km = 3000 m\n2 min = 120 s\n72 km/h = 72 ÷ 3,6 = 20 m/s",
                animation: {
                    type: "flow",
                    paths: [
                        { label: "Identifier", result: true },
                        { label: "Calculer", result: true },
                        { label: "Conclure", result: true },
                    ],
                    label: "On applique la méthode étape par étape.",
                },
            },
            {
                title: "Qu’est-ce qu’un vecteur ?",
                theory: "Un vecteur possède un module, une direction et un sens. La position, la vitesse et l’accélération sont des vecteurs.",
                code: "vecteur = module + direction + sens\nv⃗ = 5 m/s vers la droite",
                animation: {
                    type: "flow",
                    paths: [
                        { label: "Identifier", result: true },
                        { label: "Calculer", result: true },
                        { label: "Conclure", result: true },
                    ],
                    label: "On applique la méthode étape par étape.",
                },
            },
            {
                title: "Vecteurs unitaires et composantes",
                theory: "Dans un repère, un vecteur se décompose selon les axes. Son module se calcule avec Pythagore.",
                code: "v⃗=(v_x,v_y)\n|v⃗|=√(v_x²+v_y²)\nθ=arctan(v_y/v_x)",
                animation: {
                    type: "flow",
                    paths: [
                        { label: "Identifier", result: true },
                        { label: "Calculer", result: true },
                        { label: "Conclure", result: true },
                    ],
                    label: "On applique la méthode étape par étape.",
                },
            },
            {
                title: "Opérations sur les vecteurs",
                theory: "On additionne, soustrait ou multiplie les vecteurs par un scalaire composante par composante.",
                code: "u⃗=(1,2), v⃗=(3,4)\nu⃗+v⃗=(4,6)\n2u⃗=(2,4)",
                animation: {
                    type: "flow",
                    paths: [
                        { label: "Identifier", result: true },
                        { label: "Calculer", result: true },
                        { label: "Conclure", result: true },
                    ],
                    label: "On applique la méthode étape par étape.",
                },
            },
            {
                title: "Produit scalaire",
                theory: "Le produit scalaire mesure l’alignement de deux vecteurs et sert au calcul du travail.",
                code: "A⃗·B⃗=|A⃗||B⃗|cosθ\nA⃗=(3,4), B⃗=(1,2)\nA⃗·B⃗=3×1+4×2=11",
                animation: {
                    type: "flow",
                    paths: [
                        { label: "Identifier", result: true },
                        { label: "Calculer", result: true },
                        { label: "Conclure", result: true },
                    ],
                    label: "On applique la méthode étape par étape.",
                },
            },
        ],
    },
    {
        id: "cinematique-vectorielle",
        title: "Cinématique",
        subtitle: "Physique mécanique",
        icon: "📍",
        color: "from-emerald-500 to-teal-600",
        description: "Décrire le mouvement d’un mobile par sa position, sa vitesse et son accélération.",
        totalSlides: 5,
        slides: [
            {
                title: "Position vectorielle",
                theory: "La position vectorielle indique où se trouve l’objet par rapport à une origine.",
                code: "r⃗=x i⃗+y j⃗\nexemple: r⃗=(3 m,2 m)",
                animation: {
                    type: "flow",
                    paths: [
                        { label: "Identifier", result: true },
                        { label: "Calculer", result: true },
                        { label: "Conclure", result: true },
                    ],
                    label: "On applique la méthode étape par étape.",
                },
            },
            {
                title: "Vitesse moyenne vectorielle",
                theory: "La vitesse moyenne vectorielle est le déplacement total divisé par le temps total.",
                code: "v⃗_moy=Δr⃗/Δt\nΔr⃗=(10 m,0), Δt=5 s ⇒ v⃗=(2 m/s,0)",
                animation: {
                    type: "flow",
                    paths: [
                        { label: "Identifier", result: true },
                        { label: "Calculer", result: true },
                        { label: "Conclure", result: true },
                    ],
                    label: "On applique la méthode étape par étape.",
                },
            },
            {
                title: "Vitesse instantanée",
                theory: "La vitesse instantanée est la dérivée de la position et correspond à la pente de x(t).",
                code: "v⃗=dr⃗/dt\nsi x(t)=3t², alors v_x=6t",
                animation: {
                    type: "flow",
                    paths: [
                        { label: "Identifier", result: true },
                        { label: "Calculer", result: true },
                        { label: "Conclure", result: true },
                    ],
                    label: "On applique la méthode étape par étape.",
                },
            },
            {
                title: "Accélération",
                theory: "L’accélération mesure la variation de vitesse dans le temps.",
                code: "a⃗=dv⃗/dt\nΔv=12 m/s en 6 s ⇒ a=2 m/s²",
                animation: {
                    type: "flow",
                    paths: [
                        { label: "Identifier", result: true },
                        { label: "Calculer", result: true },
                        { label: "Conclure", result: true },
                    ],
                    label: "On applique la méthode étape par étape.",
                },
            },
            {
                title: "Graphiques de mouvement",
                theory: "Les graphes x(t), v(t) et a(t) sont reliés par les pentes et les aires.",
                code: "pente de x(t)=v_x\npente de v_x(t)=a_x\naire sous v_x(t)=Δx",
                animation: {
                    type: "flow",
                    paths: [
                        { label: "Identifier", result: true },
                        { label: "Calculer", result: true },
                        { label: "Conclure", result: true },
                    ],
                    label: "On applique la méthode étape par étape.",
                },
            },
        ],
    },
    {
        id: "mrua-chute-libre",
        title: "MRUA",
        subtitle: "Physique mécanique",
        icon: "🏃",
        color: "from-orange-500 to-red-600",
        description: "Étudier un mouvement en ligne droite avec une accélération constante.",
        totalSlides: 5,
        slides: [
            {
                title: "Le MRUA",
                theory: "Le MRUA est un mouvement rectiligne où l’accélération reste constante.",
                code: "a=constante\nv=v₀+at\nx=x₀+v₀t+1/2 at²",
                animation: {
                    type: "flow",
                    paths: [
                        { label: "Identifier", result: true },
                        { label: "Calculer", result: true },
                        { label: "Conclure", result: true },
                    ],
                    label: "On applique la méthode étape par étape.",
                },
            },
            {
                title: "Équations du MRUA",
                theory: "Les équations du MRUA relient position, vitesse, temps et accélération.",
                code: "v=v₀+at\nΔx=v₀t+1/2 at²\nv²=v₀²+2aΔx",
                animation: {
                    type: "flow",
                    paths: [
                        { label: "Identifier", result: true },
                        { label: "Calculer", result: true },
                        { label: "Conclure", result: true },
                    ],
                    label: "On applique la méthode étape par étape.",
                },
            },
            {
                title: "Chute libre",
                theory: "La chute libre est un MRUA vertical causé par la gravité.",
                code: "g≈9,8 m/s²\ny vers le haut ⇒ a=-g",
                animation: {
                    type: "flow",
                    paths: [
                        { label: "Identifier", result: true },
                        { label: "Calculer", result: true },
                        { label: "Conclure", result: true },
                    ],
                    label: "On applique la méthode étape par étape.",
                },
            },
            {
                title: "Plusieurs paliers d’accélération",
                theory: "Quand l’accélération change, on découpe le mouvement en phases.",
                code: "palier 1: v₁=v₀+a₁t₁\npalier 2: v₂=v₁+a₂t₂",
                animation: {
                    type: "flow",
                    paths: [
                        { label: "Identifier", result: true },
                        { label: "Calculer", result: true },
                        { label: "Conclure", result: true },
                    ],
                    label: "On applique la méthode étape par étape.",
                },
            },
            {
                title: "Problèmes à deux mobiles",
                theory: "Pour deux objets, on cherche le temps où leurs positions sont égales.",
                code: "x₁(t)=x₂(t)\n5t=10-3t ⇒ 8t=10 ⇒ t=1,25 s",
                animation: {
                    type: "flow",
                    paths: [
                        { label: "Identifier", result: true },
                        { label: "Calculer", result: true },
                        { label: "Conclure", result: true },
                    ],
                    label: "On applique la méthode étape par étape.",
                },
            },
        ],
    },
    {
        id: "projectiles-mcu",
        title: "Mouvements en 2D et circulaires",
        subtitle: "Physique mécanique",
        icon: "🎯",
        color: "from-purple-500 to-indigo-600",
        description: "Analyser les projectiles, le MCU, le MCU non uniforme et la relativité des vitesses.",
        totalSlides: 5,
        slides: [
            {
                title: "Mouvement de projectile",
                theory: "Un projectile combine un mouvement horizontal uniforme et un mouvement vertical MRUA.",
                code: "a_x=0, v_x=v₀x\na_y=-g, v_y=v₀y-gt",
                animation: {
                    type: "flow",
                    paths: [
                        { label: "Identifier", result: true },
                        { label: "Calculer", result: true },
                        { label: "Conclure", result: true },
                    ],
                    label: "On applique la méthode étape par étape.",
                },
            },
            {
                title: "Décomposer la vitesse initiale",
                theory: "Une vitesse lancée avec un angle se décompose avec cosinus et sinus.",
                code: "v₀x=v₀cosθ\nv₀y=v₀sinθ\n20 m/s à 30° ⇒ v₀y=10 m/s",
                animation: {
                    type: "flow",
                    paths: [
                        { label: "Identifier", result: true },
                        { label: "Calculer", result: true },
                        { label: "Conclure", result: true },
                    ],
                    label: "On applique la méthode étape par étape.",
                },
            },
            {
                title: "Mouvement circulaire uniforme (MCU)",
                theory: "En MCU, la vitesse scalaire reste constante mais la direction change.",
                code: "a_c=v²/r=ω²r\nv=2πr/T",
                animation: {
                    type: "flow",
                    paths: [
                        { label: "Identifier", result: true },
                        { label: "Calculer", result: true },
                        { label: "Conclure", result: true },
                    ],
                    label: "On applique la méthode étape par étape.",
                },
            },
            {
                title: "MCU non uniforme",
                theory: "Si la vitesse de rotation change, il y a une accélération centripète et tangentielle.",
                code: "a⃗=a⃗_c+a⃗_t\na_c=v²/r\na_t=Δv/Δt",
                animation: {
                    type: "flow",
                    paths: [
                        { label: "Identifier", result: true },
                        { label: "Calculer", result: true },
                        { label: "Conclure", result: true },
                    ],
                    label: "On applique la méthode étape par étape.",
                },
            },
            {
                title: "Relativité des vitesses",
                theory: "La vitesse dépend du référentiel et les vitesses relatives s’additionnent vectoriellement.",
                code: "v⃗_A/S=v⃗_A/B+v⃗_B/S\n1 m/s + 10 m/s = 11 m/s",
                animation: {
                    type: "flow",
                    paths: [
                        { label: "Identifier", result: true },
                        { label: "Calculer", result: true },
                        { label: "Conclure", result: true },
                    ],
                    label: "On applique la méthode étape par étape.",
                },
            },
        ],
    },
    {
        id: "newton-forces",
        title: "Lois de Newton et forces",
        subtitle: "Physique mécanique",
        icon: "⚖️",
        color: "from-yellow-500 to-amber-600",
        description: "Comprendre les forces, les lois de Newton, le poids, la gravité et les frottements.",
        totalSlides: 6,
        slides: [
            {
                title: "Première loi de Newton",
                theory: "Sans force résultante, un objet reste au repos ou en mouvement rectiligne uniforme.",
                code: "ΣF⃗=0 ⇒ a⃗=0",
                animation: {
                    type: "flow",
                    paths: [
                        { label: "Identifier", result: true },
                        { label: "Calculer", result: true },
                        { label: "Conclure", result: true },
                    ],
                    label: "On applique la méthode étape par étape.",
                },
            },
            {
                title: "Deuxième loi de Newton",
                theory: "La force résultante cause l’accélération.",
                code: "ΣF⃗=ma⃗\nF=20 N, m=5 kg ⇒ a=4 m/s²",
                animation: {
                    type: "flow",
                    paths: [
                        { label: "Identifier", result: true },
                        { label: "Calculer", result: true },
                        { label: "Conclure", result: true },
                    ],
                    label: "On applique la méthode étape par étape.",
                },
            },
            {
                title: "Troisième loi de Newton",
                theory: "Les forces d’action-réaction ont même grandeur et sens opposés.",
                code: "F⃗_A→B=-F⃗_B→A",
                animation: {
                    type: "flow",
                    paths: [
                        { label: "Identifier", result: true },
                        { label: "Calculer", result: true },
                        { label: "Conclure", result: true },
                    ],
                    label: "On applique la méthode étape par étape.",
                },
            },
            {
                title: "Masse, poids et inertie",
                theory: "La masse est en kg; le poids est une force en newtons.",
                code: "P=mg\n1 kg ⇒ P≈9,8 N",
                animation: {
                    type: "flow",
                    paths: [
                        { label: "Identifier", result: true },
                        { label: "Calculer", result: true },
                        { label: "Conclure", result: true },
                    ],
                    label: "On applique la méthode étape par étape.",
                },
            },
            {
                title: "Gravitation universelle",
                theory: "Deux masses s’attirent avec une force qui diminue avec le carré de la distance.",
                code: "F_g=Gm₁m₂/r²",
                animation: {
                    type: "flow",
                    paths: [
                        { label: "Identifier", result: true },
                        { label: "Calculer", result: true },
                        { label: "Conclure", result: true },
                    ],
                    label: "On applique la méthode étape par étape.",
                },
            },
            {
                title: "Frottements",
                theory: "Les frottements s’opposent au mouvement ou à la tendance au mouvement.",
                code: "f_s≤μ_sN\nf_k=μ_kN",
                animation: {
                    type: "flow",
                    paths: [
                        { label: "Identifier", result: true },
                        { label: "Calculer", result: true },
                        { label: "Conclure", result: true },
                    ],
                    label: "On applique la méthode étape par étape.",
                },
            },
        ],
    },
    {
        id: "travail-energie",
        title: "Travail, puissance et énergie",
        subtitle: "Physique mécanique",
        icon: "🔋",
        color: "from-green-500 to-lime-600",
        description: "Étudier le travail d’une force, l’énergie cinétique, les énergies potentielles et la puissance.",
        totalSlides: 7,
        slides: [
            {
                title: "Travail (force constante)",
                theory: "Le travail est l’énergie transférée par une force pendant un déplacement.",
                code: "W=Fdcosθ\nF=10 N, d=3 m, θ=0° ⇒ W=30 J",
                animation: {
                    type: "flow",
                    paths: [
                        { label: "Identifier", result: true },
                        { label: "Calculer", result: true },
                        { label: "Conclure", result: true },
                    ],
                    label: "On applique la méthode étape par étape.",
                },
            },
            {
                title: "Travail (force variable)",
                theory: "Si la force varie, le travail est l’aire sous la courbe F(x).",
                code: "W=∫F(x)dx\n5 N sur 4 m ⇒ W=20 J",
                animation: {
                    type: "flow",
                    paths: [
                        { label: "Identifier", result: true },
                        { label: "Calculer", result: true },
                        { label: "Conclure", result: true },
                    ],
                    label: "On applique la méthode étape par étape.",
                },
            },
            {
                title: "Théorème de l’énergie cinétique",
                theory: "Le travail net est égal à la variation d’énergie cinétique.",
                code: "W_net=ΔK\nK=1/2mv²",
                animation: {
                    type: "flow",
                    paths: [
                        { label: "Identifier", result: true },
                        { label: "Calculer", result: true },
                        { label: "Conclure", result: true },
                    ],
                    label: "On applique la méthode étape par étape.",
                },
            },
            {
                title: "Énergie potentielle gravitationnelle",
                theory: "L’énergie potentielle gravitationnelle dépend de la masse, de g et de la hauteur.",
                code: "U_g=mgh\n2 kg à 3 m ⇒ U≈58,8 J",
                animation: {
                    type: "flow",
                    paths: [
                        { label: "Identifier", result: true },
                        { label: "Calculer", result: true },
                        { label: "Conclure", result: true },
                    ],
                    label: "On applique la méthode étape par étape.",
                },
            },
            {
                title: "Énergie potentielle élastique",
                theory: "Un ressort déformé stocke de l’énergie.",
                code: "U_s=1/2kx²\nk=100 N/m, x=0,2 m ⇒ U=2 J",
                animation: {
                    type: "flow",
                    paths: [
                        { label: "Identifier", result: true },
                        { label: "Calculer", result: true },
                        { label: "Conclure", result: true },
                    ],
                    label: "On applique la méthode étape par étape.",
                },
            },
            {
                title: "Conservation de l’énergie mécanique",
                theory: "Si seules des forces conservatives agissent, l’énergie mécanique reste constante.",
                code: "E_m=K+U\nE_i=E_f",
                animation: {
                    type: "flow",
                    paths: [
                        { label: "Identifier", result: true },
                        { label: "Calculer", result: true },
                        { label: "Conclure", result: true },
                    ],
                    label: "On applique la méthode étape par étape.",
                },
            },
            {
                title: "Puissance",
                theory: "La puissance est le travail effectué par unité de temps.",
                code: "P=W/Δt\n120 J en 6 s ⇒ P=20 W",
                animation: {
                    type: "flow",
                    paths: [
                        { label: "Identifier", result: true },
                        { label: "Calculer", result: true },
                        { label: "Conclure", result: true },
                    ],
                    label: "On applique la méthode étape par étape.",
                },
            },
        ],
    },
    {
        id: "momentum-rotation",
        title: "Quantité de mouvement et rotation",
        subtitle: "Physique mécanique",
        icon: "🌀",
        color: "from-pink-500 to-rose-600",
        description: "Comprendre le centre de masse, la quantité de mouvement, les collisions et les mouvements de rotation.",
        totalSlides: 7,
        slides: [
            {
                title: "Centre de masse",
                theory: "Le centre de masse est une position moyenne pondérée par les masses.",
                code: "x_cm=(m₁x₁+m₂x₂)/(m₁+m₂)\n2 kg à 0 m et 6 kg à 4 m ⇒ x_cm=3 m",
                animation: {
                    type: "flow",
                    paths: [
                        { label: "Identifier", result: true },
                        { label: "Calculer", result: true },
                        { label: "Conclure", result: true },
                    ],
                    label: "On applique la méthode étape par étape.",
                },
            },
            {
                title: "Quantité de mouvement",
                theory: "La quantité de mouvement dépend de la masse et de la vitesse.",
                code: "p⃗=mv⃗\n3 kg à 4 m/s ⇒ p=12 kg·m/s",
                animation: {
                    type: "flow",
                    paths: [
                        { label: "Identifier", result: true },
                        { label: "Calculer", result: true },
                        { label: "Conclure", result: true },
                    ],
                    label: "On applique la méthode étape par étape.",
                },
            },
            {
                title: "Conservation de la quantité de mouvement",
                theory: "Dans un système isolé, la quantité de mouvement totale se conserve.",
                code: "p_total,avant=p_total,après",
                animation: {
                    type: "flow",
                    paths: [
                        { label: "Identifier", result: true },
                        { label: "Calculer", result: true },
                        { label: "Conclure", result: true },
                    ],
                    label: "On applique la méthode étape par étape.",
                },
            },
            {
                title: "Collisions",
                theory: "Les collisions peuvent conserver ou perdre de l’énergie cinétique, mais p se conserve si le système est isolé.",
                code: "élastique: K conservée\ninélastique: K non conservée",
                animation: {
                    type: "flow",
                    paths: [
                        { label: "Identifier", result: true },
                        { label: "Calculer", result: true },
                        { label: "Conclure", result: true },
                    ],
                    label: "On applique la méthode étape par étape.",
                },
            },
            {
                title: "Cinématique de rotation",
                theory: "La rotation utilise θ, ω et α, analogues à x, v et a.",
                code: "θ: position angulaire\nω: vitesse angulaire\nα: accélération angulaire",
                animation: {
                    type: "flow",
                    paths: [
                        { label: "Identifier", result: true },
                        { label: "Calculer", result: true },
                        { label: "Conclure", result: true },
                    ],
                    label: "On applique la méthode étape par étape.",
                },
            },
            {
                title: "Lien entre translation et rotation",
                theory: "Le rayon relie les grandeurs angulaires et linéaires.",
                code: "s=rθ\nv=rω\na=rα",
                animation: {
                    type: "flow",
                    paths: [
                        { label: "Identifier", result: true },
                        { label: "Calculer", result: true },
                        { label: "Conclure", result: true },
                    ],
                    label: "On applique la méthode étape par étape.",
                },
            },
            {
                title: "Moment de force",
                theory: "Le moment de force produit une rotation autour d’un pivot.",
                code: "τ=rFsinθ\nΣτ=Iα\nL=Iω",
                animation: {
                    type: "flow",
                    paths: [
                        { label: "Identifier", result: true },
                        { label: "Calculer", result: true },
                        { label: "Conclure", result: true },
                    ],
                    label: "On applique la méthode étape par étape.",
                },
            },
        ],
    },
    {
        id: "electrostatique-charges",
        title: "Charges et phénomènes électrostatiques",
        subtitle: "Électricité et magnétisme",
        icon: "⚡",
        color: "from-yellow-500 to-orange-600",
        description: "Comprendre l’origine des charges électriques, leur conservation et la force électrique entre deux charges.",
        totalSlides: 6,
        slides: [
            {
                title: "Phénomènes électrostatiques",
                theory: "L’électrostatique étudie les charges au repos et leurs interactions.",
                code: "ballon négatif après frottement ⇒ il a gagné des électrons",
                animation: {
                    type: "flow",
                    paths: [
                        { label: "Identifier", result: true },
                        { label: "Calculer", result: true },
                        { label: "Conclure", result: true },
                    ],
                    label: "On applique la méthode étape par étape.",
                },
            },
            {
                title: "Types de charges",
                theory: "Deux charges de même signe se repoussent; deux charges opposées s’attirent.",
                code: "q₁=+3 μC, q₂=-2 μC ⇒ attraction",
                animation: {
                    type: "flow",
                    paths: [
                        { label: "Identifier", result: true },
                        { label: "Calculer", result: true },
                        { label: "Conclure", result: true },
                    ],
                    label: "On applique la méthode étape par étape.",
                },
            },
            {
                title: "Conducteurs et isolants",
                theory: "Un conducteur laisse circuler les charges, contrairement à un isolant.",
                code: "métal: conducteur\nplastique: isolant",
                animation: {
                    type: "flow",
                    paths: [
                        { label: "Identifier", result: true },
                        { label: "Calculer", result: true },
                        { label: "Conclure", result: true },
                    ],
                    label: "On applique la méthode étape par étape.",
                },
            },
            {
                title: "Conservation de la charge",
                theory: "La charge totale d’un système isolé reste constante.",
                code: "+8 μC + (-2 μC)=+6 μC\n2 sphères identiques ⇒ +3 μC chacune",
                animation: {
                    type: "flow",
                    paths: [
                        { label: "Identifier", result: true },
                        { label: "Calculer", result: true },
                        { label: "Conclure", result: true },
                    ],
                    label: "On applique la méthode étape par étape.",
                },
            },
            {
                title: "Charge élémentaire et quantification",
                theory: "La charge existe par multiples de la charge élémentaire.",
                code: "q=ne\n|-4,8×10⁻¹⁹|/(1,6×10⁻¹⁹)=3 électrons",
                animation: {
                    type: "flow",
                    paths: [
                        { label: "Identifier", result: true },
                        { label: "Calculer", result: true },
                        { label: "Conclure", result: true },
                    ],
                    label: "On applique la méthode étape par étape.",
                },
            },
            {
                title: "Loi de Coulomb",
                theory: "La force électrique entre deux charges dépend des charges et de la distance.",
                code: "F=k|q₁q₂|/r²\nq₁=2 μC, q₂=3 μC, r=0,50 m ⇒ F≈0,216 N",
                animation: {
                    type: "flow",
                    paths: [
                        { label: "Identifier", result: true },
                        { label: "Calculer", result: true },
                        { label: "Conclure", result: true },
                    ],
                    label: "On applique la méthode étape par étape.",
                },
            },
        ],
    },
    {
        id: "champ-electrique",
        title: "Champ électrique et superposition",
        subtitle: "Électricité et magnétisme",
        icon: "🧲",
        color: "from-blue-500 to-cyan-600",
        description: "Comprendre le champ électrique comme un champ vectoriel causé par des charges.",
        totalSlides: 6,
        slides: [
            {
                title: "Définition du champ électrique",
                theory: "Le champ électrique indique la force par unité de charge.",
                code: "E⃗=F⃗/q\n0,40 N / 2,0 μC = 2,0×10⁵ N/C",
                animation: {
                    type: "flow",
                    paths: [
                        { label: "Identifier", result: true },
                        { label: "Calculer", result: true },
                        { label: "Conclure", result: true },
                    ],
                    label: "On applique la méthode étape par étape.",
                },
            },
            {
                title: "Champ d’une charge ponctuelle",
                theory: "Le champ d’une charge ponctuelle dépend de la charge et de la distance.",
                code: "E=k|q|/r²\n4,0 μC à 0,20 m ⇒ E≈9,0×10⁵ N/C",
                animation: {
                    type: "flow",
                    paths: [
                        { label: "Identifier", result: true },
                        { label: "Calculer", result: true },
                        { label: "Conclure", result: true },
                    ],
                    label: "On applique la méthode étape par étape.",
                },
            },
            {
                title: "Forme vectorielle de la loi de Coulomb",
                theory: "La forme vectorielle donne aussi la direction de la force.",
                code: "F⃗=k(q₁q₂/r²)r̂\n+ et + ⇒ répulsion",
                animation: {
                    type: "flow",
                    paths: [
                        { label: "Identifier", result: true },
                        { label: "Calculer", result: true },
                        { label: "Conclure", result: true },
                    ],
                    label: "On applique la méthode étape par étape.",
                },
            },
            {
                title: "Lignes de champ électrique",
                theory: "Les lignes de champ indiquent direction et intensité.",
                code: "lignes rapprochées ⇒ champ fort",
                animation: {
                    type: "flow",
                    paths: [
                        { label: "Identifier", result: true },
                        { label: "Calculer", result: true },
                        { label: "Conclure", result: true },
                    ],
                    label: "On applique la méthode étape par étape.",
                },
            },
            {
                title: "Principe de superposition",
                theory: "Le champ total est la somme vectorielle des champs individuels.",
                code: "E₁=300 vers x, E₂=400 vers y\nE_total=√(300²+400²)=500 N/C",
                animation: {
                    type: "flow",
                    paths: [
                        { label: "Identifier", result: true },
                        { label: "Calculer", result: true },
                        { label: "Conclure", result: true },
                    ],
                    label: "On applique la méthode étape par étape.",
                },
            },
            {
                title: "Mouvement d’une charge dans un champ uniforme",
                theory: "Dans un champ uniforme, une charge subit F=qE et a=qE/m.",
                code: "q=3,0 μC, E=2000 N/C, m=0,020 kg\nF=0,006 N\na=0,30 m/s²",
                animation: {
                    type: "flow",
                    paths: [
                        { label: "Identifier", result: true },
                        { label: "Calculer", result: true },
                        { label: "Conclure", result: true },
                    ],
                    label: "On applique la méthode étape par étape.",
                },
            },
        ],
    },
    {
        id: "distributions-conducteurs",
        title: "Distributions de charges et conducteurs",
        subtitle: "Électricité et magnétisme",
        icon: "📏",
        color: "from-indigo-500 to-violet-600",
        description: "Calculer le champ électrique de systèmes de charges et comprendre les conducteurs en équilibre électrostatique.",
        totalSlides: 5,
        slides: [
            {
                title: "Champ de charges ponctuelles en 2D",
                theory: "En 2D, on décompose chaque champ en composantes avant d’additionner.",
                code: "E_x=600, E_y=800\nE=√(600²+800²)=1000 N/C",
                animation: {
                    type: "flow",
                    paths: [
                        { label: "Identifier", result: true },
                        { label: "Calculer", result: true },
                        { label: "Conclure", result: true },
                    ],
                    label: "On applique la méthode étape par étape.",
                },
            },
            {
                title: "Distributions continues de charges",
                theory: "Une distribution continue se traite en petits éléments dq puis par intégration.",
                code: "λ=Q/L\nσ=Q/A\ndE=kdq/r²",
                animation: {
                    type: "flow",
                    paths: [
                        { label: "Identifier", result: true },
                        { label: "Calculer", result: true },
                        { label: "Conclure", result: true },
                    ],
                    label: "On applique la méthode étape par étape.",
                },
            },
            {
                title: "Champ d’une tige chargée",
                theory: "Une tige uniforme utilise une densité linéique.",
                code: "λ=Q/L\nQ=6 μC, L=2 m ⇒ λ=3 μC/m",
                animation: {
                    type: "flow",
                    paths: [
                        { label: "Identifier", result: true },
                        { label: "Calculer", result: true },
                        { label: "Conclure", result: true },
                    ],
                    label: "On applique la méthode étape par étape.",
                },
            },
            {
                title: "Conducteur dans un champ électrique",
                theory: "Dans un conducteur en équilibre, le champ intérieur devient nul.",
                code: "E_intérieur=0",
                animation: {
                    type: "flow",
                    paths: [
                        { label: "Identifier", result: true },
                        { label: "Calculer", result: true },
                        { label: "Conclure", result: true },
                    ],
                    label: "On applique la méthode étape par étape.",
                },
            },
            {
                title: "Conducteurs en équilibre électrostatique",
                theory: "La charge excédentaire se place à la surface et la surface est équipotentielle.",
                code: "E=0 à l’intérieur\ncharge sur la surface\nchamp extérieur perpendiculaire",
                animation: {
                    type: "flow",
                    paths: [
                        { label: "Identifier", result: true },
                        { label: "Calculer", result: true },
                        { label: "Conclure", result: true },
                    ],
                    label: "On applique la méthode étape par étape.",
                },
            },
        ],
    },
    {
        id: "potentiel-energie-condensateurs",
        title: "Potentiel, énergie et condensateurs",
        subtitle: "Électricité et magnétisme",
        icon: "🔋",
        color: "from-emerald-500 to-teal-600",
        description: "Relier le champ électrique au potentiel, puis étudier les condensateurs et l’énergie électrique.",
        totalSlides: 7,
        slides: [
            {
                title: "Potentiel électrique",
                theory: "Le potentiel est l’énergie potentielle électrique par unité de charge.",
                code: "V=U/q\n10 J / 2,0 C = 5 V",
                animation: {
                    type: "flow",
                    paths: [
                        { label: "Identifier", result: true },
                        { label: "Calculer", result: true },
                        { label: "Conclure", result: true },
                    ],
                    label: "On applique la méthode étape par étape.",
                },
            },
            {
                title: "Potentiel et champ électrique",
                theory: "Dans un champ uniforme, la grandeur du champ vaut ΔV/d.",
                code: "E=ΔV/d\n100 V / 0,020 m = 5000 V/m",
                animation: {
                    type: "flow",
                    paths: [
                        { label: "Identifier", result: true },
                        { label: "Calculer", result: true },
                        { label: "Conclure", result: true },
                    ],
                    label: "On applique la méthode étape par étape.",
                },
            },
            {
                title: "Potentiel d’une charge ponctuelle",
                theory: "Le potentiel est scalaire; on additionne les potentiels avec leur signe.",
                code: "V=kq/r\n3,0 μC à 0,50 m ⇒ V≈5,4×10⁴ V",
                animation: {
                    type: "flow",
                    paths: [
                        { label: "Identifier", result: true },
                        { label: "Calculer", result: true },
                        { label: "Conclure", result: true },
                    ],
                    label: "On applique la méthode étape par étape.",
                },
            },
            {
                title: "Énergie potentielle électrique",
                theory: "Deux charges ponctuelles possèdent une énergie potentielle électrique.",
                code: "U=kq₁q₂/r\n2 μC et 4 μC à 0,10 m ⇒ U≈0,72 J",
                animation: {
                    type: "flow",
                    paths: [
                        { label: "Identifier", result: true },
                        { label: "Calculer", result: true },
                        { label: "Conclure", result: true },
                    ],
                    label: "On applique la méthode étape par étape.",
                },
            },
            {
                title: "Capacité d’un condensateur",
                theory: "La capacité mesure la charge stockée par volt.",
                code: "C=Q/ΔV\n30 μC / 10 V = 3,0 μF",
                animation: {
                    type: "flow",
                    paths: [
                        { label: "Identifier", result: true },
                        { label: "Calculer", result: true },
                        { label: "Conclure", result: true },
                    ],
                    label: "On applique la méthode étape par étape.",
                },
            },
            {
                title: "Condensateurs en série et parallèle",
                theory: "En parallèle, les capacités s’additionnent; en série, on additionne les inverses.",
                code: "parallèle: C_eq=C₁+C₂\n2 μF + 3 μF = 5 μF",
                animation: {
                    type: "flow",
                    paths: [
                        { label: "Identifier", result: true },
                        { label: "Calculer", result: true },
                        { label: "Conclure", result: true },
                    ],
                    label: "On applique la méthode étape par étape.",
                },
            },
            {
                title: "Énergie et diélectrique",
                theory: "Un condensateur stocke l’énergie dans son champ électrique.",
                code: "U=1/2CV²\nC=4 μF, V=12 V ⇒ U=2,88×10⁻⁴ J",
                animation: {
                    type: "flow",
                    paths: [
                        { label: "Identifier", result: true },
                        { label: "Calculer", result: true },
                        { label: "Conclure", result: true },
                    ],
                    label: "On applique la méthode étape par étape.",
                },
            },
        ],
    },
    {
        id: "courant-continu-circuits",
        title: "Courant continu et circuits",
        subtitle: "Électricité et magnétisme",
        icon: "🔌",
        color: "from-red-500 to-rose-600",
        description: "Analyser les circuits avec courant, résistance, puissance, piles, lois d’Ohm et de Kirchhoff.",
        totalSlides: 7,
        slides: [
            {
                title: "Courant électrique et vitesse de dérive",
                theory: "Le courant est le débit de charge dans un conducteur.",
                code: "I=ΔQ/Δt\n12 C / 4 s = 3 A",
                animation: {
                    type: "flow",
                    paths: [
                        { label: "Identifier", result: true },
                        { label: "Calculer", result: true },
                        { label: "Conclure", result: true },
                    ],
                    label: "On applique la méthode étape par étape.",
                },
            },
            {
                title: "Résistance et résistivité",
                theory: "La résistance dépend du matériau, de la longueur et de l’aire.",
                code: "R=ρL/A\n(1,7×10⁻⁸)(2,0)/(1,0×10⁻⁶)=0,034 Ω",
                animation: {
                    type: "flow",
                    paths: [
                        { label: "Identifier", result: true },
                        { label: "Calculer", result: true },
                        { label: "Conclure", result: true },
                    ],
                    label: "On applique la méthode étape par étape.",
                },
            },
            {
                title: "Loi d’Ohm",
                theory: "La loi d’Ohm relie tension, résistance et courant.",
                code: "V=RI\n20 Ω × 0,30 A = 6,0 V",
                animation: {
                    type: "flow",
                    paths: [
                        { label: "Identifier", result: true },
                        { label: "Calculer", result: true },
                        { label: "Conclure", result: true },
                    ],
                    label: "On applique la méthode étape par étape.",
                },
            },
            {
                title: "Puissance électrique",
                theory: "La puissance mesure l’énergie transformée par seconde.",
                code: "P=VI\n12 V × 2,0 A = 24 W",
                animation: {
                    type: "flow",
                    paths: [
                        { label: "Identifier", result: true },
                        { label: "Calculer", result: true },
                        { label: "Conclure", result: true },
                    ],
                    label: "On applique la méthode étape par étape.",
                },
            },
            {
                title: "Résistances en série et parallèle",
                theory: "En série, on additionne; en parallèle, on additionne les inverses.",
                code: "1/R_eq=1/6+1/3=3/6\nR_eq=2 Ω",
                animation: {
                    type: "flow",
                    paths: [
                        { label: "Identifier", result: true },
                        { label: "Calculer", result: true },
                        { label: "Conclure", result: true },
                    ],
                    label: "On applique la méthode étape par étape.",
                },
            },
            {
                title: "Lois de Kirchhoff",
                theory: "La loi des nœuds conserve le courant et la loi des mailles conserve l’énergie.",
                code: "5=2+I₃ ⇒ I₃=3 A\nΣΔV=0",
                animation: {
                    type: "flow",
                    paths: [
                        { label: "Identifier", result: true },
                        { label: "Calculer", result: true },
                        { label: "Conclure", result: true },
                    ],
                    label: "On applique la méthode étape par étape.",
                },
            },
            {
                title: "Piles idéales, piles réelles et appareils de mesure",
                theory: "Une pile réelle a une résistance interne; voltmètre en parallèle, ampèremètre en série.",
                code: "V_bornes=ε-rI\n12-(0,50)(2,0)=11 V",
                animation: {
                    type: "flow",
                    paths: [
                        { label: "Identifier", result: true },
                        { label: "Calculer", result: true },
                        { label: "Conclure", result: true },
                    ],
                    label: "On applique la méthode étape par étape.",
                },
            },
        ],
    },
    {
        id: "condensateurs-rc",
        title: "Circuits avec condensateurs et régime transitoire",
        subtitle: "Électricité et magnétisme",
        icon: "⏱️",
        color: "from-purple-500 to-fuchsia-600",
        description: "Étudier les circuits avec condensateurs, leur énergie et leur charge/décharge dans un circuit RC.",
        totalSlides: 5,
        slides: [
            {
                title: "Circuit avec condensateurs en régime permanent",
                theory: "En courant continu, après un long temps, le condensateur bloque le courant.",
                code: "long temps en DC ⇒ I_C=0\npile de 9 V ⇒ V_C final=9 V",
                animation: {
                    type: "flow",
                    paths: [
                        { label: "Identifier", result: true },
                        { label: "Calculer", result: true },
                        { label: "Conclure", result: true },
                    ],
                    label: "On applique la méthode étape par étape.",
                },
            },
            {
                title: "Charge d’un condensateur RC",
                theory: "La charge d’un condensateur RC augmente progressivement avec τ=RC.",
                code: "τ=RC\n1000 Ω × 2,0 μF = 2,0 ms",
                animation: {
                    type: "flow",
                    paths: [
                        { label: "Identifier", result: true },
                        { label: "Calculer", result: true },
                        { label: "Conclure", result: true },
                    ],
                    label: "On applique la méthode étape par étape.",
                },
            },
            {
                title: "Décharge d’un condensateur RC",
                theory: "Pendant la décharge, la tension diminue exponentiellement.",
                code: "V(t)=V₀e^(-t/RC)\nà t=τ: 10×0,37=3,7 V",
                animation: {
                    type: "flow",
                    paths: [
                        { label: "Identifier", result: true },
                        { label: "Calculer", result: true },
                        { label: "Conclure", result: true },
                    ],
                    label: "On applique la méthode étape par étape.",
                },
            },
            {
                title: "Énergie dans un condensateur",
                theory: "L’énergie est stockée dans le champ électrique.",
                code: "U=1/2CV²\n10 μF et 20 V ⇒ U=2,0 mJ",
                animation: {
                    type: "flow",
                    paths: [
                        { label: "Identifier", result: true },
                        { label: "Calculer", result: true },
                        { label: "Conclure", result: true },
                    ],
                    label: "On applique la méthode étape par étape.",
                },
            },
            {
                title: "Méthode pour analyser un circuit RC",
                theory: "On identifie charge ou décharge, τ, les valeurs initiales/finales et l’équation.",
                code: "τ=5 s, t=15 s\n15/5=3 constantes de temps",
                animation: {
                    type: "flow",
                    paths: [
                        { label: "Identifier", result: true },
                        { label: "Calculer", result: true },
                        { label: "Conclure", result: true },
                    ],
                    label: "On applique la méthode étape par étape.",
                },
            },
        ],
    },
    {
        id: "magnetisme-induction",
        title: "Champ magnétique, forces et induction",
        subtitle: "Électricité et magnétisme",
        icon: "🧭",
        color: "from-sky-500 to-blue-700",
        description: "Comprendre les champs magnétiques, les forces sur charges/courants, Biot-Savart, Faraday, Lenz et les inducteurs.",
        totalSlides: 8,
        slides: [
            {
                title: "Champ magnétique",
                theory: "Un champ magnétique est produit par des aimants ou des charges en mouvement.",
                code: "B en teslas (T)\nlignes rapprochées ⇒ B fort",
                animation: {
                    type: "flow",
                    paths: [
                        { label: "Identifier", result: true },
                        { label: "Calculer", result: true },
                        { label: "Conclure", result: true },
                    ],
                    label: "On applique la méthode étape par étape.",
                },
            },
            {
                title: "Produit vectoriel",
                theory: "Le produit vectoriel donne une direction perpendiculaire et sert à la règle de la main droite.",
                code: "|A⃗×B⃗|=ABsinθ\nv⃗ à droite, B⃗ dans la page ⇒ F⃗ vers le haut pour q>0",
                animation: {
                    type: "flow",
                    paths: [
                        { label: "Identifier", result: true },
                        { label: "Calculer", result: true },
                        { label: "Conclure", result: true },
                    ],
                    label: "On applique la méthode étape par étape.",
                },
            },
            {
                title: "Force magnétique sur une charge",
                theory: "Une charge en mouvement dans B subit une force perpendiculaire à v.",
                code: "F=|q|vBsinθ\n2,0 μC × 3,0×10⁴ × 0,50 = 0,030 N",
                animation: {
                    type: "flow",
                    paths: [
                        { label: "Identifier", result: true },
                        { label: "Calculer", result: true },
                        { label: "Conclure", result: true },
                    ],
                    label: "On applique la méthode étape par étape.",
                },
            },
            {
                title: "Mouvement circulaire et hélicoïdal",
                theory: "Une charge perpendiculaire à B suit un cercle; avec une composante parallèle, une hélice.",
                code: "r=mv/(|q|B)\n=0,0625 m pour les valeurs données",
                animation: {
                    type: "flow",
                    paths: [
                        { label: "Identifier", result: true },
                        { label: "Calculer", result: true },
                        { label: "Conclure", result: true },
                    ],
                    label: "On applique la méthode étape par étape.",
                },
            },
            {
                title: "Sélecteur de vitesse, spectromètre et cyclotron",
                theory: "Un sélecteur laisse passer les particules quand les forces électrique et magnétique se compensent.",
                code: "v=E/B\n6000/0,20=3,0×10⁴ m/s",
                animation: {
                    type: "flow",
                    paths: [
                        { label: "Identifier", result: true },
                        { label: "Calculer", result: true },
                        { label: "Conclure", result: true },
                    ],
                    label: "On applique la méthode étape par étape.",
                },
            },
            {
                title: "Champ magnétique d’un courant",
                theory: "Un courant produit un champ magnétique; pour un fil long, B diminue avec r.",
                code: "B=μ₀I/(2πr)\nI=5,0 A, r=0,10 m ⇒ B=1,0×10⁻⁵ T",
                animation: {
                    type: "flow",
                    paths: [
                        { label: "Identifier", result: true },
                        { label: "Calculer", result: true },
                        { label: "Conclure", result: true },
                    ],
                    label: "On applique la méthode étape par étape.",
                },
            },
            {
                title: "Induction, Faraday et Lenz",
                theory: "Une variation de flux magnétique induit une f.é.m.; Lenz indique le sens opposé au changement.",
                code: "ε=-NΔΦ/Δt\n50×0,15/0,10=75 V",
                animation: {
                    type: "flow",
                    paths: [
                        { label: "Identifier", result: true },
                        { label: "Calculer", result: true },
                        { label: "Conclure", result: true },
                    ],
                    label: "On applique la méthode étape par étape.",
                },
            },
            {
                title: "Inductance et circuit RL",
                theory: "Un inducteur s’oppose aux variations de courant.",
                code: "τ=L/R\n0,50 H / 10 Ω = 0,050 s",
                animation: {
                    type: "flow",
                    paths: [
                        { label: "Identifier", result: true },
                        { label: "Calculer", result: true },
                        { label: "Conclure", result: true },
                    ],
                    label: "On applique la méthode étape par étape.",
                },
            },
        ],
    },
    {
        id: "courant-alternatif-rlc",
        title: "Courant alternatif et circuits RLC",
        subtitle: "Électricité et magnétisme",
        icon: "〰️",
        color: "from-cyan-500 to-sky-600",
        description: "Analyser les circuits en courant alternatif avec résistances, condensateurs, inducteurs, impédance, résonance et puissance moyenne.",
        totalSlides: 6,
        slides: [
            {
                title: "Courant et tension alternatifs",
                theory: "En courant alternatif, tension et courant varient sinusoïdalement.",
                code: "v(t)=Vmax sin(ωt)\nω=2πf\nf=60 Hz ⇒ ω≈377 rad/s",
                animation: {
                    type: "flow",
                    paths: [
                        { label: "Identifier", result: true },
                        { label: "Calculer", result: true },
                        { label: "Conclure", result: true },
                    ],
                    label: "On applique la méthode étape par étape.",
                },
            },
            {
                title: "Valeurs efficaces",
                theory: "Les valeurs efficaces représentent l’effet thermique équivalent.",
                code: "Veff=Vmax/√2\n170/√2≈120 V",
                animation: {
                    type: "flow",
                    paths: [
                        { label: "Identifier", result: true },
                        { label: "Calculer", result: true },
                        { label: "Conclure", result: true },
                    ],
                    label: "On applique la méthode étape par étape.",
                },
            },
            {
                title: "Réactance capacitive et inductive",
                theory: "Les condensateurs et inducteurs s’opposent au courant selon la fréquence.",
                code: "X_C=1/(ωC), X_L=ωL\nC=100 μF, f=60 Hz ⇒ X_C≈26,5 Ω",
                animation: {
                    type: "flow",
                    paths: [
                        { label: "Identifier", result: true },
                        { label: "Calculer", result: true },
                        { label: "Conclure", result: true },
                    ],
                    label: "On applique la méthode étape par étape.",
                },
            },
            {
                title: "Impédance d’un circuit RLC",
                theory: "L’impédance combine résistance et réactances.",
                code: "Z=√(R²+(X_L-X_C)²)\nR=30, X_L=50, X_C=10 ⇒ Z=50 Ω",
                animation: {
                    type: "flow",
                    paths: [
                        { label: "Identifier", result: true },
                        { label: "Calculer", result: true },
                        { label: "Conclure", result: true },
                    ],
                    label: "On applique la méthode étape par étape.",
                },
            },
            {
                title: "Déphasage et facteur de puissance",
                theory: "Le déphasage entre tension et courant influence la puissance moyenne.",
                code: "tanφ=(X_L-X_C)/R\n40/30 ⇒ φ≈53,1°\ncosφ≈0,60",
                animation: {
                    type: "flow",
                    paths: [
                        { label: "Identifier", result: true },
                        { label: "Calculer", result: true },
                        { label: "Conclure", result: true },
                    ],
                    label: "On applique la méthode étape par étape.",
                },
            },
            {
                title: "Résonance dans un circuit RLC",
                theory: "La résonance arrive quand X_L=X_C; l’impédance est minimale dans un RLC série.",
                code: "f₀=1/(2π√LC)\nL=0,20 H, C=50 μF ⇒ f₀≈50,3 Hz",
                animation: {
                    type: "flow",
                    paths: [
                        { label: "Identifier", result: true },
                        { label: "Calculer", result: true },
                        { label: "Conclure", result: true },
                    ],
                    label: "On applique la méthode étape par étape.",
                },
            },
        ],
    },
];

const javaCourses = [
    {
        id: "variables",
        title: "Variables",
        subtitle: "Types de données",
        icon: "📦",
        color: "from-emerald-500 to-teal-600",
        description: "Comprendre comment Java stocke et gère les données en mémoire.",
        totalSlides: 6,
        slides: [
            {
                title: "Qu'est-ce qu'une variable ?",
                theory: "Une **variable** est un conteneur nommé qui stocke une valeur. On peut l'imaginer comme une boîte avec une étiquette : on lui donne un nom, puis on y place une donnée.",
                code: `int age = 25;`,
                animation: {
                    type: "variable",
                    varName: "age",
                    varType: "int",
                    value: 25,
                    label: "Une boîte nommée 'age' contient maintenant la valeur 25."
                }
            },
            {
                title: "Déclarer et assigner une valeur",
                theory: "Pour créer une variable en Java, on choisit d'abord un **type**, puis un **nom**, puis on peut lui assigner une valeur avec `=`. On peut aussi la déclarer d'abord, puis lui donner une valeur plus tard.",
                code: `String nom = "Jean";\nint nombre;\nnombre = 15;\nSystem.out.println(nom);\nSystem.out.println(nombre);`,
                animation: {
                    type: "variable",
                    varName: "nombre",
                    varType: "int",
                    value: 15,
                    label: "La variable est déclarée, puis reçoit sa valeur plus tard."
                }
            },
            {
                title: "Modifier une variable",
                theory: "Une variable peut être **réassignée**. L'ancienne valeur est remplacée par la nouvelle. En Java, cela n'ajoute pas une nouvelle variable : cela met à jour la même boîte.",
                code: `int age = 25;\nage = 30; // maintenant age vaut 30`,
                animation: {
                    type: "variable",
                    varName: "age",
                    varType: "int",
                    value: 30,
                    previousValue: 25,
                    label: "La boîte 'age' passe de 25 -> 30."
                }
            },
            {
                title: "Types courants de variables",
                theory: "Java est un langage **fortement typé** : chaque variable doit avoir un type précis. Les types les plus courants sont `int` (entiers), `double` (nombres décimaux), `String` (texte), `char` (un seul caractère) et `boolean` (vrai/faux).",
                code: `int count = 10;\ndouble price = 9.99;\nString name = "Java";\nchar grade = 'A';\nboolean active = true;`,
                animation: {
                    type: "variable",
                    varName: "name",
                    varType: "String",
                    value: '"Java"',
                    label: "Chaque type représente une catégorie différente de données."
                }
            },
            {
                title: "Variables finales (`final`)",
                theory: "Le mot-clé `final` rend une variable **constante**. Une fois sa valeur définie, elle ne peut plus être modifiée. C'est utile pour des valeurs fixes comme `PI` ou des limites qui ne doivent jamais changer.",
                code: `final double PI = 3.14159;\n// PI = 3.0; // ERREUR`,
                animation: {
                    type: "variable",
                    varName: "PI",
                    varType: "final double",
                    value: 3.14159,
                    locked: true,
                    label: "Cette boîte est verrouillée : aucune modification n'est autorisée."
                }
            },
            {
                title: "Le mot-clé `var`",
                theory: "Depuis Java 10, `var` permet au compilateur de **déduire automatiquement** le type à partir de la valeur assignée. C'est pratique pour alléger le code, mais le type reste fixé une fois choisi. `var` doit obligatoirement être utilisé avec une valeur dès la déclaration.",
                code: `var x = 5;         // int\nvar prix = 9.99;   // double\nvar lettre = 'D';  // char\nvar actif = true;  // boolean\nvar texte = "Bonjour"; // String\n\n// var y; // ERREUR`,
                animation: {
                    type: "comparison",
                    left: { label: "var x = 5", value: "int" },
                    right: { label: 'var texte = "Bonjour"', value: "String" },
                    label: "Le compilateur choisit le type automatiquement selon la valeur."
                }
            }
        ]
    },
    {
        id: "data-types",
        title: "Types de données",
        subtitle: "Primitifs et non primitifs",
        icon: "🧩",
        color: "from-green-500 to-emerald-600",
        description: "Comprendre les différents types de données en Java.",
        totalSlides: 5,
        slides: [
            {
                title: "Les grandes familles de types",
                theory: "En Java, les types de données se divisent en deux groupes : les **types primitifs** et les **types non primitifs**. Les primitifs stockent directement une valeur simple. Les non primitifs, comme `String`, les tableaux et les classes, représentent des objets ou des structures plus complexes.",
                code: `int myNum = 5;\nfloat myFloatNum = 5.99f;\nchar myLetter = 'D';\nboolean myBool = true;\nString myText = "Hello";`,
                animation: {
                    type: "comparison",
                    left: { label: "Primitifs", value: "int, double, char, boolean..." },
                    right: { label: "Non primitifs", value: "String, tableaux, classes..." },
                    label: "Deux grandes familles de types en Java."
                }
            },
            {
                title: "Les 8 types primitifs",
                theory: "Java possède **huit types primitifs** : `byte`, `short`, `int`, `long`, `float`, `double`, `boolean` et `char`. Ils servent à représenter des nombres, des caractères et des valeurs logiques.",
                code: `byte b = 100;\nshort s = 5000;\nint i = 100000;\nlong l = 15000000000L;\nfloat f = 5.75f;\ndouble d = 19.99d;\nboolean ok = true;\nchar c = 'A';`,
                animation: {
                    type: "variable",
                    varName: "i",
                    varType: "int",
                    value: 100000,
                    label: "Chaque type primitif a un rôle et une capacité de stockage différente."
                }
            },
            {
                title: "Entiers et nombres décimaux",
                theory: "Les types entiers (`byte`, `short`, `int`, `long`) servent à stocker des nombres sans décimales. Les types à virgule (`float`, `double`) servent pour les nombres décimaux. En pratique, `int` est souvent le choix par défaut pour les entiers et `double` pour les calculs décimaux, car il offre une meilleure précision que `float`.",
                code: `int age = 25;\ndouble price = 19.99;\nfloat note = 5.75f;\nlong population = 8000000000L;`,
                animation: {
                    type: "comparison",
                    left: { label: "int", value: "nombres entiers" },
                    right: { label: "double", value: "nombres décimaux" },
                    label: "Choisir le bon type dépend de la nature de la donnée."
                }
            },
            {
                title: "Le type `char` et le type `boolean`",
                theory: "Le type `char` stocke **un seul caractère** entre apostrophes, comme `'A'`. Le type `boolean` stocke uniquement `true` ou `false`. Ces deux types sont très utilisés dans les conditions et la logique de programme.",
                code: `char grade = 'B';\nboolean isJavaFun = true;\n\nSystem.out.println(grade);\nSystem.out.println(isJavaFun);`,
                animation: {
                    type: "comparison",
                    left: { label: "char", value: "'B'" },
                    right: { label: "boolean", value: "true" },
                    label: "Un caractère d'un côté, une valeur logique de l'autre."
                }
            },
            {
                title: "Un type ne change pas tout seul",
                theory: "Une fois qu'une variable est déclarée avec un type, elle **ne peut pas devenir un autre type** plus tard. Cette règle rend Java plus sûr, car le compilateur empêche les mélanges incorrects. Pour convertir un type en un autre, il faut utiliser le transtypage.",
                code: `int myNum = 5;\n// myNum = "Bonjour"; // ERREUR\n\nString myText = "Salut";\n// myText = 123; // ERREUR`,
                animation: {
                    type: "gate",
                    value: '"Bonjour"',
                    condition: "assigner un String à un int",
                    result: false,
                    label: "Java bloque les assignations incompatibles."
                }
            }
        ]
    },
    {
        id: "type-casting",
        title: "Transtypage",
        subtitle: "Conversion de types",
        icon: "🔁",
        color: "from-teal-500 to-cyan-600",
        description: "Convertir une valeur d'un type à un autre en Java.",
        totalSlides: 4,
        slides: [
            {
                title: "Qu'est-ce que le transtypage ?",
                theory: "Le **transtypage** consiste à convertir une donnée d'un type vers un autre. Par exemple, transformer un `int` en `double` ou un `double` en `int`.",
                code: `int myInt = 9;\ndouble myDouble = myInt;`,
                animation: {
                    type: "flow",
                    paths: [
                        { label: "int 9", result: true },
                        { label: "conversion", result: true },
                        { label: "double 9.0", result: true, output: "9.0" }
                    ],
                    label: "Une valeur peut être convertie d'un type à un autre."
                }
            },
            {
                title: "Conversion élargissante (automatique)",
                theory: "La conversion **élargissante** transforme un type plus petit vers un type plus grand, par exemple `int` vers `double`. Elle est automatique, car il n'y a généralement pas de perte d'information.",
                code: `int myInt = 9;\ndouble myDouble = myInt; // conversion automatique\n\nSystem.out.println(myInt);    // 9\nSystem.out.println(myDouble); // 9.0`,
                animation: {
                    type: "comparison",
                    left: { label: "int", value: "9" },
                    right: { label: "double", value: "9.0" },
                    label: "Le passage vers un type plus large se fait automatiquement."
                }
            },
            {
                title: "Conversion réductrice (manuelle)",
                theory: "La conversion **réductrice** transforme un type plus grand vers un type plus petit, par exemple `double` vers `int`. Elle doit être faite manuellement avec des parenthèses, car elle peut provoquer une **perte d'information**, comme la suppression des décimales.",
                code: `double myDouble = 9.78d;\nint myInt = (int) myDouble;\n\nSystem.out.println(myDouble); // 9.78\nSystem.out.println(myInt);    // 9`,
                animation: {
                    type: "variable",
                    varName: "myInt",
                    varType: "int",
                    value: 9,
                    previousValue: 9.78,
                    label: "Le transtypage vers `int` retire la partie décimale."
                }
            },
            {
                title: "Exemple concret : calculer un pourcentage",
                theory: "Le transtypage est très utile dans les calculs. Si on divise deux `int`, le résultat reste entier. En convertissant l'un des deux en `double`, on obtient un résultat décimal plus précis.",
                code: `int maxScore = 500;\nint userScore = 423;\n\ndouble percentage = (double) userScore / maxScore * 100.0d;\nSystem.out.println("Pourcentage : " + percentage);`,
                animation: {
                    type: "flow",
                    paths: [
                        { label: "423 / 500", result: true },
                        { label: "cast vers double", result: true },
                        { label: "84.6", result: true, output: "84.6" }
                    ],
                    label: "Le cast en `double` permet un calcul précis."
                }
            }
        ]
    },
    {
        id: "strings",
        title: "Strings",
        subtitle: "Manipulation de texte",
        icon: "💬",
        color: "from-sky-500 to-blue-600",
        description: "Travailler avec le texte en Java.",
        totalSlides: 5,
        slides: [
            {
                title: "Créer une String",
                theory: "Une `String` est une suite de caractères entourée de guillemets doubles. En Java, `String` est un **type non primitif** : c'est un objet, pas un type primitif.",
                code: `String greeting = "Hello, World!";\nSystem.out.println(greeting);`,
                animation: {
                    type: "variable",
                    varName: "greeting",
                    varType: "String",
                    value: '"Hello, World!"',
                    label: "Une variable String contenant du texte."
                }
            },
            {
                title: "Longueur et accès aux caractères",
                theory: "Les chaînes ont des méthodes utiles. `.length()` donne le nombre de caractères. `.charAt(index)` permet d'accéder à un caractère précis. Les index commencent toujours à **0**.",
                code: `String txt = "Hello";\nSystem.out.println(txt.length());   // 5\nSystem.out.println(txt.charAt(0)); // H\nSystem.out.println(txt.charAt(4)); // o`,
                animation: {
                    type: "comparison",
                    left: { label: "index 0", value: '"H"' },
                    right: { label: "index 4", value: '"o"' },
                    label: "Les positions dans une String commencent à 0."
                }
            },
            {
                title: "Méthodes utiles sur les Strings",
                theory: "Les Strings possèdent de nombreuses méthodes. Par exemple, `.toUpperCase()` met tout en majuscules, `.toLowerCase()` met en minuscules, `.trim()` enlève les espaces au début et à la fin, et `.indexOf()` trouve la position d'un texte dans la chaîne.",
                code: `String txt = "   Hello World   ";\nSystem.out.println(txt.toUpperCase());\nSystem.out.println(txt.toLowerCase());\nSystem.out.println(txt.trim());\nSystem.out.println("Please locate where 'locate' occurs!".indexOf("locate"));`,
                animation: {
                    type: "comparison",
                    left: { label: ".toUpperCase()", value: '"HELLO WORLD"' },
                    right: { label: ".trim()", value: '"Hello World"' },
                    label: "Les méthodes transforment ou analysent le texte."
                }
            },
            {
                title: "Concaténation de chaînes",
                theory: "On peut utiliser l'opérateur `+` pour **assembler** plusieurs chaînes. On peut aussi combiner du texte avec des nombres : Java convertit automatiquement les autres types en texte quand on concatène avec une `String`.",
                code: `String first = "Bonjour";\nString second = "Monde";\nString full = first + " " + second;\n\nint age = 25;\nString msg = "Âge : " + age;\n\nSystem.out.println(full);\nSystem.out.println(msg);`,
                animation: {
                    type: "variable",
                    varName: "full",
                    varType: "String",
                    value: '"Bonjour Monde"',
                    label: "Deux chaînes sont fusionnées en une seule."
                }
            },
            {
                title: "Comparer des Strings",
                theory: "Pour comparer deux chaînes, on utilise `.equals()` et non `==`. La méthode `equals()` compare le **contenu** du texte. C'est la manière correcte de vérifier si deux Strings représentent la même chose.",
                code: `String txt1 = "Hello";\nString txt2 = "Hello";\nString txt3 = "Salut";\n\nSystem.out.println(txt1.equals(txt2)); // true\nSystem.out.println(txt1.equals(txt3)); // false`,
                animation: {
                    type: "comparison",
                    left: { label: '"Hello".equals("Hello")', value: "true" },
                    right: { label: '"Hello".equals("Salut")', value: "false" },
                    label: "On compare le contenu, pas seulement la référence."
                }
            }
        ]
    },
    {
        id: "operators",
        title: "Opérateurs",
        subtitle: "Calculs et comparaisons",
        icon: "➕",
        color: "from-yellow-500 to-amber-600",
        description: "Utiliser les opérateurs Java pour calculer, comparer et construire des expressions.",
        totalSlides: 4,
        slides: [
            {
                title: "Les opérateurs arithmétiques",
                theory: "Les opérateurs servent à effectuer des actions sur des valeurs ou des variables. Les plus courants sont `+`, `-`, `*`, `/` et `%`. Ils permettent d'additionner, soustraire, multiplier, diviser ou obtenir le reste d'une division.",
                code: `int a = 10;\nint b = 3;\n\nSystem.out.println(a + b); // 13\nSystem.out.println(a - b); // 7\nSystem.out.println(a * b); // 30\nSystem.out.println(a / b); // 3\nSystem.out.println(a % b); // 1`,
                animation: {
                    type: "comparison",
                    left: { label: "a + b", value: "13" },
                    right: { label: "a % b", value: "1" },
                    label: "Les opérateurs arithmétiques réalisent des calculs de base."
                }
            },
            {
                title: "L'opérateur `+` avec des variables",
                theory: "L'opérateur `+` peut additionner deux valeurs, une variable et une valeur, ou deux variables. Il est très utilisé dans les expressions numériques, mais aussi dans la concaténation de chaînes.",
                code: `int sum1 = 100 + 50;\nint sum2 = sum1 + 250;\nint sum3 = sum2 + sum2;\n\nSystem.out.println(sum1);\nSystem.out.println(sum2);\nSystem.out.println(sum3);`,
                animation: {
                    type: "flow",
                    paths: [
                        { label: "100 + 50", result: true, output: "150" },
                        { label: "150 + 250", result: true, output: "400" },
                        { label: "400 + 400", result: true, output: "800" }
                    ],
                    label: "Une expression peut réutiliser le résultat précédent."
                }
            },
            {
                title: "Opérateurs de comparaison",
                theory: "Les opérateurs de comparaison servent à produire des résultats `true` ou `false`. On utilise notamment `<`, `<=`, `>`, `>=`, `==` et `!=`. Ils sont indispensables dans les conditions.",
                code: `int x = 20;\nint y = 18;\n\nSystem.out.println(x > y);  // true\nSystem.out.println(x == y); // false\nSystem.out.println(x != y); // true`,
                animation: {
                    type: "comparison",
                    left: { label: "x > y", value: "true" },
                    right: { label: "x == y", value: "false" },
                    label: "Les comparaisons produisent toujours un booléen."
                }
            },
            {
                title: "Opérateurs logiques",
                theory: "Les opérateurs logiques permettent de combiner plusieurs conditions. `&&` signifie ET, `||` signifie OU, et `!` signifie NON. Ils sont très utiles dans les structures conditionnelles.",
                code: `int age = 20;\nboolean isHoliday = true;\n\nSystem.out.println(age >= 18 && isHoliday);`,
                animation: {
                    type: "comparison",
                    left: { label: "age >= 18", value: "true" },
                    right: { label: "isHoliday", value: "true" },
                    label: "Les opérateurs logiques combinent des conditions."
                }
            }
        ]
    },
    {
        id: "mathematiques",
        title: "Math",
        subtitle: "Calculs mathématiques",
        icon: "🧮",
        color: "from-orange-500 to-red-600",
        description: "Utiliser la classe Math pour effectuer des calculs utiles.",
        totalSlides: 4,
        slides: [
            {
                title: "Valeurs max, min et absolues",
                theory: "La classe `Math` propose plusieurs méthodes pratiques. `Math.max(x, y)` renvoie la plus grande valeur, `Math.min(x, y)` la plus petite, et `Math.abs(x)` la valeur absolue.",
                code: `System.out.println(Math.max(5, 10)); // 10\nSystem.out.println(Math.min(5, 10)); // 5\nSystem.out.println(Math.abs(-4.7));  // 4.7`,
                animation: {
                    type: "comparison",
                    left: { label: "Math.max(5, 10)", value: "10" },
                    right: { label: "Math.abs(-4.7)", value: "4.7" },
                    label: "La classe Math fournit des outils prêts à l'emploi."
                }
            },
            {
                title: "Racines et puissances",
                theory: "`Math.sqrt(x)` calcule la racine carrée, et `Math.pow(x, y)` élève `x` à la puissance `y`. Il faut noter que `Math.pow()` retourne toujours un `double`, même si le résultat semble entier.",
                code: `System.out.println(Math.sqrt(64));   // 8.0\nSystem.out.println(Math.pow(2, 8)); // 256.0`,
                animation: {
                    type: "flow",
                    paths: [
                        { label: "sqrt(64)", result: true, output: "8.0" },
                        { label: "pow(2, 8)", result: true, output: "256.0" }
                    ],
                    label: "Certaines méthodes retournent toujours un double."
                }
            },
            {
                title: "Arrondir des nombres",
                theory: "Java propose plusieurs méthodes pour l'arrondi. `Math.round(x)` arrondit à l'entier le plus proche. `Math.ceil(x)` arrondit vers le haut. `Math.floor(x)` arrondit vers le bas.",
                code: `System.out.println(Math.round(4.6)); // 5\nSystem.out.println(Math.ceil(4.1));  // 5.0\nSystem.out.println(Math.floor(4.9)); // 4.0`,
                animation: {
                    type: "comparison",
                    left: { label: "Math.ceil(4.1)", value: "5.0" },
                    right: { label: "Math.floor(4.9)", value: "4.0" },
                    label: "Chaque méthode suit une règle d'arrondi différente."
                }
            },
            {
                title: "Nombres aléatoires",
                theory: "`Math.random()` renvoie un nombre aléatoire entre `0.0` inclus et `1.0` exclu. Pour obtenir un entier dans une plage précise, on combine `Math.random()` avec une multiplication et un cast.",
                code: `double randomValue = Math.random();\nint randomNum = (int)(Math.random() * 101); // 0 à 100\n\nSystem.out.println(randomValue);\nSystem.out.println(randomNum);`,
                animation: {
                    type: "variable",
                    varName: "randomNum",
                    varType: "int",
                    value: 42,
                    label: "Après multiplication et cast, on obtient un entier dans l'intervalle voulu."
                }
            }
        ]
    },
    {
        id: "if-statement",
        title: "Le if",
        subtitle: "Logique conditionnelle",
        icon: "🚦",
        color: "from-indigo-500 to-violet-600",
        description: "Apprendre comment Java décide quel code exécuter selon une condition.",
        totalSlides: 5,
        slides: [
            {
                title: "Qu'est-ce qu'un if ?",
                theory: "Une instruction **if** permet au programme de prendre une décision. Elle vérifie une condition. Si la condition vaut `true`, le bloc est exécuté. Si elle vaut `false`, il est ignoré.",
                code: `if (condition) {\n  // s'exécute seulement si la condition est vraie\n}`,
                animation: {
                    type: "gate",
                    value: 50,
                    condition: "value > 100",
                    result: false,
                    label: "La sphère vaut 50; la porte exige > 100. Accès refusé."
                }
            },
            {
                title: "Conditions avec comparaisons",
                theory: "Les conditions d'un `if` utilisent souvent des opérateurs de comparaison comme `<`, `>`, `==` ou `!=`. Le résultat doit toujours être un booléen.",
                code: `int x = 20;\nint y = 18;\n\nif (x > y) {\n  System.out.println("x est plus grand que y");\n}`,
                animation: {
                    type: "gate",
                    value: "20 > 18",
                    condition: "x > y",
                    result: true,
                    label: "La condition est vraie, donc le bloc s'exécute."
                }
            },
            {
                title: "Tester directement un booléen",
                theory: "On peut aussi utiliser directement une variable booléenne dans un `if`. Écrire `if (isLightOn)` est plus clair que `if (isLightOn == true)`.",
                code: `boolean isLightOn = true;\n\nif (isLightOn) {\n  System.out.println("La lumière est allumée.");\n}`,
                animation: {
                    type: "gate",
                    value: "true",
                    condition: "isLightOn",
                    result: true,
                    label: "Un booléen peut être utilisé directement comme condition."
                }
            },
            {
                title: "Le bloc else",
                theory: "Quand la condition du `if` est fausse, on peut utiliser `else` pour exécuter un autre bloc. `else` agit comme la solution de rechange.",
                code: `int value = 30;\nif (value > 100) {\n  System.out.println("Grand !");\n} else {\n  System.out.println("Petit !");\n}`,
                animation: {
                    type: "gate",
                    value: 30,
                    condition: "value > 100",
                    result: false,
                    label: "La condition échoue, donc le chemin `else` est utilisé."
                }
            },
            {
                title: "Toujours utiliser les accolades",
                theory: "Même si Java permet parfois d'écrire un `if` sans accolades pour une seule ligne, il est bien plus sûr de **toujours** utiliser `{ }`. Sans accolades, seule la première ligne appartient au `if`, ce qui peut créer des bugs subtils.",
                code: `int x = 20;\nint y = 18;\n\nif (x > y) {\n  System.out.println("x est plus grand que y");\n  System.out.println("Ces deux lignes font partie du if");\n}\n\nSystem.out.println("Cette ligne est en dehors du if");`,
                animation: {
                    type: "flow",
                    paths: [
                        { label: "condition vraie", result: true },
                        { label: "bloc entre accolades", result: true },
                        { label: "code extérieur", result: true }
                    ],
                    label: "Les accolades rendent le comportement du code clair et sûr."
                }
            }
        ]
    },
    {
        id: "else-if",
        title: "Else If",
        subtitle: "Conditions multiples",
        icon: "🪜",
        color: "from-purple-500 to-indigo-600",
        description: "Tester plusieurs possibilités dans l'ordre.",
        totalSlides: 3,
        slides: [
            {
                title: "Le `else if`",
                theory: "L'instruction `else if` permet de tester une nouvelle condition si la première condition du `if` est fausse. Java vérifie les conditions dans l'ordre et exécute **le premier bloc vrai**.",
                code: `int score = 75;\nif (score >= 90) {\n  System.out.println("A");\n} else if (score >= 70) {\n  System.out.println("B");\n} else {\n  System.out.println("C");\n}`,
                animation: {
                    type: "flow",
                    paths: [
                        { label: "score >= 90", result: false },
                        { label: "score >= 70", result: true, output: "B" },
                        { label: "else", result: false }
                    ],
                    label: "Java s'arrête dès qu'une condition est vraie."
                }
            },
            {
                title: "Exemple avec le temps",
                theory: "On peut enchaîner plusieurs conditions pour afficher des résultats différents selon la situation. Ici, le message dépend de l'heure de la journée.",
                code: `int time = 16;\n\nif (time < 12) {\n  System.out.println("Bonjour.");\n} else if (time < 18) {\n  System.out.println("Bonne journée.");\n} else {\n  System.out.println("Bonsoir.");\n}`,
                animation: {
                    type: "flow",
                    paths: [
                        { label: "time < 12", result: false },
                        { label: "time < 18", result: true, output: "Bonne journée." },
                        { label: "else", result: false }
                    ],
                    label: "La deuxième condition gagne ici."
                }
            },
            {
                title: "Ordre des conditions",
                theory: "L'ordre des `if` et `else if` est important. Java teste de haut en bas. Si une condition large est placée trop tôt, elle peut empêcher les suivantes d'être atteintes.",
                code: `int score = 95;\n\nif (score >= 70) {\n  System.out.println("Réussi");\n} else if (score >= 90) {\n  System.out.println("Excellent");\n}\n// "Excellent" ne sera jamais affiché ici`,
                animation: {
                    type: "gate",
                    value: 95,
                    condition: "score >= 70 en premier",
                    result: true,
                    label: "Une condition trop générale placée en premier peut masquer les autres."
                }
            }
        ]
    },
    {
        id: "switch",
        title: "Switch",
        subtitle: "Choix parmi plusieurs cas",
        icon: "🔀",
        color: "from-lime-500 to-green-600",
        description: "Choisir proprement entre plusieurs possibilités avec switch.",
        totalSlides: 3,
        slides: [
            {
                title: "L'instruction switch",
                theory: "Une instruction `switch` compare une expression à plusieurs **cas** possibles. C'est souvent plus lisible qu'une longue suite de `if / else if` lorsqu'on veut tester plusieurs valeurs précises.",
                    label: "day = 3 -> correspond au case 3 -> affiche Mercredi.",
                animation: {
                    type: "flow",
                    paths: [
                        { label: "case 1 (Lundi)", result: false },
                        { label: "case 2 (Mardi)", result: false },
                        { label: "case 3 (Mercredi)", result: true, output: "Mercredi" },
                        { label: "default", result: false }
                    ],
                    label: "day = 3 -> correspond au case 3 -> affiche Mercredi."
                }
            },
            {
                title: "Le mot-clé `break`",
                theory: "Le mot-clé `break` arrête l'exécution du `switch` après le cas trouvé. Sans `break`, Java continue dans les cas suivants : c'est ce qu'on appelle le **fall-through**. C'est parfois voulu, mais le plus souvent c'est une erreur.",
                code: `int x = 1;\nswitch (x) {\n  case 1:\n    System.out.println("A");\n  case 2:\n    System.out.println("B");\n    break;\n}\n// Affiche A puis B`,
                animation: {
                    type: "flow",
                    paths: [
                        { label: "case 1 -> affiche A", result: true, output: "A" },
                        { label: "tombe dans case 2 -> affiche B", result: true, output: "B" }
                    ],
                    label: "Sans `break`, l'exécution continue dans les cas suivants."
                }
            },
            {
                title: "Le cas `default`",
                theory: "Le bloc `default` s'exécute si **aucun** des autres cas ne correspond. C'est l'équivalent d'un `else` dans un `switch`.",
                code: `int day = 9;\nswitch (day) {\n  case 1: System.out.println("Lundi"); break;\n  case 2: System.out.println("Mardi"); break;\n  default: System.out.println("Inconnu");\n}`,
                animation: {
                    type: "flow",
                    paths: [
                        { label: "case 1", result: false },
                        { label: "case 2", result: false },
                        { label: "default", result: true, output: "Inconnu" }
                    ],
                    label: "Aucun cas ne correspond -> `default` s'exécute."
                }
            }
        ]
    },
    {
        id: "while-loop",
        title: "Boucles while",
        subtitle: "Répétition conditionnelle",
        icon: "⏳",
        color: "from-rose-500 to-pink-600",
        description: "Exécuter du code tant qu'une condition reste vraie.",
        totalSlides: 4,
        slides: [
            {
                title: "La boucle while",
                theory: "Une boucle `while` répète un bloc de code **tant que** sa condition est vraie. Elle est utile quand on ne sait pas exactement combien de fois le code devra se répéter.",
                code: `int count = 0;\nwhile (count < 3) {\n  System.out.println(count);\n  count++;\n}`,
                animation: {
                    type: "loop",
                    current: 0,
                    max: 3,
                    items: ["1", "2", "3", "4", "5"],
                    label: "La boucle continue tant que `count < 3`."
                }
            },
            {
                title: "Ne pas oublier la mise à jour",
                theory: "Si la variable utilisée dans la condition n'est jamais modifiée, la condition peut rester vraie indéfiniment. C'est ainsi qu'on crée une **boucle infinie** par erreur.",
                code: `// ATTENTION\nwhile (true) {\n  System.out.println("Toujours...");\n}`,
                animation: {
                    type: "loop",
                    current: 0,
                    max: 999,
                    items: ["1", "2", "3", "4", "5"],
                    label: "Si la condition ne devient jamais fausse, la boucle ne s'arrête pas."
                }
            },
            {
                title: "Condition fausse dès le départ",
                theory: "Si la condition d'une boucle `while` est fausse dès le début, le bloc de code **ne s'exécute jamais**. C'est une différence importante avec `do / while`.",
                code: `int i = 10;\n\nwhile (i < 5) {\n  System.out.println("Ceci ne sera jamais affiché");\n  i++;\n}`,
                animation: {
                    type: "gate",
                    value: 10,
                    condition: "i < 5",
                    result: false,
                    label: "La boucle est ignorée dès le départ."
                }
            },
            {
                title: "La boucle do / while",
                theory: "La boucle `do / while` exécute le bloc **au moins une fois**, puis vérifie la condition. Même si la condition est fausse au départ, le code s'exécute une première fois.",
                code: `int i = 10;\n\ndo {\n  System.out.println("i vaut " + i);\n  i++;\n} while (i < 5);`,
                animation: {
                    type: "loop",
                    current: 0,
                    max: 1,
                    items: ["1", "2", "3", "4", "5"],
                    label: "Le bloc s'exécute une fois avant la vérification."
                }
            }
        ]
    },
    {
        id: "for-loop",
        title: "Boucles for",
        subtitle: "Itération contrôlée",
        icon: "🔁",
        color: "from-amber-500 to-orange-600",
        description: "Répéter du code un nombre précis de fois avec for.",
        totalSlides: 5,
        slides: [
            {
                title: "La structure d'une boucle for",
                theory: "Une boucle `for` est idéale quand on sait **combien de fois** on veut répéter un bloc. Elle contient trois parties : l'initialisation, la condition et la mise à jour.",
                code: `for (int i = 0; i < 5; i++) {\n  System.out.println(i);\n}`,
                animation: {
                    type: "loop",
                    current: 0,
                    max: 5,
                    items: ["1", "2", "3", "4", "5"],
                    label: "La boucle s'exécute 5 fois : `i` va de 0 à 4."
                }
            },
            {
                title: "Comprendre les trois parties",
                theory: "`int i = 0` s'exécute une seule fois au début. `i < 5` est vérifié avant chaque tour. `i++` s'exécute après chaque itération. Ce schéma rend la boucle très compacte et lisible.",
                code: `for (int i = 0; i < 5; i++) {\n  System.out.println(i);\n}`,
                animation: {
                    type: "loop",
                    current: 3,
                    max: 5,
                    items: ["1", "2", "3", "4", "5"],
                    highlightIndex: 3,
                    label: "Ici, on est à l'itération où `i = 3`."
                }
            },
            {
                title: "Pas personnalisé",
                theory: "On peut changer la manière dont la variable évolue. Par exemple, avec `i += 2`, la boucle avance de 2 en 2 au lieu de 1 en 1.",
                code: `for (int i = 0; i <= 10; i += 2) {\n  System.out.println(i);\n}\n// 0, 2, 4, 6, 8, 10`,
                animation: {
                    type: "loop",
                    current: 0,
                    max: 10,
                    items: ["1", "2", "3", "4", "5"],
                    label: "La boucle saute un nombre sur deux."
                }
            },
            {
                title: "Boucles imbriquées",
                theory: "On peut placer une boucle dans une autre. La boucle intérieure s'exécute entièrement à chaque tour de la boucle extérieure.",
                code: `for (int i = 0; i < 3; i++) {\n  for (int j = 0; j < 2; j++) {\n    System.out.println(i + "," + j);\n  }\n}`,
                animation: {
                    type: "loop",
                    current: 0,
                    max: 6,
                    items: ["1", "2", "3", "4", "5"],
                    label: "3 tours extérieurs x 2 tours intérieurs = 6 itérations."
                }
            },
            {
                title: "La boucle for-each",
                theory: "La boucle **for-each** sert à parcourir directement tous les éléments d'un tableau ou d'une collection. Elle est plus simple qu'une boucle `for` classique lorsqu'on n'a pas besoin de l'index.",
                code: `String[] cars = {"Volvo", "BMW", "Ford", "Mazda"};\n\nfor (String car : cars) {\n  System.out.println(car);\n}`,
                animation: {
                    type: "loop",
                    current: 0,
                    max: 4,
                    items: ["1", "2", "3", "4", "5"],
                    label: "La boucle visite chaque élément du tableau, un par un."
                }
            }
        ]
    },
    {
        id: "arrays",
        title: "Tableaux",
        subtitle: "Collections de données",
        icon: "📚",
        color: "from-violet-500 to-purple-600",
        description: "Stocker plusieurs valeurs dans une seule variable.",
        totalSlides: 4,
        slides: [
            {
                title: "Créer un tableau",
                theory: "Un **tableau** stocke plusieurs valeurs du même type. Chaque élément possède un **index** qui commence à 0. Les tableaux sont très utiles pour regrouper plusieurs données liées.",
                code: `int[] numbers = {10, 20, 30, 40, 50};\n\nSystem.out.println(numbers[0]); // 10\nSystem.out.println(numbers[2]); // 30`,
                animation: {
                    type: "loop",
                    current: 0,
                    max: 5,
                    items: ["1", "2", "3", "4", "5"],
                    label: "5 cases numérotées de 0 à 4."
                }
            },
            {
                title: "Modifier un élément",
                theory: "On peut modifier une valeur précise d'un tableau en utilisant son index. Le tableau reste le même, mais une de ses cases reçoit une nouvelle valeur.",
                code: `int[] numbers = {10, 20, 30};\nnumbers[1] = 99;\n// Devient {10, 99, 30}`,
                animation: {
                    type: "variable",
                    varName: "numbers[1]",
                    varType: "int",
                    value: 99,
                    previousValue: 20,
                    label: "L'élément à l'index 1 change de 20 -> 99."
                }
            },
            {
                title: "La longueur d'un tableau",
                theory: "La propriété `.length` indique combien d'éléments un tableau contient. Elle est souvent utilisée dans les boucles pour éviter de dépasser la taille du tableau.",
                code: `String[] cars = {"Volvo", "BMW", "Ford", "Mazda"};\nSystem.out.println(cars.length); // 4`,
                animation: {
                    type: "variable",
                    varName: "cars.length",
                    varType: "int",
                    value: 4,
                    label: "Le tableau contient exactement 4 éléments."
                }
            },
            {
                title: "Créer un tableau avec `new`",
                theory: "On peut aussi créer un tableau vide avec `new`, en précisant sa taille, puis remplir ses cases plus tard. Si les valeurs sont déjà connues, la syntaxe raccourcie est généralement plus simple.",
                code: `String[] cars = new String[4];\ncars[0] = "Volvo";\ncars[1] = "BMW";\ncars[2] = "Ford";\ncars[3] = "Mazda";\n\nfor (String car : cars) {\n  System.out.println(car);\n}`,
                animation: {
                    type: "loop",
                    current: 0,
                    max: 4,
                    items: ["1", "2", "3", "4", "5"],
                    label: "On réserve 4 cases, puis on les remplit ensuite."
                }
            }
        ]
    },
    {
        id: "methods",
        title: "Méthodes",
        subtitle: "Code réutilisable",
        icon: "⚡",
        color: "from-cyan-500 to-blue-600",
        description: "Écrire du code une fois et le réutiliser avec des méthodes.",
        totalSlides: 5,
        slides: [
            {
                title: "Qu'est-ce qu'une méthode ?",
                theory: "Une **méthode** est un bloc de code avec un nom. Au lieu de répéter le même code plusieurs fois, on le place dans une méthode et on l'appelle quand on en a besoin.",
                code: `public class Main {\n  static void myMethod() {\n    System.out.println("Je viens d'être exécutée !");\n  }\n}`,
                animation: {
                    type: "variable",
                    varName: "myMethod",
                    varType: "method",
                    value: "{ ... }",
                    label: "Une méthode encapsule un comportement réutilisable."
                }
            },
            {
                title: "Appeler une méthode",
                theory: "Pour exécuter une méthode, on écrit son nom suivi de parenthèses. Une méthode peut être appelée une seule fois ou plusieurs fois selon le besoin.",
                code: `public class Main {\n  static void myMethod() {\n    System.out.println("Je viens d'être exécutée !");\n  }\n\n  public static void main(String[] args) {\n    myMethod();\n    myMethod();\n  }\n}`,
                animation: {
                    type: "flow",
                    paths: [
                        { label: "main()", result: true },
                        { label: "-> myMethod()", result: true, output: "Je viens d'être exécutée !" },
                        { label: "-> myMethod()", result: true, output: "Je viens d'être exécutée !" },
                    ],
                    label: "Une même méthode peut être réutilisée plusieurs fois."
                }
            },
            {
                title: "Paramètres",
                theory: "Une méthode peut recevoir des **paramètres**. Ce sont des valeurs qu'on lui transmet au moment de l'appel. Cela rend la méthode plus flexible, car elle peut agir différemment selon les données reçues.",
                code: `public static void greet(String name) {\n  System.out.println("Bonjour " + name);\n}\n\ngreet("Alice");\ngreet("Bob");`,
                animation: {
                    type: "flow",
                    paths: [
                        { label: 'greet("Alice")', result: true, output: "Bonjour Alice" },
                        { label: 'greet("Bob")', result: true, output: "Bonjour Bob" }
                    ],
                    label: "La même méthode produit un résultat différent selon l'argument."
                }
            },
            {
                title: "Valeurs de retour",
                theory: "Certaines méthodes **retournent** un résultat. Dans ce cas, on utilise un type de retour à la place de `void`, puis `return` pour renvoyer la valeur calculée.",
                    left: { label: "add(3, 7)", value: "int -> 10" },
                animation: {
                    type: "variable",
                    varName: "result",
                    varType: "int",
                    value: 10,
                    label: "La méthode calcule puis renvoie une valeur au code appelant."
                }
            },
            {
                title: "Surcharge de méthodes",
                theory: "La **surcharge** permet d'avoir plusieurs méthodes avec le même nom, mais des paramètres différents. Java choisit automatiquement la bonne version selon les arguments passés.",
                    left: { label: "add(3, 7)", value: "int -> 10" },
                animation: {
                    type: "comparison",
                    left: { label: "add(3, 7)", value: "int -> 10" },
                    right: { label: "add(3.5, 2.1)", value: "double -> 5.6" },
                    label: "Même nom, signatures différentes, comportements adaptés."
                }
            }
        ]
    },
    {
        id: "classes",
        title: "Classes et objets",
        subtitle: "Bases de la POO",
        icon: "🏗️",
        color: "from-fuchsia-500 to-pink-600",
        description: "Créer ses propres types avec les classes et les objets.",
        totalSlides: 4,
        slides: [
            {
                title: "Qu'est-ce qu'une classe ?",
                theory: "Une **classe** est un plan de construction pour créer des objets. Elle définit les données (attributs) et les comportements (méthodes) que ses objets posséderont.",
                code: `public class Dog {\n  String name;\n  int age;\n\n  void bark() {\n    System.out.println("Woof!");\n  }\n}`,
                animation: {
                    type: "variable",
                    varName: "Dog",
                    varType: "class",
                    value: "{ name, age, bark() }",
                    label: "Une classe est un modèle qui décrit des objets."
                }
            },
            {
                title: "Créer un objet",
                theory: "On utilise `new` pour créer une **instance** d'une classe. Chaque objet possède ses propres valeurs pour les attributs définis par la classe.",
                code: `Dog myDog = new Dog();\nmyDog.name = "Rex";\nmyDog.age = 3;\nmyDog.bark();`,
                animation: {
                    type: "variable",
                    varName: "myDog",
                    varType: "Dog",
                    value: '{ name: "Rex", age: 3 }',
                    label: "L'objet est créé à partir du plan `Dog`."
                }
            },
            {
                title: "Les constructeurs",
                theory: "Un **constructeur** est une méthode spéciale exécutée lors de la création d'un objet. Il sert généralement à initialiser les attributs directement.",
                code: `public class Dog {\n  String name;\n  int age;\n\n  Dog(String name, int age) {\n    this.name = name;\n    this.age = age;\n  }\n}\n\nDog d = new Dog("Rex", 3);`,
                animation: {
                    type: "flow",
                    paths: [
                        { label: 'new Dog("Rex", 3)', result: true },
                        { label: "constructeur", result: true },
                        { label: "objet prêt", result: true, output: "{ Rex, 3 }" }
                    ],
                    label: "Le constructeur prépare l'objet dès sa création."
                }
            },
            {
                title: "Plusieurs objets d'une même classe",
                theory: "On peut créer plusieurs objets à partir d'une seule classe. Ils partagent la même structure, mais chacun garde ses propres données.",
                code: `Dog a = new Dog("Rex", 3);\nDog b = new Dog("Max", 5);\n\na.bark();\nb.bark();`,
                animation: {
                    type: "comparison",
                    left: { label: "Dog a", value: '{ "Rex", 3 }' },
                    right: { label: "Dog b", value: '{ "Max", 5 }' },
                    label: "Même classe, plusieurs objets indépendants."
                }
            }
        ]
    },
    {
        id: "boolean-logic",
        title: "Logique booléenne",
        subtitle: "Vrai ou faux",
        icon: "🧠",
        color: "from-red-500 to-rose-600",
        description: "Maîtriser AND, OR, NOT et les expressions booléennes.",
        totalSlides: 4,
        slides: [
            {
                title: "Les valeurs booléennes",
                theory: "Un `boolean` ne peut contenir que **`true`** ou **`false`**. Ces valeurs sont à la base de toutes les décisions prises par un programme.",
                code: `boolean isJavaFun = true;\nboolean isBoring = false;\n\nif (isJavaFun) {\n  System.out.println("Oui !");\n}`,
                animation: {
                    type: "gate",
                    value: "true",
                    condition: "isJavaFun == true",
                    result: true,
                    label: "isJavaFun vaut true -> la porte s'ouvre."
                }
            },
            {
                title: "L'opérateur ET (`&&`)",
                theory: "L'opérateur `&&` renvoie `true` seulement si **les deux conditions** sont vraies. Si une seule est fausse, le résultat devient faux.",
                code: `boolean ageOk = true;\nboolean hasID = true;\nSystem.out.println(ageOk && hasID);`,
                animation: {
                    type: "comparison",
                    left: { label: "age >= 18", value: "true" },
                    right: { label: "hasID", value: "true" },
                    label: "Deux conditions vraies -> résultat vrai."
                }
            },
            {
                title: "L'opérateur OU (`||`)",
                theory: "L'opérateur `||` renvoie `true` si **au moins une** des conditions est vraie. Les deux doivent être fausses pour produire `false`.",
                code: `boolean isWeekend = false;\nboolean isHoliday = true;\nSystem.out.println(isWeekend || isHoliday);`,
                animation: {
                    type: "comparison",
                    left: { label: "isWeekend", value: "false" },
                    right: { label: "isHoliday", value: "true" },
                    label: "Une seule condition vraie suffit avec OR."
                }
            },
            {
                title: "L'opérateur NON (`!`)",
                theory: "L'opérateur `!` inverse une valeur booléenne. `true` devient `false`, et `false` devient `true`. C'est très utile pour exprimer une négation claire.",
                code: `boolean isRaining = false;\n\nif (!isRaining) {\n  System.out.println("Sors dehors !");\n}`,
                animation: {
                    type: "gate",
                    value: "!false",
                    condition: "!isRaining",
                    result: true,
                    label: "Le NOT inverse la condition : false devient true."
                }
            }
        ]
    }
];

export const ETIQUETTES_MATIERES: Record<MatiereCours, string> = {
    java: 'Java',
    mathematiques: 'Math',
    physique: 'Physique',
};

export const COURS_PAR_MATIERE: Record<MatiereCours, CoursApprentissage[]> = {
    java: javaCourses,
    mathematiques: mathCourses,
    physique: physicsCourses,
};

const QUIZ_PAR_COURS: Record<MatiereCours, Record<string, QuizCours>> = {
    mathematiques: {
        derivee_fondations: {
            question: 'Résoudre 2(x - 3)^2 = 18. Quelles sont les valeurs de x ?',
            choices: [
                'x = 0 ou x = 6',
                'x = 3 ou x = 9',
                'x = -6 ou x = 6',
                'x = -3 ou x = 3',
            ],
            answerIndex: 0,
        },
        derivee_limites_continuite: {
            question: 'Calculer lim(x→3) (x² - 9)/(x - 3) après factorisation.',
            choices: [
                '6',
                '0',
                '3',
                'La limite n\'existe pas',
            ],
            answerIndex: 0,
        },
        derivee_definition: {
            question: 'Avec la définition de la dérivée, que vaut f\'(2) pour f(x)=x² ?',
            choices: [
                '4',
                '2',
                '6',
                '8',
            ],
            answerIndex: 0,
        },
        derivee_regles: {
            question: 'Dériver f(x)=(3x²+1)^5 avec la règle de la chaîne.',
            choices: [
                '30x(3x²+1)^4',
                '5(3x²+1)^4',
                '15x(3x²+1)^4',
                '30x(3x²+1)^5',
            ],
            answerIndex: 0,
        },
        derivee_applications: {
            question: 'Un rectangle a un périmètre de 20. Si l\'aire maximale est obtenue avec x=5 et y=5, quelle est cette aire ?',
            choices: [
                '25',
                '20',
                '50',
                '100',
            ],
            answerIndex: 0,
        },
        integrale_sens: {
            question: 'Calculer l\'intégrale indéfinie ∫(6x - 4) dx.',
            choices: [
                '3x² - 4x + C',
                '6x² - 4x + C',
                '3x² - 4 + C',
                '6 - 4x + C',
            ],
            answerIndex: 0,
        },
        integrale_tfc_substitution: {
            question: 'Calculer ∫ de 1 à 3 de 2x dx avec une primitive F(x)=x².',
            choices: [
                '8',
                '6',
                '9',
                '4',
            ],
            answerIndex: 0,
        },
        integrale_techniques: {
            question: 'Calculer ∫ x e^x dx par intégration par parties.',
            choices: [
                'e^x(x - 1) + C',
                'x e^x + C',
                'e^x(x + 1) + C',
                'x²e^x/2 + C',
            ],
            answerIndex: 0,
        },
        integrale_impropres_series: {
            question: 'Trouver la somme de la série géométrique 3 + 3/2 + 3/4 + 3/8 + ...',
            choices: [
                '6',
                '3',
                '4,5',
                'La série diverge',
            ],
            answerIndex: 0,
        },
        integrale_applications: {
            question: 'Trouver l\'aire entre y=2x et y=x² sur [0,2].',
            choices: [
                '4/3',
                '8/3',
                '2',
                '4',
            ],
            answerIndex: 0,
        },
        stats_description: {
            question: 'Pour les données 2, 4, 4, 6, quelle est la variance de population ?',
            choices: [
                '2',
                '√2',
                '4',
                '1',
            ],
            answerIndex: 0,
        },
        proba_fondements: {
            question: 'On lance une pièce puis un dé. Quelle est P(Pile et nombre pair) ?',
            choices: [
                '1/4',
                '1/2',
                '3/4',
                '1/6',
            ],
            answerIndex: 0,
        },
        proba_conditionnelle: {
            question: 'Une maladie touche 2 % des gens. Le test est positif chez 90 % des malades et 5 % des non-malades. Que vaut P(Malade | +) ?',
            choices: [
                'Environ 26,9 %',
                'Environ 90 %',
                'Environ 6,7 %',
                'Environ 2 %',
            ],
            answerIndex: 0,
        },
        lois_probabilite: {
            question: 'On lance 5 fois une pièce équilibrée. Quelle est P(exactement 2 piles) ?',
            choices: [
                '5/16 = 0,3125',
                '1/2 = 0,5',
                '2/5 = 0,4',
                '10/25 = 0,4',
            ],
            answerIndex: 0,
        },
        inference_statistique: {
            question: 'Une moyenne observée vaut 50 avec une erreur-type de 2. Quel est l\'intervalle de confiance à 95 % avec z≈1,96 ?',
            choices: [
                '[46,08 ; 53,92]',
                '[48,04 ; 51,96]',
                '[45 ; 55]',
                '[47,5 ; 52,5]',
            ],
            answerIndex: 0,
        },
        discrete_logique: {
            question: 'Quelle est la négation de : ∀x ∈ ℝ, x² ≥ 0 ?',
            choices: [
                '∃x ∈ ℝ tel que x² < 0',
                '∀x ∈ ℝ, x² < 0',
                '∃x ∈ ℝ tel que x² ≥ 0',
                '∀x ∈ ℝ, x² > 0',
            ],
            answerIndex: 0,
        },
        discrete_preuves_ensembles: {
            question: 'Si A={1,2,3,4} et B={3,4,5}, quelle est l\'intersection A∩B ?',
            choices: [
                '{3,4}',
                '{1,2,5}',
                '{1,2,3,4,5}',
                '{1,2}',
            ],
            answerIndex: 0,
        },
        discrete_nombres_modulaire: {
            question: 'Résoudre 3x ≡ 1 (mod 7). Quelle congruence convient ?',
            choices: [
                'x ≡ 5 (mod 7)',
                'x ≡ 3 (mod 7)',
                'x ≡ 1 (mod 7)',
                'x ≡ 6 (mod 7)',
            ],
            answerIndex: 0,
        },
        discrete_denombrer_recurrence: {
            question: 'Pour la Tour de Hanoï, T(1)=1 et T(n)=2T(n-1)+1. Que vaut T(4) ?',
            choices: [
                '15',
                '7',
                '12',
                '16',
            ],
            answerIndex: 0,
        },
        discrete_graphes: {
            question: 'Dans un graphe non orienté, les degrés sont 2, 2, 3, 3. Combien y a-t-il d\'arêtes ?',
            choices: [
                '5',
                '10',
                '4',
                '6',
            ],
            answerIndex: 0,
        },
    },
    physique: {
        'si-vecteurs': {
            question: 'Convertir 72 km/h en m/s.',
            choices: [
                '20 m/s',
                '25,9 m/s',
                '72 m/s',
                '259,2 m/s',
            ],
            answerIndex: 0,
        },
        'cinematique-vectorielle': {
            question: 'Un mobile a un déplacement Δr⃗=(10 m, 0) en 5 s. Quelle est sa vitesse moyenne vectorielle ?',
            choices: [
                '(2 m/s, 0)',
                '(50 m/s, 0)',
                '(5 m/s, 0)',
                '(10 m/s, 5)',
            ],
            answerIndex: 0,
        },
        'mrua-chute-libre': {
            question: 'Résoudre 5t = 10 - 3t pour trouver le temps de rencontre.',
            choices: [
                't = 1,25 s',
                't = 2 s',
                't = 0,8 s',
                't = 8 s',
            ],
            answerIndex: 0,
        },
        'projectiles-mcu': {
            question: 'Pour un projectile lancé à 20 m/s avec θ=30°, que vaut v₀y ?',
            choices: [
                '10 m/s',
                '17,3 m/s',
                '20 m/s',
                '30 m/s',
            ],
            answerIndex: 0,
        },
        'newton-forces': {
            question: 'Une force résultante de 20 N agit sur une masse de 5 kg. Quelle est l’accélération ?',
            choices: [
                '4 m/s²',
                '25 m/s²',
                '100 m/s²',
                '0,25 m/s²',
            ],
            answerIndex: 0,
        },
        'travail-energie': {
            question: 'Une force de 10 N déplace un objet de 3 m dans le même sens. Quel est le travail ?',
            choices: [
                '30 J',
                '13 J',
                '3,3 J',
                '0 J',
            ],
            answerIndex: 0,
        },
        'momentum-rotation': {
            question: 'Un objet de 3 kg se déplace à 4 m/s. Quelle est sa quantité de mouvement ?',
            choices: [
                '12 kg·m/s',
                '7 kg·m/s',
                '1,33 kg·m/s',
                '48 kg·m/s',
            ],
            answerIndex: 0,
        },
        'electrostatique-charges': {
            question: 'Deux sphères identiques portent +8 μC et -2 μC, puis se touchent. Quelle charge porte chacune après contact ?',
            choices: [
                '+3 μC',
                '+6 μC',
                '-3 μC',
                '+5 μC',
            ],
            answerIndex: 0,
        },
        'champ-electrique': {
            question: 'Une charge de 2,0 μC subit une force de 0,40 N. Quel est le champ électrique ?',
            choices: [
                '2,0 × 10⁵ N/C',
                '8,0 × 10⁻⁷ N/C',
                '0,20 N/C',
                '5,0 × 10⁶ N/C',
            ],
            answerIndex: 0,
        },
        'distributions-conducteurs': {
            question: 'Si Ex=600 N/C et Ey=800 N/C, quelle est la grandeur du champ total ?',
            choices: [
                '1000 N/C',
                '1400 N/C',
                '200 N/C',
                '700 N/C',
            ],
            answerIndex: 0,
        },
        'potentiel-energie-condensateurs': {
            question: 'Un condensateur porte 30 μC sous 10 V. Quelle est sa capacité ?',
            choices: [
                '3,0 μF',
                '300 μF',
                '0,33 μF',
                '40 μF',
            ],
            answerIndex: 0,
        },
        'courant-continu-circuits': {
            question: 'Une charge de 12 C traverse un fil en 4 s. Quel est le courant ?',
            choices: [
                '3 A',
                '48 A',
                '0,33 A',
                '16 A',
            ],
            answerIndex: 0,
        },
        'condensateurs-rc': {
            question: 'Dans un circuit RC, R=1000 Ω et C=2,0 μF. Quelle est la constante de temps ?',
            choices: [
                '2,0 ms',
                '2,0 s',
                '500 s',
                '0,50 ms',
            ],
            answerIndex: 0,
        },
        'magnetisme-induction': {
            question: 'Une bobine de 50 tours voit son flux changer de 0,15 Wb en 0,10 s. Quelle est la grandeur de la f.é.m. induite ?',
            choices: [
                '75 V',
                '7,5 V',
                '0,30 V',
                '750 V',
            ],
            answerIndex: 0,
        },
        'courant-alternatif-rlc': {
            question: 'Pour f=60 Hz, que vaut approximativement ω=2πf ?',
            choices: [
                '377 rad/s',
                '120 rad/s',
                '60 rad/s',
                '6,28 rad/s',
            ],
            answerIndex: 0,
        },
    },
    java: {
        variables: {
            question: 'À quoi sert une variable en Java ?',
            choices: [
                'À stocker une valeur avec un nom',
                'À lancer automatiquement une application',
                'À dessiner une interface graphique',
                'À supprimer le type d\'une donnée',
            ],
            answerIndex: 0,
        },
        'data-types': {
            question: 'Quelle affirmation décrit correctement les types en Java ?',
            choices: [
                'Un int peut devenir String tout seul',
                'Java n\'utilise aucun type primitif',
                'Une variable garde le type déclaré',
                'boolean stocke du texte libre',
            ],
            answerIndex: 2,
        },
        'type-casting': {
            question: 'À quoi sert le transtypage ?',
            choices: [
                'À créer une boucle infinie',
                'À comparer deux chaînes avec equals',
                'À appeler une méthode sans parenthèses',
                'À convertir une valeur d\'un type vers un autre',
            ],
            answerIndex: 3,
        },
        strings: {
            question: 'Quelle méthode compare correctement le contenu de deux Strings ?',
            choices: [
                '== uniquement',
                '.length',
                '.equals()',
                'new',
            ],
            answerIndex: 2,
        },
        operators: {
            question: 'Quel type d\'opérateur sert à tester une relation comme age >= 18 ?',
            choices: [
                'Un opérateur de comparaison',
                'Un constructeur',
                'Une boucle for',
                'Un tableau',
            ],
            answerIndex: 0,
        },
        mathematiques: {
            question: 'Quelle classe Java fournit des outils comme max, min, sqrt et random ?',
            choices: [
                'String',
                'Math',
                'Scanner',
                'Array',
            ],
            answerIndex: 1,
        },
        'if-statement': {
            question: 'Quand le bloc d\'un if est-il exécuté ?',
            choices: [
                'Quand sa condition est fausse',
                'Avant que la condition soit testée',
                'Quand sa condition est vraie',
                'Seulement dans une classe vide',
            ],
            answerIndex: 2,
        },
        'else-if': {
            question: 'Pourquoi l\'ordre des conditions else if est-il important ?',
            choices: [
                'Java exécute toujours le dernier bloc',
                'Les conditions sont ignorées',
                'else if remplace les variables',
                'Java exécute la première condition vraie',
            ],
            answerIndex: 3,
        },
        switch: {
            question: 'À quoi sert le mot-clé break dans un switch ?',
            choices: [
                'À créer une nouvelle variable',
                'À sortir du switch après un cas',
                'À convertir un double en int',
                'À comparer deux objets',
            ],
            answerIndex: 1,
        },
        'while-loop': {
            question: 'Quelle condition fait continuer une boucle while ?',
            choices: [
                'Sa condition reste vraie',
                'Sa condition est toujours fausse',
                'Le programme atteint un constructeur',
                'Le tableau contient un String',
            ],
            answerIndex: 0,
        },
        'for-loop': {
            question: 'Quelles sont les trois parties principales d\'une boucle for ?',
            choices: [
                'Classe, objet, constructeur',
                'Type, package, import',
                'Initialisation, condition, mise à jour',
                'Question, choix, réponse',
            ],
            answerIndex: 2,
        },
        arrays: {
            question: 'Par quel index commence un tableau Java ?',
            choices: [
                '0',
                '1',
                '-1',
                'La taille du tableau',
            ],
            answerIndex: 0,
        },
        methods: {
            question: 'Pourquoi utilise-t-on des méthodes ?',
            choices: [
                'Pour changer le type d\'une variable',
                'Pour supprimer les conditions',
                'Pour empêcher tout appel de code',
                'Pour regrouper et réutiliser du code',
            ],
            answerIndex: 3,
        },
        classes: {
            question: 'Quelle phrase décrit une classe ?',
            choices: [
                'Une valeur true ou false',
                'Une aire sous une courbe',
                'Un plan qui définit des objets',
                'Un index de tableau uniquement',
            ],
            answerIndex: 2,
        },
        'boolean-logic': {
            question: 'Que fait l\'opérateur ! sur une valeur booléenne ?',
            choices: [
                'Il inverse true et false',
                'Il additionne deux nombres',
                'Il crée un tableau',
                'Il appelle une méthode',
            ],
            answerIndex: 0,
        },
    },
};

const SUBJECTS_WITH_COURSES: MatiereCours[] = ['java', 'mathematiques', 'physique'];

function progressKey(subject: MatiereCours, courseId: string) {
    return `${subject}:${courseId}`;
}

/**
 * Donne accès à la progression stockée sans exposer la structure du stockage.
 *
 * Les écrans de cours demandent seulement une progression par matière et par
 * cours. Le détail de la sauvegarde reste dans `donneesLocales`.
 */
export function obtenirCarteProgressionCours(): CarteProgressionCours {
    donneesLocales.init();
    return donneesLocales.obtenirCarteProgressionCours();
}

export function obtenirProgressionCours(subject: MatiereCours, courseId: string) {
    donneesLocales.init();
    return donneesLocales.obtenirProgressionCours(subject, courseId);
}

export function obtenirDetailsProgressionCours(subject: MatiereCours, courseId: string): DetailsProgressionCours {
    donneesLocales.init();
    return donneesLocales.obtenirDetailsProgressionCours(subject, courseId);
}

export function trouverCours(subject: MatiereCours, courseId: string) {
    return COURS_PAR_MATIERE[subject].find((CoursLocal) => CoursLocal.id === courseId);
}

export function obtenirQuizCours(subject: MatiereCours, courseId: string) {
    const quiz = QUIZ_PAR_COURS[subject][courseId];

    if (quiz) {
        return quiz;
    }

    return {
        question: 'Question finale indisponible pour ce cours. Quelle action est la plus utile ?',
        choices: [
            'Relire la dernière diapo et signaler le quiz manquant',
            'Choisir une réponse au hasard sans relire',
            'Ignorer toutes les étapes de calcul',
            'Changer de matière automatiquement',
        ],
        answerIndex: 0,
    };
}

function toRecentLearningCourse(subject: MatiereCours, CoursLocal: CoursApprentissage): CoursApprentissageRecent {
    const key = progressKey(subject, CoursLocal.id);
    const progressDetails = obtenirDetailsProgressionCours(subject, CoursLocal.id);

    return {
        id: key,
        courseId: CoursLocal.id,
        subject,
        name: `${ETIQUETTES_MATIERES[subject]} - ${CoursLocal.title}`,
        progress: progressDetails.progress,
        completed: progressDetails.completed,
        totalSlides: CoursLocal.totalSlides,
        highestSlideIndex: progressDetails.highestSlideIndex,
        exerciseCompleted: progressDetails.exerciseCompleted,
    };
}

/**
 * Construit une liste complète de tous les cours suivables.
 *
 * On ne se fie pas seulement aux données sauvegardées, parce qu'un utilisateur
 * peut ne jamais avoir ouvert un cours. Le catalogue reste donc la source de
 * vérité pour les cours existants.
 */
export function obtenirResumesCoursApprentissage() {
    return SUBJECTS_WITH_COURSES.flatMap((subject) =>
        COURS_PAR_MATIERE[subject].map((CoursLocal) => toRecentLearningCourse(subject, CoursLocal))
    );
}

/**
 * Retourne les cours récemment ouverts qui existent encore dans le catalogue.
 *
 * Si une vieille donnée locale pointe vers un cours supprimé ou renommé, elle
 * est ignorée pour éviter d'afficher une carte brisée dans le profil.
 */
export function obtenirCoursApprentissageRecents(limit = 6) {
    donneesLocales.init();
    const allCoursesById = new Map(
        SUBJECTS_WITH_COURSES.flatMap((subject) =>
            COURS_PAR_MATIERE[subject].map((CoursLocal) => [progressKey(subject, CoursLocal.id), { subject, CoursLocal }] as const)
        )
    );
    const orderedRecents = donneesLocales.obtenirCoursRecents(limit)
        .map((storedCourse) => {
            const catalogCourse = allCoursesById.get(String(storedCourse.id));

            if (!catalogCourse) {
                return undefined;
            }

            return {
                id: String(storedCourse.id),
                courseId: catalogCourse.CoursLocal.id,
                subject: catalogCourse.subject,
                name: `${ETIQUETTES_MATIERES[catalogCourse.subject]} - ${catalogCourse.CoursLocal.title}`,
                progress: storedCourse.progress,
                completed: storedCourse.completed,
                totalSlides: catalogCourse.CoursLocal.totalSlides,
                highestSlideIndex: storedCourse.highestSlideIndex ?? -1,
                exerciseCompleted: Boolean(storedCourse.exerciseCompleted),
            };
        })
        .filter((CoursLocal): CoursLocal is CoursApprentissageRecent => Boolean(CoursLocal));

    return orderedRecents.slice(0, limit);
}
