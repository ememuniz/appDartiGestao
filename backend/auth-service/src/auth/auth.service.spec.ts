// backend/auth-service/src/auth/auth.service.spec.ts
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

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
    authService = new AuthService(prismaService as unknown as PrismaService);
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
