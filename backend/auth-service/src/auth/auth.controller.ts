import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegistrarMembroDto } from './dto/registrar-membro.dto';
import { LoginDto } from './dto/login.dto';
import { SolicitarRecuperacaoDto } from './dto/solicitar-recuperacao.dto';
import { RedefinirSenhaDto } from './dto/redefinir-senha.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  //readonly indica que o atributo nao pode ser alterado e somente leitura
  //o que entrar como argumento, vai ser o body da requisicao

  // REGISTRO
  @Post('registro')
  async registrar(
    @Body() dados: RegistrarMembroDto,
  ): Promise<{ registrado: boolean }> {
    // recebe o body da requisicao depois de passar pela validacao no dto
    // VERIFICA SE A SENHA E A CONFIRMACAO DE SENHA SAO IGUAIS
    if (dados.senha !== dados.confirmacaoSenha) {
      throw new BadRequestException(
        'A senha e a confirmação de senha devem ser iguais.',
      );
    }

    // REGISTRA O MEMBRO CHAMANDO A FUNCAO REGISTRARMEMBRO QUE ACESSA O PRISMA
    const resultado = await this.authService.registrarMembro({
      nomeCompleto: dados.nomeCompleto,
      email: dados.email,
      senha: dados.senha,
      codigoConvite: dados.codigoConvite,
    });
    return resultado;
  }

  // LOGIN
  @Post('login')
  async login(
    @Body() dados: LoginDto,
  ): Promise<{ access_token: string; papel: string }> {
    const resultado = await this.authService.login(dados);
    return resultado;
  }

  // SOLICITAR RECUPERAÇÃO DE SENHAS
  @Post('solicitar-recuperacao')
  async solicitarRecuperacao(
    @Body() dados: SolicitarRecuperacaoDto,
  ): Promise<{ mensagem: string }> {
    const resultado = await this.authService.solicitarRecuperacaoSenha(
      dados.email,
    );
    return resultado;
  }

  // REDEFINIR A SENHA USANDO O TOKEN
  @Post('redefinir-senha')
  async redefinirSenha(
    @Body() dados: RedefinirSenhaDto,
  ): Promise<{ mensagem: string }> {
    if (dados.novaSenha !== dados.confirmacaoNovaSenha) {
      throw new BadRequestException(
        'A nova senha e a confirmação devem ser iguais.',
      );
    }
    const resultado = await this.authService.redefinirSenha(
      dados.token,
      dados.novaSenha,
    );
    return resultado;
  }
}
