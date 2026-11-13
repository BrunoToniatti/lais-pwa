import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

interface Tokens {
  access: string;
  refresh: string;
}

const STORAGE_KEY = 'lais.session';

/**
 * Sessão do administrador. Os tokens vêm do backend (JWT de curta duração);
 * não existe nenhum token ou senha fixa no código.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private tokens = signal<Tokens | null>(this.read());
  readonly isLoggedIn = computed(() => this.tokens() !== null);
  readonly username = signal<string>(localStorage.getItem('lais.user') ?? '');

  get accessToken(): string | null {
    return this.tokens()?.access ?? null;
  }

  login(username: string, password: string): Observable<Tokens> {
    return this.http.post<Tokens>(`${environment.apiUrl}/auth/login/`, { username, password }).pipe(
      tap((tokens) => {
        this.store(tokens);
        this.username.set(username);
        localStorage.setItem('lais.user', username);
      }),
    );
  }

  refresh(): Observable<Tokens> {
    const refresh = this.tokens()?.refresh;
    return this.http
      .post<Tokens>(`${environment.apiUrl}/auth/refresh/`, { refresh })
      .pipe(tap((tokens) => this.store({ access: tokens.access, refresh: tokens.refresh ?? refresh! })));
  }

  logout(): void {
    this.tokens.set(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('lais.user');
    this.router.navigate(['/login']);
  }

  private store(tokens: Tokens): void {
    this.tokens.set(tokens);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
  }

  private read(): Tokens | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Tokens) : null;
    } catch {
      return null;
    }
  }
}
