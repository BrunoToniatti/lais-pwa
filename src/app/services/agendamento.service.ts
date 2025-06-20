import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';


export interface Cliente {
  client_name: string;
  client_email: string;
  client_phone: string;
}

export interface Agendamento {
  id?: number;
  client_name: string;
  client_email?: string;
  client_phone?: string;
  appointment_date: string;
  appointment_time: string;
  service_type: string;
}

@Injectable({
  providedIn: 'root'
})
export class AgendamentoService {
  private apiUrl = 'https://api.laisbarretoribeiro.com/api/agendamentos/agendamentos/';
  // private apiUrl = 'http://localhost:8000/api/agendamentos/agendamentos/';

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    const token = '3c07f0049dac3c17c16cc4fae40cf5b1d431522c'; // Produção
    // const token = 'cc18ff3be38f470e043489c0c911efc9fdf83614' // Localhost
    return new HttpHeaders({
      Authorization: `Token ${token}`
    });
  }

  listar(): Observable<Agendamento[]> {
    return this.http.get<Agendamento[]>(this.apiUrl, { headers: this.getAuthHeaders() });
  }

  criar(agendamento: Agendamento): Observable<Agendamento> {
    return this.http.post<Agendamento>(this.apiUrl, agendamento, { headers: this.getAuthHeaders() });
  }

  atualizar(id: number, agendamento: Agendamento): Observable<Agendamento> {
    return this.http.put<Agendamento>(`${this.apiUrl}${id}/`, agendamento, { headers: this.getAuthHeaders() });
  }

  excluir(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}${id}/`, { headers: this.getAuthHeaders() });
  }
}
