import { Component, Input, OnInit, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { startWith } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { Audience, Campaign, CampaignStatus, Frequency } from '../../core/models';
import { ToastService } from '../../core/toast.service';
import { IconComponent } from '../../shared/icon.component';

const URL_PATTERN = /^https?:\/\/\S+$/i;

const pagesValidator = (control: AbstractControl): ValidationErrors | null => {
  const lines = String(control.value ?? '').split(/[\n,]/).map((s) => s.trim()).filter(Boolean);
  return lines.every((p) => p.startsWith('/')) ? null : { pages: true };
};

/** ISO -> valor do <input type="datetime-local"> (horário local). */
const toLocalInput = (iso: string | null): string => {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const fromLocalInput = (value: string): string | null => (value ? new Date(value).toISOString() : null);

@Component({
  selector: 'app-campaign-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, IconComponent],
  templateUrl: './campaign-form.component.html',
  styleUrl: './campaign-form.component.scss',
})
export class CampaignFormComponent implements OnInit {
  /** Vem da rota /campanhas/:id (vazio em /campanhas/nova). */
  @Input() id?: string;

  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  private router = inject(Router);
  private toast = inject(ToastService);

  saving = signal(false);
  loading = signal(false);
  device = signal<'mobile' | 'desktop'>('mobile');

  readonly statuses: { value: CampaignStatus; label: string }[] = [
    { value: 'draft', label: 'Rascunho' },
    { value: 'active', label: 'Ativa' },
    { value: 'paused', label: 'Pausada' },
    { value: 'ended', label: 'Encerrada' },
  ];
  readonly audiences: { value: Audience; label: string }[] = [
    { value: 'all', label: 'Todos os visitantes' },
    { value: 'new', label: 'Primeira visita' },
    { value: 'returning', label: 'Visitantes recorrentes' },
  ];
  readonly frequencies: { value: Frequency; label: string }[] = [
    { value: 'always', label: 'Sempre' },
    { value: 'session', label: 'Uma vez por sessão' },
    { value: 'day', label: 'Uma vez por dia' },
    { value: 'once', label: 'Uma única vez' },
  ];

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    description: [''],
    status: ['draft' as CampaignStatus],
    audience: ['all' as Audience],
    priority: [100, [Validators.min(0), Validators.max(65535)]],
    starts_at: [''],
    ends_at: [''],
    modal: this.fb.nonNullable.group({
      title: ['', [Validators.required, Validators.maxLength(120)]],
      body: [''],
      image_url: ['', Validators.pattern(URL_PATTERN)],
      cta_label: ['Quero aproveitar', [Validators.required, Validators.maxLength(60)]],
      cta_url: ['', Validators.pattern(URL_PATTERN)],
      delay_seconds: [5, [Validators.min(0), Validators.max(600)]],
      pages: ['/', pagesValidator],
      frequency: ['day' as Frequency],
    }),
  });

  private value = toSignal(this.form.valueChanges.pipe(startWith(this.form.getRawValue())), {
    initialValue: this.form.getRawValue(),
  });
  preview = computed(() => {
    this.value(); // reage a qualquer mudança do formulário
    return this.form.controls.modal.getRawValue();
  });
  isEdit = computed(() => !!this.id);

  ngOnInit(): void {
    if (!this.id) return;
    this.loading.set(true);
    this.api.campaign(Number(this.id)).subscribe({
      next: (c) => {
        this.patch(c);
        this.loading.set(false);
      },
      error: () => {
        this.toast.error('Campanha não encontrada.');
        this.router.navigate(['/campanhas']);
      },
    });
  }

  invalid(path: string): boolean {
    const c = this.form.get(path);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.error('Revise os campos destacados.');
      return;
    }
    const raw = this.form.getRawValue();
    const payload = {
      ...raw,
      starts_at: fromLocalInput(raw.starts_at),
      ends_at: fromLocalInput(raw.ends_at),
      modal: {
        ...raw.modal,
        pages: raw.modal.pages.split(/[\n,]/).map((s) => s.trim()).filter(Boolean),
      },
    };

    this.saving.set(true);
    const call = this.id ? this.api.updateCampaign(Number(this.id), payload) : this.api.createCampaign(payload);
    call.subscribe({
      next: () => {
        this.toast.ok(this.id ? 'Campanha atualizada.' : 'Campanha criada.');
        this.router.navigate(['/campanhas']);
      },
      error: (err) => {
        this.saving.set(false);
        const detail = err?.error && typeof err.error === 'object' ? Object.values(err.error).flat()[0] : null;
        this.toast.error(typeof detail === 'string' ? detail : 'Não foi possível salvar.');
      },
    });
  }

  private patch(c: Campaign): void {
    this.form.patchValue({
      name: c.name,
      description: c.description,
      status: c.status,
      audience: c.audience,
      priority: c.priority,
      starts_at: toLocalInput(c.starts_at),
      ends_at: toLocalInput(c.ends_at),
      modal: c.modal ? { ...c.modal, pages: c.modal.pages.join('\n') } : undefined,
    });
  }
}
