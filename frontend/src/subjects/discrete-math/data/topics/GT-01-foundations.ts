import type { Topic } from '../../types';

export const GT01: Topic = {
  id: 'GT-01',
  number: '4.1',
  title: 'Основи: анатомія графа і нотація',
  complexity: 'foundational',
  prerequisites: [],
  estimatedHours: '2–3 год',
  assessmentGate: false,

  // ─── THEORY ───────────────────────────────────────────────────────────────

  theory: {
    definitions: [
      {
        id: 'def-graph',
        term: 'Граф (неорієнтований)',
        body: 'Пара G = (V, E), де V — непорожня множина вершин, E — множина дворелементних підмножин V, які називаються ребрами.',
        formula: 'G = (V, E)',
      },
      {
        id: 'def-digraph',
        term: 'Орієнтований граф (орграф)',
        body: 'Граф, у якому ребра є впорядкованими парами (u, v). Кожне ребро має хвіст u і голову v — напрямок від u до v.',
        formula: '(u, v) ≠ (v, u)',
      },
      {
        id: 'def-simple',
        term: 'Простий граф',
        body: 'Граф без петель (ребра вигляду {v, v}) і без кратних ребер (двох або більше ребер між однією парою вершин).',
      },
      {
        id: 'def-adjacency',
        term: 'Суміжність та інцидентність',
        body: 'Дві вершини є суміжними, якщо між ними є ребро. Вершина і ребро є інцидентними, якщо вершина є кінцем цього ребра.',
      },
      {
        id: 'def-degree',
        term: 'Степінь вершини',
        body: 'Кількість ребер, інцидентних вершині v, позначається deg(v). В орграфі: deg⁺(v) — напівстепінь виходу (ребра що виходять), deg⁻(v) — напівстепінь заходу (ребра що входять).',
        formula: 'deg(v) = |{ e ∈ E : v ∈ e }|',
      },
      {
        id: 'def-isolated',
        term: 'Ізольована вершина',
        body: 'Вершина без жодного інцидентного ребра. Має степінь 0.',
        formula: 'deg(v) = 0',
      },
      {
        id: 'def-adj-matrix',
        term: 'Матриця суміжності',
        body: 'Квадратна матриця A розміру n×n, де a[i][j] = 1 (або вага ребра), якщо між vᵢ і vⱼ є ребро, і 0 — якщо ребра немає. Для неорієнтованого простого графа: симетрична, нульова діагональ.',
        formula: 'a[i][j] = 1 ⟺ {vᵢ, vⱼ} ∈ E',
      },
    ],

    theorems: [
      {
        id: 'thm-handshaking',
        name: 'Лема про рукостискання',
        statement:
          'У будь-якому неорієнтованому графі G сума степенів усіх вершин дорівнює подвоєній кількості ребер.',
        formula: '∑_{v ∈ V} deg(v) = 2|E|',
        proof:
          'Кожне ребро {u, v} рівно один раз враховується у deg(u) і рівно один раз у deg(v) — тобто додає рівно 2 до загальної суми. Оскільки кожне ребро враховується двічі, загальна сума дорівнює 2|E|.',
      },
      {
        id: 'thm-parity',
        name: 'Наслідок: парність непарних вершин',
        statement:
          'У будь-якому скінченному неорієнтованому графі кількість вершин непарного степеня є парною.',
        formula: '|{ v ∈ V : deg(v) непарний }| ≡ 0 (mod 2)',
        proof:
          'За лемою ∑ deg(v) = 2|E| — парне число. Розіб\'ємо суму: вершини парного степеня вносять парний внесок. Якби кількість вершин непарного степеня була непарною, їх сумарний внесок був би непарним, а вся сума — непарною. Суперечність.',
      },
      {
        id: 'thm-pigeonhole',
        name: 'Збіг степенів (принцип Діріхле)',
        statement:
          'У будь-якому простому скінченному графі з n ≥ 2 вершинами завжди знайдуться принаймні дві вершини з однаковим степенем.',
        proof:
          'У простому графі степінь кожної вершини лежить в [0, n−1]. Проте значення 0 (ізольована вершина) і n−1 (суміжна з усіма) не можуть існувати разом: якщо є ізольована вершина, максимальний степінь ≤ n−2. Отже, n вершин потрапляють у щонайбільше n−1 можливих значень — за принципом Діріхле дві матимуть однаковий степінь.',
      },
    ],

    workedExamples: [
      {
        id: 'ex-notation',
        title: 'Граф у множинній нотації',
        description:
          'V = {1, 2, 3, 4}, E = {(1,2), (2,3), (3,4), (1,4), (1,3)}.\n' +
          'Степені: deg(1)=3, deg(2)=2, deg(3)=3, deg(4)=2.\n' +
          'Перевірка леми: 3+2+3+2 = 10 = 2×5 = 2|E| ✓',
        graph: {
          nodes: [
            { id: '1', label: '1', x: 150, y: 80 },
            { id: '2', label: '2', x: 320, y: 80 },
            { id: '3', label: '3', x: 320, y: 240 },
            { id: '4', label: '4', x: 150, y: 240 },
          ],
          edges: [
            { id: 'e1', source: '1', target: '2' },
            { id: 'e2', source: '2', target: '3' },
            { id: 'e3', source: '3', target: '4' },
            { id: 'e4', source: '1', target: '4' },
            { id: 'e5', source: '1', target: '3' },
          ],
          directed: false,
          weighted: false,
        },
      },
      {
        id: 'ex-matrix',
        title: 'Граф і його матриця суміжності',
        description:
          'Граф із вершинами {a, b, c, d} і ребрами {(a,b),(b,c),(c,d),(a,d)}.\n' +
          'Матриця суміжності (порядок a,b,c,d):\n' +
          '  a b c d\n' +
          'a[0 1 0 1]\n' +
          'b[1 0 1 0]\n' +
          'c[0 1 0 1]\n' +
          'd[1 0 1 0]\n' +
          'Симетрична, нульова діагональ — ознаки простого неорієнтованого графа.',
        graph: {
          nodes: [
            { id: 'a', label: 'a', x: 100, y: 160 },
            { id: 'b', label: 'b', x: 260, y: 80 },
            { id: 'c', label: 'c', x: 420, y: 160 },
            { id: 'd', label: 'd', x: 260, y: 260 },
          ],
          edges: [
            { id: 'e1', source: 'a', target: 'b' },
            { id: 'e2', source: 'b', target: 'c' },
            { id: 'e3', source: 'c', target: 'd' },
            { id: 'e4', source: 'a', target: 'd' },
          ],
          directed: false,
          weighted: false,
        },
      },
    ],

    visualizationHints: {
      animations: [
        'Клік на ребро → підсвічуються симетричні клітинки матриці суміжності',
        'Анімація леми: рахуємо ребра кожної вершини, накопичуємо суму → 2|E|',
        'Орієнтований vs неорієнтований на одному наборі вершин — перемикач',
      ],
      staticDiagrams: [
        'Граф і матриця суміжності поруч — чітка відповідність клітинка ↔ ребро',
        'Ізольована вершина і кінцева вершина — порівняння степенів',
      ],
      hardConcepts: [
        'Чому кожне ребро додає рівно 2 до суми степенів',
        'Аргумент парності: чому непарних вершин завжди парна кількість',
        'Принцип Діріхле: 0 і n−1 не можуть існувати одночасно',
      ],
    },
  },

  // ─── TASKS ────────────────────────────────────────────────────────────────

  tasks: [
    // ── T1 ──────────────────────────────────────────────────────────────────
    {
      id: 'GT-01-T1',
      type: 'graph-build',
      difficulty: 'easy',
      title: 'Побудуй граф за послідовністю степенів',
      prompt:
        'Задано послідовність степенів (3, 2, 2, 2, 1). ' +
        'Побудуй простий неорієнтований граф на 5 вершинах, ' +
        'у якому кожна вершина має рівно такий степінь. ' +
        'Якщо це неможливо — натисни «Неможливо».',
      providedData: {
        degreeSequence: [3, 2, 2, 2, 1],
        nodeCount: 5,
      },
      validation: {
        checkDegreeSequence: true,
        checkSimple: true,
        checkNoLoops: true,
        checkNoMultiEdges: true,
        impossibilityCheck: 'erdos-gallai',
      },
      adversarial:
        'Деякі варіанти мають непарну суму або порушують критерій Ердеша–Галлаї — правильна відповідь «Неможливо».',
      xp: 10,
    },

    // ── T2 ──────────────────────────────────────────────────────────────────
    {
      id: 'GT-01-T2',
      type: 'matrix-fill',
      difficulty: 'easy',
      title: 'Граф ↔ матриця суміжності',
      prompt:
        'Крок 1: За зображеним графом заповни матрицю суміжності (4×4). ' +
        'Крок 2: За окремою матрицею намалюй відповідний граф.',
      providedData: {
        graph: {
          nodes: [
            { id: '1', label: '1', x: 100, y: 160 },
            { id: '2', label: '2', x: 260, y: 80 },
            { id: '3', label: '3', x: 420, y: 160 },
            { id: '4', label: '4', x: 260, y: 260 },
          ],
          edges: [
            { id: 'e1', source: '1', target: '3' },
            { id: 'e2', source: '2', target: '3' },
            { id: 'e3', source: '3', target: '4' },
            { id: 'e4', source: '4', target: '1' },
            { id: 'e5', source: '4', target: '2' },
          ],
          directed: false,
          weighted: false,
        },
        nodeOrder: ['1', '2', '3', '4'],
        expectedMatrix: [
          [0, 0, 1, 1],
          [0, 0, 1, 1],
          [1, 1, 0, 1],
          [1, 1, 1, 0],
        ],
        reverseMatrix: [
          [0, 1, 1, 0],
          [1, 0, 0, 1],
          [1, 0, 0, 1],
          [0, 1, 1, 0],
        ],
      },
      validation: {
        checkSymmetry: true,
        checkZeroDiagonal: true,
        checkEntries: true,
        checkReverseIsomorphism: true,
      },
      adversarial:
        'Орієнтований варіант: матриця несиметрична — студент, який автоматично симетризує, помилиться.',
      xp: 15,
    },

    // ── T3 ──────────────────────────────────────────────────────────────────
    {
      id: 'GT-01-T3',
      type: 'repair',
      difficulty: 'medium',
      title: 'Полагодь лему про рукостискання',
      prompt:
        'Дано частковий граф. Стверджується, що |E| = 4, ' +
        'але сума степенів ≠ 2×4 = 8. ' +
        'Додай або видали ребра так, щоб ∑ deg(v) = 8. ' +
        'Якщо задана сума суперечить лемі — натисни «Неможливо».',
      providedData: {
        graph: {
          nodes: [
            { id: '1', label: '1', x: 100, y: 100 },
            { id: '2', label: '2', x: 300, y: 100 },
            { id: '3', label: '3', x: 300, y: 280 },
            { id: '4', label: '4', x: 100, y: 280 },
          ],
          edges: [
            { id: 'e1', source: '1', target: '2' },
            { id: 'e2', source: '2', target: '3' },
            { id: 'e3', source: '3', target: '4' },
          ],
          directed: false,
          weighted: false,
        },
        claimedEdgeCount: 4,
        targetDegreeSum: 8,
      },
      validation: {
        checkHandshaking: true,
        targetDegreeSum: 8,
        edgeCount: 4,
      },
      adversarial:
        'Варіант з непарною стверджуваною сумою степенів (наприклад 7) — це неможливо за лемою.',
      xp: 20,
    },

    // ── T4 ──────────────────────────────────────────────────────────────────
    {
      id: 'GT-01-T4',
      type: 'impossibility',
      difficulty: 'medium',
      title: 'Чи існує такий регулярний граф?',
      prompt:
        'Побудуй 3-регулярний граф на 6 вершинах ' +
        '(кожна вершина має степінь рівно 3). ' +
        'Якщо це неможливо — поясни і натисни «Неможливо».',
      providedData: {
        k: 3,
        n: 6,
        nodes: [
          { id: '1', label: '1', x: 200, y: 80 },
          { id: '2', label: '2', x: 350, y: 160 },
          { id: '3', label: '3', x: 350, y: 300 },
          { id: '4', label: '4', x: 200, y: 380 },
          { id: '5', label: '5', x: 50, y: 300 },
          { id: '6', label: '6', x: 50, y: 160 },
        ],
      },
      validation: {
        checkRegular: true,
        requiredDegree: 3,
        checkParity: true,
        possibilityCondition: 'n * k must be even',
      },
      adversarial:
        'k=3, n=7 → 7×3=21 непарне → «Неможливо». k=3, n=6 → 18 парне → граф існує.',
      xp: 20,
    },

    // ── T5 ──────────────────────────────────────────────────────────────────
    {
      id: 'GT-01-T5',
      type: 'node-click',
      difficulty: 'easy',
      title: 'Знайди дві вершини з однаковим степенем',
      prompt:
        'Клікни на дві вершини, степені яких однакові. ' +
        'За принципом Діріхле такі вершини завжди існують у простому графі з n ≥ 2.',
      providedData: {
        graph: {
          nodes: [
            { id: '1', label: '1', x: 200, y: 80 },
            { id: '2', label: '2', x: 360, y: 160 },
            { id: '3', label: '3', x: 300, y: 320 },
            { id: '4', label: '4', x: 100, y: 320 },
            { id: '5', label: '5', x: 40, y: 160 },
          ],
          edges: [
            { id: 'e1', source: '1', target: '2' },
            { id: 'e2', source: '2', target: '3' },
            { id: 'e3', source: '3', target: '4' },
            { id: 'e4', source: '4', target: '5' },
            { id: 'e5', source: '5', target: '1' },
            { id: 'e6', source: '1', target: '3' },
          ],
          directed: false,
          weighted: false,
        },
        expectedDegrees: { '1': 3, '2': 2, '3': 3, '4': 2, '5': 2 },
      },
      validation: {
        checkEqualDegrees: true,
        requiredClickCount: 2,
      },
      adversarial:
        'Граф релейблується при кожному завантаженні — студент не може запам\'ятати позиції, мусить рахувати.',
      xp: 10,
    },

    // ── T6 ──────────────────────────────────────────────────────────────────
    {
      id: 'GT-01-T6',
      type: 'matrix-fill',
      difficulty: 'medium',
      title: 'Напівстепені в орграфі',
      prompt:
        'Для кожної вершини орієнтованого графа введи deg⁺ (скільки ребер виходить) ' +
        'і deg⁻ (скільки ребер заходить). ' +
        'Потім перевір рівність: ∑ deg⁺(v) = ∑ deg⁻(v) = |E|.',
      providedData: {
        graph: {
          nodes: [
            { id: 'A', label: 'A', x: 150, y: 100 },
            { id: 'B', label: 'B', x: 350, y: 100 },
            { id: 'C', label: 'C', x: 350, y: 280 },
            { id: 'D', label: 'D', x: 150, y: 280 },
          ],
          edges: [
            { id: 'e1', source: 'A', target: 'B', directed: true },
            { id: 'e2', source: 'B', target: 'C', directed: true },
            { id: 'e3', source: 'C', target: 'A', directed: true },
            { id: 'e4', source: 'A', target: 'D', directed: true },
            { id: 'e5', source: 'D', target: 'B', directed: true },
          ],
          directed: true,
          weighted: false,
        },
        expectedOutDegrees: { A: 2, B: 1, C: 1, D: 1 },
        expectedInDegrees:  { A: 1, B: 2, C: 1, D: 1 },
        edgeCount: 5,
      },
      validation: {
        checkOutDegrees: true,
        checkInDegrees: true,
        checkSumEquality: true,
        checkSumEqualsEdgeCount: true,
      },
      adversarial:
        'Перевіряє, що студент не плутає deg⁺ і deg⁻ — типова помилка після неорієнтованих графів.',
      xp: 15,
    },
  ],
};
