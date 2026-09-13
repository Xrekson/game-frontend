import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { GameStateService } from '../services/game-state.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const state = inject(GameStateService);

  // If 10-second rate limit disable timer is active, block outgoing requests
  if (state.isRateLimited$.getValue()) {
    return throwError(() => new HttpErrorResponse({
      error: { error: 'Rate limit active. All API calls disabled for 10-second cooldown.' },
      status: 429,
      statusText: 'Too Many Requests'
    }));
  }

  const token = localStorage.getItem('jwt_token');

  let authReq = req;
  if (token && !req.headers.has('Authorization')) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error: any) => {
      if (error instanceof HttpErrorResponse) {
        // Exclude login/register requests from triggering invalid token modal
        const isAuthEndpoint = req.url.includes('/auth/login') || req.url.includes('/auth/register');

        if (error.status === 401 && !isAuthEndpoint) {
          localStorage.removeItem('jwt_token');
          state.showInvalidTokenModal$.next(true);
        }

        // Trigger 10 second rate limit cooldown timer when 429 response received
        if (error.status === 429) {
          state.triggerRateLimit(10);
        }
      }
      return throwError(() => error);
    })
  );
};
