import { Component } from '@angular/core';
import { PublicationService } from 'src/app/services/publication.service';

@Component({
  selector: 'app-publication-list',
  templateUrl: './publication-list.component.html',
  styleUrls: ['./publication-list.component.css']
})
export class PublicationListComponent {
  publications = [];

  constructor(private publicationService: PublicationService) {}

  ngOnInit(): void {
    this.getPublicaciones();  
  }

  getPublicaciones() {
    return this.publicationService.getPublicaciones() //¿El retorno no es necesario?
      .subscribe((data: any) => {
        this.publications = data;
      });
  }
}
