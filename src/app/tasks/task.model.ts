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

/** A task with the fields only the detail page needs. */
export interface TaskDetail extends Task {
  description: string;
  neighborhood: string | null;
}

/** Supabase task ids are UUIDs; anything else cannot be a task. */
export const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
