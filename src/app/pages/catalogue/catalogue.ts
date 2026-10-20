import {Component,inject,signal,OnInit,OnDestroy} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {ActivatedRoute,Router,RouterLink} from '@angular/router';
import {Subscription} from 'rxjs';
import {Store,money,message} from '../../store';
import type {Category,Page,Product} from '../../models';
import {Pagination} from '../../pagination';
@Component({selector:'app-catalogue',imports:[FormsModule,RouterLink,Pagination],templateUrl:'./catalogue.html'})
export class Catalogue implements OnInit,OnDestroy {
 store=inject(Store);route=inject(ActivatedRoute);router=inject(Router);money=money;data=signal<Page<Product>|null>(null);cats=signal<Category[]>([]);error=signal('');loading=signal(false);notice=signal('');sub?:Subscription;request=0;
 filter={q:'',category:'',min:'',max:'',available:false,sort:'selection'};
 ngOnInit(){this.store.get<Category[]>('/categories').then(v=>this.cats.set(v)).catch(e=>this.error.set(message(e)));this.sub=this.route.queryParamMap.subscribe(q=>{this.filter={q:q.get('q')||'',category:q.get('category')||'',min:q.get('min')||'',max:q.get('max')||'',available:q.get('available')==='true',sort:q.get('sort')||'selection'};void this.load(q.keys.reduce((r,k)=>({...r,[k]:q.get(k)}),{}));});}
 ngOnDestroy(){this.sub?.unsubscribe();this.request++;}
 async load(params:Record<string,string|null>){const request=++this.request;this.loading.set(true);this.error.set('');try{const query=new URLSearchParams();for(const [k,v]of Object.entries(params))if(v)query.set(k,v);const d=await this.store.get<Page<Product>>('/products?'+query);if(request===this.request)this.data.set(d);}catch(e){if(request===this.request)this.error.set(message(e));}finally{if(request===this.request)this.loading.set(false);}}
 apply(){const p:Record<string,string>={};for(const [key,value]of Object.entries(this.filter))if(value)p[key]=String(value);void this.router.navigate([],{queryParams:p});}
 reset(){void this.router.navigate([],{queryParams:{}});}
 page(n:number){void this.router.navigate([],{queryParams:{page:n},queryParamsHandling:'merge'});}
 add(p:Product){this.store.add(p.id);this.notice.set(p.name+' ajouté au panier.');}
}
