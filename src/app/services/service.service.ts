import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ServiceService {
  // private apiUrl = 'http://localhost:8000/api/servicos/';
  private apiUrl = 'https://api.laisbarretoribeiro.com/api/servicos/';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = '3c07f0049dac3c17c16cc4fae40cf5b1d431522c'; // Produção
    // const token = 'cc18ff3be38f470e043489c0c911efc9fdf83614' // Localhost
    return new HttpHeaders({
      Authorization: `Token ${token}`
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
