import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timer, switchMap, shareReplay } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PollingService {
  constructor(private http: HttpClient) {}

  poll<T>(url: string, intervalMs = 4000): Observable<T> {
    return timer(0, intervalMs).pipe(
      switchMap(() => this.http.get<T>(url)),
      shareReplay(1)
    );
  }
}