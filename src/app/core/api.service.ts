import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuditEntry, Campaign, DashboardSummary, Page } from './models';

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
}
