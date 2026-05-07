import { donneesLocales } from '@/db/donnees-principales';

/**
 * CoursLocal DATA STRUCTURE
 *
 * To add a new CoursLocal:
 * 1. Create a new object following the structure below
 * 2. Each CoursLocal has slides[] - each slide has theory + animation config
 * 3. Push it into the COURSES array
 *
 * Animation types:
 * - "gate"       -> A sphere approaches a gate (true/false logic)
 * - "loop"       -> A carousel of items cycling through
 * - "variable"   -> A box that changes its value
 * - "comparison" -> Two values being compared
 * - "flow"       -> Flowchart-style execution path
 */

export type MatiereCours = 'java' | 'mathematiques' | 'physique';

export type DiapositiveCours = {
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
    description: string;
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
        id: 'derivatives-basics',
        title: 'Dérivées',
        subtitle: 'Taux de variation',
        description: 'Comprendre la pente instantanée, la tangente et le sens de variation.',
        totalSlides: 4,
        slides: [
            {
                title: 'Idée principale',
                theory: 'Une dérivée mesure comment une quantité change quand son entrée change très peu. Sur un graphique, elle correspond à la pente de la tangente.',
                code: "f'(x) = limite quand h -> 0 de (f(x + h) - f(x)) / h",
            },
            {
                title: 'Lecture graphique',
                theory: 'Si la tangente monte, la dérivée est positive. Si elle descend, la dérivée est négative. Si elle est horizontale, la dérivée vaut 0.',
            },
            {
                title: 'Exemple simple',
                theory: 'Pour f(x) = x^2, la dérivée est f\'(x) = 2x. Au point x = 3, la pente vaut 6.',
                code: "f(x) = x^2\nf'(x) = 2x\nf'(3) = 6",
            },
            {
                title: 'Pourquoi ça sert',
                theory: 'Les dérivées permettent de trouver des vitesses, des maximums, des minimums et des zones où une fonction augmente ou diminue.',
            },
        ],
    },
    {
        id: 'integrals-basics',
        title: 'Intégrales',
        subtitle: 'Aire accumulée',
        description: 'Lire une intégrale comme une somme continue et une aire sous la courbe.',
        totalSlides: 3,
        slides: [
            {
                title: 'Idée principale',
                theory: 'Une intégrale additionne une infinité de petites contributions. Graphiquement, elle représente souvent une aire sous une courbe.',
            },
            {
                title: 'Sommes de Riemann',
                theory: 'On approxime une intégrale avec des rectangles. Plus les rectangles sont fins, plus l\'approximation devient précise.',
                code: 'aire approx = somme hauteur * largeur',
            },
            {
                title: 'Lien avec la dérivée',
                theory: 'Intégrer et dériver sont des opérations inverses dans le théorème fondamental du calcul.',
            },
        ],
    },
    {
        id: 'limits-basics',
        title: 'Limites',
        subtitle: 'Comportement local',
        description: 'Étudier ce qu\'une fonction approche près d\'un point ou vers l\'infini.',
        totalSlides: 3,
        slides: [
            {
                title: 'Idée principale',
                theory: 'Une limite décrit la valeur qu\'une fonction approche, même si elle ne prend pas exactement cette valeur.',
            },
            {
                title: 'Deux côtés',
                theory: 'Pour qu\'une limite existe en un point, la limite à gauche et la limite à droite doivent donner la même valeur.',
            },
            {
                title: 'Vers l\'infini',
                theory: 'Les limites à l\'infini servent à comprendre le comportement global d\'une fonction quand x devient très grand ou très petit.',
            },
        ],
    },
];

