import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthJwtService } from 'src/app/services/auth-jwt.service';

import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-user-patch',
  templateUrl: './user-patch.component.html',
  styleUrls: ['./user-patch.component.css']
})
export class UserPatchComponent implements OnInit {
  formUser: FormGroup;
  userId: number;
  userData: any;

  constructor(private authJWT: AuthJwtService, private userService: UserService, private router: Router) {
    this.formUser = new FormGroup({
      name: new FormControl('', [Validators.required]),
      nick_name: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email])
    });

    const userIdString = this.authJWT.getUserId;
    this.userId = Number(userIdString) || 0; // Convierte a número o establece 0 si es nulo
    // this.userId = userIdString ? +userIdString : 0; 
  }

  ngOnInit(): void {
    this.userService.getUser(this.userId).subscribe(
      (userData: any) => {
        this.formUser.patchValue({
          name: userData.name,
          nick_name: userData.nick_name,
          email: userData.email
        });
        this.userData = userData;
      }
    );
  }

  onSubmit() {
    if(confirm('¿Estás seguro de que quieres guardar los cambios?')) {
      if(this.formUser.valid) {
        const userData = this.formUser.value;
  
        this.userService.patchUser(this.userId, userData).subscribe(
          () => {
            this.router.navigate(['publications-list']);
          }
        );
      }
    }
  }

  deleteUser() {
    if(confirm('¿Estás seguro de eliminar su cuenta, también se eliminarán todas sus publicaciones?')) {
      this.userService.deleteUser(this.userId).subscribe(
        () => {                   
          this.authJWT.logout().subscribe(
            () => { console.log("Se elimino correctamente") }
          );
          // this.router.navigate(['/publications-list']);
        }
    );
    }
  } 

}
