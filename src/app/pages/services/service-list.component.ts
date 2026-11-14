import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { formatBRL, parsePrice } from '../../core/money';
import { CATEGORY_LABEL, CATEGORY_ORDER, Service, ServiceCategory } from '../../core/models';
import { ToastService } from '../../core/toast.service';
import { IconComponent } from '../../shared/icon.component';

@Component({
  selector: 'app-service-list',
  standalone: true,
  imports: [RouterLink, IconComponent],
  templateUrl: './service-list.component.html',
  styleUrl: './service-list.component.scss',
})
export class ServiceListComponent {
  private api = inject(ApiService);
  private toast = inject(ToastService);

  readonly money = formatBRL;
  items = signal<Service[]>([]);
  loading = signal(true);
  error = signal(false);

  editingId = signal<number | null>(null);
  draft = signal('');
  confirming = signal<number | null>(null);

  groups = computed(() =>
    CATEGORY_ORDER.map((category) => ({
      category,
      label: CATEGORY_LABEL[category],
      services: this.items().filter((s) => s.category === category).sort((a, b) => a.position - b.position || a.id - b.id),
    })).filter((g) => g.services.length),
  );

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(false);
    this.api.services().subscribe({
      next: (list) => {
        this.items.set(list);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }

  // ---- preço: edição rápida direto na lista ----
  editPrice(s: Service): void {
    this.editingId.set(s.id);
    this.draft.set(String(Number(s.price)).replace('.', ','));
  }

  savePrice(s: Service): void {
    const price = parsePrice(this.draft());
    if (!price) {
      this.toast.error('Digite um valor válido, como 135 ou 135,50.');
      return;
    }
    if (price === s.price) {
      this.editingId.set(null);
      return;
    }
    this.api.updateService(s.id, { price }).subscribe({
      next: (updated) => {
        this.replace(updated);
        this.editingId.set(null);
        this.toast.ok(`${s.name}: ${formatBRL(updated.price)}`);
      },
      error: () => this.toast.error('Não foi possível salvar o preço.'),
    });
  }

  cancelPrice(): void {
    this.editingId.set(null);
  }

  // ---- visibilidade, ordem e exclusão ----
  toggleActive(s: Service): void {
    this.api.updateService(s.id, { is_active: !s.is_active }).subscribe({
      next: (updated) => {
        this.replace(updated);
        this.toast.ok(updated.is_active ? 'Serviço visível no site.' : 'Serviço escondido do site.');
      },
      error: () => this.toast.error('Não foi possível alterar.'),
    });
  }

  move(category: ServiceCategory, s: Service, direction: -1 | 1): void {
    const group = this.groups().find((g) => g.category === category)!.services;
    const from = group.findIndex((x) => x.id === s.id);
    const to = from + direction;
    if (to < 0 || to >= group.length) return;

    const ids = group.map((x) => x.id);
    [ids[from], ids[to]] = [ids[to], ids[from]];
    const previous = this.items();
    this.items.update((list) => list.map((x) => (ids.includes(x.id) ? { ...x, position: ids.indexOf(x.id) + 1 } : x)));
    this.api.reorderServices(ids).subscribe({
      error: () => {
        this.items.set(previous);
        this.toast.error('Não foi possível mudar a ordem.');
      },
    });
  }

  remove(s: Service): void {
    if (this.confirming() !== s.id) {
      this.confirming.set(s.id);
      setTimeout(() => this.confirming() === s.id && this.confirming.set(null), 4000);
      return;
    }
    this.api.deleteService(s.id).subscribe({
      next: () => {
        this.items.update((list) => list.filter((x) => x.id !== s.id));
        this.confirming.set(null);
        this.toast.ok('Serviço excluído.');
      },
      error: () => this.toast.error('Não foi possível excluir.'),
    });
  }

  private replace(updated: Service): void {
    this.items.update((list) => list.map((x) => (x.id === updated.id ? updated : x)));
  }
}
