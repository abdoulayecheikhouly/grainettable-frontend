import {Component} from '@angular/core';
import {RouterLink} from '@angular/router';
@Component({selector:'app-home',imports:[RouterLink],templateUrl:'./home.html'})
export class Home {universes=[['cafe','L’univers café','Machines, capsules & cafés premium'],['cuisine','La cuisine','Ustensiles & équipements de cuisine'],['table','Les arts de la table','Vaisselle & décoration'],['fruits','Les fruits secs','Le goût des belles choses']];}
