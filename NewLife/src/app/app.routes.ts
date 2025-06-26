import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./components/fooldal/fooldal').then(m => m.Fooldal)
  },
  { 
    path: 'fooldal', 
    loadComponent: () => import('./components/fooldal/fooldal').then(m => m.Fooldal)
  },
  { 
    path: 'esemenyek', 
    loadComponent: () => import('./components/esemenyek/esemenyek').then(m => m.Esemenyek)
  },
  { 
    path: 'hirek', 
    loadComponent: () => import('./components/hirek/hirek').then(m => m.Hirek)
  },
  { 
    path: 'elo-kozvetites', 
    loadComponent: () => import('./components/elo-kozvetites/elo-kozvetites').then(m => m.EloKozvetites)
  },
  { 
    path: 'rolunk', 
    loadComponent: () => import('./components/rolunk/rolunk').then(m => m.Rolunk)
  },
  { 
    path: 'kapcsolat', 
    loadComponent: () => import('./components/kapcsolat/kapcsolat').then(m => m.Kapcsolat)
  },
  { 
    path: 'login', 
    loadComponent: () => import('./components/login/login').then(m => m.Login)
  },
  { 
    path: 'admin', 
    loadComponent: () => import('./components/admin/admin').then(m => m.Admin), 
    canActivate: [authGuard] 
  },
  { path: '**', redirectTo: '' }
];
