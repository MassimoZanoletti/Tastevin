import { Component, computed, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ExamSection, MAX_SCORE, SCORE_ITEMS, SCORE_LABELS, SECTION_LABELS, colorHex } from '../models/ais';
import { TastingRecord, hasWineDetails } from '../models/tasting';
import { GlassComponent } from './glass.component';

interface Row { label: string; value: string; hex?: string | null }
interface Section { key: ExamSection; title: string; rows: Row[]; score: number | null; max: number }

/** Visualizzazione in sola lettura di vino + degustazione. */
@Component({
  selector: 'app-summary',
  imports: [GlassComponent, DatePipe],
  template: `
    @let r = record();
    @if (hasWine()) {
      <section class="block wine">
        <div class="wine-head">
          <app-glass [color]="glassColor()" [size]="34" />
          <div>
            <h2>{{ r.wine.nome }} @if (r.wine.annata) { <span class="muted">{{ r.wine.annata }}</span> }</h2>
            @if (r.wine.produttore) { <div class="muted">{{ r.wine.produttore }}</div> }
          </div>
        </div>
        <dl>
          @for (row of wineRows(); track row.label) {
            <dt>{{ row.label }}</dt><dd>{{ row.value }}</dd>
          }
        </dl>
      </section>
    }

    <section class="block">
      <dl>
        <dt>Data</dt><dd>{{ r.tasting.data | date: 'dd/MM/yyyy' }}</dd>
        @if (r.tasting.note) { <dt>Note</dt><dd class="pre">{{ r.tasting.note }}</dd> }
      </dl>
    </section>

    @for (s of sections(); track s.key) {
      <section class="block">
        <h3>
          {{ s.title }}
          @if (s.score !== null) { <span class="pts">{{ s.score }} / {{ s.max }}</span> }
        </h3>
        @if (s.rows.length) {
          <dl>
            @for (row of s.rows; track row.label) {
              <dt>{{ row.label }}</dt>
              <dd>
                @if (row.hex) { <span class="swatch" [style.background]="row.hex"></span> }
                <span class="pre">{{ row.value }}</span>
              </dd>
            }
          </dl>
        } @else {
          <p class="muted">Nessuna voce compilata.</p>
        }
      </section>
    }

    @if (r.tasting.punteggioAttivo && r.tasting.totale !== null) {
      <section class="block total">
        <span>Punteggio totale</span>
        <b>{{ r.tasting.totale }} <small>/ {{ max }}</small></b>
      </section>
    }
  `,
  styles: `
    :host { display: flex; flex-direction: column; gap: .85rem; }
    .block {
      background: var(--p-content-background); border: 1px solid var(--p-content-border-color);
      border-radius: 1rem; padding: .9rem 1rem;
    }
    h2 { margin: 0; font-size: 1.2rem; }
    h3 { margin: 0 0 .5rem; font-size: 1rem; color: var(--p-primary-color); display: flex; justify-content: space-between; }
    .pts { color: var(--p-text-color); font-weight: 600; }
    .wine-head { display: flex; gap: .75rem; align-items: center; margin-bottom: .6rem; }
    .muted { color: var(--p-text-muted-color); font-weight: 400; }
    dl { display: grid; grid-template-columns: minmax(7rem, 40%) 1fr; gap: .35rem .75rem; margin: 0; font-size: .92rem; }
    dt { color: var(--p-text-muted-color); }
    dd { margin: 0; display: flex; align-items: center; gap: .5rem; }
    .swatch {
      flex-shrink: 0; width: 2.4rem; height: 1.3rem; border-radius: .3rem;
      box-shadow: inset 0 0 0 1px rgba(0, 0, 0, .2);
    }
    .pre { white-space: pre-wrap; }
    p { margin: 0; font-size: .9rem; }
    .total {
      display: flex; justify-content: space-between; align-items: center;
      background: var(--p-primary-color); color: var(--p-primary-contrast-color); border: none;
    }
    .total b { font-size: 1.6rem; }
    .total small { font-size: .9rem; font-weight: 400; opacity: .85; }
  `,
})
export class SummaryComponent {
  record = input.required<TastingRecord>();
  protected max = MAX_SCORE;

