import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PublicationListComponent } from './components/publication-list/publication-list.component';
import { PublicationComponent } from './components/publication/publication.component';
import { AuthGuardService } from './guard/auth-guard.service';
import { LoginComponent } from './components/login/login.component';
import { PublicationPostComponent } from './components/publication-post/publication-post.component';
import { PublicationPatchComponent } from './components/publication-patch/publication-patch.component';
import { SearchComponent } from './components/search/search.component';
import { UserPatchComponent } from './components/user-patch/user-patch.component';
import { GestionarUsuariosComponent } from './components/gestionar-usuarios/gestionar-usuarios.component';
import { GestionarPublicacionesComponent } from './components/gestionar-publicaciones/gestionar-publicaciones.component';

const routes: Routes = [
  { path: "publications-list", component: PublicationListComponent },
  { path: "publication/:id", component: PublicationComponent, canActivate: [AuthGuardService] },
  { path: "createPublication", component: PublicationPostComponent, canActivate: [AuthGuardService] },
  { path: "patchPublication/:id", component: PublicationPatchComponent, canActivate: [AuthGuardService]},
  { path: "patchUser", component: UserPatchComponent, canActivate: [AuthGuardService]},
  { path: "gestionarUsuarios", component: GestionarUsuariosComponent, canActivate: [AuthGuardService]},
  { path: "gestionarPublicaciones", component: GestionarPublicacionesComponent, canActivate: [AuthGuardService]},
  { path: "search", component: SearchComponent },
  { path: "login", component: LoginComponent },
  { path: "", redirectTo: "/publications-list", pathMatch: "full" }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
