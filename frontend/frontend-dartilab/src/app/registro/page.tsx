"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import styles from './registro.module.css'

export default function RegistroPage() {
  const [formData, setFormData] = useState({
    nomeCompleto: '',
    email: '',
    senha: '',
    confirmacaoSenha: '',
    codigoConvite: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Dados a serem enviados:', formData);
    // Aqui faremos a integração com o NestJS posteriormente
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

            <button type="submit" className={styles.button}>
              Validar e Registrar
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}
