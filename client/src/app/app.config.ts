import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { HTTP_INTERCEPTORS, HttpHandlerFn, HttpRequest, provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';

// todo: ez hogy lesz automatizálva production vs developmentben?
import { environment } from '../environments/environment.development';

function apiIntercept(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  const apiReq = req.clone({ 
    url: `${environment.apiUrl}${req.url}`,
    withCredentials: true
  });

  console.log(apiReq);
  
  return next(apiReq);
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([apiIntercept])
    )
  ]
};
