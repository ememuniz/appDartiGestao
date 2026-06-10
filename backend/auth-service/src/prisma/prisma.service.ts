import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    // 1. Adicionamos "as string" para garantir ao TypeScript que a URL existe e é um texto
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL as string,
    });

    // 2. Removemos as chaves {} de volta do "pool"
    const adapter = new PrismaPg(pool);

    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }
}
