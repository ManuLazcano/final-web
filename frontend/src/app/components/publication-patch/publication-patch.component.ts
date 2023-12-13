import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthJwtService } from 'src/app/services/auth-jwt.service';
import { PublicationService } from 'src/app/services/publication.service';

@Component({
  selector: 'app-publication-patch',
  templateUrl: './publication-patch.component.html',
  styleUrls: ['./publication-patch.component.css']
})
export class PublicationPatchComponent implements OnInit {
  param :string = '';
  id: number = 0;
  publication: any;
  formPatchPublication: FormGroup;

  constructor(
      private publicationService: PublicationService, 
      private authJWT: AuthJwtService, 
      private route: ActivatedRoute, 
      private router: Router
    ) {
    this.formPatchPublication = new FormGroup({
      title: new FormControl('', [Validators.required, Validators.maxLength(50)]),
      content: new FormControl('', [Validators.required]),
      id_federation: new FormControl('', [Validators.required]),
      id_user: new FormControl(authJWT.getUserId)
    });

  }

  ngOnInit(): void {
    this.route.paramMap
    .subscribe(params => {
      this.param = params.get('id')?? '';
    });
  
    if(this.param != '') {
      this.id = parseInt(this.param);
      this.getPublicacionesConParametros(this.id);        
    }
  }

  getPublicacionesConParametros(id: number) {
    return this.publicationService.getPublicacionesConParametros(this.id)
      .subscribe(data => {        
        this.publication = data;
        this.formPatchPublication.patchValue({
          title: this.publication.title,
          content: this.publication.content,
          id_federation: this.publication.id_federation
        });
      });
  }

  submitData() {
    if(confirm('¿Estás seguro de que quieres guardar los cambios?')) {
      if(this.formPatchPublication.valid) {
        const data = this.formPatchPublication.value;
        this.publicationService.patchPublicaciones(data, this.id)
        .subscribe(() => {
          this.router.navigate(['publication', this.id]);
        });
      }
    }
  }

  cancelEdit() {
    if(confirm('¿Estás seguro de que quieres cancelar la edición?')) {
      // Redirige al detalle de la publicación al cancelar la edición
      this.router.navigate(['/publication', this.id]);
    }    
  }

}
