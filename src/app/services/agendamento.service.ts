import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';


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
  discount_price: number;
  service_type: string;
  status?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AgendamentoService {
  private apiUrl = environment.apiUrl+'agendamentos/';

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Token ${environment.token}`
    });
  }

  atualizarStatusFinalizado(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}agendamentos/${id}/`, { status: 'Finalizado' }, {
      headers: this.getAuthHeaders()
    });
  }

  listar(): Observable<Agendamento[]> {
    return this.http.get<Agendamento[]>(`${this.apiUrl}agendamentos/`, { headers: this.getAuthHeaders() });
  }

  listarPorMes(mes: number | null): Observable<any[]> {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mesQuery = mes ?? (hoje.getMonth() + 1);
  const url = `${this.apiUrl}mes-atual/?ano=${ano}&mes=${mesQuery}`;
  return this.http.get<any[]>(url, { headers: this.getAuthHeaders() });
}

  criar(agendamento: Agendamento): Observable<Agendamento> {
    return this.http.post<Agendamento>(`${this.apiUrl}agendamentos/`, agendamento, { headers: this.getAuthHeaders() });
  }

  atualizar(id: number, agendamento: Agendamento): Observable<Agendamento> {
    return this.http.put<Agendamento>(`${this.apiUrl}agendamentos/${id}/`, agendamento, { headers: this.getAuthHeaders() });
  }

  excluir(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}agendamentos/${id}/`, { headers: this.getAuthHeaders() });
  }
}
