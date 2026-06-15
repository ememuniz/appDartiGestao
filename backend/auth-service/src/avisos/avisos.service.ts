import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CriarAvisoDto } from './dto/criar-aviso.dto';
import { Papel, Diretoria } from '@prisma/client';

@Injectable()
export class AvisosService {
  constructor(private readonly prisma: PrismaService) {}

  async criarAviso(
    membroId: string,
    papel: Papel,
    diretoriaMembro: Diretoria,
    dto: CriarAvisoDto,
  ) {
    // 1. Defesa em profundidade: Bloqueia Membros e Estagiários na camada de serviço
    if (papel === Papel.MEMBRO || papel === Papel.ESTAGIARIO) {
      throw new ForbiddenException(
        'Apenas a presidência e diretores podem emitir comunicados.',
      );
    }

    // 2. Regra de Negócio: Presidente e VP criam avisos Globais (null). Diretores criam na sua própria diretoria.
    const diretoriaAlvo =
      papel === Papel.PRESIDENTE || papel === Papel.VICE_PRESIDENTE
        ? null
        : diretoriaMembro;

    return this.prisma.aviso.create({
      data: {
        titulo: dto.titulo,
        conteudo: dto.conteudo,
        diretoria: diretoriaAlvo,
        criadoPorId: membroId,
      },
    });
  }

  async listarAvisos(papel: Papel, diretoriaMembro: Diretoria) {
    const includeAutor = {
      criadoPor: {
        select: {
          nomeCompleto: true,
          nomeSocial: true,
          foto: true,
          papel: true,
        },
      },
    };

    // 3. Regra de Visibilidade: Presidência vê tudo. Outros veem apenas globais + própria diretoria.
    if (papel === Papel.PRESIDENTE || papel === Papel.VICE_PRESIDENTE) {
      return this.prisma.aviso.findMany({
        include: includeAutor,
        orderBy: { createdAt: 'desc' },
      });
    }

    return this.prisma.aviso.findMany({
      where: {
        OR: [
          { diretoria: null }, // Avisos Globais da Presidência
          { diretoria: diretoriaMembro }, // Avisos específicos da diretoria dele
        ],
      },
      include: includeAutor,
      orderBy: { createdAt: 'desc' },
    });
  }
}
