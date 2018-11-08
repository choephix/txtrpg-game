import { Component } from '@angular/core';
import { NavigashtiService } from './services/navigashti.service';

@Component({
  selector: 'app-root',
  styles: [`
  #navi, a, div, p { transition: opacity .150s, color .150s; }
  #navi { position:fixed; top:0.5vh; right:1vh; font-family: 'consolas'; font-size: 1.5vh; text-align:right; }
  #navi { opacity:.20; user-select: none; }
  #navi:hover { opacity:1.0;  }
  #navi a { opacity:0; font-size:1.0vh; display:none; padding: .3vh 0; text-decoration: none; color:#000; }
  #navi:hover a { display:block; opacity:.50 }
  #navi:hover a:hover { opacity:1 }
  `],
  template: `
  <div>
    <router-outlet></router-outlet>
    <nav id="navi" *ngIf="navi.debug">
	    <code style="cursor:normal"><b>{{navi.branch.toUpperCase()}}</b></code>
  	  <div id="navi-branches">
        <a *ngFor="let b of navi.ALL_BRANCHES"
            routerLink="/{{b}}{{navi.debug?'/debug':''}}"
            routerLinkActive="active">{{b}}</a>
  	  </div>
    </nav>
  </div>
  `,
})
export class AppComponent {
  constructor( public navi:NavigashtiService ) { }
}
