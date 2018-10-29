import { Injectable } from '@angular/core';
import { NavigationEnd, Router, RouterEvent } from '@angular/router';

@Injectable({providedIn: 'root'})
export class NavigashtiService {
  public ALL_BRANCHES:string[] = ["shitbox","develop","lorem","poc","master"]
  
  public branch:string = null
  public debug:boolean = false
  
  public callbacks_NavigationEnd:(()=>void)[] = []
  
  constructor( router:Router )
  {
    router.events.subscribe( 
      e => {
        if ( e instanceof NavigationEnd )
        {
          this.branch = (<RouterEvent>e).url.match(/^\/?([^\/]*)/)[1]
          this.debug = (<RouterEvent>e).url.includes("/debug")
          // console.log( this.branch, this.debug, e )

          for ( let f of this.callbacks_NavigationEnd ) f()
        }
      });
  }
}
