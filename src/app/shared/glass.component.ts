import { Component, input } from '@angular/core';

/** Calice stilizzato riempito con il colore del vino. */
@Component({
  selector: 'app-glass',
  template: `
    <svg [attr.width]="size()" [attr.height]="size() * 1.4" viewBox="0 0 40 56" aria-hidden="true">
      <path d="M8 3 H32 C33 14 32 24 20 29 C8 24 7 14 8 3 Z" class="bowl" />
      <path d="M9.2 12 H30.8 C31 20 29 25 20 28.6 C11 25 9 20 9.2 12 Z" [attr.fill]="color() || 'transparent'" />
      <path d="M12 13 C12 18 13 21 15.5 23" class="shine" />
      <line x1="20" y1="29" x2="20" y2="49" class="stem" />
      <ellipse cx="20" cy="51" rx="10" ry="2.6" class="foot" />
    </svg>
  `,
  styles: `
    :host { display: inline-flex; flex-shrink: 0; }
    .bowl { fill: rgba(255,255,255,.35); stroke: var(--p-text-muted-color); stroke-width: 1.4; }
    .stem { stroke: var(--p-text-muted-color); stroke-width: 1.6; stroke-linecap: round; }
    .foot { fill: none; stroke: var(--p-text-muted-color); stroke-width: 1.4; }
    .shine { fill: none; stroke: rgba(255,255,255,.7); stroke-width: 1.2; stroke-linecap: round; }
  `,
})
export class GlassComponent {
  color = input<string | null>(null);
  size = input(28);
}
