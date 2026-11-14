import { Component, Input, OnInit, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { startWith } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { formatBRL, parsePrice } from '../../core/money';
import { CATEGORY_LABEL, CATEGORY_ORDER, Service, ServiceCategory } from '../../core/models';
import { ToastService } from '../../core/toast.service';
import { UploadService } from '../../core/upload.service';
import { IconComponent } from '../../shared/icon.component';

const URL_PATTERN = /^https?:\/\/\S+$/i;

@Component({
  selector: 'app-service-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, IconComponent],
  templateUrl: './service-form.component.html',
  styleUrl: './service-form.component.scss',
})
export class ServiceFormComponent implements OnInit {
  /** Vem da rota /servicos/:id (vazio em /servicos/novo). */
  @Input() id?: string;

  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  private router = inject(Router);
  private toast = inject(ToastService);
  private uploader = inject(UploadService);

  readonly categories = CATEGORY_ORDER.map((value) => ({ value, label: CATEGORY_LABEL[value as ServiceCategory] }));
  readonly accept = this.uploader.accept;

  loading = signal(false);
  saving = signal(false);
  uploading = signal(false);
  progress = signal(0);
  uploadEnabled = signal(false);

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    category: ['lash' as ServiceCategory],
    price: ['', Validators.required],
    price_prefix: [''],
    description: [''],
    image_url: ['', Validators.pattern(URL_PATTERN)],
    is_active: [true],
    highlight: [false],
    hero_label: [''],
  });

  private value = toSignal(this.form.valueChanges.pipe(startWith(this.form.getRawValue())), { initialValue: this.form.getRawValue() });
  preview = computed(() => {
    this.value();
    const v = this.form.getRawValue();
    const price = parsePrice(v.price);
    return { ...v, priceText: price ? formatBRL(price) : 'R$ 0,00' };
  });
  isEdit = computed(() => !!this.id);

  ngOnInit(): void {
    this.api.uploadSignature().subscribe({
      next: (sig) => this.uploadEnabled.set(sig.enabled),
      error: () => this.uploadEnabled.set(false),
    });
    if (!this.id) return;
    this.loading.set(true);
    this.api.service(Number(this.id)).subscribe({
      next: (s) => {
        this.patch(s);
        this.loading.set(false);
      },
      error: () => {
        this.toast.error('Serviço não encontrado.');
        this.router.navigate(['/servicos']);
      },
    });
  }

  invalid(path: string): boolean {
    const c = this.form.get(path);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  priceInvalid(): boolean {
    const c = this.form.controls.price;
    return (c.touched || c.dirty) && !parsePrice(c.value);
  }

  onFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    this.uploading.set(true);
    this.progress.set(0);
    this.uploader.upload(file).subscribe({
      next: (e) => {
        this.progress.set(e.progress);
        if (e.url) {
          this.form.patchValue({ image_url: e.url });
          this.form.markAsDirty();
          this.toast.ok('Foto enviada.');
        }
      },
      error: (err: Error) => {
        this.uploading.set(false);
        this.toast.error(err.message || 'Não foi possível enviar a foto.');
      },
      complete: () => this.uploading.set(false),
    });
  }

  removeImage(): void {
    this.form.patchValue({ image_url: '' });
  }

  save(): void {
    const price = parsePrice(this.form.controls.price.value);
    if (this.form.invalid || !price) {
      this.form.markAllAsTouched();
      this.toast.error('Revise os campos destacados.');
      return;
    }
    const raw = this.form.getRawValue();
    const payload: Partial<Service> = { ...raw, price, hero_label: raw.highlight ? raw.hero_label : '' };

    this.saving.set(true);
    const call = this.id ? this.api.updateService(Number(this.id), payload) : this.api.createService(payload);
    call.subscribe({
      next: () => {
        this.toast.ok(this.id ? 'Serviço atualizado.' : 'Serviço criado.');
        this.router.navigate(['/servicos']);
      },
      error: (err) => {
        this.saving.set(false);
        const detail = err?.error && typeof err.error === 'object' ? Object.values(err.error).flat()[0] : null;
        this.toast.error(typeof detail === 'string' ? detail : 'Não foi possível salvar.');
      },
    });
  }

  private patch(s: Service): void {
    this.form.patchValue({
      name: s.name,
      category: s.category,
      price: String(Number(s.price)).replace('.', ','),
      price_prefix: s.price_prefix,
      description: s.description,
      image_url: s.image_url,
      is_active: s.is_active,
      highlight: s.highlight,
      hero_label: s.hero_label,
    });
  }
}
