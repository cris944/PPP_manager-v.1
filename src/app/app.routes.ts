import { Routes } from '@angular/router';
import { AppLayoutComponent } from './layout/app.layout.component';
import { HomeComponent } from './home/home.component';
import { PersonaComponent } from './persona/persona.component';
import { EmpresaComponent } from './empresa/empresa.component';
import { EstudianteComponent } from './estudiante/estudiante.component';

export const routes: Routes = [
  {
    path: '',
    component: AppLayoutComponent,
    children: [
      { path: '', component: HomeComponent }, // Ruta principal
      { path: 'personas', component: PersonaComponent }, // Ruta para gestión de personas
      { path: 'empresas', component: EmpresaComponent }, // Ruta para gestión de empresas
      { path: 'estudiantes', component: EstudianteComponent }, // Ruta para gestión de estudiantes
    ],
  },
  {
    path: '**', // Ruta para páginas no encontradas
    redirectTo: '',
  },
];
