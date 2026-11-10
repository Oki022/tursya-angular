import { Routes } from '@angular/router';
import { Login } from './auth/login/login';
import { TaskDetail } from './tasks/task-detail/task-detail';
import { TaskList } from './tasks/task-list/task-list';

export const routes: Routes = [
  { path: '', component: TaskList, title: 'Задачи · tursya-angular' },
  { path: 'task/:id', component: TaskDetail, title: 'Задача · tursya-angular' },
  { path: 'login', component: Login, title: 'Вход · tursya-angular' },
  { path: '**', redirectTo: '' },
];
