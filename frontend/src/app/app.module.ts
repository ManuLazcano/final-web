import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthGuardService } from './guard/auth-guard.service';
import { AuthInterceptor } from './auth-interceptor';
import { PublicationListComponent } from './components/publication-list/publication-list.component';
import { PublicationComponent } from './components/publication/publication.component';
import { LoginComponent } from './components/login/login.component';
import { PublicationPostComponent } from './components/publication-post/publication-post.component';
import { PublicationPatchComponent } from './components/publication-patch/publication-patch.component';
import { SearchComponent } from './components/search/search.component';
import { UserPatchComponent } from './components/user-patch/user-patch.component';
import { GestionarUsuariosComponent } from './components/gestionar-usuarios/gestionar-usuarios.component';
import { GestionarPublicacionesComponent } from './components/gestionar-publicaciones/gestionar-publicaciones.component';

@NgModule({
  declarations: [
    AppComponent,
    PublicationListComponent,
    PublicationComponent,
    LoginComponent,
    PublicationPostComponent,
    PublicationPatchComponent,
    SearchComponent,
    UserPatchComponent,
    GestionarUsuariosComponent,
    GestionarPublicacionesComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    AuthGuardService,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
