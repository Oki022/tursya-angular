import { Routes } from '@angular/router';
import { TaskList } from './tasks/task-list/task-list';

export const routes: Routes = [
  { path: '', component: TaskList, title: 'Задачи · tursya-angular' },
  { path: '**', redirectTo: '' },
];
