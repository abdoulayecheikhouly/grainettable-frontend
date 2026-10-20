import {Component,inject,signal,OnInit} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {RouterLink,ActivatedRoute,Router} from '@angular/router';
import {Store,message} from '../../store';
@Component({selector:'app-auth',imports:[FormsModule,RouterLink],templateUrl:'./auth.html'})
export class Auth implements OnInit {
 store=inject(Store);route=inject(ActivatedRoute);router=inject(Router);signup=false;admin=false;name='';phone='';email='';password='';error=signal('');busy=signal(false);target='/produits';
 ngOnInit(){this.signup=!!this.route.snapshot.data['signup'];this.admin=this.route.snapshot.queryParamMap.get('admin')==='true';const t=this.route.snapshot.queryParamMap.get('retour')||'/produits';this.target=t.startsWith('/')&&!t.startsWith('//')?t:'/produits';if(this.store.user()?.role==='customer'&&this.target==='/admin')this.error.set('Cet espace est réservé à l’équipe. Déconnectez-vous pour utiliser un compte administrateur.');}
 async submit(){this.busy.set(true);this.error.set('');try{await this.store.ready;const data:Record<string,unknown>={email:this.email,password:this.password};if(this.signup){data['name']=this.name;data['phone']=this.phone;}await this.store.authenticate(this.signup?'/auth/register':'/auth/login',data);if(this.target==='/admin'&&this.store.user()?.role!=='admin'){this.error.set('Accès administrateur requis');return;}await this.router.navigateByUrl(this.target);}catch(e){this.error.set(message(e));}finally{this.busy.set(false);}}
}
