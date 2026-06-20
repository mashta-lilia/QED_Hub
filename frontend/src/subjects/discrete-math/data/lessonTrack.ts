import type { PageDescriptor } from '../../../types';

export const PAGES: PageDescriptor[] = [
  // ── GT-01 linear track (1-to-1 koans) ──
  { id: 'gt01-intro', kind: 'theory', title: 'Вступ: анатомія графа', lead: 'Огляд теми: що ми вивчимо в цьому підрозділі.' },
  { id: 'gt01-theory-digraph', kind: 'theory', title: 'Графи та Орграфи', lead: 'Визначення графа та орієнтованого графа.' },
  { id: 'gt01-task-directed', kind: 'practice', title: 'Напівстепені в орграфі', lead: 'Обчисли deg⁺ і deg⁻ для кожної вершини орграфа.' },
  { id: 'gt01-theory-matrix', kind: 'theory', title: 'Матриця суміжності', lead: 'Як граф записується у вигляді таблиці.' },
  { id: 'gt01-task-matrix', kind: 'practice', title: 'Побудуй матрицю', lead: 'Заповни матрицю за зображеним графом з практичного заняття 12.' },
  { id: 'gt01-theory-degree', kind: 'theory', title: 'Степінь вершини', lead: 'Що таке степінь і регулярні графи.' },
  { id: 'gt01-task-regular', kind: 'practice', title: 'Регулярний граф', lead: 'Побудуй 3-регулярний граф на 6 вершинах.' },
  { id: 'gt01-theory-sequence', kind: 'theory', title: 'Послідовність степенів', lead: 'Набір степенів усіх вершин графа.' },
  { id: 'gt01-task-sequence', kind: 'practice', title: 'Граф за степенями', lead: 'Задано послідовність степенів — побудуй відповідний граф.' },
  { id: 'gt01-theory-handshaking', kind: 'theory', title: 'Лема про рукостискання', lead: 'Сума степенів усіх вершин дорівнює подвоєній кількості ребер.' },
  { id: 'gt01-task-repair', kind: 'practice', title: 'Полагодь лему', lead: 'Додай або видали ребра, щоб лема виконувалась.' },
  { id: 'gt01-theory-pigeonhole', kind: 'theory', title: 'Збіг степенів', lead: 'Принцип Діріхле: завжди знайдуться дві вершини однакового степеня.' },
  { id: 'gt01-task-equal', kind: 'practice', title: 'Знайди однакові', lead: 'Клікни дві вершини з однаковим степенем.' },
  { id: 'gt01-taskbank', kind: 'practice', title: 'Банк задач 4.1', lead: 'Усі задачі підрозділу 4.1 у форматі дій: рахуй, будуй, обирай «Так/Ні», збирай доведення.' },

  // ── General graph track pages ──
  { id: 'concept', kind: 'theory', title: 'Поняття графа. Способи задання', lead: 'Вершини, ребра, суміжність — і чотири способи задати той самий граф.' },
  { id: 'iso', kind: 'theory', title: 'Підграфи, ізоморфізм, операції', lead: "Коли два графи — це «той самий» граф, і як графи пов'язані з відношеннями." },
  { id: 'degrees', kind: 'theory', title: 'Степені вершин', lead: 'Степінь вершини та лема про рукостискання.' },
  { id: 'degreelab', kind: 'interactive', title: 'Лема про рукостискання', lead: 'Будуйте граф клацанням і стежте: сума степенів завжди дорівнює подвоєній кількості ребер.' },
  { id: 'paths', kind: 'theory', title: "Шляхи та зв'язність", lead: "Маршрути, ланцюги, цикли, відстань, радіус, діаметр і центр графа." },
  { id: 'conncheck', kind: 'theory', title: "Перевірка зв'язності", lead: 'Степені матриці суміжності та матриця досяжності.' },
  { id: 'gt02-taskbank', kind: 'practice', title: 'Банк задач 4.2', lead: 'Прокладай найкоротші шляхи, шукай мости й точки зчленування, рахуй відстані, збирай доведення.' },
  { id: 'trees', kind: 'theory', title: 'Дерева та двочасткові графи', lead: 'Критерії дерева, кістякові дерева, цикломатичне число й теорема Кьоніга.' },
  { id: 'planar', kind: 'theory', title: 'Плоскі та планарні графи', lead: 'Формула Ейлера, графи K₅ і K₃,₃ та теорема Куратовського.' },
  { id: 'coloring', kind: 'theory', title: 'Розфарбування графів', lead: 'Хроматичне число та гіпотеза чотирьох фарб.' },
  { id: 'colorlab', kind: 'interactive', title: 'Розфарбуйте граф', lead: 'Спробуйте правильно розфарбувати граф мінімальною кількістю кольорів.' },
  { id: 'traversal', kind: 'theory', title: 'Обходи: Ейлер і Гамільтон', lead: 'Сім мостів Кеніґсберга й два класичні типи обходу графа.' },
  { id: 'eulerlab', kind: 'interactive', title: 'Мости Кеніґсберга', lead: 'Чому неможливо обійти всі мости — і як виглядає справжній ейлерів обхід.' },
  { id: 'digraph', kind: 'theory', title: 'Орієнтовані графи', lead: "Дуги, напівстепені, джерела й стоки, сильна зв'язність." },
  { id: 'gt03-taskbank', kind: 'practice', title: 'Банк задач 4.3', lead: 'Проходь ейлерові й гамільтонові обходи, працюй із напівстепенями орграфів, доводь теореми про турніри.' },
  { id: 'applications', kind: 'theory', title: 'Граф як модель', lead: 'Де теорія графів працює у науці, техніці та повсякденні.' },
  { id: 'practice', kind: 'practice', title: 'Перевірте себе', lead: 'Запитання з миттєвою перевіркою. Кожна правильна відповідь — +10 XP.' },
  { id: 'worked', kind: 'practice', title: 'Розбір задачі', lead: 'Покроковий аналіз характеристик графа за його діаграмою.' },
  { id: 'practicals', kind: 'practice', title: 'Практичні заняття 12–18', lead: 'Повний перелік завдань усіх практичних занять із теорії графів.' },
];

