import { Component, OnInit, ViewEncapsulation, HostBinding } from '@angular/core';
import { Observable } from 'rxjs'
import { Router, ActivatedRoute } from '@angular/router';
import { NgRedux } from '@angular-redux/store';
import { MatSnackBar } from '@angular/material';
import 'rxjs/add/operator/first';
import * as _ from 'lodash';

import { AppModel } from './models/app.model';
import { AppActionsService } from './store/app/app-actions.service';
import { AuthInterceptorService } from './services/auth-interceptor.service';
import { SessionModule } from './models/session.module';
import { UserService } from './services/user.service';
import { config } from './settings';
import { getNsPrefix } from '@angular/compiler';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit {

  @HostBinding('class.nosidenav') nosidenav:boolean;

  isConnected$ : Observable<boolean> = null

  constructor(
      private ngRedux: NgRedux<any>,
      private router: Router,
      private route: ActivatedRoute,
      private appActionsService: AppActionsService,
      private userService: UserService,
      private snackBar: MatSnackBar) {}

  logOut() {
    this.userService.logout()
    this.router.navigate(['/login']);
  }

  ngOnInit() {
    this.isConnected$ = this.userService.isConnected();
    //TODO
    this.router.events.subscribe(value => {
      this.nosidenav = ['/login', '/register'].indexOf(this.router.routerState.snapshot.url) > -1;
    });
  }

  /*
  isSessionValid(session): boolean {
    if (!_.get(session, 'token')) {
      return false;
    }
    return true;
  }

  start() {
    this.ngRedux.select('session')
      .first((session: any) => {
        console.debug('start first', session);
        if (!this.isSessionValid(session)) {
          return false;
        }
        AuthInterceptorService.token = session.token;
        return true;
      })
      .subscribe((session: any) => {
        this.router.navigate(['/profile']);
        this.ngRedux.select('session')
          .subscribe((sessions: any) => {
            if (!sessions) {
              this.start();
            }
          });
      });
  } */
}
