import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

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
    MatButtonModule
  ],
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.scss']
})
export class ClientesComponent {
  busca: string = '';
  nome: string = '';
  telefone: string = '';
  editando: number | null = null;
  mensagem: string = '';
  confirmandoExclusao: number | null = null;

  clientes = [
    { nome: 'Camila Souza', telefone: '(11) 99999-0001' },
    { nome: 'Bruna Lima', telefone: '(11) 98888-0002' },
    { nome: 'Jéssica Alves', telefone: '(11) 97777-0003' }
  ];

  get clientesFiltrados() {
    return this.clientes.filter(c =>
      c.nome.toLowerCase().includes(this.busca.toLowerCase())
    );
  }

  salvarCliente() {
    if (this.editando !== null) {
      this.clientes[this.editando] = { nome: this.nome, telefone: this.telefone };
      this.mensagem = 'Cliente atualizado com sucesso!';
      this.editando = null;
    } else {
      this.clientes.push({ nome: this.nome, telefone: this.telefone });
      this.mensagem = 'Cliente adicionado com sucesso!';
    }
    setTimeout(() => { this.mensagem = ''; }, 3000);
    this.nome = '';
    this.telefone = '';
  }

  editar(i: number) {
    this.editando = i;
    this.nome = this.clientes[i].nome;
    this.telefone = this.clientes[i].telefone;
  }

  pedirConfirmacaoExclusao(i: number) {
    this.confirmandoExclusao = i;
  }

  confirmarExclusao() {
    if (this.confirmandoExclusao !== null) {
      this.clientes.splice(this.confirmandoExclusao, 1);
      this.mensagem = 'Cliente removido com sucesso!';
      setTimeout(() => { this.mensagem = ''; }, 3000);
      this.confirmandoExclusao = null;
    }
  }

  cancelarExclusao() {
    this.confirmandoExclusao = null;
  }
}
