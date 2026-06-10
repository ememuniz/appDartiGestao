// backend/auth-service/src/auth/auth.service.spec.ts
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AuthService - Registro', () => {
  let authService: AuthService;
  let prismaService: PrismaService;

  beforeEach(() => {
    // Criamos instâncias "falsas" (mocks) apenas para o teste
    prismaService = new PrismaService();
    authService = new AuthService(prismaService);
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
});