const physicsCourses: CoursApprentissage[] = [
    {
        id: 'kinematics-basics',
        title: 'Cinématique',
        subtitle: 'Mouvement',
        description: 'Décrire position, vitesse et accélération sans étudier la cause du mouvement.',
        totalSlides: 4,
        slides: [
            {
                title: 'Position',
                theory: 'La position indique où se trouve un objet par rapport à une origine choisie. Elle dépend du repère utilisé.',
            },
            {
                title: 'Vitesse',
                theory: 'La vitesse mesure le changement de position par unité de temps. Une vitesse positive ou négative dépend du sens choisi.',
                code: 'v = variation de position / variation de temps',
            },
            {
                title: 'Accélération',
                theory: 'L\'accélération mesure le changement de vitesse par unité de temps. Elle peut exister même si l\'objet ralentit.',
                code: 'a = variation de vitesse / variation de temps',
            },
            {
                title: 'Mouvement uniforme',
                theory: 'Quand la vitesse est constante, l\'accélération est nulle et la position change de façon linéaire.',
            },
        ],
    },
    {
        id: 'forces-basics',
        title: 'Forces',
        subtitle: 'Dynamique',
        description: 'Relier les forces appliquées au changement de mouvement.',
        totalSlides: 3,
        slides: [
            {
                title: 'Idée principale',
                theory: 'Une force peut changer la vitesse, la direction ou la forme d\'un objet. Elle se mesure en newtons.',
            },
            {
                title: 'Deuxième loi',
                theory: 'La somme des forces sur un objet détermine son accélération. Plus la masse est grande, plus il faut de force pour obtenir la même accélération.',
                code: 'F = m * a',
            },
            {
                title: 'Équilibre',
                theory: 'Si la somme des forces est nulle, l\'objet garde son état de mouvement: repos ou vitesse constante.',
            },
        ],
    },
    {
        id: 'energy-basics',
        title: 'Énergie',
        subtitle: 'Travail et conservation',
        description: 'Suivre les transformations entre énergie cinétique, potentielle et travail.',
        totalSlides: 3,
        slides: [
            {
                title: 'Énergie cinétique',
                theory: 'L\'énergie cinétique dépend de la masse et de la vitesse. Un objet plus rapide possède beaucoup plus d\'énergie.',
                code: 'Ec = 1/2 * m * v^2',
            },
            {
                title: 'Énergie potentielle',
                theory: 'L\'énergie potentielle gravitationnelle dépend de la hauteur dans un champ de gravité.',
                code: 'Ep = m * g * h',
            },
            {
                title: 'Conservation',
                theory: 'Quand les frottements sont négligeables, l\'énergie mécanique totale reste constante.',
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
        'derivatives-basics': {
            question: 'Que représente une dérivée sur un graphique ?',
            choices: [
                'La pente de la tangente',
                'La surface totale sous la courbe',
                'La valeur la plus grande du tableau',
                'Le nombre de points dessinés',
            ],
            answerIndex: 0,
        },
        'integrals-basics': {
            question: 'Comment peut-on interpréter une intégrale graphiquement ?',
            choices: [
                'Comme une seule multiplication',
                'Comme une condition vraie ou fausse',
                'Comme une aire sous une courbe',
                'Comme le nom d\'une variable',
            ],
            answerIndex: 2,
        },
        'limits-basics': {
            question: 'Pour qu\'une limite existe en un point, que faut-il vérifier ?',
            choices: [
                'La fonction doit toujours être constante',
                'Les deux côtés approchent la même valeur',
                'La courbe doit être une droite',
                'Le résultat doit être un nombre entier',
            ],
            answerIndex: 1,
        },
    },
    physique: {
        'kinematics-basics': {
            question: 'Que décrit la cinématique ?',
            choices: [
                'Le mouvement sans étudier sa cause',
                'La composition chimique d\'un objet',
                'La couleur d\'une lumière',
                'La température d\'un système',
            ],
            answerIndex: 0,
        },
        'forces-basics': {
            question: 'Selon la deuxième loi, que détermine la somme des forces ?',
            choices: [
                'La couleur de l\'objet',
                'Le volume de l\'objet',
                'La charge électrique seule',
                'L\'accélération de l\'objet',
            ],
            answerIndex: 3,
        },
        'energy-basics': {
            question: 'Quand les frottements sont négligeables, que devient l\'énergie mécanique totale ?',
            choices: [
                'Elle disparaît toujours',
                'Elle reste constante',
                'Elle devient forcément nulle',
                'Elle se transforme en masse uniquement',
            ],
            answerIndex: 1,
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
    return QUIZ_PAR_COURS[subject][courseId];
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

export function obtenirResumesCoursApprentissage() {
    // Builds one tracking summary for every real CoursLocal in the catalog so CoursLocal tabs and profile use identical IDs.
    return SUBJECTS_WITH_COURSES.flatMap((subject) =>
        COURS_PAR_MATIERE[subject].map((CoursLocal) => toRecentLearningCourse(subject, CoursLocal))
    );
}

export function obtenirCoursApprentissageRecents(limit = 6) {
    donneesLocales.init();
    // Keeps the profile panel limited to recently opened catalog courses, ignoring stale local records for removed courses.
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
