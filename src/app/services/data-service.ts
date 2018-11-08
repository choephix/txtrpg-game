import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GameData, Node } from '../game/data-models';

const ACCO:string = "choephix"
const REPO:string = "txtrpg-data"
const FILE:string = "mock-world"

@Injectable({providedIn: 'root'})
export class WorldDataService
{
  public data:GameData = null
  public busy:boolean = false
	public loaded:boolean = false

  constructor( private http:HttpClient ) { }

  public load( branch:string, callbackLoaded:(data) => void )
  {
		let bust:string = "" + new Date().valueOf() % 1000000
    let url:string = `https://raw.githubusercontent.com/${ACCO}/${REPO}/${branch}/${FILE}?${bust}`

    this.busy = true
    this.http.get( url ).subscribe(
      data =>
      {
        this.data = <GameData>data;
        this.loaded = true

        console.log( "loaded", this.data );
        callbackLoaded( this.data );
      },
      error => console.error( error ),
      () => this.busy = false
      );
  }
}
