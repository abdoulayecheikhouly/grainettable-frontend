import { Component, inject, signal, OnInit } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { Store, money, message } from '../../store';
import type { Category, Page, Product, Order } from '../../models';
import { AdminDashboard } from '../../components/admin-dashboard/admin-dashboard';
import { AdminSettings } from '../../components/admin-settings/admin-settings';
import { AdminStock } from '../../components/admin-stock/admin-stock';
import { Pagination } from '../../pagination';
const blankProduct = () => ({
  id: 0,
  name: '',
  sku: '',
  description: '',
  category_id: 0,
  price: 0,
  stock: 0,
  status: 'draft',
  image: '/assets/cafe.jpeg',
  images: [] as string[],
});
const blankCategory = () => ({ id: 0, name: '', slug: '', description: '', visible: true });
@Component({
  selector: 'app-admin',
  imports: [
    FormsModule,
    RouterLink,
    Pagination,
    MatSidenavModule,
    MatButtonModule,
    AdminDashboard,
    AdminSettings,
    AdminStock,
  ],
  templateUrl: './admin.html',
})
export class Admin implements OnInit {
  compact = toSignal(inject(BreakpointObserver).observe('(max-width: 1023px)'));
  menuOpen = signal(false);
  store = inject(Store);
  router = inject(Router);
  view = signal('dashboard');
  data = signal<Page<Product> | null>(null);
  categories = signal<Category[]>([]);
  orders = signal<Page<Order> | null>(null);
  error = signal('');
  notice = signal('');
  busy = signal(false);
  edit = signal(false);
  product = blankProduct();
  category = blankCategory();
  q = '';
  categoryFilter = '';
  status = '';
  page = 1;
  money = money;
  ngOnInit() {
    void this.load();
  }
  async load(page = 1) {
    this.page = page;
    this.error.set('');
    try {
      this.categories.set(await this.store.get<Category[]>('/admin/categories'));
      this.data.set(
        await this.store.get<Page<Product>>(
          '/admin/products?' +
            new URLSearchParams({
              page: String(page),
              q: this.q,
              category: this.categoryFilter,
              status: this.status,
            }),
        ),
      );
      if (this.view() === 'orders')
        this.orders.set(await this.store.get<Page<Order>>('/admin/orders?page=' + page));
    } catch (e) {
      this.error.set(message(e));
    }
  }
  tab(view: string) {
    this.menuOpen.set(false);
    this.view.set(view);
    this.edit.set(false);
    this.notice.set('');
    void this.load();
  }
  editProduct(p?: Product) {
    this.product = p
      ? {
          id: p.id,
          name: p.name,
          sku: p.sku,
          description: p.description,
          category_id: p.category_id,
          price: p.price,
          stock: p.stock,
          status: p.status,
          image: p.image,
          images: [...(p.images || [p.image])],
        }
      : blankProduct();
    if (!this.product.category_id) this.product.category_id = this.categories()[0]?.id || 0;
    this.edit.set(true);
    this.error.set('');
  }
  async saveProduct() {
    this.busy.set(true);
    this.error.set('');
    try {
      const { id, ...body } = this.product;
      body.images = [body.image, ...body.images.filter((i) => i !== body.image)];
      await this.store.send(id ? 'PUT' : 'POST', '/admin/products' + (id ? '/' + id : ''), body);
      this.edit.set(false);
      this.notice.set('Produit enregistré');
      await this.load();
    } catch (e) {
      this.error.set(message(e));
    } finally {
      this.busy.set(false);
    }
  }
  async archive(p: Product) {
    if (!confirm('Retirer « ' + p.name + ' » du catalogue public ?')) return;
    try {
      await this.store.send('DELETE', '/admin/products/' + p.id);
      this.notice.set('Produit retiré du catalogue');
      await this.load();
    } catch (e) {
      this.error.set(message(e));
    }
  }
  editCategory(c?: Category) {
    this.category = c
      ? { id: c.id, name: c.name, slug: c.slug, description: c.description, visible: !!c.visible }
      : blankCategory();
  }
  async saveCategory() {
    this.busy.set(true);
    this.error.set('');
    try {
      const { id, ...body } = this.category;
      await this.store.send(id ? 'PUT' : 'POST', '/admin/categories' + (id ? '/' + id : ''), body);
      this.notice.set('Catégorie enregistrée');
      this.category = blankCategory();
      await this.load();
      await this.store.refreshContent();
    } catch (e) {
      this.error.set(message(e));
    } finally {
      this.busy.set(false);
    }
  }
  async deleteCategory(c: Category) {
    if (!confirm('Supprimer la catégorie « ' + c.name + ' » ?')) return;
    try {
      await this.store.send('DELETE', '/admin/categories/' + c.id);
      await this.load();
      await this.store.refreshContent();
    } catch (e) {
      this.error.set(message(e));
    }
  }
  removePhoto(image: string) {
    this.product.images = this.product.images.filter((i) => i !== image);
    if (this.product.image === image)
      this.product.image = this.product.images[0] || '/assets/cafe.jpeg';
  }
  async upload(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []);
    if (!files.length) return;
    this.busy.set(true);
    this.error.set('');
    try {
      if (this.product.images.length + files.length > 8)
        throw Error('8 photos maximum par produit');
      for (const file of files) {
        if (file.size > 5 * 1024 * 1024 || !['image/jpeg', 'image/png'].includes(file.type))
          throw Error('Photos JPEG ou PNG · 5 Mo maximum chacune');
      }
      for (const file of files) {
        const data = new FormData();
        data.append('file', file);
        const result = await this.store.send<{ image: string }>('POST', '/admin/uploads', data);
        if (!this.product.images.length) this.product.image = result.image;
        this.product.images = [...this.product.images, result.image];
      }
    } catch (e) {
      this.error.set(message(e));
    } finally {
      this.busy.set(false);
      input.value = '';
    }
  }
  async orderStatus(o: Order, status: string) {
    try {
      await this.store.send('PATCH', '/admin/orders/' + o.id, { status });
      await this.load(this.page);
    } catch (e) {
      this.error.set(message(e));
    }
  }
  async logout() {
    await this.store.logout();
    await this.router.navigateByUrl('/');
  }
}
