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

  private go( actionParams ):void
  {
    this.options = []

    for ( let result of this.actionHandler.resolveAction( actionParams, this.data, this.context ) ) {
      this.journal.push( result );
    }
      
    this.context.history.unshift( actionParams )

    this.options = this.actionHandler.makeOptionsList( this.data, this.context )

    try { if ( this.onChange ) this.onChange() }
    catch( e ) { console.log("onchange errorred " + e) }
  }

  public selectOption(index:number):void
  {
    let option = this.options[index]
    console.debug( `Selected Option [${index}]`, option );
    this.go( option.params );
  }
}

class Context 
{ 
  currentNode:models.Node
  history:any[] = []
}

class WordsmithDataWrapper
{
  constructor( private data:models.JournalData ) {}
      
  public getHandle( from:models.Node, to:models.Node, params ):string
  {
    for ( let row of this.queryValidRows( from, to, params ) )
      if ( row.handle ) return row.handle
    if ( params === "back" )    return `Go back to ${to.slug}.`
    if ( params === "circle" )  return `Circle back to ${to.slug}.`
    return `Go to ${to.slug}`
  }

  public getText( from:models.Node, to:models.Node, params ):string
  {
    for ( let row of this.queryValidRows( from, to, params ) )
      if ( row.text ) return row.text
    if ( params === "spawn" )   return `I spawned at ${to.slug}.`
    if ( params === "back" )    return `I returned to ${to.slug}.`
    if ( params === "circle" )  return `I circled right back to ${to.slug}.`
    return `I went to ${to.slug}.`
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

  public resolveAction( params, data:models.GameData, context:Context ):string[]
  {
    // console.log(`Resolving Action\n`,params)

    let world = new WorldDataWrapper( data.world )
    let wordsmith = new WordsmithDataWrapper( data.journal )

    if ( params.action === "spawn" )
    {
      let prev = context.currentNode;
      let next = 
      context.currentNode = world.getNode( params.node )
      return [ wordsmith.getText( prev, next, "spawn" ) ]
    }

    if ( params.action === "goto" || params.action === "spawn" )
    {
      let prev = context.currentNode;
      let next = world.getNode( params.node )

      let isBackward = this.isBackward( next, context )
      let isCircular = this.isCircular( next, context )
      console.log(isBackward,isCircular,next.uid,JSON.stringify(context.history,null,2))

      let param = null
      if ( isBackward )
        param = "back"
      else
      if ( isCircular && !isBackward ) 
        param = "circle"
      
      /// Actually do the magic
      context.currentNode = next

      let text = [ wordsmith.getText( prev, next, param ) ]
      return text
    }

    if ( params.action === "lookaround" ) return ["I looked around. It's nice here."]
    
    if ( params.action === "lookdown" ) return ["I looked down and stared thoughtfully at my shoes. I had two.\n"
          +"I began wiggling my toes, but I couldn't seem them. This was probably because I had shoes over them."]
    
    if ( params.action === "picknose" ) return ["I jammed a finger up my nose."]
  }

  public makeOptionsList( data:models.GameData, context:Context ):Option[]
  {
    let world = new WorldDataWrapper( data.world )
    let wordsmith = new WordsmithDataWrapper( data.journal )
    let currentNode = context.currentNode
    let options = []

    /// NAVIGATION
    for ( let link of data.world.links )
    {
      if ( link.from !== currentNode.uid )
        continue
      
      let next = world.getNode( link.to )

      let isBackward = this.isBackward( next, context )
      let isCircular = this.isCircular( next, context )

      let param = null
      if ( isBackward )
        param = "back"
      else
      if ( isCircular )
        param = "circle"

      options.push(
      {
        handle: wordsmith.getHandle( currentNode, next, param ),
        params: { action:"goto", node:next.uid },
        weight: isBackward ? 10 : 12
      } )
    }

    /// EXTRA
    options.push(
      {
        handle: "Inspect your surroundings",
        params: { action:"lookaround", node:currentNode },
        weight: -1
      } )
    options.push(
      {
        handle: "Look at your shoes",
        params: { action:"lookdown" },
        weight: -1
      } )
    options.push(
      {
        handle: "Pick your nose",
        params: { action:"picknose" },
        weight: -1
      } )
    
    return options.sort( (a,b) => b.weight - a.weight )
  }

  private nodeEquals( a:models.Node, b:any )
  { return a === b || a.uid === b || a.slug === b }

  private isBackward( to:models.Node, context:Context ):boolean // +param max time ago
  {
    for ( let actionParams of context.history )
      if ( actionParams.action === "goto" )
        if ( this.nodeEquals( context.currentNode, actionParams.node ) )
        {
          console.log(0,to,actionParams)
          continue
        }
        else
        {
          console.log(1,to,actionParams,context.currentNode)
          return this.nodeEquals( to, actionParams.node )
        }
    return false
  }

  private isCircular( to:models.Node, context:Context ):boolean // +param max time ago
  {
    for ( let actionParams of context.history )
      if ( actionParams.action != "goto" )
        return false
      else
      if ( this.nodeEquals( context.currentNode, actionParams.node ) )
        continue
      else
      if ( this.nodeEquals( to, actionParams.node ) )
        return true
    return false
  }

  private placeAliases( text:string ):string
  {
    //   const dict = world.aliases
    //   for ( const alias in dict )
    //     text = text.split(`${alias}`).join(dict[alias]);
      return text
  }
}

class Option
{
  handle:string
  params:object
  weight:number
}
