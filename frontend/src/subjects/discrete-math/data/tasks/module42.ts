// Module 4.2 task bank — задачі from Chapter 2 of «Теорія графів у задачах»
// (маршрути, відстань, зв'язність, мости). Rendered by the data-driven engines.

import type { Task } from '../../types';
import type { TaskSection } from './module41';

// Skip-2 graph (line 1..7 + "skip" chords) reused by trace + distance tasks.
const skipGraph = {
  nodes: [
    { id: '1', label: '1', x: 60, y: 110 },
    { id: '2', label: '2', x: 130, y: 195 },
    { id: '3', label: '3', x: 200, y: 110 },
    { id: '4', label: '4', x: 270, y: 195 },
    { id: '5', label: '5', x: 340, y: 110 },
    { id: '6', label: '6', x: 410, y: 195 },
    { id: '7', label: '7', x: 480, y: 110 },
  ],
  edges: [
    { id: 'l12', source: '1', target: '2' },
    { id: 'l23', source: '2', target: '3' },
    { id: 'l34', source: '3', target: '4' },
    { id: 'l45', source: '4', target: '5' },
    { id: 'l56', source: '5', target: '6' },
    { id: 'l67', source: '6', target: '7' },
    { id: 's13', source: '1', target: '3' },
    { id: 's35', source: '3', target: '5' },
    { id: 's57', source: '5', target: '7' },
    { id: 's24', source: '2', target: '4' },
    { id: 's46', source: '4', target: '6' },
  ],
  directed: false,
  weighted: false,
};

/* ── A · Найкоротші шляхи (path-trace) ────────────────────── */

const sectionA: Task[] = [
  {
    id: 'GT-42-trace-skip',
    type: 'path-trace',
    difficulty: 'medium',
    title: 'Прокладіть найкоротший шлях (skip-2)',
    prompt: 'Це лінія $1$–$7$ з доданими «перескоками» через одну вершину. Пройди вздовж ребер від $1$ (зелена) до $7$ (помаранчева) найкоротшим шляхом.',
    providedData: {
      graph: skipGraph,
      start: '1',
      end: '7',
      requireShortest: true,
      hint: 'Перескоки $1$–$3$–$5$–$7$ коротші за рух по лінії.',
      reveal: 'Найкоротший шлях $1\\!-\\!3\\!-\\!5\\!-\\!7$ має довжину 3, тоді як уздовж лінії — 6.',
    } as Record<string, unknown>,
    validation: { shortest: 3 },
    adversarial: 'Рух тільки по лінії дає довжину 6 — удвічі більше за оптимум.',
    xp: 20,
  },
  {
    id: 'GT-42-trace-ladder',
    type: 'path-trace',
    difficulty: 'easy',
    title: 'Найкоротший шлях у «драбинці»',
    prompt: 'Пройди від $S$ до $T$ найкоротшим шляхом, рухаючись лише вздовж ребер.',
    providedData: {
      graph: {
        nodes: [
          { id: 's', label: 'S', x: 60, y: 150 },
          { id: 'a', label: 'a', x: 185, y: 80 },
          { id: 'b', label: 'b', x: 185, y: 220 },
          { id: 'c', label: 'c', x: 325, y: 80 },
          { id: 'd', label: 'd', x: 325, y: 220 },
          { id: 't', label: 'T', x: 450, y: 150 },
        ],
        edges: [
          { id: 'e1', source: 's', target: 'a' },
          { id: 'e2', source: 's', target: 'b' },
          { id: 'e3', source: 'a', target: 'c' },
          { id: 'e4', source: 'b', target: 'd' },
          { id: 'e5', source: 'c', target: 't' },
          { id: 'e6', source: 'd', target: 't' },
          { id: 'e7', source: 'a', target: 'b' },
          { id: 'e8', source: 'c', target: 'd' },
        ],
        directed: false,
        weighted: false,
      },
      start: 's',
      end: 't',
      requireShortest: true,
      hint: 'Будь-яка зі сторін драбинки дає шлях довжини 3.',
    } as Record<string, unknown>,
    validation: { shortest: 3 },
    adversarial: 'Переходи по «щаблях» $a$–$b$, $c$–$d$ лише подовжують шлях.',
    xp: 15,
  },
];

/* ── B · Відстань, радіус, діаметр, центр (compute) ───────── */

