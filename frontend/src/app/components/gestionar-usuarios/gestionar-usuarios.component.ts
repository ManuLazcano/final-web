import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-gestionar-usuarios',
  templateUrl: './gestionar-usuarios.component.html',
  styleUrls: ['./gestionar-usuarios.component.css']
})
export class GestionarUsuariosComponent implements OnInit {
  users: any;
  formUser: FormGroup;
  userData: any;

  constructor(private userService: UserService, private router: Router) {
    this.formUser = new FormGroup({
      name: new FormControl('', [Validators.required]),
      nick_name: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email])
    });
  }

  ngOnInit(): void {
    this.getUsers();
  }

  getUsers() {
    this.userService.getUsersList().subscribe(
      (response) => {
        this.users = response;
      }
    );
  }

  editar(id: number) {
    this.userService.getUser(id).subscribe(
      (response) => {
        this.userData = response;
        this.formUser.patchValue({
          name: this.userData.name,
          nick_name: this.userData.nick_name,
          email: this.userData.email          
        });
      });
  }

  borrar(id: number) {
    if(confirm('¿Está seguro de eliminar al usuario?')) {
      this.userService.deleteUser(id).subscribe(
        () => {                             
          this.getUsers();
        }
    );
    }
  }

  submitData() {
    if(confirm('¿Estás seguro de que quieres guardar los cambios?')) {
      if(this.formUser.valid) {
        const data = this.formUser.value;
        this.userService.patchUser(this.userData.id, data)
        .subscribe(() => {
          this.getUsers();
          this.descartar();
        });
      }
    }
  }

  descartar() {
      this.formUser.patchValue({
        name: '',
        nick_name: '',
        email: ''
      });
  }

}
