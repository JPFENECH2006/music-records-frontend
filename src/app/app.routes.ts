import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { RecordsList } from './components/records-list/records-list';
import { RecordView } from './components/record-view/record-view';
import { RecordAdd } from './components/record-add/record-add';
import { RecordUpdate } from './components/record-update/record-update';
import { roleGuard } from './services/role-guard';
import { authGuard } from './services/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login', component: Login },

  {
    path: 'records',
    component: RecordsList,
    canActivate: [authGuard]
  },
  {
    path: 'records/view/:id',
    component: RecordView,
    canActivate: [authGuard]
  },
  {
    path: 'records/add',
    component: RecordAdd,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Salesperson', 'StoreManager', 'SystemAdmin'] }
  },
  {
    path: 'records/update/:id',
    component: RecordUpdate,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['StoreManager', 'SystemAdmin'] }
  }
];
