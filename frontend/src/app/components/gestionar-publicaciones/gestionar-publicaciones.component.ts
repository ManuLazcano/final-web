import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PublicationService } from 'src/app/services/publication.service';
import { UserService } from 'src/app/services/user.service';


@Component({
  selector: 'app-gestionar-publicaciones',
  templateUrl: './gestionar-publicaciones.component.html',
  styleUrls: ['./gestionar-publicaciones.component.css']
})
export class GestionarPublicacionesComponent {
  publications: any;
  formPublicaiones: FormGroup;
  userData: any;

  constructor(private userService: UserService, private router: Router, private publicationService: PublicationService) {
    this.formPublicaiones = new FormGroup({
      title: new FormControl('', [Validators.required]),
      content: new FormControl('', [Validators.required]),
      id_federation: new FormControl('', [Validators.required])
    });
  }

  ngOnInit(): void {
    this.getPublicaciones();
  }

  getPublicaciones() {
    return this.publicationService.getPublicaciones() //¿El retorno no es necesario?
      .subscribe((data: any) => {
        this.publications = data;
      });
  }

  editar(id: number) {
    this.router.navigate(['../patchPublication', id]);
  }

  borrar(id: number) {
    if(confirm('¿Estás seguro de que quieres eliminar esta publicación?')) {
      this.publicationService.deletePublicaciones(id)
        .subscribe(
          () => {                          
            this.getPublicaciones();
          }
      );
    }
  }

  submitData() {

  }

  descartar() {
    this.formPublicaiones.patchValue({
      title: '',
      content: '',
      id_federation: ''
    });
  }

}
