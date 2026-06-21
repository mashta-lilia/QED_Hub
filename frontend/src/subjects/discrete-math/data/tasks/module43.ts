// Module 4.3 task bank — обходи (Euler/Hamilton) and directed graphs, from
// Chapters 2.3–2.4 and 7 of «Теорія графів у задачах».

import type { Task } from '../../types';
import type { TaskSection } from './module41';

/* ── A · Ейлерові обходи (euler-trace / decision) ─────────── */

const sectionA: Task[] = [
  {
    id: 'GT-43-euler-trace',
    type: 'euler-trace',
    difficulty: 'medium',
    title: 'Пройди ейлерів цикл',
    prompt: 'Усі степені цього графа парні. Починаючи з вершини $1$, клікай ребра так, щоб пройти кожне рівно один раз і повернутися в старт.',
    providedData: {
      graph: {
        nodes: [
          { id: '1', label: '1', x: 90, y: 90 },
          { id: '2', label: '2', x: 90, y: 250 },
          { id: '3', label: '3', x: 230, y: 170 },
          { id: '4', label: '4', x: 370, y: 90 },
          { id: '5', label: '5', x: 370, y: 250 },
        ],
        edges: [
          { id: 'e1', source: '1', target: '2' },
          { id: 'e2', source: '2', target: '3' },
          { id: 'e3', source: '3', target: '1' },
          { id: 'e4', source: '3', target: '4' },
          { id: 'e5', source: '4', target: '5' },
          { id: 'e6', source: '5', target: '3' },
        ],
        directed: false,
        weighted: false,
      },
      start: '1',
      requireCycle: true,
      hint: 'Два трикутники з’єднані у вершині $3$. Пройди один трикутник, потім інший.',
      reveal: 'Наприклад $1\\!-\\!2\\!-\\!3\\!-\\!4\\!-\\!5\\!-\\!3\\!-\\!1$ — усі 6 ребер по разу.',
    } as Record<string, unknown>,
    validation: { allEdgesOnce: true, cycle: true },
    adversarial: 'У вершині $3$ степінь 4 — туди доведеться зайти двічі; не «застрягни» в одному трикутнику.',
    xp: 25,
  },
  {
    id: 'GT-43-konigsberg',
    type: 'impossibility',
    difficulty: 'easy',
    title: 'Сім мостів Кеніґсберга',
    prompt: 'Чотири частини суші з’єднані сімома мостами; степені вершин дорівнюють $5,3,3,3$. Чи можна пройти кожен міст рівно раз і повернутися назад?',
    providedData: {
      parts: [{ prompt: 'Існує такий замкнений маршрут (ейлерів цикл)?', answer: 'no', why: 'Ні: усі чотири вершини мають непарний степінь, а ейлерів цикл потребує, щоб усі степені були парні (Ейлер, 1736).' }],
      hint: 'Ейлерів цикл існує лише тоді, коли всі степені парні.',
    },
    validation: { rule: 'all degrees even' },
    adversarial: 'Скільки б не пробувати, парність степенів робить це неможливим.',
    xp: 10,
  },
  {
    id: 'GT-43-kn-euler',
    type: 'impossibility',
    difficulty: 'medium',
    title: 'Які повні графи $K_n$ ейлерові?',
    prompt: 'Повний граф $K_n$ ейлерів (має ейлерів цикл)?',
    providedData: {
      parts: [
        { label: 'а)', prompt: '$K_3$', answer: 'yes', why: 'Так: кожна вершина має степінь $2$ — парний.' },
        { label: 'б)', prompt: '$K_4$', answer: 'no', why: 'Ні: степінь кожної вершини $3$ — непарний.' },
        { label: 'в)', prompt: '$K_5$', answer: 'yes', why: 'Так: степінь $4$ — парний.' },
      ],
      hint: 'У $K_n$ кожна вершина має степінь $n-1$; ейлерів $\\Leftrightarrow$ $n-1$ парне, тобто $n$ непарне.',
    },
    validation: { rule: 'n odd' },
    adversarial: '$K_n$ ейлерів рівно тоді, коли $n$ непарне.',
    xp: 15,
  },
];

