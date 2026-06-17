export interface GraphSubtopic {
  id: string;
  n: string;
  title: string;
  lessons: number;
  page: string;
  progress: number;
}

export const GRAPH_SUBTOPICS: GraphSubtopic[] = [
  { id: 'g41', n: '4.1', title: 'Основи: анатомія графа і нотація', lessons: 3, page: 'с. 161', progress: 0 },
  { id: 'g42', n: '4.2', title: 'Підграфи. Ізоморфізм графів. Операції для графів', lessons: 3, page: 'с. 164', progress: 0 },
  { id: 'g43', n: '4.3', title: 'Графи та бінарні відношення', lessons: 2, page: 'с. 169', progress: 0 },
  { id: 'g44', n: '4.4', title: 'Степені вершин графа', lessons: 2, page: 'с. 169', progress: 0 },
  { id: 'g45', n: '4.5', title: "Шлях у графі. Зв'язність графів", lessons: 3, page: 'с. 171', progress: 0 },
  { id: 'g46', n: '4.6', title: "Перевірка зв'язності графів", lessons: 2, page: 'с. 176', progress: 0 },
  { id: 'g47', n: '4.7', title: 'Дерева та двочасткові графи', lessons: 3, page: 'с. 178', progress: 0 },
  { id: 'g48', n: '4.8', title: 'Плоскі та планарні графи', lessons: 2, page: 'с. 181', progress: 0 },
  { id: 'g49', n: '4.9', title: 'Розфарбування графів', lessons: 2, page: 'с. 186', progress: 0 },
  { id: 'g410', n: '4.10', title: 'Обходи графів', lessons: 2, page: 'с. 190', progress: 0 },
  { id: 'g411', n: '4.11', title: 'Орієнтовані графи', lessons: 2, page: 'с. 192', progress: 0 },
  { id: 'g412', n: '4.12', title: 'Граф як модель. Застосування теорії графів', lessons: 2, page: 'с. 195', progress: 0 },
];
