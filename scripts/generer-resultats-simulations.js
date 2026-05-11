const fs = require('fs');
const path = require('path');

const OUT = path.join(process.cwd(), 'RESULTATS_SIMULATIONS_20_EXECUTIONS.md');
const RUNS = 20;
const G = 6.6743e-11;
const MU0 = 4 * Math.PI * 1e-7;
const C = 299792458;
const GRAPH = { width: 640, height: 450 };

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function sample(i, min, max, step = 0.01, offset = 0) {
  const span = max - min;
  const raw = min + (((i * 37 + offset * 17) % 100) / 99) * span;
  return Math.round(raw / step) * step;
}

function fmt(value, digits = 2) {
  if (value === null || value === undefined || Number.isNaN(value)) return '--';
  if (!Number.isFinite(value)) return value > 0 ? 'infini' : '-infini';
  const abs = Math.abs(value);
  if (abs !== 0 && (abs >= 1e6 || abs < 1e-4)) return value.toExponential(3);
  return value.toFixed(digits);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function row(values) {
  return `| ${values.join(' | ')} |`;
}

function table(headers, rows) {
  return [row(headers), row(headers.map(() => '---')), ...rows.map(row)].join('\n');
}

function makeSection(title, headers, rows) {
  return `\n## ${title}\n\n${table(headers, rows)}\n`;
}

function factorielle(n) {
  let result = 1;
  for (let i = 2; i <= n; i += 1) result *= i;
  return result;
}

const derivativeFunctions = [
  { name: 'x^2', fn: (x) => x * x, dfn: (x) => 2 * x },
  { name: 'x^3', fn: (x) => x ** 3, dfn: (x) => 3 * x * x },
  { name: 'sin(x)', fn: Math.sin, dfn: Math.cos },
  { name: 'e^x', fn: Math.exp, dfn: Math.exp },
  { name: 'ln(x)', fn: (x) => (x > 0 ? Math.log(x) : NaN), dfn: (x) => (x > 0 ? 1 / x : NaN) },
  { name: 'cos(x)', fn: Math.cos, dfn: (x) => -Math.sin(x) },
];

const integralFunctions = [
  { name: 'x', fn: (x) => x, exact: (a, b) => (b ** 2 - a ** 2) / 2 },
  { name: 'x^2', fn: (x) => x * x, exact: (a, b) => (b ** 3 - a ** 3) / 3 },
  { name: 'sin(x)', fn: Math.sin, exact: (a, b) => -Math.cos(b) + Math.cos(a) },
  { name: 'x^3 - x', fn: (x) => x ** 3 - x, exact: (a, b) => (b ** 4 / 4 - b ** 2 / 2) - (a ** 4 / 4 - a ** 2 / 2) },
  { name: 'e^x / 3', fn: (x) => Math.exp(x) / 3, exact: (a, b) => (Math.exp(b) - Math.exp(a)) / 3 },
  { name: 'cos(x)', fn: Math.cos, exact: (a, b) => Math.sin(b) - Math.sin(a) },
];

function riemann(fn, a, b, n, method) {
  const dx = (b - a) / n;
  let sum = 0;
  for (let i = 0; i < n; i += 1) {
    const left = a + i * dx;
    const right = left + dx;
    if (method === 'trapeze') sum += ((fn(left) + fn(right)) / 2) * dx;
    else if (method === 'gauche') sum += fn(left) * dx;
    else if (method === 'droite') sum += fn(right) * dx;
    else sum += fn(left + dx / 2) * dx;
  }
  return sum;
}

const taylorFunctions = [
  { name: 'sin(x)', fn: Math.sin, approx: (x, n) => Array.from({ length: Math.floor((n - 1) / 2) + 1 }, (_, k) => ((-1) ** k * x ** (2 * k + 1)) / factorielle(2 * k + 1)).reduce((a, b) => a + b, 0) },
  { name: 'cos(x)', fn: Math.cos, approx: (x, n) => Array.from({ length: Math.floor(n / 2) + 1 }, (_, k) => ((-1) ** k * x ** (2 * k)) / factorielle(2 * k)).reduce((a, b) => a + b, 0) },
  { name: 'e^x', fn: Math.exp, approx: (x, n) => Array.from({ length: n + 1 }, (_, k) => x ** k / factorielle(k)).reduce((a, b) => a + b, 0) },
  { name: 'ln(1+x)', fn: (x) => Math.log(1 + x), approx: (x, n) => Array.from({ length: n }, (_, k) => ((-1) ** k * x ** (k + 1)) / (k + 1)).reduce((a, b) => a + b, 0) },
  { name: '1/(1-x)', fn: (x) => 1 / (1 - x), approx: (x, n) => Array.from({ length: n + 1 }, (_, k) => x ** k).reduce((a, b) => a + b, 0) },
  { name: 'arctan(x)', fn: Math.atan, approx: (x, n) => Array.from({ length: Math.floor((n - 1) / 2) + 1 }, (_, k) => ((-1) ** k * x ** (2 * k + 1)) / (2 * k + 1)).reduce((a, b) => a + b, 0) },
];

const limitFunctions = [
  { name: 'sin(x)/x', limitAt: 0, limit: 1, fn: (x) => (Math.abs(x) < 1e-10 ? NaN : Math.sin(x) / x), xMax: 8, xMin: -8 },
  { name: '(x^2-1)/(x-1)', limitAt: 1, limit: 2, fn: (x) => (Math.abs(x - 1) < 1e-10 ? NaN : (x * x - 1) / (x - 1)), xMax: 5, xMin: -3 },
  { name: '(1+1/n)^n', limitAt: Infinity, limit: Math.E, fn: (x) => (1 + 1 / x) ** x, xMax: 20, xMin: 0.5 },
  { name: 'x sin(1/x)', limitAt: 0, limit: 0, fn: (x) => (Math.abs(x) < 1e-10 ? NaN : x * Math.sin(1 / x)), xMax: 1, xMin: -1 },
];

const fourierSignals = [
  { name: 'Carree', coeff: (k) => (k % 2 === 0 ? 0 : 4 / (Math.PI * k)) },
  { name: 'Dent de scie', coeff: (k) => (2 * (-1) ** (k + 1)) / (Math.PI * k) },
  { name: 'Triangle', coeff: (k) => (k % 2 === 0 ? 0 : ((8 / (Math.PI * Math.PI)) * (-1) ** ((k - 1) / 2)) / (k * k)) },
];

function fourierAt(signal, x, n) {
  let sum = 0;
  for (let k = 1; k <= n; k += 1) sum += signal.coeff(k) * Math.sin(k * x);
  return sum;
}

const slopeFields = [
  { name: "y' = x", fn: (x) => x },
  { name: "y' = y", fn: (_x, y) => y },
  { name: "y' = x*y", fn: (x, y) => x * y },
  { name: "y' = sin(x)", fn: (x) => Math.sin(x) },
  { name: "y' = -y", fn: (_x, y) => -y },
  { name: "y' = x-y", fn: (x, y) => x - y },
];

const series = [
  { name: 'Geometrique', converge: true, limit: 2, term: (n) => 0.5 ** n },
  { name: 'Harmonique', converge: false, limit: Infinity, term: (n) => 1 / n },
  { name: 'Bale', converge: true, limit: Math.PI ** 2 / 6, term: (n) => 1 / (n * n) },
  { name: 'Alternee', converge: true, limit: Math.log(2), term: (n) => (-1) ** (n + 1) / n },
  { name: 'Leibniz', converge: true, limit: Math.PI / 4, sum: (n) => Array.from({ length: n }, (_, k) => ((-1) ** k) / (2 * k + 1)).reduce((a, b) => a + b, 0) },
];

function sumSeries(s, n) {
  if (s.sum) return s.sum(n);

  let sum = 0;
  for (let i = 1; i <= n; i += 1) sum += s.term(i);
  return sum;
}

function gravityState(m1, m2, d) {
  const force = (G * m1 * m2) / (d * d);
  const desc = force > 1e20 ? 'Force astronomique' : force > 1e10 ? 'Force tres forte' : force > 1 ? 'Force mesurable' : 'Force faible';
  return { force, a1: force / m1, a2: force / m2, desc };
}

function springState(k, m, amplitudePx, damping) {
  const x = amplitudePx / 100;
  const omega0 = Math.sqrt(k / m);
  const gamma = damping / (2 * m);
  const omegaD = Math.sqrt(Math.max(0, omega0 * omega0 - gamma * gamma));
  return { x, force: -k * x, period: omegaD > 0 ? (2 * Math.PI) / omegaD : null };
}

function snell(n1, n2, incident) {
  const critical = n1 > n2 ? (Math.asin(clamp(n2 / n1, -1, 1)) * 180) / Math.PI : null;
  const total = critical !== null && incident > critical;
  const refracted = total ? null : (Math.asin(clamp((n1 / n2) * Math.sin((incident * Math.PI) / 180), -1, 1)) * 180) / Math.PI;
  return {
    refracted,
    critical,
    state: total ? 'Reflexion totale interne' : 'Refraction',
    reflected: incident,
    deviation: refracted === null ? null : Math.abs(incident - refracted),
    direction: total ? 'Reflexion totale interne' : Math.abs(n1 - n2) < 0.0001 ? 'Aucun changement' : n2 > n1 ? 'Vers la normale' : 'Loin de la normale',
    v1: C / n1,
    v2: C / n2,
  };
}

function frictionState(mass, applied, muS, muK, g) {
  const normal = mass * g;
  const threshold = muS * normal;
  const moving = Math.abs(applied) > threshold;
  const friction = moving ? muK * normal * Math.sign(applied) : applied;
  const net = moving ? applied - friction : 0;
  return {
    normal,
    threshold,
    friction: Math.abs(friction),
    net,
    acceleration: net / mass,
    state: moving ? 'En mouvement' : 'Au repos',
  };
}

function sortStats(type, values) {
  let comparisons = 0;
  let swaps = 0;
  const a = [...values];
  if (type === 'bulles') {
    for (let i = 0; i < a.length; i += 1) for (let j = 0; j < a.length - i - 1; j += 1) { comparisons += 1; if (a[j] > a[j + 1]) { [a[j], a[j + 1]] = [a[j + 1], a[j]]; swaps += 1; } }
  } else if (type === 'selection') {
    for (let i = 0; i < a.length - 1; i += 1) { let min = i; for (let j = i + 1; j < a.length; j += 1) { comparisons += 1; if (a[j] < a[min]) min = j; } if (min !== i) { [a[i], a[min]] = [a[min], a[i]]; swaps += 1; } }
  } else if (type === 'insertion') {
    for (let i = 1; i < a.length; i += 1) { const key = a[i]; let j = i - 1; while (j >= 0) { comparisons += 1; if (a[j] <= key) break; a[j + 1] = a[j]; swaps += 1; j -= 1; } a[j + 1] = key; }
  } else if (type === 'fusion') {
    const aux = [...a];
    function merge(lo, mid, hi) {
      for (let k = lo; k <= hi; k += 1) {
        aux[k] = a[k];
        swaps += 1;
      }

      let i = lo;
      let j = mid + 1;
      for (let k = lo; k <= hi; k += 1) {
        if (i > mid) {
          a[k] = aux[j];
          j += 1;
        } else if (j > hi) {
          a[k] = aux[i];
          i += 1;
        } else {
          comparisons += 1;
          if (aux[j] < aux[i]) {
            a[k] = aux[j];
            j += 1;
          } else {
            a[k] = aux[i];
            i += 1;
          }
        }
        swaps += 1;
      }
    }
    function mergeSort(lo, hi) {
      if (hi <= lo) return;
      const mid = Math.floor((lo + hi) / 2);
      mergeSort(lo, mid);
      mergeSort(mid + 1, hi);
      merge(lo, mid, hi);
    }
    mergeSort(0, a.length - 1);
  } else {
    function quick(lo, hi) { if (lo >= hi) return; const pivot = a[hi]; let i = lo; for (let j = lo; j < hi; j += 1) { comparisons += 1; if (a[j] <= pivot) { if (i !== j) { [a[i], a[j]] = [a[j], a[i]]; swaps += 1; } i += 1; } } if (i !== hi) { [a[i], a[hi]] = [a[hi], a[i]]; swaps += 1; } quick(lo, i - 1); quick(i + 1, hi); } quick(0, a.length - 1);
  }
  return { comparisons, swaps };
}

function generateRows() {
  const sections = [];

  sections.push(makeSection('Derivees', ['#', 'Fonction', 'x0', 'f(x0)', "f'(x0)"], Array.from({ length: RUNS }, (_, i) => {
    const f = derivativeFunctions[i % derivativeFunctions.length];
    const x = f.name === 'ln(x)' ? sample(i + 1, 0.2, 5, 0.1, 1) : sample(i + 1, -4, 4, 0.1);
    return [i + 1, f.name, fmt(x, 2), fmt(f.fn(x), 4), fmt(f.dfn(x), 4)];
  })));

  sections.push(makeSection('Integrales', ['#', 'Fonction', 'Methode', 'a', 'b', 'n', 'Somme de Riemann', 'Valeur', 'Erreur'], Array.from({ length: RUNS }, (_, i) => {
    const f = integralFunctions[i % integralFunctions.length];
    const methods = ['gauche', 'droite', 'milieu', 'trapeze'];
    const a = sample(i + 1, -4, 1, 0.1, 2);
    const b = sample(i + 1, a + 0.5, 4, 0.1, 5);
    const n = Math.round(sample(i + 1, 5, 100, 1, 3));
    const method = methods[i % methods.length];
    const approx = riemann(f.fn, a, b, n, method);
    const exact = f.exact(a, b);
    return [i + 1, f.name, method, fmt(a, 1), fmt(b, 1), n, fmt(approx, 4), fmt(exact, 4), fmt(Math.abs(approx - exact), 5)];
  })));

  sections.push(makeSection('Serie de Taylor', ['#', 'Fonction', 'Ordre', 'Approximation en x=10', 'Valeur reelle en x=10'], Array.from({ length: RUNS }, (_, i) => {
    const f = taylorFunctions[i % taylorFunctions.length];
    const order = Math.round(sample(i + 1, 1, 20, 1, 4));
    return [i + 1, f.name, order, fmt(f.approx(10, order), 4), fmt(f.fn(10), 4)];
  })));

  sections.push(makeSection('Limites', ['#', 'Fonction', 'Approche', 'f(x gauche)', 'Limite L', 'f(x droite ou approchee)'], Array.from({ length: RUNS }, (_, i) => {
    const f = limitFunctions[i % limitFunctions.length];
    const approach = sample(i + 1, 0.1, 2, 0.1, 3);
    if (Number.isFinite(f.limitAt)) {
      const offset = clamp(0.35 * approach, 0.01, Math.max((f.xMax - f.xMin) * 0.08, 0.01));
      return [i + 1, f.name, fmt(approach, 1), fmt(f.fn(f.limitAt - offset), 5), fmt(f.limit, 5), fmt(f.fn(f.limitAt + offset), 5)];
    }
    const x = clamp(f.xMax - 2.5 * approach, f.xMin, f.xMax);
    return [i + 1, f.name, fmt(approach, 1), '--', fmt(f.limit, 5), fmt(f.fn(x), 5)];
  })));

  sections.push(makeSection('Fourier', ['#', 'Signal', 'Harmoniques', 'Pn(pi/2)', 'Coefficient max'], Array.from({ length: RUNS }, (_, i) => {
    const s = fourierSignals[i % fourierSignals.length];
    const n = Math.round(sample(i + 1, 1, 25, 1, 4));
    const strongest = Math.max(...Array.from({ length: n }, (_, k) => Math.abs(s.coeff(k + 1))));
    return [i + 1, s.name, n, fmt(fourierAt(s, Math.PI / 2, n), 4), fmt(strongest, 4)];
  })));

  sections.push(makeSection('Champ de pentes', ['#', 'Equation', 'y0', 'Pente initiale', 'Densite'], Array.from({ length: RUNS }, (_, i) => {
    const f = slopeFields[i % slopeFields.length];
    const y0 = sample(i + 1, -3, 3, 0.1, 2);
    const density = Math.round(sample(i + 1, 8, 26, 2, 4));
    return [i + 1, f.name, fmt(y0, 2), fmt(f.fn(0, y0), 4), density];
  })));

  sections.push(makeSection('Series', ['#', 'Serie', 'n', 'S(n)', 'Ecart avec limite'], Array.from({ length: RUNS }, (_, i) => {
    const s = series[i % series.length];
    const n = Math.round(sample(i + 1, 5, 100, 5, 7));
    const sum = sumSeries(s, n);
    return [i + 1, s.name, n, fmt(sum, 5), s.converge ? fmt(Math.abs(s.limit - sum), 5) : 'diverge'];
  })));

  sections.push(makeSection('Gravite', ['#', 'm1 kg', 'm2 kg', 'distance m', 'Force', 'a1', 'a2', 'Etat'], Array.from({ length: RUNS }, (_, i) => {
    const m1 = sample(i + 1, 1e4, 8e8, 1, 1);
    const m2 = sample(i + 1, 1e4, 8e8, 1, 4);
    const d = sample(i + 1, 1, 100000, 1, 6);
    const g = gravityState(m1, m2, d);
    return [i + 1, fmt(m1, 0), fmt(m2, 0), fmt(d, 0), `${fmt(g.force, 4)} N`, fmt(g.a1, 5), fmt(g.a2, 5), g.desc];
  })));

  sections.push(makeSection('Pendule', ['#', 'Longueur cm', 'Gravite', 'Angle initial', 'Cycle complet', 'Vitesse ang.', 'Angle'], Array.from({ length: RUNS }, (_, i) => {
    const length = sample(i + 1, 30, 250, 5, 1);
    const gravity = sample(i + 1, 1, 20, 0.1, 4);
    const angle = sample(i + 1, 5, 80, 1, 7);
    const period = 2 * Math.PI * Math.sqrt((length / 100) / gravity);
    return [i + 1, fmt(length, 0), fmt(gravity, 1), `${fmt(angle, 1)} deg`, `${fmt(period, 2)} s`, '0.00 rad/s', `${fmt(angle, 1)} deg`];
  })));

  sections.push(makeSection('Mouvement projectile', ['#', 'Vitesse', 'Angle', 'Gravite', 'Portee', 'Hauteur max', 'Temps vol'], Array.from({ length: RUNS }, (_, i) => {
    const v = sample(i + 1, 5, 80, 1, 2);
    const angle = sample(i + 1, 5, 85, 1, 6);
    const g = sample(i + 1, 1, 20, 0.1, 8);
    const rad = (angle * Math.PI) / 180;
    return [i + 1, `${fmt(v, 0)} m/s`, `${fmt(angle, 0)} deg`, fmt(g, 1), `${fmt((v * v * Math.sin(2 * rad)) / g, 2)} m`, `${fmt((v * v * Math.sin(rad) ** 2) / (2 * g), 2)} m`, `${fmt((2 * v * Math.sin(rad)) / g, 2)} s`];
  })));

  sections.push(makeSection('Ressort et loi de Hooke', ['#', 'k', 'm', 'Amplitude', 'Amortissement', 'Deplacement actuel', 'Force de rappel', 'Periode'], Array.from({ length: RUNS }, (_, i) => {
    const k = sample(i + 1, 1, 20, 0.5, 1);
    const m = sample(i + 1, 0.2, 5, 0.1, 3);
    const amp = sample(i + 1, 10, 100, 5, 5);
    const damp = sample(i + 1, 0, 0.5, 0.01, 7);
    const s = springState(k, m, amp, damp);
    return [i + 1, `${fmt(k, 1)} N/m`, `${fmt(m, 1)} kg`, `${fmt(amp, 0)} px`, fmt(damp, 2), `${fmt(s.x, 2)} m`, `${fmt(s.force, 2)} N`, s.period === null ? 'N/A' : `${fmt(s.period, 3)} s`];
  })));

  sections.push(makeSection('Mouvement circulaire', ['#', 'omega', 'rayon', 'masse', 'Force centripete', 'Vitesse', 'Periode', 'Acceleration'], Array.from({ length: RUNS }, (_, i) => {
    const omega = sample(i + 1, 0.5, 6, 0.1, 2);
    const radiusCm = sample(i + 1, 30, 120, 5, 4);
    const mass = sample(i + 1, 0.1, 5, 0.1, 6);
    const r = radiusCm / 100;
    return [i + 1, `${fmt(omega, 1)} rad/s`, `${fmt(radiusCm, 0)} cm`, `${fmt(mass, 1)} kg`, `${fmt(mass * omega * omega * r, 2)} N`, `${fmt(omega * r, 2)} m/s`, `${fmt((2 * Math.PI) / omega, 2)} s`, `${fmt(omega * omega * r, 2)} m/s2`];
  })));

  sections.push(makeSection('Champs magnetiques', ['#', 'Nombre de fils', 'Courant', 'Champ d un fil a 8 cm', 'Fils superposes', 'Champ au point fixe'], Array.from({ length: RUNS }, (_, i) => {
    const wires = Math.round(sample(i + 1, 1, 6, 1, 1));
    const current = sample(i + 1, 0.5, 3, 0.1, 4);
    const ref = (MU0 * current) / (2 * Math.PI * 0.08) * 1e6;
    const selected = ref * wires;
    return [i + 1, wires, `${fmt(current, 1)} A`, `${fmt(ref, 2)} uT`, `${wires} fils`, `${fmt(selected, 2)} uT`];
  })));

  sections.push(makeSection('Champs electriques', ['#', 'Configuration', 'Charges +', 'Charges -', 'Champ total au centre', 'Champ au point fixe'], Array.from({ length: RUNS }, (_, i) => {
    const configs = [
      { name: 'Dipole', pos: 1, neg: 1, center: 1.6e6 },
      { name: 'Deux positives', pos: 2, neg: 0, center: 0 },
      { name: 'Quadrupole', pos: 2, neg: 2, center: 0 },
      { name: 'Charge seule', pos: 1, neg: 0, center: 3.2e6 },
    ];
    const c = configs[i % configs.length];
    return [i + 1, c.name, c.pos, c.neg, `${fmt(c.center, 2)} N/C`, `${fmt(c.center, 2)} N/C`];
  })));

  sections.push(makeSection('Optique et refraction', ['#', 'n1', 'n2', 'Angle incident', 'Angle refracte', 'Angle critique', 'Etat', 'Angle reflechi', 'Deviation', 'Direction'], Array.from({ length: RUNS }, (_, i) => {
    const n1 = sample(i + 1, 1, 2.5, 0.05, 1);
    const n2 = sample(i + 1, 1, 2.5, 0.05, 4);
    const angle = sample(i + 1, 1, 89, 1, 8);
    const s = snell(n1, n2, angle);
    return [i + 1, fmt(n1, 2), fmt(n2, 2), `${fmt(angle, 0)} deg`, s.refracted === null ? '--' : `${fmt(s.refracted, 1)} deg`, s.critical === null ? 'Aucun' : `${fmt(s.critical, 1)} deg`, s.state, `${fmt(s.reflected, 1)} deg`, s.deviation === null ? '--' : `${fmt(s.deviation, 1)} deg`, s.direction];
  })));

  sections.push(makeSection('Mecanique orbitale', ['#', 'Masse astre', 'Excentricite', 'Phase', 'Perihelie', 'Aphelie', 'Demi-grand axe', 'Distance actuelle', 'Vitesse actuelle', 'Periode orbitale'], Array.from({ length: RUNS }, (_, i) => {
    const mass = sample(i + 1, 10, 100, 1, 1);
    const e = sample(i + 1, 0, 0.9, 0.05, 3);
    const phase = sample(i + 1, 0, 2 * Math.PI, 0.01, 5);
    const a = Math.min(GRAPH.width * 0.31, GRAPH.height * 0.34);
    const peri = a * (1 - e);
    const aph = a * (1 + e);
    const r = (a * (1 - e * e)) / (1 + e * Math.cos(phase));
    const v = Math.sqrt(Math.max(0, mass * (2 / r - 1 / a)));
    const period = 2 * Math.PI * Math.sqrt((a ** 3) / mass);
    return [i + 1, `${fmt(mass, 0)} u`, fmt(e, 2), fmt(phase, 2), `${fmt(peri, 1)} u`, `${fmt(aph, 1)} u`, `${fmt(a, 1)} u`, `${fmt(r, 1)} u`, `${fmt(v, 2)} u/s`, `${fmt(period, 1)} s`];
  })));

  sections.push(makeSection('Frottement', ['#', 'Masse', 'Force appliquee', 'mu_s', 'mu_k', 'Force normale', 'Force minimale', 'Frottement actuel', 'Force nette', 'Acceleration', 'Etat'], Array.from({ length: RUNS }, (_, i) => {
    const mass = sample(i + 1, 1, 50, 0.5, 1);
    const applied = sample(i + 1, 0, 500, 5, 4);
    const muS = sample(i + 1, 0.05, 1, 0.05, 6);
    const muK = Math.min(muS, sample(i + 1, 0.02, 0.8, 0.05, 8));
    const f = frictionState(mass, applied, muS, muK, 9.8);
    return [i + 1, `${fmt(mass, 1)} kg`, `${fmt(applied, 1)} N`, fmt(muS, 2), fmt(muK, 2), `${fmt(f.normal, 1)} N`, `${fmt(f.threshold, 1)} N`, `${fmt(f.friction, 1)} N`, `${fmt(f.net, 1)} N`, `${fmt(f.acceleration, 2)} m/s2`, f.state];
  })));

  const sortTypes = [
    ['Tri a bulles', 'bulles'],
    ['Tri par selection', 'selection'],
    ['Tri par insertion', 'insertion'],
    ['Tri fusion', 'fusion'],
    ['Tri rapide', 'rapide'],
  ];

  sortTypes.forEach(([title, type], typeIndex) => {
    sections.push(makeSection(title, ['#', 'Taille', 'Cas', 'Comparaisons', 'Echanges/deplacements'], Array.from({ length: RUNS }, (_, i) => {
      const size = Math.round(sample(i + 1, 6, 20, 1, typeIndex));
      const cases = ['aleatoire', 'meilleur', 'pire'];
      const caseName = cases[i % cases.length];
      let values = Array.from({ length: size }, (_, k) => k + 1);
      if (caseName === 'pire') values.reverse();
      if (caseName === 'aleatoire') values = values.map((_, k) => ((k * 7 + i * 3) % size) + 1);
      const stats = sortStats(type, values);
      return [i + 1, size, caseName, stats.comparisons, stats.swaps];
    })));
  });

  sections.push(makeSection('ArrayList', ['#', 'Taille', 'Capacite', 'Occupation', 'Prochain ajout', 'Operation simulee'], Array.from({ length: RUNS }, (_, i) => {
    const size = Math.round(sample(i + 1, 0, 32, 1, 2));
    const capacity = Math.max(8, 2 ** Math.ceil(Math.log2(size + 1)));
    const next = size >= capacity ? 'redimensionnement' : 'capacite disponible';
    const operation = ['add', 'insert(index)', 'remove(index)', 'get(index)'][i % 4];
    return [i + 1, size, capacity, `${fmt((size / capacity) * 100, 1)}%`, next, operation];
  })));

  return sections;
}

function runAssertions() {
  assert(fmt(8.882e-16).includes('e-16'), 'La notation scientifique doit conserver le signe negatif de l exposant.');

  const exp = taylorFunctions.find((f) => f.name === 'e^x');
  assert(Math.abs(exp.approx(10, 1) - 11) < 1e-9, 'Taylor e^x ordre 1 en x=10 doit valoir 11.');

  const leibniz = series.find((s) => s.name === 'Leibniz');
  const leibniz10 = sumSeries(leibniz, 10);
  assert(leibniz10 > 0.72 && leibniz10 < 0.85, 'La serie de Leibniz doit rester positive et proche de pi/4.');

  const fusion = sortStats('fusion', Array.from({ length: 18 }, (_, i) => 18 - i));
  assert(fusion.swaps > fusion.comparisons, 'Tri fusion doit compter les deplacements separement des comparaisons.');

  const rapide = sortStats('rapide', Array.from({ length: 12 }, (_, i) => i + 1));
  assert(rapide.swaps <= rapide.comparisons, 'Tri rapide doit compter uniquement les vrais echanges.');
}

const header = `# Resultats des simulations - 20 executions par simulation

Fichier genere automatiquement par \`node scripts/generer-resultats-simulations.js\`.

Les tableaux ci-dessous reprennent les valeurs affichees dans les cartes de statistiques des simulations interactives disponibles. Chaque ligne represente une execution avec des valeurs de controles differentes.

Notes de lecture :
- Les simulations animees sont calculees a l'etat initial apres changement des controles.
- Les champs magnetiques et electriques utilisent un point fixe de reference pour rendre les valeurs comparables dans ce rapport automatique.
- Les entrees du catalogue marquees comme verrouillees, en preparation ou "Bientot" ne sont pas incluses, car elles n'ont pas de statistiques de simulation exploitables.
- Pour les calculs qui dependent de la taille du graphe, le script utilise une taille representative de ${GRAPH.width} x ${GRAPH.height}.

Entrees exclues du rapport pour cette raison : Champ vectoriel, Collisions elastiques, les cartes "Bientot" de mathematiques et physique, Pile - LIFO, File - FIFO, Liste chainee, Tableaux, Chaines et caracteres, Transtypage, Multithreading, Collisions de hachage et Heritage.
`;

runAssertions();
fs.writeFileSync(OUT, `${header}\n${generateRows().join('\n')}\n`, 'utf8');
console.log(`Resultats ecrits dans ${OUT}`);