/* ── B · Гамільтонові цикли (hamilton-trace) ──────────────── */

const sectionB: Task[] = [
  {
    id: 'GT-43-hamilton',
    type: 'hamilton-trace',
    difficulty: 'medium',
    title: 'Знайди гамільтонів цикл',
    prompt: 'Починаючи з вершини $1$, відвідай кожну вершину рівно один раз і поверни цикл у старт.',
    providedData: {
      graph: {
        nodes: [
          { id: '1', label: '1', x: 260, y: 50 },
          { id: '2', label: '2', x: 374, y: 133 },
          { id: '3', label: '3', x: 331, y: 267 },
          { id: '4', label: '4', x: 189, y: 267 },
          { id: '5', label: '5', x: 146, y: 133 },
        ],
        edges: [
          { id: 'c12', source: '1', target: '2' },
          { id: 'c23', source: '2', target: '3' },
          { id: 'c34', source: '3', target: '4' },
          { id: 'c45', source: '4', target: '5' },
          { id: 'c51', source: '5', target: '1' },
          { id: 'h13', source: '1', target: '3' },
          { id: 'h25', source: '2', target: '5' },
        ],
        directed: false,
        weighted: false,
      },
      start: '1',
      hint: 'Зовнішній п’ятикутник $1\\!-\\!2\\!-\\!3\\!-\\!4\\!-\\!5\\!-\\!1$ уже є гамільтоновим циклом; хорди — лише відволікання.',
      reveal: 'Гамільтонів цикл: $1\\to2\\to3\\to4\\to5\\to1$.',
    } as Record<string, unknown>,
    validation: { hamiltonCycle: true },
    adversarial: 'Хорди $1$–$3$ і $2$–$5$ спокушають «зрізати», але тоді якусь вершину пропустиш.',
    xp: 20,
  },
];

/* ── C · Орієнтовані графи (compute / decision) ───────────── */

const digraph = {
  nodes: [
    { id: 'A', label: 'A', x: 120, y: 90 },
    { id: 'B', label: 'B', x: 380, y: 90 },
    { id: 'C', label: 'C', x: 380, y: 270 },
    { id: 'D', label: 'D', x: 120, y: 270 },
  ],
  edges: [
    { id: 'a', source: 'A', target: 'B' },
    { id: 'b', source: 'B', target: 'C' },
    { id: 'c', source: 'C', target: 'A' },
    { id: 'd', source: 'A', target: 'D' },
    { id: 'e', source: 'D', target: 'B' },
  ],
  directed: true,
  weighted: false,
};

