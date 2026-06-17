"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import styles from './dashboard.module.css';

// Definição do Tipo de Usuário vindo do Backend
interface UsuarioLogado {
  id: string;
  nomeCompleto: string;
  nomeSocial: string | null;
  email: string;
  papel: 'PRESIDENTE' | 'VICE_PRESIDENTE' | 'DIRETOR' | 'MEMBRO' | 'ESTAGIARIO';
  diretoria: 'SEM_DIRETORIA' | 'RECURSOS_HUMANOS' | 'COMUNICACAO' | 'HARDWARE' | 'SOFTWARE' | 'MULTIDISCIPLINARIDADE';
  foto: string | null;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  
  const [usuario, setUsuario] = useState<UsuarioLogado | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const carregarPerfil = async () => {
      const token = localStorage.getItem('@DartiLab:token');

      if (!token) {
        router.push('/login');
        return;
      }

      try {
        // Buscando os dados em tempo real do perfil do usuário logado
        const response = await fetch('http://localhost:3001/membros/perfil', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Sessão expirada');
        }

        const dados = await response.json() as UsuarioLogado;
        setUsuario(dados);
      } catch (error) {
        console.error(error);
        localStorage.removeItem('@DartiLab:token');
        localStorage.removeItem('@DartiLab:papel');
        router.push('/login');
      } finally {
        setCarregando(false);
      }
    };

    void carregarPerfil();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('@DartiLab:token');
    localStorage.removeItem('@DartiLab:papel');
    router.push('/login');
  };

  if (carregando) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Carregando ecossistema DartiLab...</p>
      </div>
    );
  }

  if (!usuario) return null;

  // Priorização do Nome Social conforme regra de negócio
  const nomeExibicao = usuario.nomeSocial || usuario.nomeCompleto;

  // Controle de links dinâmicos na Sidebar por Papel
  const exibirGerenciamentoMembros = usuario.papel === 'PRESIDENTE' || usuario.papel === 'VICE_PRESIDENTE';

  // Formatação amigável das labels de Diretoria
  const formatarDiretoria = (dir: string) => {
    if (dir === 'SEM_DIRETORIA') return 'Geral';
    return dir.replace('_', ' ');
  };

  return (
    <div className={styles.layoutWrapper}>
      {/* SIDEBAR DE NAVEGAÇÃO */}
      <aside className={styles.sidebar}>
        <div className={styles.logoBox}>
          <Image
            src="/logo-darti.png"
            alt="Logo DartiLab"
            width={140}
            height={45}
            style={{ objectFit: 'contain' }}
          />
        </div>

        {/* CARD DO USUÁRIO */}
        <div className={styles.profileCard}>
          <div className={styles.avatarWrapper}>
            <Image
              src={usuario.foto || '/default-avatar.png'} 
              alt={`Foto de ${nomeExibicao}`}
              width={64}
              height={64}
              className={styles.avatar}
            />
          </div>
          <h3 className={styles.userName}>{nomeExibicao}</h3>
          <span className={styles.userRoleBadge}>{usuario.papel.replace('_', ' ')}</span>
          <p className={styles.userDiretoria}>📍 {formatarDiretoria(usuario.diretoria)}</p>
        </div>

        {/* MENU DINÂMICO */}
        <nav className={styles.navigation}>
          <p className={styles.menuTitle}>Navegação</p>
          
          <Link 
            href={`/dashboard/${usuario.papel.toLowerCase().replace('_', '-')}`}
            className={`${styles.navLink} ${pathname.includes('/dashboard/') && !pathname.includes('membros') ? styles.activeLink : ''}`}
          >
            📊 Dashboard
          </Link>

          {/* Opção exibida somente para Presidentes e Vices */}
          {exibirGerenciamentoMembros && (
            <Link 
              href="/dashboard/gerenciar-membros"
              className={`${styles.navLink} ${pathname.includes('gerenciar-membros') ? styles.activeLink : ''}`}
            >
              👥 Gerenciar Membros
            </Link>
          )}

          {/* Links futuros podem ser plugados aqui respeitando as regras */}
        </nav>

        {/* BOTÃO DE LOGOUT */}
        <button onClick={handleLogout} className={styles.logoutButton}>
          🚪 Sair do Sistema
        </button>
      </aside>

      {/* CONTEÚDO PRINCIPAL À DIREITA */}
      <div className={styles.mainContent}>
        <header className={styles.topbar}>
          <h2>Painel Operacional DartiLab</h2>
          <div className={styles.dateDisplay}>
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </header>
        
        <main className={styles.pageBody}>
          {children}
        </main>
      </div>
    </div>
  );
}