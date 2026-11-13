import { Component, computed, inject, signal } from '@angular/core';
import { ApiService } from '../../core/api.service';
import { DashboardSummary } from '../../core/models';
import { CountUpDirective } from '../../shared/count-up.directive';
import { IconComponent } from '../../shared/icon.component';

const W = 640;
const H = 220;
const fmt = (iso: string) => iso.split('-').reverse().slice(0, 2).join('/');
const PAD = { top: 16, right: 12, bottom: 26, left: 12 };

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CountUpDirective, IconComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  private api = inject(ApiService);

  readonly periods = [7, 30, 90];
  readonly W = W;
  readonly H = H;

  days = signal(30);
  data = signal<DashboardSummary | null>(null);
  loading = signal(true);
  error = signal(false);

  kpis = computed(() => {
    const d = this.data();
    return [
      { label: 'Campanhas ativas', value: d?.active_campaigns ?? 0, icon: 'campaigns', decimals: 0, suffix: '' },
      { label: 'Exibições', value: d?.impressions ?? 0, icon: 'eye', decimals: 0, suffix: '' },
      { label: 'Cliques', value: d?.clicks ?? 0, icon: 'cursor', decimals: 0, suffix: '' },
      { label: 'Taxa de clique', value: d?.ctr ?? 0, icon: 'percent', decimals: 1, suffix: '%' },
    ];
  });

  hasEvents = computed(() => (this.data()?.impressions ?? 0) + (this.data()?.clicks ?? 0) > 0);

  chart = computed(() => {
    const series = this.data()?.series ?? [];
    if (!series.length) return null;
    const max = Math.max(1, ...series.map((s) => s.impressions), ...series.map((s) => s.clicks));
    const x = (i: number) => PAD.left + (series.length === 1 ? (W - PAD.left - PAD.right) / 2 : (i / (series.length - 1)) * (W - PAD.left - PAD.right));
    const y = (v: number) => PAD.top + (1 - v / max) * (H - PAD.top - PAD.bottom);
    const line = (key: 'impressions' | 'clicks') =>
      series.map((s, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(s[key]).toFixed(1)}`).join(' ');
    const base = H - PAD.bottom;
    const first = series[0], last = series[series.length - 1];
    return {
      impressions: line('impressions'),
      clicks: line('clicks'),
      area: `${line('impressions')} L${x(series.length - 1).toFixed(1)},${base} L${x(0).toFixed(1)},${base} Z`,
      points: series.map((s, i) => ({ x: x(i), y: y(s.clicks) })),
      from: fmt(first.day),
      to: fmt(last.day),
      max,
    };
  });

  constructor() {
    this.load();
  }

  setPeriod(days: number): void {
    this.days.set(days);
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(false);
    this.api.summary(this.days()).subscribe({
      next: (data) => {
        this.data.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }
}
