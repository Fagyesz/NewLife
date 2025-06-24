import { Routes } from '@angular/router';
import { Fooldal } from './components/fooldal/fooldal';
import { Esemenyek } from './components/esemenyek/esemenyek';
import { Hirek } from './components/hirek/hirek';
import { EloKozvetites } from './components/elo-kozvetites/elo-kozvetites';
import { Rolunk } from './components/rolunk/rolunk';
import { Kapcsolat } from './components/kapcsolat/kapcsolat';

export const routes: Routes = [
  { path: '', component: Fooldal }, // Főoldal (Home)
  { path: 'fooldal', component: Fooldal }, // Főoldal (Home) 
  { path: 'esemenyek', component: Esemenyek }, // Események (Events)
  { path: 'hirek', component: Hirek }, // Hírek (News)
  { path: 'elo-kozvetites', component: EloKozvetites }, // Élő közvetítés (Live Stream)
  { path: 'rolunk', component: Rolunk }, // Rólunk (About Us)
  { path: 'kapcsolat', component: Kapcsolat }, // Kapcsolat (Contact)
  { path: '**', redirectTo: '' } // Wildcard route - redirect to home
];