  protected hasWine = computed(() => hasWineDetails(this.record().wine));

  protected glassColor = computed(() => {
    const r = this.record();
    return colorHex(r.tasting.visivo.colore)
      ?? ({ bianco: '#F1D768', rosa: '#EE8A86', rosso: '#9B111E' } as Record<string, string>)[r.wine.colore ?? '']
      ?? null;
  });

  protected wineRows = computed<Row[]>(() => {
    const w = this.record().wine;
    return rows([
      ['Colore', w.colore],
      ['Tipologia', w.tipologia?.join(', ')],
      ['Classificazione', w.classificazione],
      ['Regione', w.regione],
      ['Grado alcolico', w.grado !== null && w.grado !== undefined ? `${w.grado}% vol` : null],
      ['Vitigni', w.vitigni],
      ['Specifiche', w.specifiche],
      ['Note', w.note],
    ]);
  });

  protected sections = computed<Section[]>(() => {
    const t = this.record().tasting;
    const v = t.visivo, o = t.olfattivo, g = t.gustativo, f = t.finale;
    const content: Record<ExamSection, Row[]> = {
      visivo: [
        { label: 'Colore', value: v.colore ?? '', hex: colorHex(v.colore) },
        { label: 'Riflessi', value: v.riflessi ?? '', hex: colorHex(v.riflessi) },
        ...rows([
          ['Limpidezza', v.limpidezza],
          ['Consistenza', v.fluidita],
          ...(v.spumante ? [
            ['Grana bollicine', v.effervescenza.grana],
            ['Numero bollicine', v.effervescenza.numero],
            ['Persistenza perlage', v.effervescenza.persistenza],
          ] as [string, string | null][] : []),
        ]),
      ].filter(r => r.value),
      olfattivo: rows([
        ['Intensità', o.intensita],
        ['Complessità', o.complessita],
        ['Persistenza', o.persistenza],
        ['Qualità', o.qualita],
        ['Famiglie', o.famiglie?.join(', ')],
        ['Primi profumi', o.primiProfumi],
        ['Profumi in evoluzione', o.profumiEvoluzione],
      ]),
      gustativo: rows([
        ['Zuccheri', g.zuccheri], ['Alcol', g.alcol], ['Polialcoli', g.polialcoli],
        ['Acidità', g.acidita], ['Tannicità', g.tannicita], ['Sali minerali', g.saliMinerali],
        ['Corpo', g.corpo], ['Equilibrio', g.equilibrio], ['Intensità', g.intensita],
        ['PAI', g.pai], ['Qualità', g.qualita],
      ]),
      finale: rows([['Armonia', f.armonia], ['Stato evolutivo', f.statoEvolutivo]]),
    };

    return (Object.keys(content) as ExamSection[]).map(key => {
      const items = SCORE_ITEMS.filter(i => i.section === key);
      let score: number | null = null;
      if (t.punteggioAttivo) {
        const scored = items.filter(i => t.punteggi[i.key] !== null);
        if (scored.length) score = scored.reduce((s, i) => s + (t.punteggi[i.key] ?? 0) * i.factor, 0);
      }
      const scoreRows: Row[] = t.punteggioAttivo
        ? items.filter(i => t.punteggi[i.key] !== null).map(i => ({
            label: `★ ${i.label}`,
            value: `${SCORE_LABELS[t.punteggi[i.key]!]} (${t.punteggi[i.key]} × ${i.factor})`,
          }))
        : [];
      return {
        key, title: SECTION_LABELS[key], rows: [...content[key], ...scoreRows],
        score, max: items.reduce((s, i) => s + i.factor * 4, 0),
      };
    });
  });
}

function rows(pairs: [string, string | null | undefined][]): Row[] {
  return pairs.filter(([, v]) => !!v && String(v).trim()).map(([label, value]) => ({ label, value: String(value) }));
}
