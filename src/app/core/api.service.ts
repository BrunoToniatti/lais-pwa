import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuditEntry, Campaign, DashboardSummary, Page, Service, UploadSignature } from './models';

type CampaignPayload = Omit<Campaign, 'id' | 'created_at' | 'updated_at'>;

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  summary(days: number): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>(`${this.base}/dashboard/summary/`, { params: { days } });
  }

  campaigns(status?: string): Observable<Page<Campaign>> {
    const params = status ? new HttpParams().set('status', status) : undefined;
    return this.http.get<Page<Campaign>>(`${this.base}/campaigns/`, { params });
  }

  campaign(id: number): Observable<Campaign> {
    return this.http.get<Campaign>(`${this.base}/campaigns/${id}/`);
  }

  createCampaign(data: CampaignPayload): Observable<Campaign> {
    return this.http.post<Campaign>(`${this.base}/campaigns/`, data);
  }

  updateCampaign(id: number, data: Partial<CampaignPayload>): Observable<Campaign> {
    return this.http.patch<Campaign>(`${this.base}/campaigns/${id}/`, data);
  }

  deleteCampaign(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/campaigns/${id}/`);
  }

  activate(id: number): Observable<Campaign> {
    return this.http.post<Campaign>(`${this.base}/campaigns/${id}/activate/`, {});
  }

  pause(id: number): Observable<Campaign> {
    return this.http.post<Campaign>(`${this.base}/campaigns/${id}/pause/`, {});
  }

  audit(page = 1): Observable<Page<AuditEntry>> {
    return this.http.get<Page<AuditEntry>>(`${this.base}/audit/`, { params: { page } });
  }

  // ---- Serviços e preços ----
  services(): Observable<Service[]> {
    return this.http.get<Service[]>(`${this.base}/services/`);
  }

  service(id: number): Observable<Service> {
    return this.http.get<Service>(`${this.base}/services/${id}/`);
  }

  createService(data: Partial<Service>): Observable<Service> {
    return this.http.post<Service>(`${this.base}/services/`, data);
  }

  updateService(id: number, data: Partial<Service>): Observable<Service> {
    return this.http.patch<Service>(`${this.base}/services/${id}/`, data);
  }

  deleteService(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/services/${id}/`);
  }

  reorderServices(ids: number[]): Observable<void> {
    return this.http.post<void>(`${this.base}/services/reorder/`, { ids });
  }

  uploadSignature(): Observable<UploadSignature> {
    return this.http.get<UploadSignature>(`${this.base}/media/signature/`);
  }
}
