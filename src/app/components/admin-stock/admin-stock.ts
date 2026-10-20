import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store, message, money } from '../../store';
import { Product, Page } from '../../models';
import { Pagination } from '../../pagination';
interface Movement {
  previous_stock: number;
  new_stock: number;
  reason: string;
  created_at: string;
}
@Component({
  selector: 'app-admin-stock',
  imports: [FormsModule, Pagination],
  templateUrl: './admin-stock.html',
  styleUrl: './admin-stock.css',
})
export class AdminStock implements OnInit {
  store = inject(Store);
  data = signal<Page<Product> | null>(null);
  error = signal('');
  notice = signal('');
  busy = signal(false);
  history = signal<Movement[]>([]);
  selected = signal<Product | null>(null);
  q = '';
  level = 'all';
  counts: Record<number, number> = {};
  reason = '';
  page = 1;
  money = money;
  ngOnInit() {
    void this.load();
  }
  async load(page = 1) {
    this.page = page;
    this.error.set('');
    try {
      const d = await this.store.get<Page<Product>>(
        '/admin/stock?' + new URLSearchParams({ page: String(page), q: this.q, level: this.level }),
      );
      this.data.set(d);
      for (const p of d.items) this.counts[p.id] = p.stock;
    } catch (e) {
      this.error.set(message(e));
    }
  }
  async save(p: Product) {
    this.busy.set(true);
    this.error.set('');
    this.notice.set('');
    try {
      await this.store.send('PATCH', '/admin/products/' + p.id + '/stock', {
        stock: this.counts[p.id],
        reason: this.reason || 'Ajustement manuel',
      });
      this.notice.set('Stock mis à jour : ' + p.name);
      await this.load(this.page);
      if (this.selected()?.id === p.id) await this.movements(p);
    } catch (e) {
      this.error.set(message(e));
    } finally {
      this.busy.set(false);
    }
  }
  async movements(p: Product) {
    this.selected.set(p);
    try {
      this.history.set(
        await this.store.get<Movement[]>('/admin/stock/movements?productId=' + p.id),
      );
    } catch (e) {
      this.error.set(message(e));
    }
  }
}
