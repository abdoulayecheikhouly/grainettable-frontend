import { Component, inject, signal, effect, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Store, money, message } from '../../store';
import type { Product, Quote, Order, Page } from '../../models';
import { CartItem } from '../../components/cart-item/cart-item';
import { Pagination } from '../../pagination';
@Component({
  selector: 'app-shop',
  imports: [FormsModule, RouterLink, Pagination, CartItem],
  templateUrl: './shop.html',
})
export class Shop implements OnInit {
  store = inject(Store);
  route = inject(ActivatedRoute);
  router = inject(Router);
  view = signal('');
  product = signal<Product | null>(null);
  quote = signal<Quote | null>(null);
  orders = signal<Page<Order> | null>(null);
  error = signal('');
  busy = signal(false);
  result = signal<{ order: Order; whatsapp_url: string } | null>(null);
  money = money;
  qty = 1;
  page = 1;
  name = '';
  phone = '';
  note = '';
  key = crypto.randomUUID();
  request = 0;
  get maps() {
    return this.store.maps;
  }
  constructor() {
    effect(() => {
      const items = this.store.cart();
      const v = this.view();
      if (v === 'cart' || v === 'checkout') {
        const seq = ++this.request;
        this.quote.set(null);
        if (!items.length) return;
        this.store
          .send<Quote>('POST', '/cart/quote', { items })
          .then((q) => {
            if (seq === this.request) this.quote.set(q);
          })
          .catch((e) => {
            if (seq === this.request) this.error.set(message(e));
          });
      }
    });
  }
  ngOnInit() {
    this.view.set(this.route.snapshot.data['view']);
    this.name = this.store.user()?.name || '';
    this.phone = this.store.user()?.phone || '';
    if (this.view() === 'product')
      this.store
        .get<Product>('/products/' + this.route.snapshot.paramMap.get('id'))
        .then((p) => this.product.set(p))
        .catch((e) => this.error.set(message(e)));
    if (this.view() === 'account') void this.loadOrders();
  }
  add() {
    const p = this.product();
    if (p && Number.isInteger(this.qty) && this.qty > 0 && this.qty <= Math.min(100, p.stock)) {
      this.store.add(p.id, this.qty);
      void this.router.navigateByUrl('/panier');
    }
  }
  quantity(id: number, n: number) {
    this.error.set('');
    this.store.quantity(id, n);
  }
  async order() {
    const quote = this.quote();
    if (!quote) return;
    this.error.set('');
    this.busy.set(true);
    try {
      const r = await this.store.send<{ order: Order; whatsapp_url: string }>(
        'POST',
        '/guest/orders',
        {
          items: this.store.cart(),
          customer_name: this.name,
          phone: this.phone,
          note: this.note,
          expected_total: quote.total,
        },
        { 'Idempotency-Key': this.key },
      );
      this.result.set(r);
      this.store.clear();
      window.location.assign(r.whatsapp_url);
    } catch (e) {
      this.error.set(message(e));
    } finally {
      this.busy.set(false);
    }
  }
  async loadOrders(page = 1) {
    this.page = page;
    try {
      this.orders.set(await this.store.get<Page<Order>>('/orders?page=' + page));
    } catch (e) {
      this.error.set(message(e));
    }
  }
  status(s: string) {
    return (
      (
        {
          awaiting_confirmation: 'À confirmer avec la boutique',
          confirmed: 'Confirmée par la boutique',
          cancelled: 'Annulée',
        } as Record<string, string>
      )[s] || s
    );
  }
}