const sectionB: Task[] = [
  {
    id: 'GT-42-rdc',
    type: 'compute',
    difficulty: 'medium',
    title: 'Радіус, діаметр і центр',
    prompt: 'За діаграмою графа знайди радіус $R$, діаметр $D$ і центр (множину вершин з найменшим ексцентриситетом).',
    providedData: {
      graph: {
        nodes: [
          { id: '1', label: '1', x: 90, y: 60 },
          { id: '2', label: '2', x: 230, y: 60 },
          { id: '3', label: '3', x: 90, y: 185 },
          { id: '4', label: '4', x: 230, y: 185 },
          { id: '5', label: '5', x: 360, y: 120 },
          { id: '6', label: '6', x: 470, y: 60 },
          { id: '7', label: '7', x: 470, y: 185 },
        ],
        edges: [
          { id: 'a', source: '1', target: '3' },
          { id: 'b', source: '1', target: '2' },
          { id: 'c', source: '3', target: '4' },
          { id: 'd', source: '2', target: '4' },
          { id: 'e', source: '4', target: '5' },
          { id: 'f', source: '5', target: '6' },
          { id: 'g', source: '5', target: '7' },
          { id: 'h', source: '6', target: '7' },
        ],
        directed: false,
        weighted: false,
      },
      parts: [
        { label: '$R(G)$', prompt: 'радіус', answers: ['2'] },
        { label: '$D(G)$', prompt: 'діаметр', answers: ['4'] },
        { label: 'центр', prompt: 'множина центральних вершин', answers: ['4,5', '5,4', '{4,5}', '{5,4}'] },
      ],
      hint: 'Ексцентриситет $e(v)=\\max_w d(v,w)$. Радіус — найменший, діаметр — найбільший.',
      reveal: '$e(4)=e(5)=2$ (центр), $e(1)=e(2)=3$, $e(3)=e(6)=e(7)=4$. Тож $R=2$, $D=4$, центр $\\{4,5\\}$.',
    },
    validation: { R: 2, D: 4, center: ['4', '5'] },
    adversarial: 'Легко переплутати радіус (мінімум ексцентриситетів) із діаметром (максимум).',
    xp: 20,
  },
  {
    id: 'GT-42-dist',
    type: 'compute',
    difficulty: 'easy',
    title: 'Відстані у skip-2 графі',
    prompt: 'У цьому ж графі (лінія з перескоками) знайди відстані між вершинами.',
    providedData: {
      graph: skipGraph,
      parts: [
        { label: 'а)', prompt: '$d(1,7)$', answers: ['3'] },
        { label: 'б)', prompt: '$d(1,4)$', answers: ['2'] },
      ],
      hint: 'Відстань — довжина найкоротшого ланцюга; перескоки скорочують шлях.',
      reveal: '$d(1,7)=3$ (через $3,5$); $d(1,4)=2$ (через $3$).',
    },
    validation: { answers: ['3', '2'] },
    adversarial: 'Рахуючи лише по лінії, легко завищити відстань.',
    xp: 10,
  },
];

/* ── C · Зв'язність, точки зчленування, мости ─────────────── */

