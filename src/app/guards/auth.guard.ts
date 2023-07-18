import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
):
  | Observable<boolean | UrlTree>
  | Promise<boolean | UrlTree>
  | boolean
  | UrlTree => {
  if (inject(AuthService).isLoggedIn !== true) {
    const currentUser = inject(AuthService).getCurrentUser();
    // 👇 Redirects to another route
    const isAnonymous = !currentUser;
    if (isAnonymous) {
      return inject(Router).createUrlTree(['/', 'login']);
    }

    const profilePageId = route.params['id'];

    // 👇 Grants or deny access to this route
    const attemptsToAccessItsOwnPage = currentUser.id !== profilePageId;
    return attemptsToAccessItsOwnPage;
  } else {
    return false;
  }
};
