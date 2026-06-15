/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { AvisosService } from './avisos.service';
import { PrismaService } from '../prisma/prisma.service';
import { Papel, Diretoria } from '@prisma/client';
import { ForbiddenException } from '@nestjs/common';

describe('AvisosService (TDD)', () => {
  let service: AvisosService;
  let prisma: PrismaService;

  const mockPrismaService = {
    aviso: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AvisosService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<AvisosService>(AvisosService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('criarAviso', () => {
    it('deve permitir ao PRESIDENTE criar um aviso GLOBAL (diretoria null)', async () => {
      const dto = { titulo: 'Aviso Geral', conteudo: 'Reunião geral amanhã' };
      mockPrismaService.aviso.create.mockResolvedValue({
        id: '1',
        ...dto,
        diretoria: null,
      });

      const resultado = await service.criarAviso(
        'user-pres',
        Papel.PRESIDENTE,
        Diretoria.SEM_DIRETORIA,
        dto,
      );

      expect(prisma.aviso.create).toHaveBeenCalledWith({
        data: {
          titulo: dto.titulo,
          conteudo: dto.conteudo,
          diretoria: null, // Global
          criadoPorId: 'user-pres',
        },
      });
      expect(resultado.diretoria).toBeNull();
    });

    it('deve permitir ao DIRETOR criar um aviso restrito à sua diretoria', async () => {
      const dto = { titulo: 'Aviso Devs', conteudo: 'Sprint planning hoje' };
      mockPrismaService.aviso.create.mockResolvedValue({
        id: '2',
        ...dto,
        diretoria: Diretoria.SOFTWARE,
      });

      const resultado = await service.criarAviso(
        'user-dir',
        Papel.DIRETOR,
        Diretoria.SOFTWARE,
        dto,
      );

      expect(prisma.aviso.create).toHaveBeenCalledWith({
        data: {
          titulo: dto.titulo,
          conteudo: dto.conteudo,
          diretoria: Diretoria.SOFTWARE,
          criadoPorId: 'user-dir',
        },
      });
      expect(resultado.diretoria).toBe(Diretoria.SOFTWARE);
    });

    it('deve proibir um MEMBRO de criar um aviso lançando ForbiddenException', async () => {
      const dto = {
        titulo: 'Aviso Ilegal',
        conteudo: 'Tentando burlar as regras',
      };

      await expect(
        service.criarAviso(
          'user-membro',
          Papel.MEMBRO,
          Diretoria.SOFTWARE,
          dto,
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('listarAvisos', () => {
    it('deve permitir ao PRESIDENTE ver todos os avisos sem filtros de diretoria', async () => {
      mockPrismaService.aviso.findMany.mockResolvedValue([]);

      await service.listarAvisos(Papel.PRESIDENTE, Diretoria.SEM_DIRETORIA);

      expect(prisma.aviso.findMany).toHaveBeenCalledWith({
        include: {
          criadoPor: {
            select: {
              nomeCompleto: true,
              nomeSocial: true,
              foto: true,
              papel: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('deve filtrar avisos para um MEMBRO (ver globais + os da sua diretoria)', async () => {
      mockPrismaService.aviso.findMany.mockResolvedValue([]);

      await service.listarAvisos(Papel.MEMBRO, Diretoria.SOFTWARE);

      expect(prisma.aviso.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            {
              diretoria: null,
            },
            { diretoria: Diretoria.SOFTWARE },
          ],
        },
        include: {
          criadoPor: {
            select: {
              nomeCompleto: true,
              nomeSocial: true,
              foto: true,
              papel: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    });
  });
});
