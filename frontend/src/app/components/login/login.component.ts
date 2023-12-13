import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthJwtService } from 'src/app/services/auth-jwt.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  private viewLogin: boolean = true;
  formLogin: FormGroup;
  formRegister: FormGroup;  
  submitted = false;

  constructor(private authJWT: AuthJwtService, private router: Router) {
    this.formLogin = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required])
    });

    this.formRegister = new FormGroup({
      name: new FormControl('', [Validators.required]),
      nick_name: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(8)]),  
      confirmPassword: new FormControl('', [Validators.required, Validators.minLength(8)])    
    });

  }

  matchPassword() {
    const password = this.formRegister.get('password')?.value;
    const confirmPassword = this.formRegister.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
      // Las contraseñas no coinciden, establece el estado del control como inválido
      this.formRegister.get('confirmPassword')?.setErrors({ 'passwordMismatch': true });      
    } else {
      // Las contraseñas coinciden, elimina el error si existe
      this.formRegister.get('confirmPassword')?.setErrors(null);
    }
  }

  submitLogin() {   
    this.submitted = true; 
    if(this.formLogin.valid) {
      const data = this.formLogin.value;
      this.authJWT.login(data).subscribe(
        response => {           
          this.router.navigate(['/publications-list']);
        }
      );
    } 
  }

  submitRegister() {
    this.submitted = true;
    this.matchPassword();

    if (this.formRegister.valid) {
      const data = this.formRegister.value;
      this.authJWT.createUser(data).subscribe(
        response => {           
          this.router.navigate(['/publications-list']);
        }
      );
    } 

  }

  get login() {
    return this.viewLogin;
  }

  toggleForm() {
      this.viewLogin = !this.viewLogin;
  }

}
