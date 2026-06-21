export const APP_NAME = 'Q.E.D';

export type SubjectIcon = 'sets' | 'code' | 'calc';

export interface Subject {
  id: string;
  name: string;
  desc: string;
  icon: SubjectIcon;
  color: string;
  status: 'active' | 'soon';
}

export const SUBJECTS: Subject[] = [
  {
    id: 'discrete',
    name: 'Дискретна математика',
    desc: 'Множини, логіка, відношення, комбінаторика та графи.',
    icon: 'sets',
    color: '#2f6fdb',
    status: 'active',
  },
  {
    id: 'programming',
    name: 'Програмування',
    desc: 'Алгоритми, структури даних і основи мов.',
    icon: 'code',
    color: '#1f8aa3',
    status: 'soon',
  },
  {
    id: 'calculus',
    name: 'Математичний аналіз',
    desc: 'Границі, похідні та інтеграли функцій.',
    icon: 'calc',
    color: '#1f9d6b',
    status: 'soon',
  },
];

export interface Topic {
  id: string;
  n: string;
  title: string;
  lessons: number;
  baseProgress: number;
  status: 'active' | 'soon';
}

export const DISCRETE_TOPICS: Topic[] = [
  { id: 'sets', n: '1', title: 'Елементи математичної логіки', lessons: 8, baseProgress: 0, status: 'soon' },
  { id: 'logic', n: '2', title: 'Множини та відношення', lessons: 7, baseProgress: 0, status: 'soon' },
  { id: 'combinatorics', n: '3', title: 'Комбінаторика', lessons: 6, baseProgress: 0, status: 'soon' },
  { id: 'graphs', n: '4', title: 'Теорія графів', lessons: 17, baseProgress: 0, status: 'active' },
  { id: 'automata', n: '5', title: 'Теорія автоматів', lessons: 9, baseProgress: 0, status: 'soon' },
  { id: 'boolean', n: '6', title: 'Семантичні засади логіки предикатів', lessons: 6, baseProgress: 0, status: 'soon' },
];
