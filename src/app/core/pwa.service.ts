import { Injectable, NgZone, inject, signal } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs';

interface InstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/** Instalação do app, aviso de nova versão e estado offline. */
@Injectable({ providedIn: 'root' })
export class PwaService {
  private zone = inject(NgZone);
  private updates = inject(SwUpdate, { optional: true });
  private deferred: InstallPromptEvent | null = null;

  readonly canInstall = signal(false);
  readonly updateReady = signal(false);
  readonly online = signal(typeof navigator === 'undefined' ? true : navigator.onLine);

  constructor() {
    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      this.deferred = event as InstallPromptEvent;
      this.zone.run(() => this.canInstall.set(true));
    });
    window.addEventListener('appinstalled', () => this.zone.run(() => this.canInstall.set(false)));
    window.addEventListener('online', () => this.zone.run(() => this.online.set(true)));
    window.addEventListener('offline', () => this.zone.run(() => this.online.set(false)));

    this.updates?.versionUpdates
      .pipe(filter((e): e is VersionReadyEvent => e.type === 'VERSION_READY'))
      .subscribe(() => this.updateReady.set(true));
  }

  async install(): Promise<void> {
    if (!this.deferred) return;
    await this.deferred.prompt();
    await this.deferred.userChoice;
    this.deferred = null;
    this.canInstall.set(false);
  }

  reload(): void {
    location.reload();
  }
}