const sectionC: Task[] = [
  {
    id: 'GT-42-connected',
    type: 'impossibility',
    difficulty: 'easy',
    title: 'Чи зв’язний граф?',
    prompt: 'Подивись на діаграму й визнач, чи є граф зв’язним.',
    providedData: {
      graph: {
        nodes: [
          { id: '1', label: '1', x: 90, y: 90 },
          { id: '2', label: '2', x: 90, y: 220 },
          { id: '3', label: '3', x: 205, y: 155 },
          { id: '4', label: '4', x: 350, y: 90 },
          { id: '5', label: '5', x: 350, y: 220 },
          { id: '6', label: '6', x: 460, y: 155 },
        ],
        edges: [
          { id: 'a', source: '1', target: '2' },
          { id: 'b', source: '2', target: '3' },
          { id: 'c', source: '3', target: '1' },
          { id: 'd', source: '4', target: '5' },
          { id: 'e', source: '5', target: '6' },
          { id: 'f', source: '6', target: '4' },
        ],
        directed: false,
        weighted: false,
      },
      parts: [{ prompt: 'Граф зв’язний (між будь-якими двома вершинами є маршрут)?', answer: 'no', why: 'Ні: дві компоненти — $\\{1,2,3\\}$ і $\\{4,5,6\\}$, між ними немає ребер.' }],
      hint: 'Спробуй подумки пройти від вершини $1$ до вершини $4$.',
    },
    validation: { connected: false },
    adversarial: 'Обидва трикутники «гарні», але між ними немає жодного ребра.',
    xp: 10,
  },
  {
    id: 'GT-42-cutvertex',
    type: 'node-click',
    difficulty: 'medium',
    title: 'Знайди точку зчленування',
    prompt: 'Клікни вершину, видалення якої роз’єднує граф (точку зчленування).',
    providedData: {
      graph: {
        nodes: [
          { id: '1', label: '1', x: 80, y: 80 },
          { id: '2', label: '2', x: 80, y: 230 },
          { id: '3', label: '3', x: 230, y: 155 },
          { id: '4', label: '4', x: 380, y: 80 },
          { id: '5', label: '5', x: 380, y: 230 },
        ],
        edges: [
          { id: 'a', source: '1', target: '2' },
          { id: 'b', source: '2', target: '3' },
          { id: 'c', source: '3', target: '1' },
          { id: 'd', source: '3', target: '4' },
          { id: 'e', source: '4', target: '5' },
          { id: 'f', source: '5', target: '3' },
        ],
        directed: false,
        weighted: false,
      },
      requiredCount: 1,
      check: 'cut-vertex',
      hint: 'Два трикутники «склеєні» в одній вершині — саме вона тримає граф разом.',
    },
    validation: { cutVertex: '3' },
    adversarial: 'Вершини на трикутниках лежать на циклах — їх видалення нічого не роз’єднує.',
    xp: 20,
  },
  {
    id: 'GT-42-bridge',
    type: 'edge-click',
    difficulty: 'medium',
    title: 'Знайди міст',
    prompt: 'Клікни ребро-міст: те, без якого граф розпадається на дві компоненти.',
    providedData: {
      graph: {
        nodes: [
          { id: '1', label: '1', x: 70, y: 80 },
          { id: '2', label: '2', x: 70, y: 220 },
          { id: '3', label: '3', x: 180, y: 150 },
          { id: '4', label: '4', x: 330, y: 150 },
          { id: '5', label: '5', x: 440, y: 80 },
          { id: '6', label: '6', x: 440, y: 220 },
        ],
        edges: [
          { id: 't1', source: '1', target: '2' },
          { id: 't2', source: '2', target: '3' },
          { id: 't3', source: '3', target: '1' },
          { id: 'bridge', source: '3', target: '4' },
          { id: 't4', source: '4', target: '5' },
          { id: 't5', source: '5', target: '6' },
          { id: 't6', source: '6', target: '4' },
        ],
        directed: false,
        weighted: false,
      },
      check: 'bridge',
      hint: 'Ребра трикутників лежать на циклах. Шукай те єдине, що з’єднує два трикутники.',
    },
    validation: { bridge: '3-4' },
    adversarial: 'Усі ребра трикутників лежать на циклі — мостом є лише з’єднувальне ребро $3$–$4$.',
    xp: 20,
  },
];

/* ── D · Доведення (interactive proof builder) ────────────── */

