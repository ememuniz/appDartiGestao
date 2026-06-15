import { Module } from '@nestjs/common';
import { AvisosService } from './avisos.service';
import { AvisosController } from './avisos.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [AvisosController],
  providers: [AvisosService, PrismaService],
  exports: [AvisosService],
})
export class AvisosModule {}
