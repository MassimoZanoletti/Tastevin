import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subject, debounceTime, switchMap, catchError, of, tap } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { SkeletonModule } from 'primeng/skeleton';
import { colorHex } from '../../models/ais';
import { TastingListItem } from '../../models/tasting';
import { ApiService } from '../../services/api.service';
import { GlassComponent } from '../../shared/glass.component';

const FALLBACK: Record<string, string> = { bianco: '#F1D768', rosa: '#EE8A86', rosso: '#9B111E' };

@Component({
  selector: 'app-archive',
  imports: [
    DatePipe, FormsModule, RouterLink, ButtonModule, IconFieldModule, InputIconModule, InputTextModule,
    MessageModule, SkeletonModule, GlassComponent,
  ],
  template: `
    <h1>Archivio</h1>

    <p-iconfield>
      <p-inputicon styleClass="pi pi-search" />
      <input pInputText type="search" placeholder="Cerca per vino, produttore, regione…" [fluid]="true"
             [ngModel]="query()" (ngModelChange)="onQuery($event)" />
    </p-iconfield>

    <div class="list">
      @if (loading()) {
        @for (i of [1, 2, 3, 4]; track i) { <p-skeleton height="4.5rem" borderRadius="1rem" /> }
      } @else if (error()) {
        <p-message severity="error">Impossibile contattare l'archivio. Verifica la connessione o la configurazione delle API.</p-message>
        <p-button label="Riprova" icon="pi pi-refresh" [text]="true" (onClick)="onQuery(query())" />
      } @else {
        @for (it of items(); track it.id) {
          <a class="item" [routerLink]="['/archivio', it.id]">
            <app-glass [color]="glass(it)" [size]="26" />
            <div class="txt">
              <b>{{ it.nome }} @if (it.annata) { <span class="muted">{{ it.annata }}</span> }</b>
              <span class="muted">{{ it.produttore || '—' }} · {{ it.data | date: 'dd/MM/yyyy' }}</span>
            </div>
            @if (it.totale !== null) { <span class="score">{{ it.totale }}</span> }
            <i class="pi pi-chevron-right muted"></i>
          </a>
        } @empty {
          <p class="empty">
            @if (query()) { Nessuna degustazione trovata. } @else { Nessuna degustazione salvata. }
          </p>
          <p-button label="Inizia una degustazione" icon="pi pi-plus" routerLink="/" [text]="true" />
        }
      }
    </div>
  `,
  styles: `
    h1 { font-size: 1.35rem; margin: .25rem 0 .9rem; }
    .list { display: flex; flex-direction: column; gap: .55rem; margin-top: 1rem; }
    .item {
      display: flex; align-items: center; gap: .8rem; padding: .7rem .9rem; border-radius: 1rem;
      background: var(--p-content-background); border: 1px solid var(--p-content-border-color);
      color: inherit; text-decoration: none;
    }
    .item:active { background: var(--p-content-hover-background); }
    .txt { display: flex; flex-direction: column; flex: 1; min-width: 0; }
    .txt > * { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .muted { color: var(--p-text-muted-color); font-weight: 400; font-size: .88rem; }
    .score {
      min-width: 2.6rem; text-align: center; padding: .25rem .5rem; border-radius: 1rem; font-weight: 700;
      background: var(--p-primary-color); color: var(--p-primary-contrast-color);
    }
    .empty { text-align: center; color: var(--p-text-muted-color); margin: 2rem 0 .5rem; }
  `,
})
export class ArchiveComponent implements OnInit {
  private api = inject(ApiService);
  protected items = signal<TastingListItem[]>([]);
  protected loading = signal(true);
  protected error = signal(false);
  protected query = signal('');
  private search$ = new Subject<string>();

  ngOnInit(): void {
    this.search$.pipe(
      debounceTime(300),
      tap(() => { this.loading.set(true); this.error.set(false); }),
      switchMap(q => this.api.listTastings(q).pipe(catchError(() => { this.error.set(true); return of([]); }))),
    ).subscribe(list => {
      this.items.set(list);
      this.loading.set(false);
    });
    this.search$.next('');
  }

  onQuery(q: string): void {
    this.query.set(q);
    this.search$.next(q.trim());
  }

  glass(it: TastingListItem): string | null {
    return colorHex(it.colore_visivo) ?? FALLBACK[it.colore ?? ''] ?? null;
  }
}
