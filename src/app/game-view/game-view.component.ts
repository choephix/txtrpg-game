import { Component, ViewChild, ElementRef, AfterViewInit, OnInit } from '@angular/core';
import { Game } from './../game/game';
import { WorldDataService } from './../game/data-service';

@Component({
  selector: 'app-game-view',
  templateUrl: './game-view.component.html',
  styleUrls: ['./game-view.component.css']
})
export class GameViewComponent implements OnInit {

  @ViewChild('separator') _separator:ElementRef

  imgurl = 'https://openclipart.org/download/268262/Vintage-Decorative-Divider.svg';
  // imgurl = '/assets/separator.svg';

  game:Game = new Game()

  debby:string = ""
  
  constructor( public dataService:WorldDataService ) {}

  ngOnInit() { this.startGame("develop") }
  
  startGame( branch:string )
  {
    this.dataService.load( "develop", data => {
      this.game.start( data )
      this.game.onChange = () => this.onChange()
    } )
  }

  ngAfterViewInit() { this.onChange() }

  onChange()
  {
    try {
      const o = this._separator.nativeElement;
      const d = o.y - innerHeight * .5;
      scrollBy( { top: d, behavior: "auto" } )
    } catch( e ) { }
  }

  getHalfWindowHeight() { return window.innerHeight * .5 + "px" }
}