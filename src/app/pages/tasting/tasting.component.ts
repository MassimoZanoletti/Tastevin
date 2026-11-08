import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AutoCompleteModule, AutoCompleteCompleteEvent, AutoCompleteSelectEvent } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { MessageService } from 'primeng/api';
import * as AIS from '../../models/ais';
import { ScoreKey } from '../../models/ais';
import { Wine, computeTotal, hasWineDetails } from '../../models/tasting';
import { ApiService } from '../../services/api.service';
import { DraftService, normalizeRecord } from '../../services/draft.service';
import { ChoiceComponent, ChoiceOption } from '../../shared/choice.component';
import { ScoreComponent } from '../../shared/score.component';
import { SummaryComponent } from '../../shared/summary.component';

const SPARKLING = ['nature', 'extra brut', 'brut', 'extra dry', 'dry'];

@Component({
  selector: 'app-tasting',
  imports: [
    FormsModule, AutoCompleteModule, ButtonModule, InputNumberModule, InputTextModule, MessageModule,
    ProgressSpinnerModule, SelectModule, TextareaModule, ToggleSwitchModule,
    ChoiceComponent, ScoreComponent, SummaryComponent,
  ],
  templateUrl: './tasting.component.html',
  styleUrl: './tasting.component.scss',
})
export class TastingComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(MessageService);
  protected draft = inject(DraftService);

  protected readonly A = AIS;
  protected readonly steps = [
    { label: 'Vino', icon: 'pi pi-tag' },
    { label: 'Visivo', icon: 'pi pi-eye' },
    { label: 'Olfattivo', icon: 'pi pi-sparkles' },
    { label: 'Gustativo', icon: 'pi pi-heart' },
    { label: 'Finale', icon: 'pi pi-flag' },
    { label: 'Riepilogo', icon: 'pi pi-list-check' },
  ];

  protected step = signal(0);
  protected loading = signal(false);
  protected saving = signal(false);
  protected showWine = signal(false);
  protected wineSuggestions = signal<Wine[]>([]);
  /** Forza il ricalcolo delle parti che dipendono dal modello mutabile. */
  protected rev = signal(0);

  protected wineColorOptions: ChoiceOption[] = AIS.WINE_COLORS.map(c => ({ label: c.label, value: c.value, hex: c.hex }));
  protected classificazioni = AIS.CLASSIFICAZIONI.map(c => ({ label: c, value: c }));
  /** Regione: testo libero, con suggerimenti dalle regioni italiane. */
  protected regioniSuggerite = signal<string[]>([]);

  protected visualColors = computed<ChoiceOption[]>(() => {
    this.rev();
    const group = this.r.wine.colore;
    return AIS.COLORI_VISIVI
      .filter(c => !group || c.group === group)
      .map(c => ({ label: c.label, value: c.label, hex: c.hex }));
  });

  get r() { return this.draft.record; }
  get t() { return this.draft.record.tasting; }
  get w() { return this.draft.record.wine; }
  get total(): number | null { return computeTotal(this.t.punteggi); }
  get canSave(): boolean { return hasWineDetails(this.w); }
  get isLast(): boolean { return this.step() === this.steps.length - 1; }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loading.set(true);
      this.api.getTasting(id).subscribe({
        next: rec => {
          this.draft.reset(rec);
          this.showWine.set(true);
          this.loading.set(false);
          this.rev.update(v => v + 1);
        },
        error: () => {
          this.loading.set(false);
          this.toast.add({ severity: 'error', summary: 'Errore', detail: 'Impossibile caricare la degustazione.' });
          this.router.navigate(['/archivio']);
        },
      });
    } else {
      this.step.set(Math.min(this.draft.step, this.steps.length - 1));
      this.showWine.set(hasWineDetails(this.w) || !!this.w.id);
    }
  }

  goTo(i: number): void {
    if (this.step() === 0 && i > 0) this.presetSparkling();
    this.step.set(i);
    this.draft.step = i;
    this.changed();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  next(): void { if (!this.isLast) this.goTo(this.step() + 1); }
  prev(): void { if (this.step() > 0) this.goTo(this.step() - 1); }

  /** Chiamato ad ogni modifica: aggiorna il totale e salva la bozza nel browser. */
  changed(): void {
    this.t.totale = this.t.punteggioAttivo ? computeTotal(this.t.punteggi) : null;
    this.draft.persist();
    this.rev.update(v => v + 1);
  }

  onWineColorChange(): void {
    // se il colore del vino cambia, azzera le scelte non coerenti dell'esame visivo
    const allowed = new Set(this.visualColorsFor(this.w.colore));
    if (this.t.visivo.colore && !allowed.has(this.t.visivo.colore)) this.t.visivo.colore = null;
    if (this.t.visivo.riflessi && !allowed.has(this.t.visivo.riflessi)) this.t.visivo.riflessi = null;
    this.changed();
  }

  searchWine(e: AutoCompleteCompleteEvent): void {
    this.api.searchWines(e.query).subscribe({
      next: list => this.wineSuggestions.set(list),
      error: () => this.wineSuggestions.set([]),
    });
  }

  searchRegione(e: AutoCompleteCompleteEvent): void {
    const q = (e.query ?? '').trim().toLowerCase();
    this.regioniSuggerite.set(q ? AIS.REGIONI.filter(r => r.toLowerCase().includes(q)) : [...AIS.REGIONI]);
  }

  selectWine(e: AutoCompleteSelectEvent): void {
    const rec = normalizeRecord({ wine: e.value as Wine, tasting: this.t });
    this.draft.record.wine = rec.wine;
    this.onWineColorChange();
  }

  clearWine(): void {
    this.draft.record.wine = normalizeRecord(null).wine;
    this.changed();
  }

  score(key: ScoreKey): number | null { return this.t.punteggi[key]; }
  factor(key: ScoreKey): number { return AIS.SCORE_ITEMS.find(i => i.key === key)!.factor; }

  save(): void {
    if (!this.canSave) return;
    this.changed();
    this.saving.set(true);
    this.api.saveTasting(this.r).subscribe({
      next: saved => {
        this.saving.set(false);
        this.draft.clear();
        this.toast.add({ severity: 'success', summary: 'Salvata', detail: 'Degustazione salvata in archivio.' });
        this.router.navigate(['/archivio', saved.tasting.id]);
      },
      error: err => {
        this.saving.set(false);
        this.toast.add({
          severity: 'error', summary: 'Salvataggio non riuscito',
          detail: err?.error?.error ?? 'Controlla la connessione: la bozza resta sul dispositivo.', life: 6000,
        });
      },
    });
  }

  restart(): void {
    this.draft.reset();
    this.showWine.set(false);
    this.step.set(0);
    this.rev.update(v => v + 1);
    this.router.navigate(['/degustazione']);
  }

  private visualColorsFor(group: string | null): string[] {
    return AIS.COLORI_VISIVI.filter(c => !group || c.group === group).map(c => c.label);
  }

  private presetSparkling(): void {
    const v = this.t.visivo;
    const e = v.effervescenza;
    if (!v.spumante && !e.grana && !e.numero && !e.persistenza
        && this.w.tipologia.some(t => SPARKLING.includes(t))) {
      v.spumante = true;
    }
  }
}
