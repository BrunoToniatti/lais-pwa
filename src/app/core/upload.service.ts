import { HttpClient, HttpEventType } from '@angular/common/http';
import { Injectable, NgZone, inject } from '@angular/core';
import { Observable, filter, map, switchMap, throwError } from 'rxjs';
import { ApiService } from './api.service';

const MAX_SIZE = 1600;
const MAX_FILE_MB = 20;
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Envia fotos direto do navegador para o Cloudinary, com o envio assinado pelo nosso backend.
 * Antes de enviar, reduz a foto (celular gera arquivos enormes), o que acelera o upload e o site.
 */
@Injectable({ providedIn: 'root' })
export class UploadService {
  private http = inject(HttpClient);
  private api = inject(ApiService);
  private zone = inject(NgZone);

  readonly accept = ACCEPTED.join(',');

  /** Emite o progresso (0 a 100) e, no fim, a URL final da imagem. */
  upload(file: File): Observable<{ progress: number; url?: string }> {
    if (!ACCEPTED.includes(file.type)) return throwError(() => new Error('Use uma foto JPG, PNG ou WebP.'));
    if (file.size > MAX_FILE_MB * 1024 * 1024) return throwError(() => new Error(`A foto passa de ${MAX_FILE_MB} MB.`));

    return this.api.uploadSignature().pipe(
      switchMap((sig) => {
        if (!sig.enabled) return throwError(() => new Error('O envio de fotos não está configurado no servidor.'));
        return this.shrink(file).pipe(
          switchMap((blob) => {
            const form = new FormData();
            form.append('file', blob, 'foto.jpg');
            form.append('api_key', sig.api_key!);
            form.append('timestamp', String(sig.timestamp));
            form.append('folder', sig.folder!);
            form.append('signature', sig.signature!);
            return this.http.post<{ secure_url: string }>(sig.upload_url!, form, { reportProgress: true, observe: 'events' });
          }),
        );
      }),
      filter((e) => e.type === HttpEventType.UploadProgress || e.type === HttpEventType.Response),
      map((e) =>
        e.type === HttpEventType.UploadProgress
          ? { progress: e.total ? Math.round((e.loaded / e.total) * 100) : 0 }
          : { progress: 100, url: (e as { body: { secure_url: string } }).body.secure_url },
      ),
    );
  }

  /** Reduz para no máximo 1600px no lado maior, respeitando a rotação da foto do celular. */
  private shrink(file: File): Observable<Blob> {
    return new Observable<Blob>((subscriber) => {
      (async () => {
        const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
        const scale = Math.min(1, MAX_SIZE / Math.max(bitmap.width, bitmap.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(bitmap.width * scale);
        canvas.height = Math.round(bitmap.height * scale);
        canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        bitmap.close();
        // O callback do canvas roda fora da zona do Angular; sem voltar para ela a tela não atualiza.
        canvas.toBlob(
          (blob) =>
            this.zone.run(() =>
              blob ? (subscriber.next(blob), subscriber.complete()) : subscriber.error(new Error('Não foi possível preparar a foto.')),
            ),
          'image/jpeg',
          0.88,
        );
      })().catch(() => this.zone.run(() => subscriber.error(new Error('Não foi possível ler essa foto.'))));
    });
  }
}
