import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { AvisosService } from './avisos.service';
import { CriarAvisoDto } from './dto/criar-aviso.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Papel } from '@prisma/client';

// Contrato de Tipagem para o Request injetado pelo Guard
interface RequestAutenticado extends Request {
  user: {
    sub: string;
    email: string;
    papel: Papel;
    diretoria: any; // Ajustado para evitar conflito de tipo direto com enum do Prisma
  };
}

@Controller('avisos')
@UseGuards(JwtAuthGuard, RolesGuard) // Protege todas as rotas deste controlador
export class AvisosController {
  constructor(private readonly avisosService: AvisosService) {}

  @Post()
  @Roles(Papel.PRESIDENTE, Papel.VICE_PRESIDENTE, Papel.DIRETOR) // Apenas estes papéis passam pelo Guard
  async criar(@Body() dto: CriarAvisoDto, @Request() req: RequestAutenticado) {
    return this.avisosService.criarAviso(
      req.user.sub,
      req.user.papel,
      req.user.diretoria,
      dto,
    );
  }

  @Get()
  async listar(@Request() req: RequestAutenticado) {
    return this.avisosService.listarAvisos(req.user.papel, req.user.diretoria);
  }
}