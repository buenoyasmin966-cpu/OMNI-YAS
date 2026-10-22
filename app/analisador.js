'use client';

import { useState } from 'react';
import { desafio } from '../desafio';

export default function Analisador() {
  const [campos, setCampos] = useState(() => Object.fromEntries(desafio.campos.map(({ id }) => [id, ''])));
  const [resposta, setResposta] = useState('');
  const [erro, setErro] = useState('');
  const [analisando, setAnalisando] = useState(false);

  async function analisar(event) {
    event.preventDefault();
    if (analisando) return;
    setAnalisando(true);
    setErro('');
    setResposta('');
    try {
      const response = await fetch('/api/ia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campos),
        signal: AbortSignal.timeout(55000),
      });
      const texto = await response.text();
      if (response.status === 429) throw new Error('Você atingiu o limite de uso de hoje.');
      if (response.status === 401) throw new Error('Chave da IA inválida.');
      if (!response.ok) throw new Error(response.headers.get('content-type')?.includes('text/plain')
        ? texto : 'Não foi possível concluir a análise. Tente novamente em instantes.');
      if (!texto.trim()) throw new Error('A IA não retornou uma resposta. Tente novamente.');
      setResposta(texto);
      if (response.headers.get('X-Historico-Salvo') === 'false') {
        setErro('Sua resposta foi gerada, mas não foi salva no histórico. Copie o resultado para guardá-lo. Verifique a tabela respostas e as regras de segurança do Supabase.');
      }
    } catch (error) {
      setErro(error.name === 'TimeoutError' ? 'A análise demorou demais. Tente novamente em instantes.'
        : error instanceof TypeError ? 'Não foi possível conectar. Verifique sua conexão e tente novamente.'
          : error.message || 'Não foi possível concluir a análise. Tente novamente.');
    } finally {
      setAnalisando(false);
    }
  }

  return (
    <>
        <span className="marca">OMNI-YAS</span>
        <h1>{desafio.nome}</h1>
        <p className="descricao">{desafio.subtitulo}</p>
        <form onSubmit={analisar} aria-busy={analisando}>
          {desafio.campos.map(({ id, rotulo, linhas }) => (
            <div className="campo-desafio" key={id}>
              <label htmlFor={id}>{rotulo}</label>
              <textarea id={id} name={id} value={campos[id]} onChange={(event) => setCampos(current => ({ ...current, [id]: event.target.value }))} rows={linhas} maxLength={6000} disabled={analisando} />
            </div>
          ))}
          <button type="submit" disabled={analisando}>{analisando ? 'Analisando...' : desafio.botao}</button>
          <p className="ajuda">{desafio.aviso}</p>
          {erro && <p className="erro" role="alert">{erro}</p>}
        </form>
        <div className="resultado" aria-live="polite">
          <h2>Resposta</h2>
          <p>{analisando ? 'Preparando seu retorno…' : resposta || 'Sua resposta aparecerá aqui.'}</p>
        </div>
      </>
  );
}