export const GT01_TRACK = [
  'gt01-intro',
  'gt01-theory-digraph',
  'gt01-task-directed',
  'gt01-theory-matrix',
  'gt01-task-matrix',
  'gt01-theory-degree',
  'gt01-task-regular',
  'gt01-theory-sequence',
  'gt01-task-sequence',
  'gt01-theory-handshaking',
  'gt01-task-repair',
  'gt01-theory-pigeonhole',
  'gt01-task-equal',
  'gt01-taskbank',
];

export const GENERAL_GRAPH_TRACK = [
  'concept', 'iso', 'degrees', 'degreelab', 'paths', 'conncheck',
  'trees', 'planar', 'coloring', 'colorlab', 'traversal', 'eulerlab',
  'digraph', 'applications', 'practice', 'worked', 'practicals',
];

// Module 4.2 — paths & connectivity: reuse existing theory pages + its own task bank.
export const GT02_TRACK = ['paths', 'conncheck', 'gt02-taskbank'];

// Module 4.3 — traversals & directed graphs.
export const GT03_TRACK = ['traversal', 'digraph', 'gt03-taskbank'];

export const LESSON_TRACK = [...GT01_TRACK, ...GENERAL_GRAPH_TRACK, 'gt02-taskbank', 'gt03-taskbank'];

export function getLessonTrackForSubtopic(subtopicId: string) {
  if (subtopicId === 'g41') return GT01_TRACK;
  if (subtopicId === 'g42') return GT02_TRACK;
  if (subtopicId === 'g43') return GT03_TRACK;
  return GENERAL_GRAPH_TRACK;
}
