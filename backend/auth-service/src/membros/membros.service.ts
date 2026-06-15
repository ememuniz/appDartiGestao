import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Papel, Diretoria } from '@prisma/client'; // 👈 IMPORTANTE: Importando os Enums do Prisma

@Injectable()
export class MembrosService {
  constructor(private readonly prisma: PrismaService) {}

  async buscarPorId(id: string) {
    const membro = await this.prisma.membro.findUnique({
      where: { id },
      select: {
        id: true,
        nomeCompleto: true,
        nomeSocial: true,
        email: true,
        papel: true,
        diretoria: true,
      },
    });

    if (!membro) {
      throw new NotFoundException('Membro não encontrado.');
    }

    return membro;
  }

  async listarTodos() {
    return this.prisma.membro.findMany({
      select: {
        id: true,
        nomeCompleto: true,
        nomeSocial: true,
        email: true,
        papel: true,
        diretoria: true,
      },
    });
  }

  // 👇 AQUI MUDAMOS DE "string" PARA "Papel" e "Diretoria"
  async atualizar(id: string, dados: { papel?: Papel; diretoria?: Diretoria }) {
    return this.prisma.membro.update({
      where: { id },
      data: dados,
    });
  }

  async remover(id: string) {
    return this.prisma.membro.delete({
      where: { id },
    });
  }
}
