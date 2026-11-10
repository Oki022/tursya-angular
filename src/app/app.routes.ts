import { Routes } from '@angular/router';
import { AdminStats } from './admin/stats/stats';
import { Login } from './auth/login/login';
import { signedInGuard } from './auth/signed-in.guard';
import { TaskDetail } from './tasks/task-detail/task-detail';
import { TaskList } from './tasks/task-list/task-list';

export const routes: Routes = [
  { path: '', component: TaskList, title: 'Задачи · tursya-angular' },
  { path: 'task/:id', component: TaskDetail, title: 'Задача · tursya-angular' },
  { path: 'login', component: Login, title: 'Вход · tursya-angular' },
  { path: 'admin', component: AdminStats, canActivate: [signedInGuard], title: 'Статистика · tursya-angular' },
  { path: '**', redirectTo: '' },
];
