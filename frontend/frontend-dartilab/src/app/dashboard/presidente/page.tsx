"use client";

import React, { useState, useEffect, useCallback } from 'react';
import styles from './presidente.module.css';

interface Membro {
  id: string;
  nomeCompleto: string;
  nomeSocial: string | null;
  email: string;
  papel: string;
  diretoria: string;
}

interface Aviso {
  id: string;
  titulo: string;
  conteudo: string;
  createdAt: string;
}

interface Tarefa {
  id: string;
  nome: string;
  descricao: string;
  dataEntrega: string;
  linksExternos: string[];
  atribuidoA: { nomeCompleto: string; nomeSocial?: string | null };
}

export default function PresidenteDashboard() {
  const [membros, setMembros] = useState<Membro[]>([]);
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);

  const [novoAviso, setNovoAviso] = useState({ titulo: '', conteudo: '' });
  const [novaTarefa, setNovaTarefa] = useState({
    nome: '',
    descricao: '',
    dataEntrega: '',
    atribuidoAId: '',
    linkInput: '',
    linksExternos: [] as string[]
  });

  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  const carregarDadosDoPainel = useCallback(async () => {
    const token = localStorage.getItem('@DartiLab:token');
    if (!token) return;

    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [resMembros, resAvisos, resTarefas] = await Promise.all([
        fetch('http://localhost:3001/membros', { headers }),
        fetch('http://localhost:3001/avisos', { headers }),
        fetch('http://localhost:3001/tarefas', { headers })
      ]);

      if (resMembros.ok) setMembros(await resMembros.json() as Membro[]);
      if (resAvisos.ok) setAvisos(await resAvisos.json() as Aviso[]);
      if (resTarefas.ok) setTarefas(await resTarefas.json() as Tarefa[]);
    } catch (err) {
      console.error(err);
      setErro('Falha na sincronização com os servidores do DartiLab.');
    }
  }, []);

  useEffect(() => {
    const carregar = async () => {
      await carregarDadosDoPainel();
    };
    void carregar();
  }, [carregarDadosDoPainel]);

  const calcularAlertaPrazo = (dataEntregaStr: string) => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const entrega = new Date(dataEntregaStr);
    entrega.setHours(0, 0, 0, 0);

    const diferencaDias = Math.ceil((entrega.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));

    if (diferencaDias < 2) return styles.prazoVermelho;
    if (diferencaDias <= 4) return styles.prazoAmarelo;
    return styles.prazoVerde;
  };

  const limparMensagens = () => {
    setSucesso(null);
    setErro(null);
  };

  const handleAlterarCargoDiretoria = async (id: string, campo: 'papel' | 'diretoria', valor: string) => {
    limparMensagens();
    const token = localStorage.getItem('@DartiLab:token');
    try {
      const res = await fetch(`http://localhost:3001/membros/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ [campo]: valor })
      });
      if (res.ok) {
        setSucesso('Permissões atualizadas com sucesso!');
        void carregarDadosDoPainel();
      }
    } catch {
      setErro('Erro ao modificar privilégios.');
    }
  };

  const handleExcluirMembro = async (id: string) => {
    limparMensagens();
    if (!confirm('Deseja realmente desligar este membro do DartiLab?')) return;
    const token = localStorage.getItem('@DartiLab:token');
    try {
      const res = await fetch(`http://localhost:3001/membros/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setSucesso('Membro removido da organização.');
        void carregarDadosDoPainel();
      }
    } catch {
      setErro('Erro ao executar exclusão.');
    }
  };

  const handleCriarAviso = async (e: React.FormEvent) => {
    e.preventDefault();
    limparMensagens();
    const token = localStorage.getItem('@DartiLab:token');
    try {
      const res = await fetch('http://localhost:3001/avisos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(novoAviso)
      });
      if (res.ok) {
        setNovoAviso({ titulo: '', conteudo: '' });
        setSucesso('Aviso global publicado com sucesso!');
        void carregarDadosDoPainel();
      }
    } catch {
      setErro('Erro ao publicar aviso.');
    }
  };

  const handleCriarTarefa = async (e: React.FormEvent) => {
    e.preventDefault();
    limparMensagens();
    const token = localStorage.getItem('@DartiLab:token');
    try {
      const res = await fetch('http://localhost:3001/tarefas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          titulo: novaTarefa.nome,
          descricao: novaTarefa.descricao,
          dataEntrega: novaTarefa.dataEntrega,
          responsavelId: novaTarefa.atribuidoAId,
          linksExternos: novaTarefa.linksExternos
        })
      });
      if (res.ok) {
        setNovaTarefa({ nome: '', descricao: '', dataEntrega: '', atribuidoAId: '', linkInput: '', linksExternos: [] });
        setSucesso('Tarefa delegada com sucesso!');
        void carregarDadosDoPainel();
      }
    } catch {
      setErro('Erro ao delegar tarefa.');
    }
  };

  return (
    <div className={styles.dashboardContainer}>
      <header className={styles.pageHeader}>
        <h1 className={styles.title}>Visão Geral Estratégica</h1>
        <p className={styles.subtitle}>Centro de Comando DartiLab</p>
      </header>

      {/* TOASTS DE FEEDBACK */}
      {(erro || sucesso) && (
        <div className={erro ? styles.toastError : styles.toastSuccess}>
          {erro || sucesso}
        </div>
      )}

      <div className={styles.gridContainer}>
        {/* QUADRO DE AVISOS GLOBAIS */}
        <section className={styles.cardPanel}>
          <h3 className={styles.panelTitle}>
            <span className={styles.iconWrapper}>📢</span> Quadro de Avisos
          </h3>
          
          <form onSubmit={handleCriarAviso} className={styles.formModern}>
            <input 
              type="text" 
              className={styles.inputModern}
              placeholder="Título do comunicado..." 
              value={novoAviso.titulo}
              onChange={(e) => setNovoAviso({ ...novoAviso, titulo: e.target.value })}
              required 
            />
            <textarea 
              className={`${styles.inputModern} ${styles.textareaModern}`}
              placeholder="Conteúdo informativo..." 
              value={novoAviso.conteudo}
              onChange={(e) => setNovoAviso({ ...novoAviso, conteudo: e.target.value })}
              required 
            />
            <button type="submit" className={styles.btnPrimary}>Disparar Aviso</button>
          </form>

          <div className={styles.listaScroll}>
            {avisos.length === 0 ? <p className={styles.emptyState}>Nenhum aviso ativo.</p> : avisos.map((aviso) => (
              <div key={aviso.id} className={`${styles.itemCard} ${styles.itemAviso}`}>
                <div className={styles.itemHeader}>
                  <h4>{aviso.titulo}</h4>
                  <span className={styles.dateBadge}>{new Date(aviso.createdAt).toLocaleDateString('pt-BR')}</span>
                </div>
                <p className={styles.itemDesc}>{aviso.conteudo}</p>
              </div>
            ))}
          </div>
        </section>

        {/* QUADRO DE TAREFAS */}
        <section className={styles.cardPanel}>
          <h3 className={styles.panelTitle}>
            <span className={styles.iconWrapper}>🎯</span> Delegação de Tarefas
          </h3>
          
          <form onSubmit={handleCriarTarefa} className={styles.formModern}>
            <div className={styles.rowInputs}>
              <input 
                type="text" 
                className={styles.inputModern}
                placeholder="Nome da Tarefa" 
                value={novaTarefa.nome}
                onChange={(e) => setNovaTarefa({ ...novaTarefa, nome: e.target.value })}
                required 
              />
              <input 
                type="date" 
                className={styles.inputModern}
                value={novaTarefa.dataEntrega}
                onChange={(e) => setNovaTarefa({ ...novaTarefa, dataEntrega: e.target.value })}
                required 
              />
            </div>
            
            <select 
              className={styles.inputModern}
              value={novaTarefa.atribuidoAId}
              onChange={(e) => setNovaTarefa({ ...novaTarefa, atribuidoAId: e.target.value })}
              required
            >
              <option value="" disabled>Selecione um Membro para atribuir...</option>
              {membros.map(m => (
                <option key={m.id} value={m.id}>{m.nomeSocial || m.nomeCompleto} - {m.diretoria}</option>
              ))}
            </select>
            
            <textarea 
              className={`${styles.inputModern} ${styles.textareaModern}`}
              placeholder="Descrição e critérios de aceite..." 
              value={novaTarefa.descricao}
              onChange={(e) => setNovaTarefa({ ...novaTarefa, descricao: e.target.value })}
              required 
            />

            <div className={styles.inputGroup}>
              <input 
                type="url" 
                className={styles.inputModern}
                placeholder="https://link-externo.com..." 
                value={novaTarefa.linkInput}
                onChange={(e) => setNovaTarefa({ ...novaTarefa, linkInput: e.target.value })}
              />
              <button 
                type="button" 
                className={styles.btnSecondary}
                onClick={() => {
                  if(novaTarefa.linkInput) {
                    setNovaTarefa({
                      ...novaTarefa,
                      linksExternos: [...novaTarefa.linksExternos, novaTarefa.linkInput],
                      linkInput: ''
                    });
                  }
                }}
              >
                Adicionar Link
              </button>
            </div>

            {novaTarefa.linksExternos.length > 0 && (
              <div className={styles.tagsContainer}>
                {novaTarefa.linksExternos.map((link, idx) => (
                  <span key={idx} className={styles.tagLink}>Link {idx + 1} anexado</span>
                ))}
              </div>
            )}

            <button type="submit" className={styles.btnPrimary}>Delegar Tarefa</button>
          </form>

          <div className={styles.listaScroll}>
            {tarefas.length === 0 ? <p className={styles.emptyState}>Nenhuma tarefa ativa.</p> : tarefas.map((tarefa) => (
              <div key={tarefa.id} className={`${styles.itemCard} ${calcularAlertaPrazo(tarefa.dataEntrega)}`}>
                <div className={styles.itemHeader}>
                  <h4>{tarefa.nome}</h4>
                  <span className={styles.dateBadge}>Prazo: {new Date(tarefa.dataEntrega).toLocaleDateString('pt-BR')}</span>
                </div>
                <p className={styles.itemDesc}>{tarefa.descricao}</p>
                <div className={styles.itemFooter}>
                  <small>👤 {tarefa.atribuidoA?.nomeSocial || tarefa.atribuidoA?.nomeCompleto}</small>
                  {tarefa.linksExternos?.length > 0 && (
                    <div className={styles.tarefaLinks}>
                      {tarefa.linksExternos.map((lnk, idx) => (
                        <a key={idx} href={lnk} target="_blank" rel="noreferrer">🔗 Acessar Link {idx + 1}</a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* GOVERNANÇA DE MEMBROS */}
        <section className={`${styles.cardPanel} ${styles.sectionMembros}`}>
          <h3 className={styles.panelTitle}>
            <span className={styles.iconWrapper}>👥</span> Governança de Equipe
          </h3>
          <div className={styles.tableResponsive}>
            <table className={styles.tableModern}>
              <thead>
                <tr>
                  <th>Membro</th>
                  <th>E-mail</th>
                  <th>Cargo</th>
                  <th>Diretoria</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {membros.map((m) => (
                  <tr key={m.id}>
                    <td>
                      <div className={styles.membroInfo}>
                        <div className={styles.avatarLetter}>
                          {(m.nomeSocial || m.nomeCompleto).charAt(0).toUpperCase()}
                        </div>
                        <span className={styles.membroNome}>{m.nomeSocial || m.nomeCompleto}</span>
                      </div>
                    </td>
                    <td className={styles.textDim}>{m.email}</td>
                    <td>
                      <select 
                        className={styles.selectInline}
                        value={m.papel} 
                        onChange={(e) => void handleAlterarCargoDiretoria(m.id, 'papel', e.target.value)}
                      >
                        <option value="PRESIDENTE">Presidente</option>
                        <option value="VICE_PRESIDENTE">Vice Presidente</option>
                        <option value="DIRETOR">Diretor</option>
                        <option value="MEMBRO">Membro</option>
                        <option value="ESTAGIARIO">Estagiário</option>
                      </select>
                    </td>
                    <td>
                      <select 
                        className={styles.selectInline}
                        value={m.diretoria} 
                        onChange={(e) => void handleAlterarCargoDiretoria(m.id, 'diretoria', e.target.value)}
                      >
                        <option value="SEM_DIRETORIA">Geral</option>
                        <option value="RECURSOS_HUMANOS">Recursos Humanos</option>
                        <option value="COMUNICACAO">Comunicação</option>
                        <option value="HARDWARE">Hardware</option>
                        <option value="SOFTWARE">Software</option>
                        <option value="MULTIDISCIPLINARIDADE">Multidisc.</option>
                      </select>
                    </td>
                    <td>
                      <button onClick={() => void handleExcluirMembro(m.id)} className={styles.btnDangerIcon} title="Desligar Membro">
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}