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
}
