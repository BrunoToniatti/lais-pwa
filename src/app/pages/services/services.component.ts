import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { ServiceService } from '../../services/service.service'; // ajuste o path se necessário

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ],
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.scss']
})
export class ServicesComponent implements OnInit {
  nome = '';
  preco = '';
  duracao_cliente = '';
  editandoId: number | null = null;
  showForm = false;
  servicosFiltrados: any[] = [];
  services: any[] = [];
  filtroCliente: string = '';

  constructor(private serviceApi: ServiceService) { }

  ngOnInit(): void {
    this.carregarServicos();
  }

  carregarServicos() {
    this.serviceApi.getAll().subscribe(data => {
      this.services = data;
      this.servicosFiltrados = data;
    });
  }

  filtrarPorData() {
    this.servicosFiltrados = this.services.filter(se => {
      // Filtro por nome do servico
      let nameOk = true;
      if (this.filtroCliente) {
        nameOk = se.name.toLowerCase().includes(this.filtroCliente.toLowerCase());
      }
      return nameOk;
    });
  }

  salvarServico() {
    const body = {
      name: this.nome,
      price: parseFloat(this.preco),
      duracion_client: this.duracao_cliente
    };

    if (this.editandoId !== null) {
      this.serviceApi.update(this.editandoId, body).subscribe(() => {
        this.resetarForm();
        this.carregarServicos();
      });
    } else {
      this.serviceApi.create(body).subscribe(() => {
        this.resetarForm();
        this.carregarServicos();
      });
    }
  }

  editarServico(servico: any) {
    this.showForm = true;
    this.nome = servico.name;
    this.preco = servico.price;
    this.duracao_cliente = servico.duracion_client;
    this.editandoId = servico.id;
  }

  excluirServico(id: number) {
    if (confirm('Deseja excluir este serviço?')) {
      this.serviceApi.delete(id).subscribe(() => this.carregarServicos());
    }
  }

  resetarForm() {
    this.nome = '';
    this.preco = '';
    this.duracao_cliente = '';
    this.editandoId = null;
  }
}
