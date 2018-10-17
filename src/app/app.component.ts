import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  styles: [`
  #navi { position:fixed; top:0; right:16px; font-family: 'consolas'; font-size: 1.5vh; text-align:right; }
  #navi-branches { font-size:1.0vh }
  #navi a { opacity:.05; display:block; }
  #navi a:hover { opacity:2.00; }
  `],
  template: `
  <div>
    <router-outlet></router-outlet>
    <nav id="navi">
  	  <div id="navi-branches">
  	  	<a *ngFor="let b of ALL_BRANCHES" routerLink="{{router.url.replace(branch,b)}}" routerLinkActive="active">{{b}} 🌍</a>
  	  </div>
    </nav>
  </div>
  `,
})
export class AppComponent {
	public ALL_BRANCHES:string[] = ["master","develop","poc","lorem"]
	public branch:string = "develop"
  constructor( public router:Router )
  { 
    router.events.subscribe( e => this.branch = router.url.match(/^\/?([^\/]*)\//)[1] ) 
  }
}