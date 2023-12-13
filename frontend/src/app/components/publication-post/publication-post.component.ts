import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthJwtService } from 'src/app/services/auth-jwt.service';
import { PublicationService } from 'src/app/services/publication.service';


@Component({
  selector: 'app-publication-post',
  templateUrl: './publication-post.component.html',
  styleUrls: ['./publication-post.component.css']
})
export class PublicationPostComponent {
    // private userId: string | null;
    formPublication: FormGroup;

    constructor(private publicationService: PublicationService, private router: Router, private authJWT: AuthJwtService) {
      // this.userId = authJWT.getUserId;
  
      this.formPublication = new FormGroup({
        title: new FormControl('', [Validators.required, Validators.maxLength(50)]),
        content: new FormControl('', [Validators.required]),
        id_federation: new FormControl('', [Validators.required]),
        id_user: new FormControl(authJWT.getUserId)
      });
  
    }
  
  
    submitData() {
      if(this.formPublication.valid) {
        const data = this.formPublication.value;
        this.publicationService.postPublicaciones(data)
        .subscribe(() => {
          this.router.navigate(['publications-list']);
        });
      }
    }
}
