// import { WorldDataWrapper } from './data-service';
import { GameData, Node } from './data-service';

declare var require:any

export class Game
{
  public journal:string[] = []
  public options:Option[] = []

  public data:GameData = null
  public context:Context = new Context

  private actionHandler:ActionHandler

  public onChange:()=>void;

  public start( gamedata:GameData ):void
  {
    this.data = gamedata
    this.actionHandler = new ActionHandler()
    this.go( {action:"spawn", node:this.data.ini.spawn_node} )
  }

  private go( action ):void
  {
    this.options = []

    const result = this.actionHandler.handleAction( action, this.data, this.context );
    this.journal.push(result.journal_entry);
    this.options = result.options;

    console.info(`Action result\n`,result)
    console.info(`Context\n`,this.context)

    try { if ( this.onChange ) this.onChange() }
    catch( e ) { console.log("onchange errorred " + e) }
  }

  public selectOption(index:number):void
  {
    console.info(`Selected Option [${index}]`);

    this.go( this.options[index].pa );
  }

  public getCurrentNode():Node { return this.context.currentNode }
  public getTime() { return 0 }
}

class Context { currentNode:Node }

class ActionHandler
{
  public handleAction( params, data, context ):ActionResult
  {
    console.log(`Handling Action\n`,params)

    const getNode = ( uidOrSlug:string ):Node =>
    {
      let node = null
      for ( let x of data.world.nodes )
        if ( x.uid === uidOrSlug || x.slug === uidOrSlug )
          node = x
      return node
    }

    // const placeAliases = ( text:string ):string =>
    // {
    //   const dict = world.aliases
    //   for ( const alias in dict )
    //     text = text.split(`${alias}`).join(dict[alias]);
    //   return text
    // }
    
    if ( params.action === "goto" || params.action === "spawn" )
    {
      let node = 
      context.currentNode = getNode( params.node )
      
      const options = []
      for ( let link of data.world.links )
      {
        if ( link.from !== node.uid )
          continue
          
        let target = getNode( link.to )  
        options.push(
        {
          t:`Go to ${target.slug}`,
          pa:{ action:"goto", node:target.uid } 
        } )
      }
      
      let text:string = params.action === "spawn" 
        ? `I spawned at ${node.slug}` 
        : `I went to ${node.slug}`

      return {
        journal_entry : text,
        options: options,
      }
    }
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


