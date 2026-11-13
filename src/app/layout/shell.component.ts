import { animate, query, style, transition, trigger } from '@angular/animations';
import { Component, inject } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { AuthService } from '../core/auth.service';
import { PwaService } from '../core/pwa.service';
import { ToastService } from '../core/toast.service';
import { IconComponent } from '../shared/icon.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, IconComponent],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
  animations: [
    trigger('page', [
      transition('* <=> *', [
        query(':leave', style({ display: 'none' }), { optional: true }),
        query(
          ':enter',
          [
            style({ opacity: 0, transform: 'translateY(14px)' }),
            animate('420ms cubic-bezier(0.22, 1, 0.36, 1)', style({ opacity: 1, transform: 'none' })),
          ],
          { optional: true },
        ),
      ]),
    ]),
  ],
})
export class ShellComponent {
  auth = inject(AuthService);
  pwa = inject(PwaService);
  toast = inject(ToastService);
  private router = inject(Router);

  readonly nav = [
    { path: '/painel', label: 'Painel', icon: 'dashboard' },
    { path: '/campanhas', label: 'Campanhas', icon: 'campaigns' },
    { path: '/historico', label: 'Histórico', icon: 'audit' },
  ];

  /** Muda a cada seção, disparando a animação de página. */
  section = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects.split('/')[1] ?? ''),
    ),
    { initialValue: '' },
  );
}
