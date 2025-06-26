import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input'; // obrigatório para <input matInput>
import { MatCard } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

import { ServiceService, Servico } from '../../services/service.service';
import { Cliente } from '../../services/agendamento.service';
import { ClientService } from '../../services/client.service'; // certifique-se que o service existe
import { AgendamentoService, Agendamento } from '../../services/agendamento.service';

import { MatSlideToggleModule } from '@angular/material/slide-toggle';


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
    MatAutocompleteModule,
    MatSlideToggleModule,
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
  showObservation = false;

  agendamentos: any[] = [];

  novoAgendamento = {
    nome: '',
    phone: '',
    procedimento: '',
    discount_price: '',
    data: '',
    hora: '',
    comentario: ''
  };

  constructor(
    private agendamentoService: AgendamentoService,
    private serivceApi: ServiceService,
    private clientApi: ClientService
  ) { }

  procedimentos: string[] = []

  sugestoesClientes: Cliente[] = [];

  buscarClientes(nome: string) {
    if (nome.length < 2) return;

    this.clientApi.getAll().subscribe((clientes: Cliente[]) => {
      this.sugestoesClientes = clientes.filter((c: Cliente) =>
        c.client_name.toLowerCase().includes(nome.toLowerCase())
      );
    });
  }

  sugestaoServicos: Servico[] = [];

  buscarServicos(nome: string) {
    if(nome.length < 2) return;

    this.serivceApi.getAll().subscribe((servicos: Servico[]) => {
      this.sugestaoServicos = servicos.filter((s: Servico) =>
        s.name.toLowerCase().includes(nome.toLowerCase())
      )
    })
  }

  selecionarCliente(c: Cliente) {
    this.novoAgendamento.nome = c.client_name;
    this.novoAgendamento.phone = c.client_phone || '';
    this.sugestoesClientes = []; // limpa a lista após selecionar
  }

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
        this.agendamentos = res
        .filter(a => a.status === 'Agendado')
        .map(a => ({
          id: a['id'],
          cliente: a.client_name,
          telefone: a.client_phone,
          servico: a.service_type,
          discount_price: a.discount_price,
          data: a.appointment_date,
          hora: a.appointment_time,
          comentario: a.coment
        }));
        this.filtrarPorData();
      },
      error: (err: any) => console.error('Erro ao buscar agendamentos', err)

    });
  }

  finalizarAgendamento(id: number) {
    this.agendamentoService.atualizarStatusFinalizado(id).subscribe({
      next: () => {
        this.mensagemSucesso = 'Status atualizado para "finalizado"!';
        this.carregarAgendamentos();
        setTimeout(() => this.mensagemSucesso = '', 3000);
      },
      error: (err) => {
        console.error('Erro ao finalizar agendamento', err);
      }
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
    this.novoAgendamento = { nome: '', phone: '', procedimento: '', discount_price: '', data: '', hora: '', comentario: '' };
    this.carregarAgendamentos();
    setTimeout(() => this.mensagemSucesso = '', 3000);
  }


  salvar(): void {
    this.carregando = true;

    const payload: Agendamento = {
      client_name: this.novoAgendamento.nome,
      client_phone: this.novoAgendamento.phone,
      service_type: this.novoAgendamento.procedimento,
      discount_price: Number(this.novoAgendamento.discount_price),
      appointment_date: this.formatarData(this.novoAgendamento.data),
      appointment_time: this.novoAgendamento.hora,
      coment: this.novoAgendamento.comentario
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

  btNovoAgendamento(){
    this.modoForm = !this.modoForm
    this.editando = null
    this.novoAgendamento = { nome: '', phone: '', procedimento: '', discount_price: '', data: '', hora: '', comentario: '' };
  }


  editar(i: number) {
    const ag = this.agendamentosFiltrados[i];
    if(ag.comentario) this.showObservation = true;
    this.novoAgendamento = {
      nome: ag.cliente,
      phone: ag.telefone,
      procedimento: ag.servico,
      discount_price: ag.discount_price,
      data: ag.data,
      hora: ag.hora,
      comentario: ag.comentario
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
