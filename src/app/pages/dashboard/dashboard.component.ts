import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Agendamento, AgendamentoService } from '../../services/agendamento.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {

  agendamentos: Agendamento[] = [];
  hoje: string = new Date().toISOString().split('T')[0];

  mensagemSucesso = '';

  constructor(private agendamentoService: AgendamentoService) { }

  ngOnInit(): void {
    this.carregarAgendamentosHoje();
  }

  carregarAgendamentosHoje(): void {
    this.agendamentoService.listar().subscribe(
      (agendamentos) => {
        this.agendamentos = agendamentos.filter(
          (a) => a.appointment_date === this.hoje && a.status === 'Agendado'
        );
      },
      (erro) => {
        console.error('Erro ao carregar agendamentos', erro);
      }
    );
  }

  atualizarStatus(id: number, novoStatus: string): void {
    this.agendamentoService.atualizar(id, { status: novoStatus } as Agendamento).subscribe(
      () => {
        this.agendamentos = this.agendamentos.filter((a) => a.id !== id);
      },
      (erro) => {
        console.error('Erro ao atualizar status', erro);
      }
    );
  }

  finalizarAgendamento(id: number) {
    this.agendamentoService.atualizarStatusFinalizado(id).subscribe({
      next: () => {
        this.mensagemSucesso = 'Status atualizado para "finalizado"!';
        this.carregarAgendamentosHoje();
        setTimeout(() => this.mensagemSucesso = '', 3000);
      },
      error: (err) => {
        console.error('Erro ao finalizar agendamento', err);
      }
    });
  }
}
