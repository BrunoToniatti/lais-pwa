import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { AUDIENCE_LABEL, Campaign, CampaignStatus, STATUS_LABEL } from '../../core/models';
import { ToastService } from '../../core/toast.service';
import { IconComponent } from '../../shared/icon.component';

@Component({
  selector: 'app-campaign-list',
  standalone: true,
  imports: [RouterLink, DatePipe, IconComponent],
  templateUrl: './campaign-list.component.html',
  styleUrl: './campaign-list.component.scss',
})
export class CampaignListComponent {
  private api = inject(ApiService);
  private toast = inject(ToastService);

  readonly statusLabel = STATUS_LABEL;
  readonly audienceLabel = AUDIENCE_LABEL;
  readonly filters: { value: '' | CampaignStatus; label: string }[] = [
    { value: '', label: 'Todas' },
    { value: 'active', label: 'Ativas' },
    { value: 'draft', label: 'Rascunhos' },
    { value: 'paused', label: 'Pausadas' },
    { value: 'ended', label: 'Encerradas' },
  ];

  filter = signal<'' | CampaignStatus>('');
  items = signal<Campaign[]>([]);
  loading = signal(true);
  error = signal(false);
  busy = signal<number | null>(null);
  confirming = signal<number | null>(null);
  empty = computed(() => !this.loading() && !this.error() && this.items().length === 0);

  constructor() {
    this.load();
  }

  setFilter(value: '' | CampaignStatus): void {
    this.filter.set(value);
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(false);
    this.api.campaigns(this.filter() || undefined).subscribe({
      next: (page) => {
        this.items.set(page.results);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }

  toggle(c: Campaign): void {
    this.busy.set(c.id);
    const call = c.status === 'active' ? this.api.pause(c.id) : this.api.activate(c.id);
    call.subscribe({
      next: (updated) => {
        this.items.update((list) => list.map((x) => (x.id === c.id ? updated : x)));
        this.busy.set(null);
        this.toast.ok(updated.status === 'active' ? 'Campanha ativada.' : 'Campanha pausada.');
      },
      error: () => {
        this.busy.set(null);
        this.toast.error('Não foi possível alterar a campanha.');
      },
    });
  }

  remove(c: Campaign): void {
    if (this.confirming() !== c.id) {
      this.confirming.set(c.id);
      setTimeout(() => this.confirming() === c.id && this.confirming.set(null), 4000);
      return;
    }
    this.api.deleteCampaign(c.id).subscribe({
      next: () => {
        this.items.update((list) => list.filter((x) => x.id !== c.id));
        this.confirming.set(null);
        this.toast.ok('Campanha excluída.');
      },
      error: () => this.toast.error('Não foi possível excluir.'),
    });
  }
}
