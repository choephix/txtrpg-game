import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  styles: [`
  #navi, a, div, p { transition: opacity .150s, color .150s; }
  #navi { position:fixed; top:0.5vh; right:1vh; font-family: 'consolas'; font-size: 1.5vh; text-align:right; }
  #navi { opacity:.20;  }
  #navi:hover { opacity:1.0;  }
  #navi a { opacity:0; font-size:1.0vh; display:none; padding: .3vh 0; text-decoration: none; color:#000; }
  #navi:hover a { display:block; opacity:.50 }
  #navi:hover a:hover { opacity:1 }
  `],
  template: `
  <div>
    <router-outlet></router-outlet>
    <nav id="navi" *ngIf="debug">
	    <code><b>{{branch.toUpperCase()}}</b></code>
  	  <div id="navi-branches">
        <a *ngFor="let b of ALL_BRANCHES" routerLink="{{router.url.replace(branch,b)}}" routerLinkActive="active">{{b}}</a>
  	  </div>
    </nav>
  </div>
  `,
})
export class AppComponent {
	public ALL_BRANCHES:string[] = ["master","develop","poc","lorem"]
	public branch:string = "develop"
	public debug:boolean = false
  constructor( public router:Router )
  { 
    console.log(router)
    router.events.subscribe( e => {
      this.branch = router.url.match(/^\/?([^\/]*)/)[1]
      this.debug = router.url.includes("/debug")
    } ) 
  }
}