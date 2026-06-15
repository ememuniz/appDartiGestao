import { Module } from '@nestjs/common';
import { TarefasService } from './tarefas.service';
import { TarefasController } from './tarefas.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [TarefasController],
  providers: [TarefasService, PrismaService],
  exports: [TarefasService],
})
export class TarefasModule {}
