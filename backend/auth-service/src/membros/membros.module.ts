import { Module } from '@nestjs/common';
import { MembrosService } from './membros.service';
import { MembrosController } from './membros.controller';
import { PrismaService } from '../prisma/prisma.service'; // 👈 Importamos o Serviço

@Module({
  imports: [], // 👈 Fica vazio (não colocamos serviços aqui)
  controllers: [MembrosController],
  providers: [MembrosService, PrismaService], // 👈 PrismaService desce para os providers!
  exports: [MembrosService],
})
export class MembrosModule {}
