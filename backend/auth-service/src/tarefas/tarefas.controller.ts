import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { TarefasService } from './tarefas.service';
import { CriarTarefaDto } from './dto/criar-tarefa.dto';
import { CriarComentarioDto } from './dto/criar-comentario.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Papel, Diretoria } from '@prisma/client';
import { Request } from 'express';

interface RequestAutenticado extends Request {
  user: {
    sub: string;
    email: string;
    papel: Papel;
    diretoria: Diretoria;
  };
}

@Controller('tarefas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TarefasController {
  constructor(private readonly tarefasService: TarefasService) {}

  @Post()
  @Roles(Papel.PRESIDENTE, Papel.VICE_PRESIDENTE, Papel.DIRETOR)
  async criar(@Body() dto: CriarTarefaDto, @Req() req: RequestAutenticado) {
    return this.tarefasService.criarTarefa(
      req.user.sub,
      req.user.papel,
      //f eslint-disable-next-line
      req.user.diretoria,
      dto,
    );
  }

  @Get()
  async listar(@Req() req: RequestAutenticado) {
    return this.tarefasService.listarTarefas(
      req.user.sub,
      req.user.papel,
      //f eslint-disable-next-line
      req.user.diretoria,
    );
  }

  @Post(':id/comentarios')
  async comentar(
    @Param('id') tarefaId: string,
    @Body() dto: CriarComentarioDto,
    @Req() req: RequestAutenticado,
  ) {
    const usuario = req.user;

    return this.tarefasService.adicionarComentario(
      usuario.sub,
      tarefaId,
      dto,
    ) as Promise<unknown>;
  }
}
