import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { NgRedux } from '@angular-redux/store';
import * as _ from 'lodash';
import { AuthInterceptorService } from './auth-interceptor.service';
import { AppActionsService } from '../store/app/app-actions.service';
import { UserService } from './user.service';
import { MatSnackBar } from '@angular/material';
import { SessionActionsService } from '../store/session/session-actions.service';
import { AppModel } from '../models/app.model';
import { resolve, reject } from 'q';
import { SessionModule } from '../models/session.module';

@Injectable()
export class InitGuard implements CanActivate {
  constructor(
    public router: Router,
    private ngRedux: NgRedux<any>,
    private sessionActionsService: SessionActionsService,
    private appActionsService: AppActionsService,
    private userService: UserService,
    private snackBar: MatSnackBar
  ) { }

  getProfileFromQueryToken(queryParams:any): Promise<any> {
    return new Promise((resolve, reject) => {
      let token: string = queryParams.token;
      if (!token) {
        resolve();
      } else {
        console.log('try userService.getProfile');
        AuthInterceptorService.token = token;
        this.userService.getProfile()
          .then(profile => {
            console.log('open session from init guard');
            this.sessionActionsService.open({
              token: token,
              profile: profile
            });
            let appState: AppModel = _.get(this.ngRedux.getState(), 'app');
            let messageName: string = 'email_confirm_success_' + profile.id;
            if (queryParams.flash_message == 'email_confirm_success' && !appState.hasUniqMessage(messageName)) {
              this.snackBar.open("Vous êtes inscrit !", "OK", {
                duration: 5000,
                verticalPosition: 'top'
              });
              this.appActionsService.addUniqMessage(messageName);
            }
            resolve();
          }, error => {
            console.log(error);
            AuthInterceptorService.token = null;
            resolve();
          });
      }
    });
  }

  canActivate(route: ActivatedRouteSnapshot): boolean | Observable<boolean> {
    return new Observable<boolean>((observer) => {
      this.getProfileFromQueryToken(route.queryParams)
        .then(() => {
          let sessionState: SessionModule = _.get(this.ngRedux.getState(), 'session');
          if (sessionState)
            AuthInterceptorService.token = sessionState.token;
          observer.next(true);
          observer.complete();
        })
    });
  }
}
