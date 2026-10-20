import { Component, inject } from '@angular/core';
import { RouterOutlet,RouterLink,Router } from '@angular/router';
import {Store,message} from './store';

@Component({
  imports: [RouterOutlet,RouterLink],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  store=inject(Store);router=inject(Router);
  async logout(){try{await this.store.logout();await this.router.navigateByUrl('/');}catch(e){this.store.error.set(message(e));}}
}
