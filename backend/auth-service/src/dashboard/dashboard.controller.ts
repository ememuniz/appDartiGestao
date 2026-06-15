import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Papel, Diretoria } from '@prisma/client';

type RequestAutenticado = {
  user: {
    sub: string;
    email: string;
    papel: Papel;
    diretoria: Diretoria;
  };
};

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('metricas')
  @Roles(Papel.PRESIDENTE, Papel.VICE_PRESIDENTE, Papel.DIRETOR)
  async pegarMetricas(@Req() req: RequestAutenticado) {
    const usuario = req.user;
    return this.dashboardService.obterMetricasGerais(
      usuario.papel,
      usuario.diretoria,
    );
  }
}
