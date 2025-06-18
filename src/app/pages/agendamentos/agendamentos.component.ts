import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card'; // 👈 IMPORTA AQUI

@Component({
  selector: 'app-agendamentos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCardModule // 👈 ADICIONA AQUI TAMBÉM
  ],
  templateUrl: './agendamentos.component.html',
  styleUrls: ['./agendamentos.component.scss']
})
export class AgendamentosComponent {
  modoForm: boolean = false;
  mensagemSucesso: string = '';

  agendamentos = [
    { hora: '09:00', cliente: 'Camila Souza', servico: 'Volume Russo' },
    { hora: '10:30', cliente: 'Bruna Lima', servico: 'Design de Sobrancelha' },
    { hora: '13:00', cliente: 'Jéssica Alves', servico: 'Manutenção Cílios' }
  ];

  novoAgendamento = {
    nome: '',
    procedimento: '',
    data: '',
    hora: ''
  };

  salvar() {
    this.agendamentos.push({
      hora: this.novoAgendamento.hora,
      cliente: this.novoAgendamento.nome,
      servico: this.novoAgendamento.procedimento
    });
    this.mensagemSucesso = 'Agendamento salvo com sucesso!';
    setTimeout(() => {
      this.mensagemSucesso = '';
    }, 3000);
    this.novoAgendamento = { nome: '', procedimento: '', data: '', hora: '' };
    this.modoForm = false;
  }
}
