import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
// A class-validator serve para validar os dados de entrada do membro, alguns não podem ser nulos, alguns devem ser strings, outros devem ter formato de email e outros devem ter pelo menos 8 caracteres
export class RegistrarMembroDto {
  @IsString()
  @IsNotEmpty({ message: 'O nome completo é obrigatório.' })
  nomeCompleto!: string;

  @IsEmail({}, { message: 'O formato do e-mail é inválido.' })
  email!: string;

  @IsString()
  @MinLength(8, { message: 'A senha deve ter pelo menos 8 caracteres.' })
  senha!: string;

  @IsString()
  @IsNotEmpty({ message: 'A confirmação de senha é obrigatória.' })
  confirmacaoSenha!: string;

  @IsString()
  @IsNotEmpty({ message: 'O código de convite é obrigatório.' })
  codigoConvite!: string;
}
