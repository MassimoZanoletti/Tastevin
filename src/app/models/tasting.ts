import { MAX_SCORE, SCORE_ITEMS, ScoreKey, WineColor } from './ais';

export interface Wine {
  id?: number | null;
  nome: string;
  produttore: string;
  annata: number | null;
  grado: number | null;
  colore: WineColor | null;
  tipologia: string[];
  classificazione: string | null;
  regione: string | null;
  specifiche: string;
  vitigni: string;
  note: string;
}

export interface Effervescenza {
  grana: string | null;
  numero: string | null;
  persistenza: string | null;
}

export interface EsameVisivo {
  colore: string | null;
  riflessi: string | null;
  limpidezza: string | null;
  fluidita: string | null;
  spumante: boolean;
  effervescenza: Effervescenza;
}

export interface EsameOlfattivo {
  intensita: string | null;
  complessita: string | null;
  persistenza: string | null;
  qualita: string | null;
  famiglie: string[];
  primiProfumi: string;
  profumiEvoluzione: string;
}

export interface EsameGustativo {
  zuccheri: string | null;
  alcol: string | null;
  polialcoli: string | null;
  acidita: string | null;
  tannicita: string | null;
  saliMinerali: string | null;
  corpo: string | null;
  equilibrio: string | null;
  intensita: string | null;
  pai: string | null;
  qualita: string | null;
}

export interface ConsiderazioniFinali {
  armonia: string | null;
  statoEvolutivo: string | null;
}

export type Scores = Record<ScoreKey, number | null>;

export interface Tasting {
  id?: number | null;
  data: string; // yyyy-mm-dd
  note: string;
  visivo: EsameVisivo;
  olfattivo: EsameOlfattivo;
  gustativo: EsameGustativo;
  finale: ConsiderazioniFinali;
  punteggioAttivo: boolean;
  punteggi: Scores;
  totale: number | null;
}

/** Riga dell'elenco archivio (degustazione + dati principali del vino). */
export interface TastingListItem {
  id: number;
  data: string;
  totale: number | null;
  wine_id: number;
  nome: string;
  produttore: string;
  annata: number | null;
  colore: WineColor | null;
  colore_visivo: string | null;
}

export interface TastingRecord {
  wine: Wine;
  tasting: Tasting;
}

export function todayIso(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function emptyWine(): Wine {
  return {
    id: null, nome: '', produttore: '', annata: null, grado: null, colore: null,
    tipologia: [], classificazione: null, regione: null, specifiche: '', vitigni: '', note: '',
  };
}

export function emptyScores(): Scores {
  return Object.fromEntries(SCORE_ITEMS.map(i => [i.key, null])) as Scores;
}

export function emptyTasting(): Tasting {
  return {
    id: null,
    data: todayIso(),
    note: '',
    visivo: {
      colore: null, riflessi: null, limpidezza: null, fluidita: null, spumante: false,
      effervescenza: { grana: null, numero: null, persistenza: null },
    },
    olfattivo: {
      intensita: null, complessita: null, persistenza: null, qualita: null,
      famiglie: [], primiProfumi: '', profumiEvoluzione: '',
    },
    gustativo: {
      zuccheri: null, alcol: null, polialcoli: null, acidita: null, tannicita: null,
      saliMinerali: null, corpo: null, equilibrio: null, intensita: null, pai: null, qualita: null,
    },
    finale: { armonia: null, statoEvolutivo: null },
    punteggioAttivo: false,
    punteggi: emptyScores(),
    totale: null,
  };
}

/** Totale pesato (max 100). Restituisce null se nessuna voce è stata valutata. */
export function computeTotal(scores: Scores): number | null {
  let total = 0;
  let any = false;
  for (const item of SCORE_ITEMS) {
    const v = scores[item.key];
    if (v !== null && v !== undefined) {
      total += v * item.factor;
      any = true;
    }
  }
  return any ? Math.min(total, MAX_SCORE) : null;
}

export function hasWineDetails(w: Wine): boolean {
  return !!w.nome?.trim();
}
