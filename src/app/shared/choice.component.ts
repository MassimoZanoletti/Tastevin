import { Component, computed, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { GlassComponent } from './glass.component';

export interface ChoiceOption {
  label: string;
  value: string;
  hex?: string;
}

/**
 * Selezione a "chip" pensata per il tocco: singola (ritocca per deselezionare) o multipla.
 * Accetta un array di stringhe o di ChoiceOption. Con hex mostra il colore:
 * swatch="glass" (calice) oppure swatch="tile" (rettangolo grande con il nome sotto).
 */
@Component({
  selector: 'app-choice',
  imports: [GlassComponent],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ChoiceComponent), multi: true }],
  template: `
    @if (hasSwatch() && swatch() === 'tile') {
      <div class="tiles" role="listbox" [attr.aria-multiselectable]="multiple()">
        @for (o of opts(); track o.value) {
          <button type="button" class="tile" role="option"
                  [class.selected]="isSelected(o.value)" [attr.aria-selected]="isSelected(o.value)"
                  [disabled]="disabled()" (click)="toggle(o.value)">
            <span class="color" [style.background]="o.hex">
              @if (isSelected(o.value)) { <i class="pi pi-check"></i> }
            </span>
            <span class="name">{{ o.label }}</span>
          </button>
        }
      </div>
    } @else {
      <div class="chips" [class.with-swatch]="hasSwatch()" role="listbox" [attr.aria-multiselectable]="multiple()">
        @for (o of opts(); track o.value) {
          <button type="button" class="chip" role="option"
                  [class.selected]="isSelected(o.value)" [attr.aria-selected]="isSelected(o.value)"
                  [disabled]="disabled()" (click)="toggle(o.value)">
            @if (o.hex) { <app-glass [color]="o.hex" [size]="22" /> }
            <span>{{ o.label }}</span>
            @if (isSelected(o.value)) { <i class="pi pi-check"></i> }
          </button>
        }
      </div>
    }
  `,
  styles: `
    .chips { display: flex; flex-wrap: wrap; gap: .5rem; }
    .chips.with-swatch { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); }
    .chip {
      display: inline-flex; align-items: center; gap: .45rem;
      min-height: 2.5rem; padding: .4rem .85rem; border-radius: 1.25rem;
      border: 1px solid var(--p-content-border-color);
      background: var(--p-content-background); color: var(--p-text-color);
      font: inherit; font-size: .95rem; cursor: pointer; text-align: left;
      transition: background .15s, border-color .15s;
      -webkit-tap-highlight-color: transparent;
    }
    .with-swatch .chip { border-radius: .75rem; }
    .chip:hover:not(:disabled) { border-color: var(--p-primary-color); }
    .chip.selected {
      background: var(--p-primary-color); border-color: var(--p-primary-color);
      color: var(--p-primary-contrast-color);
    }
    .with-swatch .chip.selected {
      background: color-mix(in srgb, var(--p-primary-color) 16%, var(--p-content-background));
      color: var(--p-text-color); box-shadow: inset 0 0 0 1px var(--p-primary-color);
    }
    .with-swatch .chip.selected i { color: var(--p-primary-color); }
    .chip i { font-size: .8rem; margin-left: auto; }
    .chip:disabled { opacity: .6; cursor: default; }

    /* tessere colore: rettangolo grande + nome */
    .tiles { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: .6rem; }
    .tile {
      display: flex; flex-direction: column; padding: 0; overflow: hidden; cursor: pointer;
      border-radius: .75rem; border: 2px solid var(--p-content-border-color);
      background: var(--p-content-background); color: var(--p-text-color); font: inherit;
      -webkit-tap-highlight-color: transparent; transition: border-color .15s, transform .15s;
    }
    .tile .color {
      height: 3.5rem; display: grid; place-items: center;
      box-shadow: inset 0 -1px 0 rgba(0, 0, 0, .15);
    }
    .tile .color i {
      width: 1.8rem; height: 1.8rem; border-radius: 50%; display: grid; place-items: center;
      background: rgba(255, 255, 255, .9); color: #222; font-size: .9rem; font-weight: 700;
    }
    .tile .name { padding: .45rem .5rem; font-size: .92rem; text-align: center; }
    .tile:hover:not(:disabled) { border-color: var(--p-primary-color); }
    .tile.selected { border-color: var(--p-primary-color); transform: scale(1.02); }
    .tile.selected .name { font-weight: 700; color: var(--p-primary-color); }
    .tile:disabled { opacity: .6; cursor: default; }
  `,
})
export class ChoiceComponent implements ControlValueAccessor {
  options = input.required<(string | ChoiceOption)[]>();
  multiple = input(false);
  swatch = input<'glass' | 'tile'>('glass');

  protected value = signal<string | string[] | null>(null);
  protected disabled = signal(false);
  protected opts = computed<ChoiceOption[]>(() =>
    this.options().map(o => (typeof o === 'string' ? { label: o, value: o } : o)));
  protected hasSwatch = computed(() => this.opts().some(o => !!o.hex));

  private onChange: (v: unknown) => void = () => {};
  private onTouched: () => void = () => {};

  isSelected(v: string): boolean {
    const cur = this.value();
    return Array.isArray(cur) ? cur.includes(v) : cur === v;
  }

  toggle(v: string): void {
    let next: string | string[] | null;
    if (this.multiple()) {
      const cur = Array.isArray(this.value()) ? [...(this.value() as string[])] : [];
      next = cur.includes(v) ? cur.filter(x => x !== v) : [...cur, v];
    } else {
      next = this.value() === v ? null : v;
    }
    this.value.set(next);
    this.onChange(next);
    this.onTouched();
  }

  writeValue(v: string | string[] | null): void { this.value.set(v ?? (this.multiple() ? [] : null)); }
  registerOnChange(fn: (v: unknown) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(d: boolean): void { this.disabled.set(d); }
}
