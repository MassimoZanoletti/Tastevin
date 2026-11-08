import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DraftService } from '../../services/draft.service';

@Component({
  selector: 'app-home',
  imports: [ButtonModule, RouterLink],
  template: `
    <section class="hero">
      <!-- Foto: "Taste vin" di Véronique Pagnier, Wikimedia Commons, pubblico dominio (scontornata) -->
      <img class="photo" src="img/tastevin.webp" width="840" height="376" alt="Un tastevin d'argento" />
      <h1>Tastevin</h1>
      <p>Degustazione guidata del vino secondo il metodo AIS: esame visivo, olfattivo, gustativo e considerazioni finali.</p>
    </section>

    <div class="actions">
      @if (draft.hasDraft) {
        <p-button label="Riprendi la degustazione in corso" icon="pi pi-play" (onClick)="resume()" [fluid]="true" />
        <p-button label="Nuova degustazione" icon="pi pi-plus" severity="secondary" [outlined]="true"
                  (onClick)="startNew()" [fluid]="true" />
      } @else {
        <p-button label="Inizia una degustazione" icon="pi pi-plus" (onClick)="startNew()" [fluid]="true" size="large" />
      }
      <p-button label="Archivio degustazioni" icon="pi pi-book" severity="secondary" [text]="true"
                routerLink="/archivio" [fluid]="true" />
    </div>

    <ol class="phases">
      <li><i class="pi pi-eye"></i><div><b>Esame visivo</b><span>colore, riflessi, limpidezza, consistenza, perlage</span></div></li>
      <li><i class="pi pi-sparkles"></i><div><b>Esame olfattivo</b><span>intensità, complessità, qualità, famiglie</span></div></li>
      <li><i class="pi pi-heart"></i><div><b>Esame gustativo</b><span>morbidezze, durezze, corpo, equilibrio, PAI</span></div></li>
      <li><i class="pi pi-flag"></i><div><b>Considerazioni finali</b><span>armonia e stato evolutivo</span></div></li>
    </ol>
  `,
  styles: `
    .hero { text-align: center; padding: .5rem 0 1rem; }
    .photo {
      display: block; width: 100%; max-width: 380px; height: auto; margin: 0 auto;
      filter: drop-shadow(0 8px 14px rgba(0, 0, 0, .35));
    }
    h1 { margin: .5rem 0 .25rem; font-size: 2rem; letter-spacing: .02em; color: var(--p-primary-color); }
    p { margin: 0 auto; max-width: 28rem; color: var(--p-text-muted-color); }
    .actions { display: flex; flex-direction: column; gap: .6rem; margin: 1.25rem 0; }
    .phases { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: .5rem; }
    .phases li {
      display: flex; gap: .85rem; align-items: center; padding: .75rem 1rem; border-radius: .9rem;
      background: var(--p-content-background); border: 1px solid var(--p-content-border-color);
    }
    .phases i { color: var(--p-primary-color); font-size: 1.15rem; }
    .phases div { display: flex; flex-direction: column; }
    .phases span { font-size: .85rem; color: var(--p-text-muted-color); }
  `,
})
export class HomeComponent {
  protected draft = inject(DraftService);
  private router = inject(Router);

  resume(): void { this.router.navigate(['/degustazione']); }

  startNew(): void {
    this.draft.reset();
    this.router.navigate(['/degustazione']);
  }
}
