import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthService } from './auth/auth.service';
import { PrismaService } from './prisma/prisma.service';
import { AuthController } from './auth/auth.controller';
import { AvisosModule } from './avisos/avisos.module';
import { TarefasModule } from './tarefas/tarefas.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { MembrosModule } from './membros/membros.module';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'CHAVE_SUPER_SECRETA_DO_DARTILAB',
      signOptions: { expiresIn: '1d' },
    }),
    AvisosModule,
    TarefasModule,
    DashboardModule,
    MembrosModule,
  ],
  controllers: [AppController, AuthController],
  providers: [AppService, AuthService, PrismaService],
})
export class AppModule {}
