import { Reveal } from '../../motion';
import { Catalogue } from '../catalogue/catalogue';
import { Store } from '../../store';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-home',
  imports: [RouterLink, Catalogue, Reveal],
  templateUrl: './home.html',
})
export class Home {
  store = inject(Store);
  universes = [
    ['cafe', 'L’univers café', 'Machines, capsules & cafés premium'],
    ['cuisine', 'La cuisine', 'Ustensiles & équipements de cuisine'],
    ['table', 'Les arts de la table', 'Vaisselle & décoration'],
    ['fruits', 'Les fruits secs', 'Le goût des belles choses'],
  ];
}
