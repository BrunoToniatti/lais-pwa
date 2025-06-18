import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

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

  constructor(private http: HttpClient) { }

  listar(): Observable<Agendamento[]> {
    return this.http.get<Agendamento[]>(this.apiUrl);
  }

  criar(agendamento: Agendamento): Observable<Agendamento> {
    return this.http.post<Agendamento>(this.apiUrl, agendamento);
  }

  atualizar(id: number, agendamento: Agendamento): Observable<Agendamento> {
    return this.http.put<Agendamento>(`${this.apiUrl}${id}/`, agendamento);
  }

  excluir(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}${id}/`);
  }
}
