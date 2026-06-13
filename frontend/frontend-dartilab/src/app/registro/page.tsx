"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import styles from './registro.module.css'
import Link from 'next/link';

export default function RegistroPage() {
  const [formData, setFormData] = useState({
    nomeCompleto: '',
    email: '',
    senha: '',
    confirmacaoSenha: '',
    codigoConvite: '',
  });

  // Estado para feedbacks visuais
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);
  const [cadastradoComSucesso, setCadastradoComSucesso] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMensagemErro(null);
    setCarregando(true);

    // Validação no front antes de gastar banda de rede
    if (formData.senha !== formData.confirmacaoSenha) {
      setMensagemErro('A senha e a confirmação de senha não coicidem.');
      setCarregando(false);
      return;
    }

    console.log(formData);

    try {
      // Requisição
      const response = await fetch('http://localhost:3001/auth/registro', {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
        },
        body: JSON.stringify({
          nomeCompleto: formData.nomeCompleto,
          email: formData.email,
          senha: formData.senha,
          confirmacaoSenha: formData.confirmacaoSenha,
          codigoConvite: formData.codigoConvite
        }),
      });

      // Transformando a resposta em JSON
      const dadosResposta = await response.json() as { message?: string | string[] };

      // Se algo deu errado
      if (!response.ok) {
        const erroApi = Array.isArray(dadosResposta.message) ?
        dadosResposta.message[0] : dadosResposta.message || 'Ocorreu um erro ao realizar o registro';
        throw new Error(erroApi);
      }

      // Se deu certo
      setCadastradoComSucesso(true);
      setFormData({
        nomeCompleto: '',
        email: '',
        senha: '',
        confirmacaoSenha: '',
        codigoConvite: '',
      });

    } catch (error) {
      if (error instanceof Error) {
        setMensagemErro(error.message);
      } else {
        setMensagemErro('Erro inesperado na comunicação com o servidor.');
      }
    } finally {
      setCarregando(false);
    }
  };
  return (
    <main className={styles.container}>
      {/* LADO ESQUERDO: Visual Dartilab */}
      <section className={styles.banner}>
        <div className={styles.logoContainer}>
          {/* Renderizando a Logo do Dartilab */}
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

      {/* LADO DIREITO: Formulário */}
      <section className={styles.formSection}>
        <div className={styles.formBox}>
          <h2 className={styles.formTitle}>Criar Conta</h2>
          <p className={styles.formSubtitle}>Insira seus dados e o seu código de convite</p>

          {/* Exibição dos alertas de feedback */}
          {mensagemErro && <div className={styles.alertError}>{mensagemErro}</div>}
          {cadastradoComSucesso && <div className={styles.alertSuccess}>Conta criada com sucesso! Você já pode fazer login.</div>}

          {/* Formulário de registro */}
          <form onSubmit={handleSubmit}>
            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="nomeCompleto">Nome Completo</label>
              <input
                className={styles.input}
                type="text"
                id="nomeCompleto"
                name="nomeCompleto"
                placeholder="Ex: Alan Turing"
                value={formData.nomeCompleto}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="email">E-mail Institucional</label>
              <input 
                className={styles.input}
                type="email"
                id="email"
                name="email"
                placeholder="seu.email@ufma.br"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="codigoConvite">Código de Convite</label>
              <input
                className={styles.input}
                type="text"
                id="codigoConvite"
                name="codigoConvite"
                placeholder="XXXX-XXXX"
                value={formData.codigoConvite}
                onChange={handleChange}
                required
                />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="senha">Senha Segura</label>
              <input 
                className={styles.input}
                type="password"
                id="senha"
                name="senha"
                placeholder= "••••••••"
                value={formData.senha}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="confirmacaoSenha">Confirmar Senha</label>
              <input 
                className={styles.input}
                type="password"
                id="confirmacaoSenha"
                name="confirmacaoSenha"
                placeholder= "••••••••"
                value={formData.confirmacaoSenha}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className={styles.button} disabled={carregando}>
              {carregando ? 'Processando...' : 'Validar e Registrar'}
            </button>

            {/* 2. ADICIONE ESTE BLOCO LOGO ABAIXO DO BOTÃO */}
            <div className={styles.loginRedirect}>
              Já possui cadastro?
              <Link href='/login' className={styles.loginLink}>
                Faça login
              </Link>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
