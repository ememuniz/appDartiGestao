// backend/auth-service/src/auth/auth.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { isPasswordValid } from '../utils/password.validator';

interface RegistrarMembroDto {
  nomeCompleto: string;
  email: string;
  senha: string;
  codigoConvite: string;
}

@Injectable()
export class AuthService {
  // Injetamos a nossa ponte do Prisma para usar o banco de dados futuramente
  constructor(private readonly prisma: PrismaService) {}

  async registrarMembro(dados: RegistrarMembroDto) {
    // 1. Usamos o validador de senha que criamos no primeiro passo do TDD
    if (!isPasswordValid(dados.senha)) {
      // Se a senha for fraca, disparamos o erro exato que o teste espera
      throw new BadRequestException(
        'A senha não atende aos requisitos de segurança.',
      );
    }
    await Promise.resolve();
    // [Os próximos passos do registro entrarão aqui: verificar convite, criptografar senha, salvar...]
    return { registrado: true };
  }
}
