import * as models from './data-models';
import { Testability } from '@angular/core';

export class Game
{
  public journal:string[] = []
  public options:Option[] = []

  public context:Context = new Context

  private actionHandler:ActionHandler

  public onChange:()=>void;

  constructor( public data:models.GameData )
  {
    this.actionHandler = new ActionHandler()
    this.go( {action:"spawn", node:this.data.ini.spawn_node} )
  }

  private go( action ):void
  {
    this.options = []

    const result = this.actionHandler.handleAction( action, this.data, this.context );
    this.journal.push(result.journal_entry);
    this.options = result.options;

    // console.info(`Action result\n`,result)
    // console.info(`Context\n`,this.context)

    try { if ( this.onChange ) this.onChange() }
    catch( e ) { console.log("onchange errorred " + e) }
  }

  public selectOption(index:number):void
  {
    // console.info(`Selected Option [${index}]`);

    this.go( this.options[index].pa );
  }

  public getCurrentNode():Node { return this.context.currentNode }
  public getTime() { return 0 }
}

class Context 
{ 
  currentNode:Node
  history:any[] = []
}

class ActionHandler
{
  // constructor( private data:GameData ) { }



  public handleAction( params, data:models.GameData, context ):ActionResult
  {
    console.log(`Handling Action\n`,params)

    const getNode = ( uidOrSlug:string ):models.Node =>
    {
      let node = null
      for ( let x of data.world.nodes )
        if ( x.uid === uidOrSlug || x.slug === uidOrSlug )
          node = x
      return node
    }

    if ( params.action === "goto" || params.action === "spawn" )
    {
      let spawned = params.action == "spawn"
      let prev = context.currentNode;
      let node = 
      context.currentNode = getNode( params.node )
      
      function getHandle( from:models.Node, to:models.Node, params ):string
      {
        for ( let row of queryValidRows( from, to, params ) )
          if ( row.handle )
            return row.handle
        return `Go to ${to.slug}`
      }

      function getText( from:models.Node, to:models.Node, params ):string
      {
        for ( let row of queryValidRows( from, to, params ) )
          if ( row.text )
            return row.text
        return params === "spawn" 
            ? `I spawned at ${to.slug}` 
            : `I went to ${to.slug}`
      }

      function queryValidRows( from:models.Node, to:models.Node, params=null )
      {
        return data.journal.actions.goto
          .filter( a => { return ( !from || !a.from || a.from == from.slug ) && 
                                 ( !to   || !a.to   || a.to == to.slug     ) &&
                                 ( !a.params || params == a.params ) } )
          .sort( ( a, b ) => {
            let aa = a.params ? a.params.length : 0
            let bb = b.params ? b.params.length : 0
            return bb - aa
          } )
      }
      
      const options = []
      for ( let link of data.world.links )
      {
        if ( link.from !== node.uid )
          continue
        
        let target = getNode( link.to )

        options.push(
        {
          t:getHandle( node, target, null ),
          pa:{ action:"goto", node:target.uid } 
        } )
      }
      
      return {
        journal_entry : getText( prev, node, spawned ? "spawn" : null ),
        options: options,
      }
    }
  }


  private placeAliases( text:string ):string
  {
    //   const dict = world.aliases
    //   for ( const alias in dict )
    //     text = text.split(`${alias}`).join(dict[alias]);
      return text
  }
}

class ActionResult
{
  journal_entry:string
  options:Option[]
}

class Option
{
  t:string
  pa:object
}


