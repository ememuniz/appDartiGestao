"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './recuperar-senha.module.css';

export default function RecuperarSenhaPage() {
  const router = useRouter();

  // 'solicitar' = pede e-mail | 'redefinir' = pede token e nova senha
  const [passo, setPasso] = useState<'solicitar' | 'redefinir'>('solicitar');
  
  // Guardamos o e-mail digitado no primeiro passo para enviar junto no segundo passo se necessário
  const [emailGuardado, setEmailGuardado] = useState('');

  // Estados de feedback visual
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  // PASSO 1: Solicitar o código de recuperação
  const handleSolicitar = async (formData: FormData) => {
    setMensagemErro(null);
    setMensagemSucesso(null);
    setCarregando(true);

    const email = formData.get('email') as string;

    try {
      const response = await fetch('http://localhost:3001/auth/solicitar-recuperacao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const dados = await response.json() as { message?: string | string[] };

      if (!response.ok) {
        const erroApi = Array.isArray(dados.message) ? dados.message[0] : dados.message || 'Erro ao solicitar recuperação.';
        throw new Error(erroApi);
      }

      setEmailGuardado(email);
      setMensagemSucesso('Código de recuperação enviado para o seu e-mail!');
      setPasso('redefinir'); // Avança para o formulário de redefinição
    // eslint-disable-next-line 
    } catch (error: any) {
      setMensagemErro(error.message || 'Ocorreu um erro inesperado.');
    } finally {
      setCarregando(false);
    }
  };

  // PASSO 2: Enviar o token e a nova senha definida
  const handleRedefinir = async (formData: FormData) => {
    setMensagemErro(null);
    setCarregando(true);

    const token = formData.get('token') as string;
    const novaSenha = formData.get('novaSenha') as string;
    const confirmacaoSenha = formData.get('confirmacaoSenha') as string;

    if (novaSenha !== confirmacaoSenha) {
      setMensagemErro('As senhas digitadas não coincidem.');
      setCarregando(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/auth/redefinir-senha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailGuardado,
          token,
          novaSenha,
        }),
      });

      const dados = await response.json() as { message?: string | string[] };

      if (!response.ok) {
        const erroApi = Array.isArray(dados.message) ? dados.message[0] : dados.message || 'Erro ao redefinir a senha.';
        throw new Error(erroApi);
      }

      setMensagemSucesso('Senha redefinida com sucesso! Redirecionando para o login...');
      
      // Aguarda 3 segundos para o usuário ler a mensagem de sucesso e manda pro login
      setTimeout(() => {
        router.push('/login');
      }, 3000);
      // eslint-disable-next-line 
    } catch (error: any) {
      setMensagemErro(error.message || 'Ocorreu um erro inesperado.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <main className={styles.container}>
      {/* LADO ESQUERDO: Identidade Visual Dartilab */}
      <section className={styles.banner}>
        <div className={styles.logoContainer}>
          <Image
            src="/logo-darti.png"
            alt="Logo Dartilab"
            width={180}
            height={60}
            style={{ objectFit: 'contain' }}
          />
        </div>
        <h1 className={styles.bannerTitle}>
          Inovação, IA & <br />
          <span className={styles.bannerHighlight}>Humanidade</span>
        </h1>
        <p className={styles.bannerDescription}>
          Junte-se ao DartiLab. O laboratório multidisciplinar da UFMA onde tecnologia, biotecnologia, inovação social e educação digital convergem para redefinir o futuro.
        </p>
      </section>

      {/* LADO DIREITO: Formulários Dinâmicos baseados no Passo */}
      <section className={styles.formSection}>
        <div className={styles.formBox}>
          
          {passo === 'solicitar' ? (
            <>
              <h2 className={styles.formTitle}>Recuperar Senha</h2>
              <p className={styles.formSubtitle}>Insira seu e-mail para receber um código de verificação</p>

              {mensagemErro && <div className={styles.alertError}>{mensagemErro}</div>}

              <form action={handleSolicitar}>
                <div className={styles.inputGroup}>
                  <label className={styles.label} htmlFor="email">E-mail Institucional</label>
                  <input
                    className={styles.input}
                    type="email"
                    id="email"
                    name="email"
                    placeholder="seu.email@ufma.br"
                    required
                  />
                </div>

                <button type="submit" className={styles.button} disabled={carregando}>
                  {carregando ? 'Enviando...' : 'Solicitar Código'}
                </button>
              </form>
            </>
          ) : (
            <>
              <h2 className={styles.formTitle}>Nova Senha</h2>
              <p className={styles.formSubtitle}>Insira o código enviado e escolha sua nova senha institucional</p>

              {mensagemErro && <div className={styles.alertError}>{mensagemErro}</div>}
              {mensagemSucesso && <div className={styles.alertSuccess}>{mensagemSucesso}</div>}

              <form action={handleRedefinir}>
                <div className={styles.inputGroup}>
                  <label className={styles.label} htmlFor="token">Código de Verificação</label>
                  <input
                    className={styles.input}
                    type="text"
                    id="token"
                    name="token"
                    placeholder="Digite o código recebido"
                    required
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label} htmlFor="novaSenha">Nova Senha</label>
                  <input
                    className={styles.input}
                    type="password"
                    id="novaSenha"
                    name="novaSenha"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label} htmlFor="confirmacaoSenha">Confirmar Nova Senha</label>
                  <input
                    className={styles.input}
                    type="password"
                    id="confirmacaoSenha"
                    name="confirmacaoSenha"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <button type="submit" className={styles.button} disabled={carregando}>
                  {carregando ? 'Processando...' : 'Alterar Senha'}
                </button>
              </form>
            </>
          )}

          {/* Atalho para retornar ao Login */}
          <div className={styles.loginRedirect}>
            Lembrou as credenciais?
            <Link href="/login" className={styles.loginLink}>
              Voltar para o Login
            </Link>
          </div>

        </div>
      </section>
    </main>
  );
}