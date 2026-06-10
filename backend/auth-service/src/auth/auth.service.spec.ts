// backend/auth-service/src/auth/auth.service.spec.ts
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AuthService - Registro', () => {
  let authService: AuthService;

  let prismaService: {
    convite: {
      findUnique: jest.Mock;
    };
    membro: {
      findUnique: jest.Mock;
    };
  };
  beforeEach(() => {
    // Criamos instâncias "falsas" (mocks) apenas para o teste
    prismaService = {
      convite: {
        findUnique: jest.fn(),
      },
      membro: {
        findUnique: jest.fn(),
      },
    };
    authService = new AuthService(prismaService as unknown as PrismaService);
  });

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
});
