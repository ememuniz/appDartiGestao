import { IsNotEmpty, IsString, IsDateString, IsUUID } from 'class-validator';

export class CriarTarefaDto {
  @IsNotEmpty({ message: 'O título da tarefa é obrigatório.' })
  @IsString()
  titulo!: string;

  @IsNotEmpty({ message: 'A descrição da tarefa é obrigatória.' })
  @IsString()
  descricao!: string;

  @IsNotEmpty({ message: 'A data de entrega é obrigatória.' })
  @IsDateString({}, { message: 'Data de entrega inválida.' })
  dataEntrega!: string;

  @IsNotEmpty({ message: 'O membro responsável é obrigatório.' })
  @IsUUID('4', { message: 'ID do responsável inválido.' })
  responsavelId!: string;
}
