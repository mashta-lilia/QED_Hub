import type { PageDescriptor } from '../../../types';

export const PAGES: PageDescriptor[] = [
  {
    id: 'gt01-theory',
    kind: 'theory',
    title: 'Основи: анатомія графа і нотація',
    lead: 'Означення, нотація, степені вершин і перший візуальний запис графа.',
  },
  {
    id: 'gt01-theorems',
    kind: 'theory',
    title: 'Теореми: перші факти про графи',
    lead: 'Лема про рукостискання, парність непарних вершин і збіг степенів.',
  },
  {
    id: 'gt01-practice',
    kind: 'practice',
    title: 'Практика: основи графів',
    lead: 'Інтерактивні завдання на степені, матриці, лему про рукостискання та орграфи.',
  },
  {
    id: 'concept',
    kind: 'theory',
    title: 'Поняття графа. Способи задання',
    lead: 'Вершини, ребра, суміжність — і чотири способи задати той самий граф.',
  },
  {
    id: 'iso',
    kind: 'theory',
    title: 'Підграфи, ізоморфізм, операції',
    lead: "Коли два графи — це «той самий» граф, і як графи пов'язані з відношеннями.",
  },
  { id: 'degrees', kind: 'theory', title: 'Степені вершин', lead: 'Степінь вершини та лема про рукостискання.' },
  {
    id: 'degreelab',
    kind: 'interactive',
    title: 'Лема про рукостискання',
    lead: 'Будуйте граф клацанням і стежте: сума степенів завжди дорівнює подвоєній кількості ребер.',
  },
  {
    id: 'paths',
    kind: 'theory',
    title: "Шляхи та зв'язність",
    lead: "Маршрути, ланцюги, цикли, відстань, радіус, діаметр і центр графа.",
  },
  {
    id: 'conncheck',
    kind: 'theory',
    title: "Перевірка зв'язності",
    lead: 'Степені матриці суміжності та матриця досяжності.',
  },
  {
    id: 'trees',
    kind: 'theory',
    title: 'Дерева та двочасткові графи',
    lead: 'Критерії дерева, кістякові дерева, цикломатичне число й теорема Кьоніга.',
  },
  {
    id: 'planar',
    kind: 'theory',
    title: 'Плоскі та планарні графи',
    lead: 'Формула Ейлера, графи K₅ і K₃,₃ та теорема Куратовського.',
  },
  {
    id: 'coloring',
    kind: 'theory',
    title: 'Розфарбування графів',
    lead: 'Хроматичне число та гіпотеза чотирьох фарб.',
  },
  {
    id: 'colorlab',
    kind: 'interactive',
    title: 'Розфарбуйте граф',
    lead: 'Спробуйте правильно розфарбувати граф мінімальною кількістю кольорів.',
  },
  {
    id: 'traversal',
    kind: 'theory',
    title: 'Обходи: Ейлер і Гамільтон',
    lead: 'Сім мостів Кеніґсберга й два класичні типи обходу графа.',
  },
  {
    id: 'eulerlab',
    kind: 'interactive',
    title: 'Мости Кеніґсберга',
    lead: 'Чому неможливо обійти всі мости — і як виглядає справжній ейлерів обхід.',
  },
  {
    id: 'digraph',
    kind: 'theory',
    title: 'Орієнтовані графи',
    lead: "Дуги, напівстепені, джерела й стоки, сильна зв'язність.",
  },
  {
    id: 'applications',
    kind: 'theory',
    title: 'Граф як модель',
    lead: 'Де теорія графів працює у науці, техніці та повсякденні.',
  },
  {
    id: 'practice',
    kind: 'practice',
    title: 'Перевірте себе',
    lead: 'Запитання з миттєвою перевіркою. Кожна правильна відповідь — +10 XP.',
  },
  {
    id: 'worked',
    kind: 'practice',
    title: 'Розбір задачі',
    lead: 'Покроковий аналіз характеристик графа за його діаграмою.',
  },
  {
    id: 'practicals',
    kind: 'practice',
    title: 'Практичні заняття 12–18',
    lead: 'Повний перелік завдань усіх практичних занять із теорії графів.',
  },
];

export const GT01_TRACK = ['gt01-theory', 'gt01-theorems', 'gt01-practice'];

export const GENERAL_GRAPH_TRACK = [
  'concept',
  'iso',
  'degrees',
  'degreelab',
  'paths',
  'conncheck',
  'trees',
  'planar',
  'coloring',
  'colorlab',
  'traversal',
  'eulerlab',
  'digraph',
  'applications',
  'practice',
  'worked',
  'practicals',
];

export const LESSON_TRACK = [...GT01_TRACK, ...GENERAL_GRAPH_TRACK];

export function getLessonTrackForSubtopic(subtopicId: string) {
  return subtopicId === 'g41' ? GT01_TRACK : GENERAL_GRAPH_TRACK;
}
