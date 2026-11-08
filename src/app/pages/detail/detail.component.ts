import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ConfirmationService, MessageService } from 'primeng/api';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TastingRecord, emptyTasting } from '../../models/tasting';
import { ApiService } from '../../services/api.service';
import { DraftService, normalizeRecord } from '../../services/draft.service';
import { SummaryComponent } from '../../shared/summary.component';

@Component({
  selector: 'app-detail',
  imports: [ButtonModule, MessageModule, ProgressSpinnerModule, RouterLink, SummaryComponent],
  template: `
    <div class="top">
      <p-button icon="pi pi-arrow-left" [text]="true" routerLink="/archivio" ariaLabel="Torna all'archivio" />
      <h1>Degustazione</h1>
    </div>

    @let r = record();
    @if (loading()) {
      <div class="center"><p-progress-spinner strokeWidth="4" /></div>
    } @else if (r) {
      <app-summary [record]="r" />
      <div class="actions">
        <p-button label="Modifica" icon="pi pi-pencil" (onClick)="edit()" [fluid]="true" />
        <p-button label="Nuova degustazione di questo vino" icon="pi pi-plus" severity="secondary"
                  [outlined]="true" (onClick)="tasteAgain(r)" [fluid]="true" />
        <p-button label="Elimina" icon="pi pi-trash" severity="danger" [text]="true" (onClick)="remove()" [fluid]="true" />
      </div>
    } @else {
      <p-message severity="error">Degustazione non trovata o archivio non raggiungibile.</p-message>
    }
  `,
  styles: `
    .top { display: flex; align-items: center; gap: .25rem; margin: 0 0 .75rem -.75rem; }
    h1 { font-size: 1.35rem; margin: 0; }
    .center { display: flex; justify-content: center; padding: 3rem 0; }
    .actions { display: flex; flex-direction: column; gap: .6rem; margin-top: 1rem; }
  `,
})
export class DetailComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private draft = inject(DraftService);
  private confirm = inject(ConfirmationService);
  private toast = inject(MessageService);

  protected record = signal<TastingRecord | null>(null);
  protected loading = signal(true);
  private id = 0;

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.api.getTasting(this.id).subscribe({
      next: r => { this.record.set(normalizeRecord(r)); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  edit(): void { this.router.navigate(['/degustazione', this.id]); }

  tasteAgain(r: TastingRecord): void {
    const t = emptyTasting();
    t.punteggioAttivo = r.tasting.punteggioAttivo;
    this.draft.reset({ wine: r.wine, tasting: t });
    this.router.navigate(['/degustazione']);
  }

  remove(): void {
    this.confirm.confirm({
      header: 'Elimina degustazione',
      message: 'Vuoi eliminare definitivamente questa degustazione?',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Elimina',
      rejectLabel: 'Annulla',
      acceptButtonProps: { severity: 'danger' },
      rejectButtonProps: { severity: 'secondary', outlined: true },
      accept: () => {
        this.api.deleteTasting(this.id).subscribe({
          next: () => {
            this.toast.add({ severity: 'success', summary: 'Eliminata', detail: 'Degustazione eliminata.' });
            this.router.navigate(['/archivio']);
          },
          error: () => this.toast.add({ severity: 'error', summary: 'Errore', detail: 'Eliminazione non riuscita.' }),
        });
      },
    });
  }
}
