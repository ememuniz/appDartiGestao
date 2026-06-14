// backend/auth-service/src/auth/auth.service.ts
import {
  Injectable, //Serve para injeção de dependência
  BadRequestException, // Serve para rejeitar uma requisição
  ConflictException, // Serve para rejeitar uma requisição devido a um conflito
  UnauthorizedException, // Serve para rejeitar uma requisição devido a uma autorização
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { isPasswordValid } from '../utils/password.validator';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { randomBytes } from 'crypto';

interface RegistrarMembroDto {
  nomeCompleto: string;
  email: string;
  senha: string;
  codigoConvite: string;
}

@Injectable()
export class AuthService {
  // Injetamos a nossa ponte do Prisma para usar o banco de dados futuramente
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  // LOGIN
  async login(
    dados: LoginDto,
  ): Promise<{ access_token: string; papel: string }> {
    // Busca o usuário pelo e-mail
    const usuario = await this.prisma.membro.findUnique({
      where: { email: dados.email },
    });

    // Se não achar, barra por falta de autorização
    if (!usuario) {
      throw new UnauthorizedException('E-mail ou senha inválidos.');
    }

    // Compara a senha digitada com hash salvo no banco
    const senhaValida = await bcrypt.compare(dados.senha, usuario.senha);
    if (!senhaValida) {
      throw new UnauthorizedException('E-mail ou senha inválidos.');
    }

    // Prepara as informações que vão dentro do Token
    const payload = {
      sub: usuario.id,
      email: usuario.email,
      papel: usuario.papel,
    };

    // Retorna o token assinado e o papel para o frontend guiar a rota
    return {
      access_token: this.jwtService.sign(payload),
      papel: usuario.papel,
    };
  }

  // REGISTRO
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

  // SOLICITAR RECUPERAÇÃO DE SENHAS
  async solicitarRecuperacaoSenha(
    email: string,
  ): Promise<{ mensagem: string }> {
    const usuario = await this.prisma.membro.findUnique({
      where: { email },
    });

    // Se o usuário não existir, retornamos a mensagem de segurança
    if (!usuario) {
      return {
        mensagem:
          'Se o e-mail existir em nossa base, um link de recuperação será enviado.',
      };
    }

    // Gera um token aleatório seguro de 32 caracteres
    const tokenRecuperacao = randomBytes(32).toString('hex');

    //Define a expiração para 1 hora a partir de agora
    const expiracaoToken = new Date();
    expiracaoToken.setHours(expiracaoToken.getHours() + 1);

    // Salva no banco de dados
    await this.prisma.membro.update({
      where: { id: usuario.id },
      data: {
        tokenRecuperacao,
        expiracaoToken,
      },
    });

    // TODO: Chamada para o serviço de email ficará aqui
    return {
      mensagem:
        'Se o email existir em nossa base, um link de recuperação sera enviado.',
    };
  }

  // REDEFINIR A SENHA
  async redefinirSenha(
    token: string,
    novaSenha: string,
  ): Promise<{ mensagem: string }> {
    const usuario = await this.prisma.membro.findFirst({
      where: {
        tokenRecuperacao: token,
        expiracaoToken: {
          gt: new Date(),
        },
      },
    });

    if (!usuario) {
      throw new UnauthorizedException('Token inválido ou expirado.');
    }

    const senhaCriptografada = await bcrypt.hash(novaSenha, 10);

    await this.prisma.membro.update({
      where: { id: usuario.id },
      data: {
        senha: senhaCriptografada,
        tokenRecuperacao: null,
        expiracaoToken: null,
      },
    });

    return { mensagem: 'Senha redefinida com sucesso.' };
  }
}
