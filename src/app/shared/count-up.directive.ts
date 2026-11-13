import { Directive, ElementRef, Input, OnChanges, inject } from '@angular/core';

/** Anima o número de 0 (ou do valor anterior) até o novo valor. */
@Directive({ selector: '[appCountUp]', standalone: true })
export class CountUpDirective implements OnChanges {
  @Input('appCountUp') value = 0;
  @Input() decimals = 0;
  @Input() suffix = '';

  private el = inject<ElementRef<HTMLElement>>(ElementRef);
  private current = 0;
  private frame = 0;

  ngOnChanges(): void {
    cancelAnimationFrame(this.frame);
    const from = this.current;
    const to = Number(this.value) || 0;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || from === to) {
      this.render(to);
      return;
    }

    const start = performance.now();
    const duration = 900;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      this.render(from + (to - from) * eased);
      if (t < 1) this.frame = requestAnimationFrame(tick);
    };
    this.frame = requestAnimationFrame(tick);
  }

  private render(n: number): void {
    this.current = n;
    this.el.nativeElement.textContent =
      n.toLocaleString('pt-BR', { minimumFractionDigits: this.decimals, maximumFractionDigits: this.decimals }) +
      this.suffix;
  }
}
