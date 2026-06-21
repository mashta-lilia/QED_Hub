export interface GraphSubtopic {
  id: string;
  n: string;
  title: string;
  lessons: number;
  page: string;
  progress: number;
}

export const GRAPH_SUBTOPICS: GraphSubtopic[] = [
  { id: 'g41', n: '4.1', title: 'Основи та подання графів', lessons: 5, page: 'с. 161–168', progress: 0 },
  { id: 'g42', n: '4.2', title: 'Степені, маршрути та зв’язність', lessons: 5, page: 'с. 169–177', progress: 0 },
  { id: 'g43', n: '4.3', title: 'Обходи та орієнтовані графи', lessons: 4, page: 'с. 190–197', progress: 0 },
  { id: 'g44', n: '4.4', title: 'Дерева та двочасткові графи', lessons: 4, page: 'с. 178–180', progress: 0 },
  { id: 'g45', n: '4.5', title: 'Планарність та розфарбування', lessons: 4, page: 'с. 181–189', progress: 0 },
];
