import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthJwtService } from 'src/app/services/auth-jwt.service';
import { PublicationService } from 'src/app/services/publication.service';

@Component({
  selector: 'app-publication',
  templateUrl: './publication.component.html',
  styleUrls: ['./publication.component.css']
})
export class PublicationComponent implements OnInit {
  param :string = '';
  id: number = 0;
  publication: any;
  loogedIn: boolean = false;

  constructor(
    private route: ActivatedRoute, 
    private publicationService: PublicationService, 
    private authJWT: AuthJwtService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .subscribe(params => {
        this.param = params.get('id')?? '';
      });
    
    if(this.param != '') {
      this.id = parseInt(this.param);
      this.getPublicacionesConParametros(this.id);        
    }

    this.authJWT.isLoggedIn
      .subscribe(
        (isLoggedIn) => {
          this.loogedIn = isLoggedIn;        
        }
      );
      
  }

  getPublicacionesConParametros(id: number) {
    return this.publicationService.getPublicacionesConParametros(this.id)
      .subscribe(data => {        
        this.publication = data;
      });
  }

  navigateToEditPage() {
    this.router.navigate(['../patchPublication', this.id]);
  }

  deletePublication() {
    if(confirm('¿Estás seguro de que quieres eliminar esta publicación?')) {
      this.publicationService.deletePublicaciones(this.id)
        .subscribe(
          () => {          
            console.log('Publicación eliminada correctamente');            
            this.router.navigate(['/publications-list']);
          }
      );
    }
  }

  isOwner(): boolean {    
    // Verifica si el usuario autenticado es el dueño de la publicación
    return this.loogedIn && this.publication?.id_user === this.authJWT.getUserId;
  }
}
