import { Component, Input } from '@angular/core';

const PATHS: Record<string, string> = {
  dashboard: 'M4 13h7V4H4v9Zm0 7h7v-5H4v5Zm9 0h7V11h-7v9Zm0-16v5h7V4h-7Z',
  campaigns: 'M3 11v2a1 1 0 0 0 1 1h2l4 4V6L6 10H4a1 1 0 0 0-1 1Zm13-1.5a4 4 0 0 1 0 5M18.5 7a7.5 7.5 0 0 1 0 10',
  audit: 'M12 8v5l3 2m6-3a9 9 0 1 1-3-6.7M21 4v4h-4',
  logout: 'M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 16l-4-4 4-4M6 12h10',
  plus: 'M12 5v14M5 12h14',
  play: 'M7 5v14l12-7L7 5Z',
  pause: 'M8 5v14M16 5v14',
  edit: 'M4 20h4L19 9l-4-4L4 16v4ZM14 6l4 4',
  trash: 'M5 7h14M10 11v6M14 11v6M6 7l1 12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-12M9 7V4h6v3',
  download: 'M12 4v11m0 0-4-4m4 4 4-4M5 20h14',
  eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  cursor: 'M5 3l14 7-6 2-2 6L5 3Z',
  users: 'M16 20v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1m13-9a3 3 0 1 0 0-6m5 15v-1a4 4 0 0 0-3-3.9M9.5 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  percent: 'M19 5 5 19M7.5 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm9 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z',
  back: 'M15 6l-6 6 6 6',
  offline: 'M3 3l18 18M8.5 8.5A7 7 0 0 0 5 12m3 3a4 4 0 0 1 3-1.7M12 19h.01M16 11a7 7 0 0 1 3 1',
  refresh: 'M20 12a8 8 0 1 1-2.3-5.7M20 4v5h-5',
};

@Component({
  selector: 'app-icon',
  standalone: true,
  template: `
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path [attr.d]="path" />
    </svg>
  `,
  styles: `
    :host { display: inline-flex; width: 1.25em; height: 1.25em; flex: none; }
    svg { width: 100%; height: 100%; }
  `,
})
export class IconComponent {
  @Input({ required: true }) name!: string;

  get path(): string {
    return PATHS[this.name] ?? '';
  }
}
