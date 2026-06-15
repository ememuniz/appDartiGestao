import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Papel, Diretoria } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async obterMetricasGerais(papel: Papel, diretoriaUsuario: Diretoria) {
    // 1. Governança: Apenas a liderança (Diretores, Vices e Presidentes) acessa o Analytics
    if (papel === Papel.MEMBRO || papel === Papel.ESTAGIARIO) {
      throw new ForbiddenException(
        'Apenas a liderança tem acesso ao painel de estatísticas.',
      );
    }

    // 2. Define o escopo de visão (Filtro por diretoria para diretores, geral para presidência)
    const filtroMembro =
      papel === Papel.DIRETOR ? { diretoria: diretoriaUsuario } : {};
    const filtroTarefa =
      papel === Papel.DIRETOR
        ? { atribuidoA: { diretoria: diretoriaUsuario } }
        : {};

    // 3. Executa as contagens básicas em paralelo para performance
    const [totalMembros, totalTarefas] = await Promise.all([
      this.prisma.membro.count({ where: filtroMembro }),
      this.prisma.tarefa.count({ where: filtroTarefa }),
    ]);

    // 4. Busca todas as tarefas do escopo para calcular a saúde dos prazos
    const tarefas = await this.prisma.tarefa.findMany({
      where: filtroTarefa,
      select: { dataEntrega: true },
    });

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    let noPrazo = 0; // Verde (> 3 dias)
    let emAlerta = 0; // Amarelo (<= 3 dias)
    let atrasadas = 0; // Vermelho (< hoje)

    tarefas.forEach((tarefa) => {
      const entrega = new Date(tarefa.dataEntrega);
      entrega.setHours(0, 0, 0, 0);

      const diferencaTempo = entrega.getTime() - hoje.getTime();
      const diferencaDias = Math.ceil(diferencaTempo / (1000 * 60 * 60 * 24));

      if (diferencaDias > 3) {
        noPrazo++;
      } else if (diferencaDias >= 0) {
        emAlerta++;
      } else {
        atrasadas++;
      }
    });

    return {
      totalMembros,
      totalTarefas,
      saudePrazos: {
        noPrazo,
        emAlerta,
        atrasadas,
      },
    };
  }
}
