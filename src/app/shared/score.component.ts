import { Component, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { SCORE_LABELS } from '../models/ais';

/** Punteggio AIS 0–4 con fattore di moltiplicazione. */
@Component({
  selector: 'app-score',
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ScoreComponent), multi: true }],
  template: `
    <div class="score">
      <div class="head">
        <span class="title"><i class="pi pi-star"></i> Punteggio <small>(× {{ factor() }})</small></span>
        <span class="val">
          @if (value() !== null) { {{ labels[value()!] }} · <b>{{ value()! * factor() }}</b> pt }
          @else { non valutato }
        </span>
      </div>
      <div class="btns">
        @for (l of labels; track $index) {
          <button type="button" [class.on]="value() === $index" (click)="set($index)" [attr.aria-label]="l">
            {{ $index }}
          </button>
        }
      </div>
    </div>
  `,
  styles: `
    .score {
      margin-top: .6rem; padding: .6rem .75rem; border-radius: .75rem;
      background: color-mix(in srgb, var(--p-primary-color) 7%, transparent);
    }
    .head { display: flex; justify-content: space-between; gap: .5rem; font-size: .85rem; margin-bottom: .45rem; flex-wrap: wrap; }
    .title { font-weight: 600; color: var(--p-primary-color); }
    .title small { font-weight: 400; color: var(--p-text-muted-color); }
    .val { color: var(--p-text-muted-color); }
    .btns { display: grid; grid-template-columns: repeat(5, 1fr); gap: .35rem; }
    button {
      height: 2.4rem; border-radius: .5rem; border: 1px solid var(--p-content-border-color);
      background: var(--p-content-background); color: var(--p-text-color);
      font: inherit; font-weight: 600; cursor: pointer; -webkit-tap-highlight-color: transparent;
    }
    button.on { background: var(--p-primary-color); border-color: var(--p-primary-color); color: var(--p-primary-contrast-color); }
  `,
})
export class ScoreComponent implements ControlValueAccessor {
  factor = input(1);
  protected labels = SCORE_LABELS;
  protected value = signal<number | null>(null);
  private onChange: (v: number | null) => void = () => {};

  set(i: number): void {
    const next = this.value() === i ? null : i;
    this.value.set(next);
    this.onChange(next);
  }

  writeValue(v: number | null): void { this.value.set(v ?? null); }
  registerOnChange(fn: (v: number | null) => void): void { this.onChange = fn; }
  registerOnTouched(): void {}
}
