import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DataService {
  private http = inject(HttpClient);

  load<T>(fileName: string): Observable<T> {

    return this.http.get<T>(`/assets/data/${fileName}`);
  }
}
