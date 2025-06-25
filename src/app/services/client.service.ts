import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
    private apiUrl = environment.apiUrl+'clientes/';

    constructor(private http: HttpClient) {}

    private getAuthHeaders(): HttpHeaders {
      return new HttpHeaders({
        Authorization: `Token ${environment.token}`
      });
    }

    getAll(): Observable<any> {
      return this.http.get<any>(this.apiUrl, { headers: this.getAuthHeaders() });
    }

    create(data: any): Observable<any> {
      return this.http.post<any>(this.apiUrl, data, { headers: this.getAuthHeaders() });
    }

    update(id: number, data: any): Observable<any> {
      return this.http.put<any>(`${this.apiUrl}${id}/`, data, { headers: this.getAuthHeaders() });
    }

    delete(id: number): Observable<any> {
      return this.http.delete<any>(`${this.apiUrl}${id}/`, { headers: this.getAuthHeaders() });
    }
}
