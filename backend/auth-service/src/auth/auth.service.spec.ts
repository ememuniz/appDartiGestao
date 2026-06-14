// backend/auth-service/src/auth/auth.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

// mockPrismaService cria um mock de um membro no banco de dados
const mockPrismaService = {
  membro: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    findFirst: jest.fn(),
  },
};

// mockJwtService cria um mock de um token JWT fake
const mockJwtService = {
  sign: jest.fn(() => 'jwt_token_fake'),
};

describe('AuthService - Login', () => {
  let service: AuthService; // instância do servico
  let prisma: typeof mockPrismaService; // instância do prisma

  // Antes de cada teste, criamos uma nova instância do servico
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get(PrismaService);
  });

  it('deve logar com sucesso e retornar o token e o papel do usuário', async () => {
    const senhaPlana = 'SenhaSegura123!';
    const senhaCriptografada = await bcrypt.hash(senhaPlana, 10);

    prisma.membro.findUnique.mockResolvedValue({
      id: 'user-id-123',
      email: 'alan.turing@ufma.br',
      senha: senhaCriptografada,
      papel: 'PRESIDENTE',
    });

    const resultado = await service.login({
      email: 'alan.turing@ufma.br',
      senha: senhaPlana,
    });

    expect(resultado).toHaveProperty('access_token');
    expect(resultado.papel).toBe('PRESIDENTE');
  });

  it('deve lançar UnauthorizedException se o e-mail não for encontrado', async () => {
    prisma.membro.findUnique.mockResolvedValue(null);

    await expect(
      service.login({ email: 'inexistente@ufma.br', senha: '123' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('deve lançar UnauthorizedException se a senha estiver incorreta', async () => {
    prisma.membro.findUnique.mockResolvedValue({
      id: 'user-id-123',
      email: 'alan.turing@ufma.br',
      senha: 'hash_de_outra_senha',
      papel: 'MEMBRO',
    });

    await expect(
      service.login({ email: 'alan.turing@ufma.br', senha: 'senha_errada' }),
    ).rejects.toThrow(UnauthorizedException);
  });
});

describe('AuthService - Registro', () => {
  let authService: AuthService;

  let prismaService: {
    convite: {
      findUnique: jest.Mock;
      update: jest.Mock;
    };
    membro: {
      findUnique: jest.Mock;
      create: jest.Mock;
    };
  };
  beforeEach(() => {
    // Criamos instâncias "falsas" (mocks) apenas para o teste
    prismaService = {
      convite: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      membro: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };
    authService = new AuthService(
      prismaService as unknown as PrismaService,
      mockJwtService as unknown as JwtService,
    );
  }); //beforeEach serve para executar antes de todos os testes

  it('deve dar erro se a senha for fraca', async () => {
    // Tentamos registrar um membro com senha fraca
    const dadosRegistro = {
      nomeCompleto: 'João da Silva',
      email: 'joao@email.com',
      senha: 'fraca', // Senha sem maiúscula e símbolos
      codigoConvite: 'CODIGO-VALIDO',
    };

    // Esperamos que a função "registrarMembro" dispare um erro
    await expect(authService.registrarMembro(dadosRegistro)).rejects.toThrow(
      'A senha não atende aos requisitos de segurança.',
    );
  });

  it('deve dar erro se o código de convite não existir ou já tiver sido usado', async () => {
    // 3. Isso continua funcionando perfeitamente e com autocompletação do Jest!
    prismaService.convite.findUnique.mockResolvedValue(null);

    const dadosRegistro = {
      nomeCompleto: 'João da Silva',
      email: 'joao@email.com',
      senha: 'SenhaForte@2026',
      codigoConvite: 'CONVITE-INEXISTENTE',
    };

    await expect(authService.registrarMembro(dadosRegistro)).rejects.toThrow(
      'Código de convite inválido ou já utilizado.',
    );
  });

  it('deve dar erro se o email já estiver cadastrado', async () => {
    prismaService.convite.findUnique.mockResolvedValue({
      id: '1',
      codigo: 'CONVITE-OK',
      usado: false,
    });
    prismaService.membro.findUnique.mockResolvedValue({
      id: 'user-existente',
      email: 'joao@email.com',
    });

    const dadosRegistro = {
      nomeCompleto: 'João da Silva',
      email: 'joao@email.com',
      senha: 'SenhaForte@2026',
      codigoConvite: 'CONVITE-OK',
    };

    await expect(authService.registrarMembro(dadosRegistro)).rejects.toThrow(
      'Email já cadastrado.',
    );
  });

  it('deve criptografar a senha, salvar o membro e marcar o convite como usado', async () => {
    prismaService.convite.findUnique.mockResolvedValue({
      id: '1',
      codigo: 'CONVITE-OK',
      usado: false,
      papel: 'DIRETOR',
    }); // Convite OK
    prismaService.membro.findUnique.mockResolvedValue(null); // Não existe membro com esse email
    prismaService.membro.create.mockResolvedValue({
      id: 'novo-membro-uuid',
      email: 'joao@email.com',
    }); // Novo membro criado
    prismaService.convite.update.mockResolvedValue({
      id: '1',
      usado: true,
    }); // Convite usado

    const dadosRegistro = {
      nomeCompleto: 'João da Silva',
      email: 'joao@email.com',
      senha: 'SenhaForte@2026',
      codigoConvite: 'CONVITE-OK',
    };
    const resultado = await authService.registrarMembro(dadosRegistro);

    expect(resultado).toEqual({ registrado: true });

    expect(prismaService.membro.create).toHaveBeenCalledWith({
      data: {
        nomeCompleto: 'João da Silva',
        email: 'joao@email.com',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        senha: expect.any(String),
        papel: 'DIRETOR',
        conviteId: '1',
      },
    });
    expect(prismaService.convite.update).toHaveBeenCalledWith({
      where: { codigo: 'CONVITE-OK' },
      data: { usado: true },
    });
  });
});

describe('AuthService - Recuperação de Senha', () => {
  let service: AuthService;
  beforeEach(() => {
    service = new AuthService(
      mockPrismaService as unknown as PrismaService,
      mockJwtService as unknown as JwtService,
    );
  });
  it('deve gerar e salvar um token de recuperação se o email existir', async () => {
    // Mock do usuário sendo encontrado
    mockPrismaService.membro.findUnique.mockResolvedValue({
      id: '123',
      email: 'teste@ufma.br',
    });
    // Mock da atualização salvando o token
    mockPrismaService.membro.update.mockResolvedValue(true);

    const resultado = await service.solicitarRecuperacaoSenha('teste@ufma.br');

    expect(mockPrismaService.membro.findUnique).toHaveBeenCalledWith({
      where: { email: 'teste@ufma.br' },
    });
    expect(mockPrismaService.membro.update).toHaveBeenCalled();
    expect(resultado).toHaveProperty('mensagem');
  });

  it('deve redefinir a senha com sucesso usando um token válido', async () => {
    const novaSenha = 'NovaSenhaSegura123!';
    const membroComTokenValido = {
      id: '123',
      email: 'teste@ufma.br',
      tokenRecuperacao: 'token-valido-123',
      expiracaoToken: new Date(Date.now() + 3600000), // Expira em 1 hora
    };

    // Mock de encontrar o token válido
    mockPrismaService.membro.findFirst.mockResolvedValue(membroComTokenValido);
    // Mock de atualizar a senha
    mockPrismaService.membro.update.mockResolvedValue(true);

    const resultado = await service.redefinirSenha(
      'token-valido-123',
      novaSenha,
    );

    expect(mockPrismaService.membro.findFirst).toHaveBeenCalledWith({
      where: {
        tokenRecuperacao: 'token-valido-123',
        expiracaoToken: {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          gt: expect.any(Date),
        },
      },
    });
    expect(mockPrismaService.membro.update).toHaveBeenCalled();
    expect(resultado).toHaveProperty('mensagem');
  });

  it('deve lançar erro se o token for inválido ou estiver expirado', async () => {
    // Mock de não encontrar o token (inválido ou expirado)
    mockPrismaService.membro.findFirst.mockResolvedValue(null);

    await expect(
      service.redefinirSenha('token-invalido', 'NovaSenha123!'),
    ).rejects.toThrow('Token inválido ou expirado.');
  });
});
