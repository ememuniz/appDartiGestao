export function isPasswordValid(senha: string): boolean {
  if (senha.length < 8) return false;
  const temMaiuscula = /[A-Z]/.test(senha);
  const temMinuscula = /[a-z]/.test(senha);
  const temNumero = /[0-9]/.test(senha);
  const temCaracterEspecial = /[!@#$%^&*(),.?":{}|<>]/.test(senha);
  return temMaiuscula && temMinuscula && temNumero && temCaracterEspecial;
}
