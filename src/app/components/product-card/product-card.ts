import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { Product } from '../../models';
import { money } from '../../store';
@Component({
  selector: 'app-product-card',
  imports: [RouterLink, MatButtonModule],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
})
export class ProductCard {
  product = input.required<Product>();
  add = output<Product>();
  money = money;
}
