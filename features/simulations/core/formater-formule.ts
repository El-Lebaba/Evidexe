/**
 * Petit formateur de secours pour les formules.
 *
 * Quand une formule ne passe pas par KaTeX ou MathJax, on transforme au moins
 * quelques écritures LaTeX courantes en texte lisible.
 */
const CARTE_EXPOSANTS: Record<string, string> = {
  '0': '\u2070',
  '1': '\u00b9',
  '2': '\u00b2',
  '3': '\u00b3',
  '4': '\u2074',
  '5': '\u2075',
  '6': '\u2076',
  '7': '\u2077',
  '8': '\u2078',
  '9': '\u2079',
  '+': '\u207a',
  '-': '\u207b',
  '=': '\u207c',
  '(': '\u207d',
  ')': '\u207e',
  x: '\u02e3',
  n: '\u207f',
};

function versExposant(value: string) {
  return value
    .split('')
    .map((character) => CARTE_EXPOSANTS[character] ?? character)
    .join('');
}

export function formaterFormulePourAffichage(input: string) {
  return input
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)')
    .replace(/\\sin/g, 'sin')
    .replace(/\\cos/g, 'cos')
    .replace(/\\ln/g, 'ln')
    .replace(/\^\{([^}]+)\}/g, (_match, exponent: string) => versExposant(exponent))
    .replace(/\^([A-Za-z0-9+\-=()]+)/g, (_match, exponent: string) => versExposant(exponent))
    .replace(/->/g, '\u2192')
    .replace(/>=/g, '\u2265')
    .replace(/<=/g, '\u2264');
}
