import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ApiService } from '../../core/api.service';
import { AuditEntry } from '../../core/models';
import { IconComponent } from '../../shared/icon.component';

const MODEL_LABEL: Record<string, string> = { 'campaigns.Campaign': 'a campanha', 'campaigns.Modal': 'o modal' };
const VERB: Record<string, string> = { create: 'criou', update: 'alterou', delete: 'excluiu' };

@Component({
  selector: 'app-audit',
  standalone: true,
  imports: [DatePipe, IconComponent],
  templateUrl: './audit.component.html',
  styleUrl: './audit.component.scss',
})
export class AuditComponent {
  private api = inject(ApiService);

  entries = signal<AuditEntry[]>([]);
  loading = signal(true);
  error = signal(false);
  hasMore = signal(false);
  private page = 1;
  empty = computed(() => !this.loading() && !this.error() && this.entries().length === 0);

  constructor() {
    this.load();
  }

  load(more = false): void {
    this.loading.set(true);
    this.error.set(false);
    this.page = more ? this.page + 1 : 1;
    this.api.audit(this.page).subscribe({
      next: (res) => {
        this.entries.update((list) => (more ? [...list, ...res.results] : res.results));
        this.hasMore.set(!!res.next);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }

  sentence(e: AuditEntry): string {
    return `${VERB[e.action] ?? e.action} ${MODEL_LABEL[e.model] ?? e.model}`;
  }

  diff(e: AuditEntry): { field: string; from: string; to: string }[] {
    if (e.action !== 'update') return [];
    return Object.entries(e.changes).map(([field, v]) => {
      const change = v as { from: unknown; to: unknown };
      return { field, from: this.show(change.from), to: this.show(change.to) };
    });
  }

  private show(value: unknown): string {
    return value === null || value === '' ? 'vazio' : String(value);
  }
}
