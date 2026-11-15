import { Component, Input, OnInit, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { startWith } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { Audience, Campaign, CampaignKind, CampaignStatus, Frequency, TickerSpeed, TickerTheme } from '../../core/models';
import { ToastService } from '../../core/toast.service';
import { IconComponent } from '../../shared/icon.component';

const URL_PATTERN = /^https?:\/\/\S+$/i;
const MAX_MESSAGES = 6;
const MAX_LENGTH = 80;
// segundos de rolagem por caractere: o letreiro nunca passa rápido demais para ler
const SECONDS_PER_CHAR: Record<TickerSpeed, number> = { slow: 0.5, normal: 0.35, fast: 0.24 };

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

  readonly kinds: { value: CampaignKind; label: string; hint: string }[] = [
    { value: 'modal', label: 'Modal', hint: 'Janela com título, texto e botão' },
    { value: 'ticker', label: 'Letreiro', hint: 'Faixa no topo com frases que passam' },
  ];
  readonly speeds: { value: TickerSpeed; label: string }[] = [
    { value: 'slow', label: 'Lenta' },
    { value: 'normal', label: 'Normal' },
    { value: 'fast', label: 'Rápida' },
  ];
  readonly themes: { value: TickerTheme; label: string }[] = [
    { value: 'gold', label: 'Dourado' },
    { value: 'dark', label: 'Escuro' },
  ];

  form = this.fb.nonNullable.group({
    kind: ['modal' as CampaignKind],
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
    ticker: this.fb.nonNullable.group({
      messages: this.fb.array([this.newMessage()]),
      speed: ['normal' as TickerSpeed],
      theme: ['gold' as TickerTheme],
      pages: ['/', pagesValidator],
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
  isTicker = computed(() => (this.value().kind ?? 'modal') === 'ticker');

  get messages(): FormArray {
    return this.form.controls.ticker.controls.messages as FormArray;
  }

  /** Letreiro como o visitante verá: só frases preenchidas, com velocidade proporcional ao texto. */
  tickerPreview = computed(() => {
    this.value();
    const t = this.form.controls.ticker.getRawValue();
    const texts = (t.messages as { text: string }[]).map((m) => m.text.trim()).filter(Boolean);
    const chars = texts.join('').length + texts.length * 4;
    return { texts, theme: t.theme, seconds: Math.max(14, Math.round(chars * SECONDS_PER_CHAR[t.speed])) };
  });

  constructor() {
    this.form.controls.kind.valueChanges.subscribe((kind) => this.applyKind(kind));
    this.applyKind('modal');
  }

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

  newMessage(text = '', url = ''): FormGroup {
    return this.fb.nonNullable.group({
      text: [text, [Validators.required, Validators.maxLength(MAX_LENGTH)]],
      url: [url, Validators.pattern(URL_PATTERN)],
    });
  }

  addMessage(): void {
    if (this.messages.length < MAX_MESSAGES) this.messages.push(this.newMessage());
  }

  removeMessage(index: number): void {
    if (this.messages.length > 1) this.messages.removeAt(index);
  }

  canAddMessage(): boolean {
    return this.messages.length < MAX_MESSAGES;
  }

  messageInvalid(index: number, field: 'text' | 'url'): boolean {
    const c = this.messages.at(index).get(field);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  /** Só o conteúdo do tipo escolhido é validado e enviado. */
  private applyKind(kind: CampaignKind): void {
    const modal = this.form.controls.modal;
    const ticker = this.form.controls.ticker;
    if (kind === 'ticker') {
      modal.disable({ emitEvent: false });
      ticker.enable({ emitEvent: false });
    } else {
      ticker.disable({ emitEvent: false });
      modal.enable({ emitEvent: false });
    }
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
    const splitPages = (text: string) => text.split(/[\n,]/).map((x) => x.trim()).filter(Boolean);
    const { modal, ticker, ...common } = raw;
    const payload =
      raw.kind === 'ticker'
        ? {
            ...common,
            starts_at: fromLocalInput(raw.starts_at),
            ends_at: fromLocalInput(raw.ends_at),
            modal: null,
            ticker: {
              speed: ticker.speed,
              theme: ticker.theme,
              pages: splitPages(ticker.pages),
              messages: (ticker.messages as { text: string; url: string }[]).map((m) => ({ text: m.text.trim(), url: m.url.trim() })),
            },
          }
        : {
            ...common,
            starts_at: fromLocalInput(raw.starts_at),
            ends_at: fromLocalInput(raw.ends_at),
            modal: { ...modal, pages: splitPages(modal.pages) },
            ticker: null,
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
    if (c.ticker) {
      this.messages.clear();
      c.ticker.messages.forEach((m) => this.messages.push(this.newMessage(m.text, m.url)));
    }
    this.form.patchValue({
      kind: c.kind,
      name: c.name,
      description: c.description,
      status: c.status,
      audience: c.audience,
      priority: c.priority,
      starts_at: toLocalInput(c.starts_at),
      ends_at: toLocalInput(c.ends_at),
      modal: c.modal ? { ...c.modal, pages: c.modal.pages.join('\n') } : undefined,
      ticker: c.ticker ? { speed: c.ticker.speed, theme: c.ticker.theme, pages: c.ticker.pages.join('\n') } : undefined,
    });
    this.applyKind(c.kind);
    this.form.controls.kind.disable({ emitEvent: false }); // o tipo não muda depois de criada
  }
}
