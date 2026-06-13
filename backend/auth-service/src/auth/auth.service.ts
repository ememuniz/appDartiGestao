// backend/auth-service/src/auth/auth.service.ts
import {
  Injectable,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { isPasswordValid } from '../utils/password.validator';
import * as bcrypt from 'bcrypt';

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
    // 2. Busca o convite no banco de dados usando o Prisma
    const convite = await this.prisma.convite.findUnique({
      where: {
        codigo: dados.codigoConvite,
      },
    });
    // 3. Se o convite não existir ou a propriedade 'usado' for true, barramos o registro
    if (!convite || convite.usado) {
      throw new BadRequestException(
        'Código de convite inválido ou já utilizado.',
      );
    }
    // 4. Busca se já existe um membro com email informado.
    const emailExistente = await this.prisma.membro.findUnique({
      where: {
        email: dados.email,
      },
    });

    if (emailExistente) {
      throw new ConflictException('Email já cadastrado.');
    }

    // 5. Gera o Salt e faz o Hash da senha para protegê-la
    const salt = await bcrypt.genSalt(10);
    const senhaCriptografada = await bcrypt.hash(dados.senha, salt);

    // 6. Cria o registro do membro no banco de dados
    await this.prisma.membro.create({
      data: {
        nomeCompleto: dados.nomeCompleto,
        email: dados.email,
        senha: senhaCriptografada,
        papel: convite.papel, // Herda o Enum do convite
        conviteId: convite.id,
      },
    });

    // 7. Inutiliza o convite usado
    await this.prisma.convite.update({
      where: { codigo: dados.codigoConvite },
      data: { usado: true },
    });
    await Promise.resolve();
    return { registrado: true };
  }
}
