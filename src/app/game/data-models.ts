
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