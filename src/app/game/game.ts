// import { WorldDataWrapper } from './data-service';
import { GameData } from './data-service';

declare var require:any

export class Game
{
  public journal:string[] = [];
  public options:Option[] = [];

  public worldData:any = null;
  
  public data:GameData = null;
  public context:Context = new Context;

  private actionHandler:ActionHandler = new ActionHandler();

  public onChange:()=>void;

  public start( gamedata:GameData ):void
  {
    this.data = gamedata
    
    this.worldData = require('./mock-world.2.json');

    const start_node = this.worldData.start.node;
    const start_text = this.worldData.start.on_start;
    this.go( {action:"goto", node:start_node, pre:start_text} );
  }

  private go( action ):void
  {
    this.options = []

    const result = this.actionHandler.handleAction( action, this.worldData, this.context );
    this.journal.push(result.journal_entry);
    this.options = result.options;

    console.log(`Action result\n`,result)
    console.log(`Context\n`,this.context)

    try { if ( this.onChange ) this.onChange() }
    catch( e ) { console.log("onchange errorred " + e) }
  }

  public selectOption(index:number):void
  {
    console.log(`Selected Option [${index}]`);

    this.go( this.options[index].pa );
  }

  private getNode(id:string) { return this.worldData.nodes[id] }

  ///

  public getCurrentNode()
  // { return `${this.context.currentNode} / ${this.getNode(this.context.currentNode).title}` }
  { return `${this.context.currentNode}` }

  public getTime() { return 0 }
}

class Context
{
  currentNode:string
}

class ActionHandler
{
  public handleAction( params, world, context ):ActionResult
  {
    console.log(`Handling Action Params\n`,params)

    const placeAliases = ( text:string ):string =>
    {
      const dict = world.aliases
      for ( const alias in dict )
        text = text.split(`${alias}`).join(dict[alias]);
      return text
    }

    const node = world.nodes[params.node]

    if ( params.action === "goto" )
    {
      context.currentNode = params.node;

      const options = []
      for ( const exit of node.exits )
      {
        options.push( {
          t:placeAliases(exit.handle),
          pa:{action:"goto",node:exit.node,pre:exit.on_go} } )
      }

      return {
        journal_entry : `${placeAliases(params.pre)}\nI was at ${placeAliases(node.title)}`,
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


