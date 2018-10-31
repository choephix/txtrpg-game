import { Component, ViewChild, ElementRef } from '@angular/core';
import { WorldDataService } from '../services/data-service';
import { NavigashtiService } from '../services/navigashti.service';
import { Game } from '../game/game';

@Component({
  selector: 'app-game-view',
  templateUrl: './game-view.component.html',
  styleUrls: ['./game-view.component.css']
})
export class GameViewComponent
{
  @ViewChild('separator') _separator:ElementRef
  imgurl = 'https://openclipart.org/download/268262/Vintage-Decorative-Divider.svg';
  // imgurl = '/assets/separator.svg';

  game:Game

  showHidden:boolean = false

  tutShowHidden:boolean = true

  constructor( private dataService:WorldDataService, private navi:NavigashtiService )
  {
    navi.callbacks_NavigationEnd.push( () => this.startGame( navi.branch ) )
  }
  
  private startGame( branch:string )
  {
    this.dataService.load( branch, data => {
      this.game = new Game( data )
      this.game.onChange = () => this.onChange()
    } )
  }

  private ngAfterViewInit() 
  { this.resetScroll() }

  onClickOption(e:MouseEvent,i)
  {
    this.game.selectOption(i)
    // e.stopPropagation()
  }

  onClickExpandHidden(e:MouseEvent)
  {
    this.showHidden =! this.showHidden
    this.tutShowHidden = false
    e.stopPropagation()
  }

  onClickAnywhere(e:MouseEvent)
  {
    this.resetScroll()
  }

  private onChange()
  {
    this.showHidden = false
    this.resetScroll()
  }

  private resetScroll()
  {
    try {
      const o = this._separator.nativeElement;
      const d = o.y - innerHeight * .5;
      scrollBy( { top: d, behavior: "auto" } )
    } catch( e ) { }
  }

  getHalfWindowHeight() { return window.innerHeight * .5 + "px" }
}