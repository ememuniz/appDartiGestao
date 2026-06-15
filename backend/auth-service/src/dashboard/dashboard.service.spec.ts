/* geslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '../prisma/prisma.service';
import { Papel, Diretoria } from '@prisma/client';
import { ForbiddenException } from '@nestjs/common';

describe('DashboardService (TDD)', () => {
  let service: DashboardService;

  const mockPrismaService = {
    membro: { count: jest.fn() },
    tarefa: { count: jest.fn(), findMany: jest.fn() },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    jest.clearAllMocks();
  });

  describe('obterMetricasGerais', () => {
    it('deve permitir ao PRESIDENTE ver dados globais sem travar por diretoria', async () => {
      mockPrismaService.membro.count.mockResolvedValue(15);
      mockPrismaService.tarefa.count.mockResolvedValue(30);
      mockPrismaService.tarefa.findMany.mockResolvedValue([]);

      const dados = await service.obterMetricasGerais(
        Papel.PRESIDENTE,
        Diretoria.SEM_DIRETORIA,
      );

      expect(dados).toHaveProperty('totalMembros');
      expect(dados).toHaveProperty('totalTarefas');
    });

    it('deve filtrar por diretoria se o usuário logado for um DIRETOR', async () => {
      mockPrismaService.membro.count.mockResolvedValue(5);
      mockPrismaService.tarefa.count.mockResolvedValue(10);
      mockPrismaService.tarefa.findMany.mockResolvedValue([]);

      await service.obterMetricasGerais(Papel.DIRETOR, Diretoria.SOFTWARE);

      // Garante que o Prisma foi chamado filtrando especificamente pela diretoria do Diretor
      expect(mockPrismaService.membro.count).toHaveBeenCalledWith({
        where: { diretoria: Diretoria.SOFTWARE },
      });
    });

    it('deve barrar MEMBROS comuns de acessar o dashboard', async () => {
      await expect(
        service.obterMetricasGerais(Papel.MEMBRO, Diretoria.SOFTWARE),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
