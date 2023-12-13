import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { tap } from 'rxjs';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root'
})
export class AuthJwtService {
  private loggedIn = new BehaviorSubject<boolean>(false);
  private jwtHelper = new JwtHelperService();
  private userId: string | null = null;

  constructor(private http: HttpClient, private router: Router) { 
    this.tryGetDataUserFromToken();
  }

  private tryGetDataUserFromToken(): void {
    const token = localStorage.getItem('jwt');

    if(token && !this.jwtHelper.isTokenExpired(token)) {
      try {
        const decodedToken: any = this.jwtHelper.decodeToken(token)
        this.userId = decodedToken.uid;       
        localStorage.setItem('userRole', decodedToken.rol);
      } catch (error) {
        console.error('Error decoding JWT: ', error);
      }
    }
  }

  login(data: any): Observable<any> {
    //Se crea un objeto observable, se pasa una función como argumento. La cual se ejecutará cada vez que
    //alguien se suscriba al observable
    let retorno = new Observable(loginApi => { 
      this.http.post(`${environment.baseUrl}/login`, data)
        .subscribe({
          next: (response:any) => {
            localStorage.setItem('jwt', response.jwt);            
            loginApi.next(response.jwt); //Cualquier syscriptor de este obervable recibirá este valor
            this.tryGetDataUserFromToken();
            this.loggedIn.next(!!response.jwt);  
          },
          error: (err) => { loginApi.error(err); },
          complete: () => { loginApi.complete(); }
        });
    });
    return retorno;
  }

  logout(): Observable<any> {
    return this.http.post(`${environment.baseUrl}/logout`, {}).pipe(
      tap(() => {
        this.loggedIn.next(false);
        localStorage.removeItem('jwt');
        localStorage.removeItem('userRole');
        this.router.navigate(['publications-list']);
      })
    );
  }

  createUser(data: any): Observable<any> {
    return this.http.post(`${environment.baseUrl}/usuarios`, data);
  }

  get isLoggedIn(): Observable<boolean> {
    return this.loggedIn.asObservable();
  }

  get getUserId(): string | null {
    return this.userId;
  }  
  
}
