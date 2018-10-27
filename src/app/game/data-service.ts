import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

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
    let url:string = `https://raw.githubusercontent.com/${ACCO}/${REPO}/${branch}/${FILE}`
    
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

export class GameData
{
  ini:IniParams
  world:WorldData
  journal:JournalData
}
export interface IniParams { spawn_node:string }

export class WorldData
{
  nodes:Node[]
  subnodes:Subnode[]
  links:NodeLink[]
}
export interface Node { uid:string, slug:string, x:number, y:number }
export interface Subnode extends Node { parent:string }
export interface NodeLink { from:string, to:string }

export class JournalData
{
  snippets:Snippet[] = []
  aliases:Alias[] = []
  actions:{goto:ActionGoto[]} = {goto:[]}
}
export interface Snippet { key:string, text:string }
export interface Alias { entity:string, text:string }
export interface ActionGoto { from:string, to:string, params:string, handle:string, text:string }