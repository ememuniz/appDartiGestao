import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Req, // 👈 Trocamos Request por Req para ficar mais padronizado
} from '@nestjs/common';
import { MembrosService } from './membros.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Papel, Diretoria } from '@prisma/client';

// 👇 Criamos o tipo para explicar ao TypeScript o que o JWT injeta no Request
type RequestAutenticado = {
  user: {
    sub: string;
    email: string;
    papel: Papel;
    diretoria: Diretoria;
  };
};

@Controller('membros')
@UseGuards(JwtAuthGuard)
export class MembrosController {
  constructor(private readonly membrosService: MembrosService) {}

  @Get('perfil')
  // 👇 Avisamos que req é do tipo RequestAutenticado
  obterPerfilLogado(@Req() req: RequestAutenticado) {
    return this.membrosService.buscarPorId(req.user.sub); // O ESLint agora sabe que req.user.sub é uma string!
  }

  @Get()
  listarMembros() {
    return this.membrosService.listarTodos();
  }

  @Patch(':id')
  atualizarMembro(
    @Param('id') id: string,
    @Body() dados: { papel?: Papel; diretoria?: Diretoria },
  ) {
    return this.membrosService.atualizar(id, dados);
  }

  @Delete(':id')
  removerMembro(@Param('id') id: string) {
    return this.membrosService.remover(id);
  }
}
