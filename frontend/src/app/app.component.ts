import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { AuthJwtService } from './services/auth-jwt.service';
import { PublicationService } from './services/publication.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  loggedIn: boolean = false;  
  searchTerm: string = '';
  searchResults: any[] = [];

  constructor(private authJWT: AuthJwtService, private publicacionesService: PublicationService, private router: Router) {}

  ngOnInit(): void {
    this.authJWT.isLoggedIn.subscribe(
      (isLoggedIn) => {
        this.loggedIn = isLoggedIn;        
      }
    );    

  }

  logout() {
    this.authJWT.logout()
      .subscribe(
        () => {
          this.loggedIn = false;
        }
      );    
  }

  searchByTitle() {
    this.publicacionesService.searchPublicationsByTitle(this.searchTerm)
      .subscribe(results => {
        this.searchResults = results;
        if(this.searchResults.length > 0) {
          const navigationExtras: NavigationExtras = {
            state: {
              results: this.searchResults
            }
          };
          this.router.navigate(['search'], navigationExtras);
        } 
      });
  }

   // Maneja el cambio en el input de búsqueda
   handleSearchInputChange() {
    if (!this.searchTerm || this.searchTerm.trim() === '') {
      // Redirige a la lista de publicaciones si el término de búsqueda está vacío
      this.router.navigate(['/publications-list']);
    }
  }

  isAdmin(): boolean {
    const userRole = localStorage.getItem('userRole');
    return userRole === '1';  // Compara con el rol de administrador
  }

}