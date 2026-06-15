import { IsNotEmpty, IsString, IsOptional, IsUUID } from 'class-validator';

export class CriarComentarioDto {
  @IsNotEmpty({ message: 'O conteúdo do comentário não pode estar vazio.' })
  @IsString()
  conteudo!: string;

  @IsOptional()
  @IsUUID('4', { message: 'ID do comentário pai inválido.' })
  paiId?: string; // Para permitir aninhamento (respostas)
}
