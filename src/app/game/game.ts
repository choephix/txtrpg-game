import * as models from './data-models';

export class Game
{
  public journal:string[] = []
  public options:Option[] = []

  public context:Context

  private actionHandler:ActionHandler

  public onChange:()=>void;

  public words:WordsmithDataWrapper
  public world:WorldDataWrapper

  constructor( public data:models.GameData )
  {
    this.context = new Context()
    this.words = new WordsmithDataWrapper(data.journal,this.context)
    this.world = new WorldDataWrapper(data.world)

    this.actionHandler = new ActionHandler(this.words,this.world)
    this.go( new Act( "spawn", { to:this.data.ini.spawn_node } ) )
  }

  private go( act:Act ):void
  {
    this.options = []

    let results = this.actionHandler.resolveAction( act, this.data, this.context )
    for ( let result of results )
      this.journal.push( result );
      
    this.context.history.unshift( act )

    this.options = this.actionHandler.makeOptionsList( this.data, this.context )

    try { if ( this.onChange ) this.onChange() }
    catch( e ) { console.log("onchange errorred " + e) }
  }

  public selectOption(index:number):void
  {
    let option = this.options[index]
    console.debug( `Selected Option [${index}]`, option );
    this.go( option.act );
  }
}

class Context 
{ 
  currentNode:models.Node
  history:Act[] = []

  nosepicks:number = 0
}

class WordsmithDataWrapper
{
  constructor( private data:models.JournalData, private context:Context ) {}

  public codetotext( code:string, context:Context ):string
  {
    try { return eval( code ) }
    catch(e) { return `... \n(ERROR)\n${e}\n ... ` }
  }

  public fixText( text:string ):string
  {
    return text.replace( 
      /{{([^}]*)}}/gi, 
      ( match, code ) => this.codetotext.call( null, code, this.context ) )
  }
      
  public getHandle( from:models.Node, to:models.Node, flags:string[] ):string
  {
    for ( let row of this.queryValidRows( from, to, flags ) )
      if ( row.handle ) return this.fixText( row.handle )
    if ( flags.includes( "back" ) )   return `Go back to ${to.slug}.`
    if ( flags.includes( "circle" ) ) return `Circle back to ${to.slug}.`
    return `Go to ${to.slug}`
  }

  public getText( from:models.Node, to:models.Node, flags:string[] ):string
  {
    for ( let row of this.queryValidRows( from, to, flags ) )
      if ( row.text ) return this.fixText( row.text )
    if ( flags.includes( "spawn" ) )  return `I spawned at ${to.slug}.`
    if ( flags.includes( "back" ) )   return `I returned to ${to.slug}.`
    if ( flags.includes( "circle" ) ) return `I circled right back to ${to.slug}.`
    return `I went to ${to.slug}.`
  }

  private queryValidRows( from:models.Node, to:models.Node, flags:string[] )
  {
    return this.data.actions.goto
      .filter( a => {
          if ( from && a.from && from.slug != a.from && from.uid != a.from ) return false
          if ( to && a.to && to.slug != a.to && to.uid != a.to ) return false
          if ( a.params && !flags.includes( a.params ) ) return false
          return true
        } )
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
  constructor ( private wordsmith:WordsmithDataWrapper, private world:WorldDataWrapper) {}

  private resolverFunctions:{[actType:string]:(act?:Act,data?:models.GameData,context?:Context)=>string[]} =
  {
    "spawn": (act,data,context) => 
    {
      console.log("spoo",this,this.world,this.world.getNode)
      let prev = context.currentNode;
      let next = 
      context.currentNode = this.world.getNode( act.params.to )
      return [ this.wordsmith.getText( prev, next, ["spawn"] ) ]
    },
    "goto": (act,data,context) => 
    {
      let prev = context.currentNode;
      let next = this.world.getNode( act.params.to )

      context.currentNode = next
      return [ this.wordsmith.getText( prev, next, act.flags ) ]
    },
    "lookaround": () => 
    {
      return ["I looked around. It's nice here."]
    },
    "lookdown": () => 
    {
      return ["I looked down and stared thoughtfully at my shoes. I had two.\n"
             +"I began wiggling my toes, but I couldn't seem them. This was probably because I had shoes over them."]
    },
    "picknose": (act,data,context) => 
    {
      context.nosepicks++
      return ["I jammed a finger up my nose."]
    },
  }

  public resolveAction( act:Act, data:models.GameData, context:Context ):string[]
  {
    console.log(JSON.stringify(act,null,2))
    let func = this.resolverFunctions[act.type]
    return func( act, data, context )
  }

  public makeOptionsList( data:models.GameData, context:Context ):Option[]
  {
    let currentNode = context.currentNode
    let options = []

    /// NAVIGATION
    for ( let link of data.world.links )
    {
      if ( link.from !== currentNode.uid )
        continue
      
      let next = this.world.getNode( link.to )

      let isBackward = this.isBackward( next, context )
      let isCircular = this.isCircular( next, context )

      let params = []
      if ( isBackward )
        params.push( "back" )
      else
      if ( isCircular )
        params.push( "circle" )

      options.push(
      {
        weight: isBackward ? 10 : 12,
        handle: this.wordsmith.getHandle( currentNode, next, params ),
        act: new Act( "goto", {to:next.uid}, params ),
      } )
    }

    /// EXTRA
    options.push(
      {
        weight: -1,
        handle: "Inspect your surroundings",
        act: new Act("lookaround"),
      } )
      options.push(
      {
        weight: -1,
        handle: "Look at your shoes",
        act: new Act("lookdown"),
      } )
      options.push(
      {
        weight: -1,
        handle: "Pick your nose",
        act: new Act("picknose"),
      } )
    
    return options.sort( (a,b) => b.weight - a.weight )
  }

  private nodeEquals( a:models.Node, b:any )
  { return a === b || a.uid === b || a.slug === b }

  private isBackward( to:models.Node, context:Context ):boolean // +param max time ago
  {
    for ( let act of context.history )
      if ( act.type === "goto" )
        if ( this.nodeEquals( context.currentNode, act.params.to ) )
          continue
        else
          return !act.flags.includes("back") && this.nodeEquals( to, act.params.to )
    return false
  }

  private isCircular( to:models.Node, context:Context ):boolean // +param max time ago
  {
    for ( let act of context.history )
      if ( act.type != "goto" )
        return false
      else
      if ( act.flags.includes("back") || act.flags.includes("circle") )
        return false
      else
      if ( this.nodeEquals( context.currentNode, act.params.to ) )
        continue
      else
      if ( this.nodeEquals( to, act.params.to ) )
        return true
    return false
  }
}

class Act
{
  constructor( public type:"goto"|"spawn"|"lookaround"|"lookdown"|"picknose",
               public params:any = {},
               public flags:string[] = [] 
             ) {}
}

class Option
{
  handle:string
  weight:number
  act:Act
}
