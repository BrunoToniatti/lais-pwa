import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgendamentoService } from '../../services/agendamento.service';
import { FormsModule } from '@angular/forms';

interface AtendimentoFinanceiro {
  cliente: string;
  servico: string;
  data: string;
  hora: string;
  valor: number;
  status: string;
}

@Component({
  selector: 'app-financeiro',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './financeiro.component.html',
  styleUrls: ['./financeiro.component.scss']
})
export class FinanceiroComponent implements OnInit {


  atendimentosDoMes: AtendimentoFinanceiro[] = [];
  recebidos: number = 0;
  contasAReceber: number = 0;

  graficoBarras: Array<{ dia: number; total: number; altura: number }> = [];

  constructor(private atendimentoService: AgendamentoService) { }

  ngOnInit(): void {
    this.carregarAtendimentos();
  }

  mesSelecionado: number | null = null;

  meses = [
    { nome: 'Janeiro', valor: 1 },
    { nome: 'Fevereiro', valor: 2 },
    { nome: 'Março', valor: 3 },
    { nome: 'Abril', valor: 4 },
    { nome: 'Maio', valor: 5 },
    { nome: 'Junho', valor: 6 },
    { nome: 'Julho', valor: 7 },
    { nome: 'Agosto', valor: 8 },
    { nome: 'Setembro', valor: 9 },
    { nome: 'Outubro', valor: 10 },
    { nome: 'Novembro', valor: 11 },
    { nome: 'Dezembro', valor: 12 },
  ];

  carregarAtendimentos() {
    this.atendimentoService.listarPorMes(this.mesSelecionado).subscribe((dados: AtendimentoFinanceiro[]) => {
      this.atendimentosDoMes = dados;
      this.recebidos = 0;
      this.contasAReceber = 0;

      const porDia: { [dia: number]: number } = {};

      dados.forEach((item: AtendimentoFinanceiro) => {
        const [ano, mes, diaStr] = item.data.split('-');
        const dia = parseInt(diaStr);

        if (item.status == 'Finalizado') {
          this.recebidos += item.valor;
          porDia[dia] = (porDia[dia] || 0) + item.valor;
        } else {
          this.contasAReceber += item.valor;
        }
      });

      const barras = Object.entries(porDia).map(([dia, total]) => ({
        dia: parseInt(dia),
        total: total as number
      })).sort((a, b) => a.dia - b.dia);

      const max = Math.max(...barras.map(b => b.total));
      this.graficoBarras = barras.map(b => ({
        ...b,
        altura: max > 0 ? (b.total / max) * 100 : 0
      }));
    });
  }
}
