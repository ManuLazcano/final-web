import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PublicationService {
  private http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
   }

  getPublicaciones() {
    return this.http.get(`${environment.baseUrl}/publicaciones`);
  }

  getPublicacionesConParametros(id: number) {
    return this.http.get(`${environment.baseUrl}/publicaciones/${id}`);
  }

  postPublicaciones(data: any) {
    return this.http.post(`${environment.baseUrl}/publicaciones`, data);
  }

  patchPublicaciones(data: any, id: number) {
    return this.http.patch(`${environment.baseUrl}/publicaciones/${id}`, data);
  }

  deletePublicaciones(id: number) {
    return this.http.delete(`${environment.baseUrl}/publicaciones/${id}`);
  }

  searchPublicationsByTitle(searchTerm: string) {
    // Filtra un array de publicaciones, almacenado localmente, por título.
    return this.getPublicaciones()
      .pipe(
        map((publications: any) => {
          return publications.filter((pub: { title: string; }) => pub.title.toLowerCase().includes(searchTerm.toLowerCase()));
        })
      );
  }

}
