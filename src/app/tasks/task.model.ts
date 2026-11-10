/** One task (job post) as the Supabase REST API returns it. */
export interface Task {
  id: string;
  title: string;
  category: string;
  city: string | null;
  /** 0 when the client wrote "По договаряне" (price to be agreed). */
  budget: number;
  created_at: string;
}

/** Category ids stored in the database and their Bulgarian names (same list as tursya.bg). */
export const CATEGORIES: Record<string, string> = {
  remonti: 'Ремонти',
  stroitelstvo: 'Строителство',
  pochistvane: 'Почистване',
  avto: 'Авто',
  prevoz: 'Превоз и хамали',
  gradina: 'Градина и двор',
  it: 'ИТ и техника',
  'krasota-zdrave': 'Красота и здраве',
  uroci: 'Уроци',
  eksperti: 'Експерти и консултанти',
  domashni: 'Домашни любимци',
  foto: 'Фото, видео и забавления',
};