const sectionC: Task[] = [
  {
    id: 'GT-43-semidegrees',
    type: 'compute',
    difficulty: 'medium',
    title: 'Напівстепені орграфа',
    prompt: 'За напрямками дуг (стрілок) знайди напівстепені орграфа.',
    providedData: {
      graph: digraph,
      showDegrees: false,
      parts: [
        { label: 'а)', prompt: '$\\sum_v\\delta^+(v)$ (= $|E|$)', answers: ['5'] },
        { label: 'б)', prompt: '$\\delta^+(A)$ — скільки дуг виходить з $A$', answers: ['2'] },
        { label: 'в)', prompt: '$\\delta^-(B)$ — скільки дуг заходить у $B$', answers: ['2'] },
      ],
      hint: '$\\delta^+$ — вихідні дуги (стрілка від вершини), $\\delta^-$ — вхідні (стрілка до вершини).',
      reveal: 'Дуг $5$, тож $\\sum\\delta^+=5$. З $A$ виходять $A\\!\\to\\!B$ і $A\\!\\to\\!D$ ($\\delta^+(A)=2$); у $B$ заходять $A\\!\\to\\!B$ і $D\\!\\to\\!B$ ($\\delta^-(B)=2$).',
    },
    validation: { answers: ['5', '2', '2'] },
    adversarial: 'Легко переплутати $\\delta^+$ і $\\delta^-$ після неорієнтованих графів.',
    xp: 20,
  },
  {
    id: 'GT-43-dag',
    type: 'impossibility',
    difficulty: 'medium',
    title: 'Джерело, стік, сильна зв’язність',
    prompt: 'Перед тобою безконтурний орграф $1\\to2,\\ 1\\to3,\\ 2\\to4,\\ 3\\to4$.',
    providedData: {
      graph: {
        nodes: [
          { id: '1', label: '1', x: 90, y: 170 },
          { id: '2', label: '2', x: 250, y: 80 },
          { id: '3', label: '3', x: 250, y: 260 },
          { id: '4', label: '4', x: 410, y: 170 },
        ],
        edges: [
          { id: 'a', source: '1', target: '2' },
          { id: 'b', source: '1', target: '3' },
          { id: 'c', source: '2', target: '4' },
          { id: 'd', source: '3', target: '4' },
        ],
        directed: true,
        weighted: false,
      },
      parts: [
        { label: 'а)', prompt: 'Чи є джерело (вершина без вхідних дуг)?', answer: 'yes', why: 'Так: у вершину $1$ не заходить жодна дуга — це джерело.' },
        { label: 'б)', prompt: 'Чи є стік (вершина без вихідних дуг)?', answer: 'yes', why: 'Так: з вершини $4$ не виходить жодна дуга — це стік.' },
        { label: 'в)', prompt: 'Чи є орграф сильно зв’язним?', answer: 'no', why: 'Ні: він безконтурний, тож з $4$ не повернутися в $1$ — взаємної досяжності немає.' },
      ],
      hint: 'Сильна зв’язність потребує контуру; у безконтурному орграфі його немає.',
    },
    validation: { source: '1', sink: '4', strong: false },
    adversarial: 'Наявність джерела/стоку — якраз ознака відсутності сильної зв’язності.',
    xp: 20,
  },
];

/* ── D · Доведення (interactive proof builder) ────────────── */

