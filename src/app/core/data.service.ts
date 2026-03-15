import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, shareReplay } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class DataService {

  private http = inject(HttpClient);

  load<T>(fileName: string): Observable<T> {

    const url = `assets/data/${fileName}`;

    return this.http.get<T>(url).pipe(
      shareReplay(1),
      catchError((error) => {
        console.error(`Error loading data file: ${fileName}`, error);
        return throwError(() => error);
      })
    );
  }
}
