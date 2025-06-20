import { Component, OnInit } from '@angular/core';
import { AgendamentoService, Agendamento } from '../../services/agendamento.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input'; // obrigatório para <input matInput>
import { MatCard } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { ServiceService } from '../../services/service.service';
import { MatSelectModule } from '@angular/material/select';
import {  NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';


@Component({
  selector: 'app-agendamentos',
  templateUrl: './agendamentos.component.html',
  styleUrls: ['./agendamentos.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCard,
    MatIcon,
    MatDatepickerModule,
    MatSelectModule,
    NgxMaskDirective,
  ]
})
export class AgendamentosComponent implements OnInit {
  mensagemErro: string = '';
  carregando = false;
  modoForm = false;
  mensagemSucesso = '';
  editando: number | null = null;
  confirmandoExclusao: number | null = null;
  dataFiltro: Date | null = null;
  filtroCliente: string = '';
  filtroServico: string = '';
  agendamentosFiltrados: any[] = [];

  agendamentos: any[] = [];

  novoAgendamento = {
    nome: '',
    email: '',
    phone: '',
    procedimento: '',
    data: '',
    hora: ''
  };

  constructor(
    private agendamentoService: AgendamentoService,
    private serivceApi: ServiceService
  ) { }

  procedimentos: string[] = []

  carregarServicos() {
    this.serivceApi.getAll().subscribe(data => {
      this.procedimentos = data.map((s: { name: string }) => s.name);
    });
  }


  ngOnInit(): void {
    this.carregarAgendamentos();
    this.carregarServicos();
  }

  carregarAgendamentos(): void {
    this.agendamentoService.listar().subscribe({
      next: (res) => {
        this.agendamentos = res.map(a => ({
          id: a['id'],
          cliente: a.client_name,
          email: a.client_email,
          telefone: a.client_phone,
          servico: a.service_type,
          data: a.appointment_date,
          hora: a.appointment_time
        }));
        this.filtrarPorData();
      },
      error: (err: any) => console.error('Erro ao buscar agendamentos', err)

    });
  }

  filtrarPorData() {
    this.agendamentosFiltrados = this.agendamentos.filter(ag => {
      // Filtro por data
      let dataOk = true;
      if (this.dataFiltro) {
        const dataStr = this.dataFiltro.toISOString().slice(0, 10);
        const agDataStr = (ag.data instanceof Date ? ag.data : new Date(ag.data)).toISOString().slice(0, 10);
        dataOk = agDataStr === dataStr;
      }
      // Filtro por cliente
      let clienteOk = true;
      if (this.filtroCliente) {
        clienteOk = ag.cliente.toLowerCase().includes(this.filtroCliente.toLowerCase());
      }
      // Filtro por serviço
      let servicoOk = true;
      if (this.filtroServico) {
        servicoOk = ag.servico.toLowerCase().includes(this.filtroServico.toLowerCase());
      }
      return dataOk && clienteOk && servicoOk;
    });
  }

  formatDate(date: string): string {
    let dateSplit = date.split('-');
    return `${dateSplit[2]}/${dateSplit[1]}/${dateSplit[0]}`;
  }

  resetarForm(): void {
    this.modoForm = false;
    this.editando = null;
    this.novoAgendamento = { nome: '', email: '', phone: '', procedimento: '', data: '', hora: '' };
    this.carregarAgendamentos();
    setTimeout(() => this.mensagemSucesso = '', 3000);
  }


  salvar(): void {
    this.carregando = true;

    const payload: Agendamento = {
      client_name: this.novoAgendamento.nome,
      client_email: this.novoAgendamento.email,
      client_phone: this.novoAgendamento.phone,
      service_type: this.novoAgendamento.procedimento,
      appointment_date: this.formatarData(this.novoAgendamento.data),
      appointment_time: this.novoAgendamento.hora
    };

    const callback = () => {
      this.carregando = false;
      this.resetarForm();
    };

    if (this.editando !== null) {
      const id = this.agendamentos[this.editando].id;
      this.agendamentoService.atualizar(id, payload).subscribe({
        next: () => {
          this.mensagemSucesso = 'Agendamento atualizado com sucesso!';
          callback();
        },
        error: (err) => {
          console.error('Erro ao atualizar agendamento', err);
          this.carregando = false;
        }
      });
    } else {
      this.agendamentoService.criar(payload).subscribe({
        next: () => {
          this.mensagemSucesso = 'Agendamento salvo com sucesso!';
          callback();
        },
        error: (err: any) => {
          console.error('Erro ao salvar agendamento', err);
          this.mensagemErro = err.error?.detail || 'Erro ao salvar agendamento';
          this.carregando = false;
          console.log('Erro aqui olha chat', this.mensagemErro);
        }
      });
    }
  }


  editar(i: number) {
    const ag = this.agendamentosFiltrados[i];
    this.novoAgendamento = {
      nome: ag.cliente,
      email: ag.email,
      phone: ag.telefone,
      procedimento: ag.servico,
      data: ag.data,
      hora: ag.hora
    };
    // Encontrar o índice real no array principal
    this.editando = this.agendamentos.findIndex(a => a === ag);
    this.modoForm = true;
  }

  pedirConfirmacaoExclusao(i: number) {
    // Encontrar o índice real no array principal
    const ag = this.agendamentosFiltrados[i];
    this.confirmandoExclusao = this.agendamentos.findIndex(a => a === ag);
  }

  confirmarExclusao() {
    if (this.confirmandoExclusao !== null) {
      const id = this.agendamentos[this.confirmandoExclusao].id;
      this.agendamentoService.excluir(id).subscribe({
        next: () => {
          this.mensagemSucesso = 'Agendamento removido com sucesso!';
          this.confirmandoExclusao = null;
          this.carregarAgendamentos();
          setTimeout(() => this.mensagemSucesso = '', 3000);
        },
        error: (err) => console.error('Erro ao excluir agendamento', err)
      });
    }
  }


  cancelarExclusao() {
    this.confirmandoExclusao = null;
  }

  limparFiltros() {
    this.dataFiltro = null;
    this.filtroCliente = '';
    this.filtroServico = '';
    this.filtrarPorData();
  }

  fecharErro() {
    this.mensagemErro = '';
  }

  private formatarData(data: any): string {
    if (typeof data === 'string') return data;
    const d = new Date(data);
    return d.toISOString().split('T')[0];
  }
}
