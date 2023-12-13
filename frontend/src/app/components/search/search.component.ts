import { Component } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent {
  publications = [];

  constructor(private router: Router) {
    const results = this.router.getCurrentNavigation()?.extras.state?.['results'];
    if(results) {      
      this.publications = results;      
    }
  }

}
