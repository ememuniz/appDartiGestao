// backend/auth-service/src/auth/guards/roles.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Papel } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

interface RequestComUsuario extends Request {
  user?: {
    sub: string;
    email: string;
    papel: Papel;
    diretoria: string;
  };
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Procura se a rota tem o decorador @Roles
    const requiredRoles = this.reflector.getAllAndOverride<Papel[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Se não tiver o decorador, a rota está libertada (passa)
    if (!requiredRoles) {
      return true;
    }

    // Pega o utilizador que foi injetado pelo JwtAuthGuard
    const request = context.switchToHttp().getRequest<RequestComUsuario>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Utilizador não autenticado.');
    }

    // Verifica se o papel do utilizador está dentro dos papéis permitidos para esta rota
    const temPermissao = requiredRoles.includes(user.papel);

    if (!temPermissao) {
      throw new ForbiddenException(
        'Não tem privilégios organizacionais para aceder a este recurso.',
      );
    }

    return true;
  }
}
