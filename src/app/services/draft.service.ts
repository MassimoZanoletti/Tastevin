import { Injectable } from '@angular/core';
import { TastingRecord, emptyTasting, emptyWine } from '../models/tasting';

const KEY = 'tastevin.draft';

/** Unisce un oggetto parziale sui valori di default (utile per dati salvati con versioni precedenti). */
export function mergeDefaults<T>(defaults: T, value: unknown): T {
  if (value === null || value === undefined) return defaults;
  if (Array.isArray(defaults)) return (Array.isArray(value) ? value : defaults) as T;
  if (typeof defaults === 'object' && defaults !== null && typeof value === 'object') {
    const out: Record<string, unknown> = { ...(defaults as Record<string, unknown>) };
    for (const k of Object.keys(value as object)) {
      const dv = (defaults as Record<string, unknown>)[k];
      const vv = (value as Record<string, unknown>)[k];
      out[k] = k in out && dv !== null && typeof dv === 'object' ? mergeDefaults(dv, vv) : vv;
    }
    return out as T;
  }
  return value as T;
}

export function normalizeRecord(r: Partial<TastingRecord> | null | undefined): TastingRecord {
  return {
    wine: mergeDefaults(emptyWine(), r?.wine),
    tasting: mergeDefaults(emptyTasting(), r?.tasting),
  };
}

/** Degustazione in corso: tenuta in memoria e copiata nel browser per non perderla ricaricando. */
@Injectable({ providedIn: 'root' })
export class DraftService {
  step = 0; // dichiarato prima di record: load() lo imposta
  record: TastingRecord = this.load() ?? normalizeRecord(null);

  get hasDraft(): boolean {
    try { return localStorage.getItem(KEY) !== null; } catch { return false; }
  }

  reset(from?: Partial<TastingRecord>): void {
    this.record = normalizeRecord(from);
    this.step = 0;
    this.persist();
  }

  persist(): void {
    try {
      localStorage.setItem(KEY, JSON.stringify({ record: this.record, step: this.step }));
    } catch { /* storage non disponibile */ }
  }

  clear(): void {
    try { localStorage.removeItem(KEY); } catch { /* ignore */ }
    this.record = normalizeRecord(null);
    this.step = 0;
  }

  private load(): TastingRecord | null {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      this.step = parsed.step ?? 0;
      return normalizeRecord(parsed.record);
    } catch {
      return null;
    }
  }
}
