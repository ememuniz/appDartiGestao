// backend/auth-service/src/auth/guards/jwt-auth.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extrairTokenDoCabecalho(request);

    if (!token) {
      throw new UnauthorizedException('Token de acesso não encontrado.');
    }

    try {
      interface JwtPayload {
        sub: string;
        email: string;
        papel: string;
        diretoria: string;
        iat?: number;
        exp?: number;
      }
      // Verifica a validade do token usando a mesma chave secreta
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: process.env.JWT_SECRET || 'CHAVE_SUPER_SECRETA_DO_DARTILAB',
      });
      // Injeta os dados do utilizador (id, email, papel, etc) no Request
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException('Token inválido ou expirado.');
    }
    return true;
  }

  private extrairTokenDoCabecalho(request: Request): string | undefined {
    const [tipo, token] = request.headers.authorization?.split(' ') ?? [];
    return tipo === 'Bearer' ? token : undefined;
  }
}