const sectionD: Task[] = [
  {
    id: 'GT-42-triangle',
    type: 'order-steps',
    difficulty: 'medium',
    title: 'Нерівність трикутника для відстані',
    prompt: 'Збери доведення нерівності трикутника для відстані в графі.',
    providedData: {
      claim: 'Для відстані $d$ (довжини найкоротшого ланцюга) виконується $d(u,w)\\le d(u,v)+d(v,w)$.',
      steps: [
        'Нехай $P$ — найкоротший ланцюг з $u$ у $v$ (довжини $d(u,v)$), а $Q$ — з $v$ у $w$ (довжини $d(v,w)$).',
        'Поєднавши $P$ і $Q$, дістаємо маршрут з $u$ у $w$ довжини $d(u,v)+d(v,w)$.',
        'Будь-який маршрут містить простий ланцюг із тими самими кінцями не більшої довжини.',
        'Отже, існує ланцюг з $u$ у $w$ довжини $\\le d(u,v)+d(v,w)$.',
        'Найкоротший ланцюг не довший за нього: $d(u,w)\\le d(u,v)+d(v,w)$.',
      ],
      distractors: ['Оскільки відстань — метрика, одразу маємо рівність $d(u,w)=d(u,v)+d(v,w)$.'],
      hint: 'Склей два найкоротші ланцюги в один маршрут і скороти його до ланцюга.',
    } as Record<string, unknown>,
    validation: { method: 'concatenate shortest chains' },
    adversarial: 'Дистрактор підмінює нерівність рівністю — вона виконується не завжди.',
    xp: 25,
  },
  {
    id: 'GT-42-walks',
    type: 'order-steps',
    difficulty: 'hard',
    title: 'Степені матриці суміжності рахують маршрути',
    prompt: 'Збери доведення індукцією за $k$.',
    providedData: {
      claim: 'Елемент $A^k[i,j]$ дорівнює кількості маршрутів довжини $k$ з вершини $v_i$ у вершину $v_j$.',
      steps: [
        'База $k=1$: $A[i,j]\\in\\{0,1\\}$ — це і є число маршрутів довжини 1 (ребер) між $v_i$ і $v_j$.',
        'Припустимо, що $A^k[i,j]$ дорівнює числу маршрутів довжини $k$ (припущення індукції).',
        'За означенням добутку матриць $A^{k+1}[i,j]=\\sum_r A^k[i,r]\\,A[r,j]$.',
        'Доданок $A^k[i,r]\\,A[r,j]$ — це маршрути довжини $k$ з $v_i$ у $v_r$, продовжені ребром $v_r v_j$.',
        'Сума по всіх $r$ дає всі маршрути довжини $k+1$ з $v_i$ у $v_j$ — крок індукції доведено.',
      ],
      distractors: ['Оскільки $A^{k+1}=A^k+A$, кількість маршрутів зростає на $A[i,j]$.'],
      hint: 'Останнє ребро маршруту довжини $k+1$ виходить з якоїсь проміжної вершини $v_r$.',
    } as Record<string, unknown>,
    validation: { method: 'induction on k' },
    adversarial: 'Дистрактор плутає добуток матриць зі сумою.',
    xp: 30,
  },
  {
    id: 'GT-42-min-edges',
    type: 'order-steps',
    difficulty: 'medium',
    title: 'Зв’язний граф має $\\ge n-1$ ребро',
    prompt: 'Збери доведення.',
    providedData: {
      claim: 'Зв’язний граф з $n$ вершинами містить не менше $n-1$ ребра.',
      steps: [
        'Зафіксуємо одну вершину й нарощуватимемо зв’язний підграф, додаючи решту вершин по одній.',
        'Через зв’язність кожну наступну вершину можна з’єднати ребром із уже приєднаними.',
        'Додавання кожної з $n-1$ вершин дає принаймні одне нове ребро.',
        'Отже, ребер не менше $n-1$.',
      ],
      distractors: ['Кожна вершина має степінь $\\ge2$, тому ребер не менше $n$.'],
      hint: 'Будуй граф по вершині за раз і рахуй нові ребра.',
    } as Record<string, unknown>,
    validation: { method: 'incremental construction' },
    adversarial: 'Дистрактор хибно припускає мінімальний степінь 2 (буває степінь 1).',
    xp: 25,
  },
  {
    id: 'GT-42-disconn-compl',
    type: 'order-steps',
    difficulty: 'hard',
    title: 'Доповнення незв’язного графа',
    prompt: 'Задача 2.20. Збери доведення.',
    providedData: {
      claim: 'Якщо граф $G$ незв’язний, то доповнення $\\overline{G}$ зв’язне і $D(\\overline{G})\\le2$.',
      steps: [
        'Візьмемо дві довільні вершини $u,w$ і покажемо, що $d_{\\overline{G}}(u,w)\\le2$.',
        'Якщо $u,w$ у різних компонентах $G$, то ребра $uw$ немає в $G$, отже воно є в $\\overline{G}$: $d_{\\overline{G}}(u,w)=1$.',
        'Якщо ж $u,w$ в одній компоненті $G$, візьмемо вершину $x$ з іншої компоненти (вона існує, бо $G$ незв’язний).',
        'Тоді $ux\\notin G$ і $xw\\notin G$, тож $ux,xw\\in\\overline{G}$ — маємо шлях $u\\!-\\!x\\!-\\!w$.',
        'У всіх випадках відстань $\\le2$, тому $\\overline{G}$ зв’язне і $D(\\overline{G})\\le2$.',
      ],
      distractors: ['Оскільки $G$ незв’язне, його доповнення $\\overline{G}$ теж незв’язне.'],
      hint: 'Розглянь два випадки: вершини в різних компонентах $G$ та в одній.',
    } as Record<string, unknown>,
    validation: { method: 'two cases via a vertex in another component' },
    adversarial: 'Дистрактор стверджує протилежне до доведеного.',
    xp: 30,
  },
];

/* ── Assembled bank ───────────────────────────────────────── */

export const MODULE_42_TASK_SECTIONS: TaskSection[] = [
  { label: 'A · Найкоротші шляхи', note: 'Рухайся по ребрах від старту до фінішу — і знайди найкоротший маршрут.', tasks: sectionA },
  { label: 'B · Відстань, радіус, діаметр, центр', note: 'Полічи ексцентриситети й характеристики графа.', tasks: sectionB },
  { label: 'C · Зв’язність, мости, точки зчленування', note: 'Клікай вершини й ребра, що тримають граф разом.', tasks: sectionC },
  { label: 'D · Збери доведення', note: 'Розстав кроки у логічному порядку; один крок зайвий.', tasks: sectionD },
];

export const MODULE_42_TASK_BANK: Task[] = MODULE_42_TASK_SECTIONS.flatMap((section) => section.tasks);
