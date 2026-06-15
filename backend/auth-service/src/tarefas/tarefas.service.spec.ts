/* deslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { TarefasService } from './tarefas.service';
import { PrismaService } from '../prisma/prisma.service';
import { Papel, Diretoria } from '@prisma/client';
import { ForbiddenException } from '@nestjs/common';

describe('TarefasService (TDD)', () => {
  let service: TarefasService;
  let prisma: PrismaService;

  const mockPrismaService = {
    membro: { findUnique: jest.fn() },
    tarefa: { create: jest.fn(), findMany: jest.fn(), findUnique: jest.fn() },
    comentarioTarefa: { create: jest.fn() },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TarefasService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<TarefasService>(TarefasService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  describe('criarTarefa', () => {
    it('deve permitir ao PRESIDENTE criar tarefa para qualquer diretoria', async () => {
      const dto = {
        titulo: 'Tarefa Pres',
        descricao: 'X',
        dataEntrega: '2026-12-31',
        responsavelId: 'membro-1',
      };

      mockPrismaService.membro.findUnique.mockResolvedValue({
        id: 'membro-1',
        diretoria: Diretoria.SOFTWARE,
      });
      mockPrismaService.tarefa.create.mockResolvedValue({
        id: 'task-1',
        ...dto,
      });

      await service.criarTarefa(
        'pres-id',
        Papel.PRESIDENTE,
        Diretoria.SEM_DIRETORIA,
        dto,
      );

      // eslint-disable-next-line
      expect(prisma.tarefa.create).toHaveBeenCalled();
    });

    it('deve dar erro se o DIRETOR tentar atribuir tarefa a membro de OUTRA diretoria', async () => {
      const dto = {
        titulo: 'Tarefa Invasora',
        descricao: 'X',
        dataEntrega: '2026-12-31',
        responsavelId: 'membro-marketing',
      };

      // Diretor é de SOFTWARE, mas o membro encontrado é de MARKETING
      mockPrismaService.membro.findUnique.mockResolvedValue({
        id: 'membro-marketing',
        diretoria: Diretoria.COMUNICACAO,
      });

      await expect(
        service.criarTarefa('dir-id', Papel.DIRETOR, Diretoria.SOFTWARE, dto),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('calcularStatusPrazo', () => {
    it('deve retornar VERDE se faltarem mais de 3 dias', () => {
      const hoje = new Date();
      const futura = new Date(hoje);
      futura.setDate(hoje.getDate() + 5);

      const status = service.calcularStatusPrazo(futura);
      expect(status).toBe('VERDE');
    });

    it('deve retornar AMARELO se faltarem 2 dias', () => {
      const hoje = new Date();
      const proxima = new Date(hoje);
      proxima.setDate(hoje.getDate() + 2);

      const status = service.calcularStatusPrazo(proxima);
      expect(status).toBe('AMARELO');
    });

    it('deve retornar VERMELHO se o prazo já passou', () => {
      const passada = new Date('2020-01-01');
      const status = service.calcularStatusPrazo(passada);
      expect(status).toBe('VERMELHO');
    });
  });
});
