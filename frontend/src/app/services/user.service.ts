import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }

  getUsersList() {
    return this.http.get(`${environment.baseUrl}/usuarios`);
  }

  getUser(id: number) {
    return this.http.get(`${environment.baseUrl}/usuarios/${id}`);
  }
  
  patchUser(id: any, data: any) {
    return this.http.patch(`${environment.baseUrl}/usuarios/${id}`, data);
  }

  deleteUser(id: number) {
    return this.http.delete(`${environment.baseUrl}/usuarios/${id}`);
  }

}
