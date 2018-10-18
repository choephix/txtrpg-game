import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { ServiceWorkerModule } from '@angular/service-worker'
import { RouterModule, Routes } from '@angular/router'
import { HttpClientModule } from '@angular/common/http';
import { environment } from '../environments/environment'

import { AppComponent } from './app.component'
import { Page404Component } from './app-404.component'
import { GameViewComponent } from './game-view/game-view.component'

const appRoutes: Routes = [
  { path: ':branch/debug', component: GameViewComponent, data:{debug:true} },
  { path: ':branch', component: GameViewComponent, data:{debug:false} },
  { path: '', redirectTo: 'poc', pathMatch: 'full' },
  { path: '**', component: Page404Component },
];

@NgModule({
  declarations: [
    AppComponent,
    Page404Component,
    GameViewComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    RouterModule.forRoot( appRoutes, { enableTracing: false } )
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
