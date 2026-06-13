import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    console.log(
      '🔌 Tentando conectar ao banco com a URL:',
      process.env.DATABASE_URL,
    );

    if (!process.env.DATABASE_URL) {
      throw new Error(
        '❌ ERRO CRÍTICO: A variável de ambiente DATABASE_URL não foi carregada pelo Node.js!',
      );
    }
    // 1. Adicionamos "as string" para garantir ao TypeScript que a URL existe e é um texto
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    // 2. Removemos as chaves {} de volta do "pool"
    const adapter = new PrismaPg(pool);

    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }
}
