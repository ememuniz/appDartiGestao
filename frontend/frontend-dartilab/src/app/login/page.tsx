'use client'
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './login.module.css'

export default function LoginPage(){
  // CRIA O HOOK DE NAVEGACAO
  const router = useRouter();

  // VARIÁVEIS DE CONTROLE PARA FEEDBACK DO USUÁRIO
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  
  // FUNÇÃO DE LOGIN
  const handleLogin = async (formData: FormData) => {
    setMensagemErro(null); // Limpa a mensagem de erro anterior
    setCarregando(true); // Ativa o indicador de carregamento

    // EXTRAÇÃO DOS DADOS DO FORMULÁRIO
    const email = formData.get('email') as string;
    const senha = formData.get('senha') as string;

    try {
      // REQUISIÇÃO POST PARA /auth/login
      const response = await fetch('http://localhost:3001/auth/login', {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
        },
        body: JSON.stringify({ email, senha }),
      });

      // TRATA A RESPOSTA DA REQUISIÇÃO COMO JSON
      const dadosResposta = await response.json() as {
        access_token?: string;
        papel?: string;
        mensagem?: string | string[];
      };
      
      // SE A RESPOSTA FOR UM ERRO
      if (!response.ok) {
        const erroApi = Array.isArray(dadosResposta.mensagem) ?
        dadosResposta.mensagem[0] : dadosResposta.mensagem || 'E-mail ou senha incorretos.';
        throw new Error(erroApi);
      }
      
      // SE A RESPOSTA FOR SUCESSO
      if (dadosResposta.access_token && dadosResposta.papel) {
        localStorage.setItem('@DartiLab:token', dadosResposta.access_token);
        localStorage.setItem('@DartiLab:papel', dadosResposta.papel);
        const rotaPapel = dadosResposta.papel.toLowerCase().replace('_', '-');
        router.push(`/dashboard/${rotaPapel}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        setMensagemErro(error.message);
      } else {
        setMensagemErro('Ocorreu um erro desconhecido.');
      }   
    } finally {
      setCarregando(false);
    }
  };

  return(
    <main className={styles.container}>
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
          Junte-se ao DartiLab. O laboratório multidisciplinar da UFMA, onde tecnologia, biotecnologia, inovação social e educação digital convergem para redefinir o futuro.
        </p>
      </section>

      <section className={styles.formSection}>
        <div className={styles.formBox}>
          <h2 className={styles.formTitle}>Login</h2>
          <p className={styles.formSubtitle}>Entre com suas credenciais organizacionais</p>

          {mensagemErro && <div className={styles.alertError}>{mensagemErro}</div>}

          {/* Substituímos o onSubmit={handleSubmit} por action={handleLogin} */}
          <form action={handleLogin}>
            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="email">E-mail Institucional</label>
              <input
                className={styles.input}
                type="email"
                id="email"
                name="email" /* O atributo "name" é obrigatório para o FormData funcionar */
                placeholder="seu.email@ufma.br"
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="senha">Senha</label>
              <input
                className={styles.input}
                type="password"
                id="senha"
                name="senha" /* O atributo "name" é obrigatório para o FormData funcionar */
                placeholder="••••••••"
                required
              />
            </div>

            <div className={styles.forgotGroup}>
              <Link href="/recuperar-senha" className={styles.forgotLink}>
                Esqueceu a senha?
              </Link>
            </div>

            <button type="submit" className={styles.button} disabled={carregando}>
              {carregando ? 'Autenticando...' : 'Entrar'}
            </button>

            <div className={styles.registerRedirect}>
              Não possui uma conta?
              <Link href="/registro" className={styles.registerLink}>
                Cadastre-se
              </Link>
            </div>
          </form>
        </div>
      </section>
    </main>
  )
}