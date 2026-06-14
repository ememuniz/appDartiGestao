import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RedefinirSenhaDto {
  @IsString()
  @IsNotEmpty({ message: 'O token é obrigatório.' })
  token!: string;

  @IsString()
  @MinLength(8, { message: 'A nova senha deve ter pelo menos 8 caracteres.' })
  novaSenha!: string;

  @IsString()
  @IsNotEmpty({ message: 'A confirmação da nova senha é obrigatória.' })
  confirmacaoNovaSenha!: string;
}
