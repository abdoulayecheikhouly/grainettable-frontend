import {inject,Injectable,signal,computed} from '@angular/core';
import {HttpClient,HttpErrorResponse} from '@angular/common/http';
import {firstValueFrom} from 'rxjs';
import type {User,CartItem} from './models';
export const money=(n:number)=>new Intl.NumberFormat('fr-FR').format(n)+' FCFA';
export const message=(e:unknown)=>e instanceof HttpErrorResponse?(e.error?.error||'Le serveur est indisponible. Réessayez.'):(e as Error).message;
@Injectable({providedIn:'root'})
export class Store {
 http=inject(HttpClient);user=signal<User|null>(null);error=signal('');cart=signal<CartItem[]>(this.readCart());count=computed(()=>this.cart().reduce((s,i)=>s+i.quantity,0));ready=this.refresh();
 async refresh(){try{const s=await this.get<{user:User|null}>('/session');this.user.set(s.user);this.error.set('');}catch(e){this.error.set(message(e));}}
 get<T>(path:string){return firstValueFrom(this.http.get<T>('/api'+path));}
 async send<T>(method:string,path:string,body?:unknown,headers?:Record<string,string>){await this.ready;return firstValueFrom(this.http.request<T>(method,'/api'+path,{body,headers}));}
 async authenticate(path:string,data:unknown){const s=await this.send<{user:User}>('POST',path,data);this.user.set(s.user);await this.refresh();}
 async logout(){await this.send('POST','/auth/logout');this.user.set(null);await this.refresh();}
 readCart():CartItem[]{try{const v=JSON.parse(localStorage.getItem('gt_cart')||'[]');return Array.isArray(v)?v.filter(i=>Number.isSafeInteger(i.product_id)&&i.product_id>0&&Number.isInteger(i.quantity)&&i.quantity>0&&i.quantity<=100).slice(0,50):[];}catch{return [];}}
 persist(cart:CartItem[]){this.cart.set(cart);try{localStorage.setItem('gt_cart',JSON.stringify(cart));}catch{}}
 add(id:number,n=1){const old=this.cart();this.persist(old.some(i=>i.product_id===id)?old.map(i=>i.product_id===id?{...i,quantity:Math.min(100,i.quantity+n)}:i):[...old,{product_id:id,quantity:Math.min(100,n)}]);}
 quantity(id:number,n:number){this.persist(n<=0?this.cart().filter(i=>i.product_id!==id):this.cart().map(i=>i.product_id===id?{...i,quantity:Math.min(100,n)}:i));}
 clear(){this.persist([]);}
}
