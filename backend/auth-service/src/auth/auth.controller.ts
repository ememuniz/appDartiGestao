import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegistrarMembroDto } from './dto/registrar-membro.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  //readonly indica que o atributo nao pode ser alterado e somente leitura
  //o que entrar como argumento, vai ser o body da requisicao

  @Post('registro')
  async registrar(@Body() dados: RegistrarMembroDto) {
    // recebe o body da requisicao depois de passar pela validacao no dto
    // VERIFICA SE A SENHA E A CONFIRMACAO DE SENHA SAO IGUAIS
    if (dados.senha !== dados.confirmacaoSenha) {
      throw new BadRequestException(
        'A senha e a confirmação de senha devem ser iguais.',
      );
    }

    // REGISTRA O MEMBRO CHAMANDO A FUNCAO REGISTRARMEMBRO QUE ACESSA O PRISMA
    return this.authService.registrarMembro({
      nomeCompleto: dados.nomeCompleto,
      email: dados.email,
      senha: dados.senha,
      codigoConvite: dados.codigoConvite,
    });
  }
}
