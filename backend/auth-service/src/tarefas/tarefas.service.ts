import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CriarTarefaDto } from './dto/criar-tarefa.dto';
import { CriarComentarioDto } from './dto/criar-comentario.dto';
import { Papel, Diretoria, Feedback } from '@prisma/client'; // 👈 Importa Feedback do Prisma

@Injectable()
export class TarefasService {
  constructor(private readonly prisma: PrismaService) {}

  async criarTarefa(
    criadorId: string,
    papelCriador: Papel,
    diretoriaCriador: Diretoria,
    dto: CriarTarefaDto,
  ) {
    if (papelCriador === Papel.MEMBRO || papelCriador === Papel.ESTAGIARIO) {
      throw new ForbiddenException('Não tens permissão para delegar tarefas.');
    }

    const responsavel = await this.prisma.membro.findUnique({
      where: { id: dto.responsavelId },
    });

    if (!responsavel) {
      throw new NotFoundException('Membro responsável não encontrado.');
    }

    if (
      papelCriador === Papel.DIRETOR &&
      responsavel.diretoria !== diretoriaCriador
    ) {
      throw new ForbiddenException(
        'Um Diretor só pode atribuir tarefas a membros da sua própria diretoria.',
      );
    }

    // 👈 Atualizado para bater com os nomes do seu schema (nome, atribuidoAId)
    return this.prisma.tarefa.create({
      data: {
        nome: dto.titulo,
        descricao: dto.descricao,
        dataEntrega: new Date(dto.dataEntrega),
        atribuidoAId: dto.responsavelId,
        criadoPorId: criadorId,
      },
    });
  }

  calcularStatusPrazo(dataEntrega: Date): 'VERDE' | 'AMARELO' | 'VERMELHO' {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const entrega = new Date(dataEntrega);
    entrega.setHours(0, 0, 0, 0);

    const diferencaTempo = entrega.getTime() - hoje.getTime();
    const diferencaDias = Math.ceil(diferencaTempo / (1000 * 60 * 60 * 24));

    if (diferencaDias > 3) return 'VERDE';
    if (diferencaDias >= 0) return 'AMARELO';
    return 'VERMELHO';
  }

  async listarTarefas(membroId: string, papel: Papel, diretoria: Diretoria) {
    let filtro = {};

    if (papel !== Papel.PRESIDENTE && papel !== Papel.VICE_PRESIDENTE) {
      if (papel === Papel.DIRETOR) {
        // Diretor vê tarefas onde o responsável pertence à diretoria dele
        filtro = { atribuidoA: { diretoria } };
      } else {
        filtro = { atribuidoAId: membroId };
      }
    }

    const tarefas = await this.prisma.tarefa.findMany({
      where: filtro,
      include: {
        atribuidoA: { select: { nomeCompleto: true, papel: true } },
        feedbacks: { include: { autor: { select: { nomeCompleto: true } } } },
      },
      orderBy: { dataEntrega: 'asc' },
    });

    return tarefas.map((tarefa) => ({
      ...tarefa,
      alertaPrazo: this.calcularStatusPrazo(tarefa.dataEntrega),
    }));
  }

  // 👈 Atualizado para usar o model "feedback" e o campo "authorId"
  async adicionarComentario(
    membroId: string,
    tarefaId: string,
    dto: CriarComentarioDto,
  ): Promise<Feedback> {
    return this.prisma.feedback.create({
      data: {
        conteudo: dto.conteudo,
        tarefaId,
        authorId: membroId,
        ...(dto.paiId ? { paiId: dto.paiId } : {}),
      },
    });
  }
}
