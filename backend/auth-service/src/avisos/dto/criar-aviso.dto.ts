import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CriarAvisoDto {
  @IsNotEmpty({ message: 'O título do aviso não pode estar vazio.' })
  @IsString()
  @MinLength(5, { message: 'O título deve ter pelo menos 5 caracteres.' })
  titulo!: string;

  @IsNotEmpty({ message: 'O conteúdo do aviso não pode estar vazio.' })
  @IsString()
  @MinLength(10, { message: 'O conteúdo deve ter pelo menos 10 caracteres.' })
  conteudo!: string;
}
