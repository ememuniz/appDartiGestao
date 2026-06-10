// backend/auth-service/src/utils/password.validator.spec.ts

// Vamos importar uma função que ainda nem criamos!
import { isPasswordValid } from './password.validator';

describe('Validador de Senha Forte', () => {
  it('deve rejeitar senhas com menos de 8 caracteres', () => {
    expect(isPasswordValid('Senha@1')).toBe(false); // Tem 7 caracteres
  });

  it('deve rejeitar senhas sem letra maiúscula', () => {
    expect(isPasswordValid('senha@1234')).toBe(false);
  });

  it('deve rejeitar senhas sem letra minúscula', () => {
    expect(isPasswordValid('SENHA@1234')).toBe(false);
  });

  it('deve rejeitar senhas sem números', () => {
    expect(isPasswordValid('Senha@abc')).toBe(false);
  });

  it('deve rejeitar senhas sem caracteres especiais', () => {
    expect(isPasswordValid('Senha12345')).toBe(false);
  });

  it('deve aceitar uma senha válida que cumpra todas as regras', () => {
    expect(isPasswordValid('Senha@123')).toBe(true);
  });
});
