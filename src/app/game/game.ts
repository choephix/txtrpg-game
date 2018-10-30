import * as models from './data-models';

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

    for ( let result of this.actionHandler.resolveAction( action, this.data, this.context ) )
      this.journal.push( result );

    this.options = this.actionHandler.makeOptionsList( this.data, this.context )

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

class WordsmithDataWrapper
{
  constructor( private data:models.JournalData ) {}
      
  public getHandle( from:models.Node, to:models.Node, params ):string
  {
    for ( let row of this.queryValidRows( from, to, params ) )
      if ( row.handle )
        return row.handle
    return `Go to ${to.slug}`
  }

  public getText( from:models.Node, to:models.Node, params ):string
  {
    for ( let row of this.queryValidRows( from, to, params ) )
      if ( row.text )
        return row.text
    return params === "spawn" 
        ? `I spawned at ${to.slug}` 
        : `I went to ${to.slug}`
  }

  private queryValidRows( from:models.Node, to:models.Node, params=null )
  {
    return this.data.actions.goto
      .filter( a => { return ( !from || !a.from || a.from == from.slug ) && 
                             ( !to   || !a.to   || a.to == to.slug     ) &&
                             ( !a.params || params == a.params ) } )
      .sort( ( a, b ) => {
        let aa = a.params ? a.params.length : 0
        let bb = b.params ? b.params.length : 0
        return bb - aa
      } )
  }
}

class WorldDataWrapper
{
  constructor( private data:models.WorldData ) {}

  public getNode( uidOrSlug:string ):models.Node
  {
    let node = null
    for ( let x of this.data.nodes )
      if ( x.uid === uidOrSlug || x.slug === uidOrSlug )
        node = x
    return node
  }
}

class ActionHandler
{
  // constructor( private data:GameData ) { }

  public resolveAction( params, data:models.GameData, context ):string[]
  {
    // console.log(`Resolving Action\n`,params)

    let world = new WorldDataWrapper( data.world )
    let wordsmith = new WordsmithDataWrapper( data.journal )

    if ( params.action === "goto" || params.action === "spawn" )
    {
      let spawned = params.action == "spawn"
      let prev = context.currentNode;
      let next = 
      context.currentNode = world.getNode( params.node )
      
      let text = [ wordsmith.getText( prev, next, spawned ? "spawn" : null ) ]
      return text
    }
  }

  public makeOptionsList( data:models.GameData, context ):Option[]
  {
    let world = new WorldDataWrapper( data.world )
    let wordsmith = new WordsmithDataWrapper( data.journal )
    let currentNode = context.currentNode
    let options = []
    for ( let link of data.world.links )
    {
      if ( link.from !== currentNode.uid )
        continue
      
      let target = world.getNode( link.to )

      options.push(
      {
        t: wordsmith.getHandle( currentNode, target, null ),
        pa: { action:"goto", node:target.uid } 
      } )
    }
    
    return options
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


