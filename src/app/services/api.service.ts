import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { TastingListItem, TastingRecord, Wine } from '../models/tasting';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private base = environment.apiUrl.replace(/\/$/, '');

  private get headers(): HttpHeaders {
    let h = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (environment.apiKey) h = h.set('X-Api-Key', environment.apiKey);
    return h;
  }

  searchWines(q: string): Observable<Wine[]> {
    const params = new HttpParams().set('q', q);
    return this.http.get<Wine[]>(`${this.base}/wines.php`, { params, headers: this.headers });
  }

  listTastings(q = ''): Observable<TastingListItem[]> {
    const params = new HttpParams().set('q', q);
    return this.http.get<TastingListItem[]>(`${this.base}/tastings.php`, { params, headers: this.headers });
  }

  getTasting(id: number): Observable<TastingRecord> {
    const params = new HttpParams().set('id', id);
    return this.http.get<TastingRecord>(`${this.base}/tastings.php`, { params, headers: this.headers });
  }

  /** Crea o aggiorna vino e degustazione. Restituisce il record salvato con gli id. */
  saveTasting(record: TastingRecord): Observable<TastingRecord> {
    return this.http.post<TastingRecord>(`${this.base}/tastings.php`, record, { headers: this.headers });
  }

  deleteTasting(id: number): Observable<{ ok: boolean }> {
    const params = new HttpParams().set('id', id);
    return this.http.delete<{ ok: boolean }>(`${this.base}/tastings.php`, { params, headers: this.headers });
  }
}
