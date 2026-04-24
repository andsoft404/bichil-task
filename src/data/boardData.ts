import type { Board, CardLabel } from '../types/board';

export const DEFAULT_LABELS: CardLabel[] = [
  { id: 'lbl-1', color: '#4bce97', text: '' },
  { id: 'lbl-2', color: '#c4a33b', text: '' },
  { id: 'lbl-3', color: '#f5a623', text: '' },
  { id: 'lbl-4', color: '#f87168', text: '' },
  { id: 'lbl-5', color: '#9f8fef', text: '' },
  { id: 'lbl-6', color: '#579dff', text: '' },
];

export const BOARD_MEMBERS = [
  { id: '1001', initials: 'KK', name: 'Kuzo Kuzo', color: '#6554c0' },
  { id: '1002', initials: 'BT', name: 'Bat Tulga', color: '#00a3bf' },
  { id: '1003', initials: 'AA', name: 'Anand Ariunaa', color: '#ff5630' },
];

// Системийн бүх гишүүд - ID-ээр хайж урих боломжтой
export const ALL_SYSTEM_MEMBERS = [
  { id: '1001', initials: 'KK', name: 'Kuzo Kuzo', color: '#6554c0' },
  { id: '1002', initials: 'BT', name: 'Bat Tulga', color: '#00a3bf' },
  { id: '1003', initials: 'AA', name: 'Anand Ariunaa', color: '#ff5630' },
  { id: '1004', initials: 'DN', name: 'Dorj Narantsetseg', color: '#36b37e' },
  { id: '1005', initials: 'TS', name: 'Tuvshinjargal Solongo', color: '#ff8b00' },
  { id: '1006', initials: 'GE', name: 'Gantulga Enkhjargal', color: '#0052cc' },
  { id: '1007', initials: 'MO', name: 'Munkhbayar Oyuntsetseg', color: '#e91e8c' },
  { id: '1008', initials: 'PU', name: 'Purevdorj Uranchimeg', color: '#00b8d9' },
];

export const initialBoard: Board = {
  id: 'board-1',
  title: '2026 - 1 улирал',
  columns: [
    {
      id: 'col-1',
      title: 'PROJECT&PRODUCT DEV.',
      cards: [
        { id: 'card-1', title: '+ ТӨСӨЛ/PROJECT', isCategory: true },
        { id: 'card-2', title: '+ БҮТЭЭГДЭХҮҮН/PRODUCT', isCategory: true },
      ],
    },
    {
      id: 'col-2',
      title: 'CUSTOMER SERVICE/EXPERIENCE',
      collapsed: true,
      cards: [
        { id: 'card-cs-1', title: 'Үйлчилгээний чанар', isCategory: true },
        { id: 'card-cs-2', title: 'Хэрэглэгчийн санал хүсэлт', isCategory: true },
      ],
    },
    {
      id: 'col-3',
      title: 'MARKETING/SALES',
      cards: [
        { id: 'card-3', title: '+НЭР ХҮНД, БРЭНД, БРЭНДИНГ', isCategory: true },
        { id: 'card-4', title: '+ БОРЛУУЛАЛТ', isCategory: true },
        { id: 'card-5', title: '+ СУВАГ АРЧИЛГАА', isCategory: true },
        { id: 'card-6', title: '+ ИДЭВХЖҮҮЛЭЛТ', isCategory: true },
        { id: 'card-7', title: '+ ТОГТМОЛ ТӨЛБӨРҮҮД', isCategory: true },
        { id: 'card-8', title: '+ СУРГАЛТ', isCategory: true },
        { id: 'card-9', title: '+ ХЯНАЛТ, ШАЛГАЛТ', isCategory: true },
      ],
    },
    {
      id: 'col-4',
      title: 'BRAND/DESIGN',
      cards: [
        { id: 'card-10', title: '+ КОМПАНИТ АЖИЛ', isCategory: true },
        {
          id: 'card-11',
          title: 'САР ШИНЭ 2026',
          label: { text: 'Хийж байгаа', color: '#eb5a46' },
          image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=200&fit=crop',
          attachments: 1,
        },
        {
          id: 'card-12',
          title: '+ НЭР ХҮНД, БРЭНД',
          isCategory: true,
        },
        {
          id: 'card-13',
          title: 'OV PPT',
          image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=200&fit=crop&q=80',
          attachments: 24,
        },
      ],
    },
    {
      id: 'col-5',
      title: 'CALLCENTER',
      collapsed: true,
      cards: [
        { id: 'card-cc-1', title: 'Дуудлагын тайлан', isCategory: true },
      ],
    },
    {
      id: 'col-6',
      title: 'MEETING',
      collapsed: true,
      cards: [],
    },
  ],
};
