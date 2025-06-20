import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { ClientService } from '../../services/client.service';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatButtonModule,
    NgxMaskDirective,
    NgxMaskPipe
  ],
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.scss']
})
export class ClientesComponent {
  constructor(private clientApi: ClientService) { }

  clientCreate: boolean = false;
  busca = '';
  nome = '';
  telefone = '';
  email = '';
  editando: number | null = null;
  mensagem = '';
  confirmandoExclusao: number | null = null;
  clientes: any[] = [];
  clienteEditandoId: number | null = null;

  ngOnInit() {
    this.carregarClientes();
  }

  carregarClientes() {
    this.clientApi.getAll().subscribe(res => {
      this.clientes = res;
    });
  }

  tratarErro(err: any) {
    if (err.status === 400 && err.error) {
      if (err.error.client_phone) {
        this.mensagem = 'Já existe um cliente com esse número'; // mensagem amigável vinda do backend
        this.clientCreate = false;
      } else {
        this.mensagem = 'Erro ao salvar cliente.';
        this.clientCreate = false;
      }
    } else {
      this.mensagem = 'Erro de conexão com o servidor.';
      this.clientCreate = false;
    }

    setTimeout(() => this.mensagem = '', 4000);
  }

  salvarCliente() {
    const dados = {
      client_name: this.nome,
      client_phone: this.telefone,
      client_email: this.email // ou um email fictício, se for opcional
    };

    if (this.clienteEditandoId !== null) {
      this.clientApi.update(this.clienteEditandoId, dados).subscribe({
        next: () => {
          this.mensagem = 'Cliente atualizado com sucesso!';
          this.resetarFormulario();
          this.carregarClientes();
        },
        error: (err) => {
          this.tratarErro(err);
        }
      });
    } else {
      this.clientApi.create(dados).subscribe({
        next: () => {
          this.mensagem = 'Cliente adicionado com sucesso!';
          this.clientCreate = true;
          this.resetarFormulario();
          this.carregarClientes();
        },
        error: (err) => {
          this.tratarErro(err);
        }
      });
    }
  }

  editar(i: number) {
    this.editando = i;
    const cliente = this.clientes[i];
    this.nome = cliente.client_name;
    this.telefone = cliente.client_phone;
    this.email = cliente.client_email;
    this.clienteEditandoId = cliente.id;
  }

  pedirConfirmacaoExclusao(i: number) {
    this.confirmandoExclusao = i;
  }

  confirmarExclusao() {
    const cliente = this.clientes[this.confirmandoExclusao!];
    this.clientApi.delete(cliente.id).subscribe(() => {
      this.mensagem = 'Cliente removido com sucesso!';
      this.carregarClientes();
      this.confirmandoExclusao = null;
    });
  }

  cancelarExclusao() {
    this.confirmandoExclusao = null;
  }

  resetarFormulario() {
    this.nome = '';
    this.telefone = '';
    this.email = '';
    this.editando = null;
    this.clienteEditandoId = null;
    setTimeout(() => this.mensagem = '', 3000);
  }

  get clientesFiltrados() {
    return this.clientes.filter(c =>
      c.client_name.toLowerCase().includes(this.busca.toLowerCase())
    );
  }
}