const sectionD: Task[] = [
  {
    id: 'GT-43-euler-criterion',
    type: 'order-steps',
    difficulty: 'medium',
    title: 'Ейлерів цикл ⟹ парні степені',
    prompt: 'Збери доведення необхідної умови.',
    providedData: {
      claim: 'Якщо зв’язний граф має ейлерів цикл, то степінь кожної вершини парний.',
      steps: [
        'Нехай $C$ — ейлерів цикл: замкнений маршрут, що проходить кожне ребро рівно раз.',
        'Розглянемо довільну вершину $v$ і прослідкуємо проходження $C$ через неї.',
        'Щоразу, коли цикл заходить у $v$ одним ребром, він виходить іншим — ребра йдуть парами.',
        'Кожне інцидентне $v$ ребро використане рівно раз, тож усі вони розбиваються на пари «вхід–вихід».',
        'Отже, кількість ребер при $v$ парна, тобто $\\delta(v)$ парний.',
      ],
      distractors: ['За лемою про рукостискання сума степенів парна, тому кожен степінь парний.'],
      hint: 'Простеж, як цикл щоразу «входить і виходить» через вершину.',
    } as Record<string, unknown>,
    validation: { method: 'pairing in–out at each vertex' },
    adversarial: 'Дистрактор плутає парність суми з парністю кожного доданка.',
    xp: 25,
  },
  {
    id: 'GT-43-digraph-handshake',
    type: 'order-steps',
    difficulty: 'medium',
    title: 'Сума напівстепенів орграфа',
    prompt: 'Доведи, що $\\sum_v\\delta^+(v)=\\sum_v\\delta^-(v)=|E|$.',
    providedData: {
      claim: 'У будь-якому орграфі $\\sum_v\\delta^+(v)=\\sum_v\\delta^-(v)=|E|$.',
      steps: [
        'Кожна дуга $(u,w)$ має рівно один хвіст $u$ і рівно одну голову $w$.',
        'Дуга $(u,w)$ додає $1$ до $\\delta^+(u)$ (вона виходить з $u$).',
        'Підсумувавши по всіх дугах, $\\sum_v\\delta^+(v)$ рахує кожну дугу рівно раз: $\\sum_v\\delta^+(v)=|E|$.',
        'Аналогічно дуга додає $1$ до $\\delta^-(w)$, тож $\\sum_v\\delta^-(v)=|E|$.',
        'Отже, обидві суми дорівнюють $|E|$.',
      ],
      distractors: ['Оскільки кожне ребро неорієнтоване, $\\sum_v\\delta^+(v)=2|E|$.'],
      hint: 'Рахуй внесок кожної дуги окремо у виходи й у заходи.',
    } as Record<string, unknown>,
    validation: { method: 'count each arc once' },
    adversarial: 'Дистрактор застосовує неорієнтовану лему до дуг.',
    xp: 25,
  },
  {
    id: 'GT-43-tournament',
    type: 'order-steps',
    difficulty: 'hard',
    title: 'Гамільтонів ланцюг у турнірі',
    prompt: 'Задача 7.51. Збери доведення індукцією.',
    providedData: {
      claim: 'У будь-якому турнірі існує гамільтонів ланцюг (орієнтований шлях через усі вершини).',
      steps: [
        'Турнір — орграф, у якому кожні дві вершини з’єднані рівно однією дугою.',
        'База: для одної вершини ланцюг тривіальний.',
        'Припустимо, що в турнірі на $n-1$ вершинах є гамільтонів ланцюг $v_1\\to v_2\\to\\dots\\to v_{n-1}$.',
        'Додамо $n$-ту вершину $u$ і подивимось на напрямки дуг між $u$ та кожною $v_i$.',
        'Знайдеться місце вставки ($u$ перед $v_1$, після $v_{n-1}$ або між $v_i,v_{i+1}$ з дугами $v_i\\to u\\to v_{i+1}$) — дістаємо ланцюг на $n$ вершинах.',
      ],
      distractors: ['Оскільки турнір повний, у ньому завжди є й гамільтонів цикл.'],
      hint: 'Вставляй нову вершину в наявний ланцюг, дивлячись на напрямки дуг.',
    } as Record<string, unknown>,
    validation: { method: 'induction, insert vertex' },
    adversarial: 'Дистрактор перебільшує: цикл існує лише в сильно зв’язному турнірі, а ланцюг — завжди.',
    xp: 30,
  },
  {
    id: 'GT-43-acyclic-source',
    type: 'order-steps',
    difficulty: 'hard',
    title: 'Безконтурний орграф має джерело',
    prompt: 'Збери доведення від супротивного.',
    providedData: {
      claim: 'У будь-якому скінченному безконтурному орграфі існує джерело (вершина без вхідних дуг).',
      steps: [
        'Припустимо супротивне: кожна вершина має принаймні одну вхідну дугу.',
        'Стартуємо з довільної вершини й щоразу переходимо проти дуги — у її попередника.',
        'Оскільки попередник завжди існує, рухатися назад можна як завгодно довго.',
        'Але вершин скінченно, тож якась повториться — утвориться контур.',
        'Це суперечить безконтурності. Отже, джерело існує.',
      ],
      distractors: ['За лемою про рукостискання сума напівстепенів заходу нульова, тому джерело є.'],
      hint: 'Іди «проти стрілок» і дочекайся повтору вершини.',
    } as Record<string, unknown>,
    validation: { method: 'walk backwards, finite ⇒ repeat' },
    adversarial: 'Дистрактор вигадує хибну рівність для напівстепенів заходу.',
    xp: 30,
  },
];

/* ── Assembled bank ───────────────────────────────────────── */

export const MODULE_43_TASK_SECTIONS: TaskSection[] = [
  { label: 'A · Ейлерові обходи', note: 'Пройди кожне ребро рівно раз — або визнач, коли це неможливо.', tasks: sectionA },
  { label: 'B · Гамільтонові цикли', note: 'Відвідай кожну вершину рівно раз і повернися в старт.', tasks: sectionB },
  { label: 'C · Орієнтовані графи', note: 'Напівстепені, джерела, стоки та зв’язність орграфів.', tasks: sectionC },
  { label: 'D · Збери доведення', note: 'Розстав кроки у логічному порядку; один крок зайвий.', tasks: sectionD },
];

export const MODULE_43_TASK_BANK: Task[] = MODULE_43_TASK_SECTIONS.flatMap((section) => section.tasks);
