'use client';

import { useState } from 'react';

export default function Home() {
  const [texto, setTexto] = useState('');
  const [resposta, setResposta] = useState('');

  function analisar(event) {
    event.preventDefault();
    setResposta(texto);
  }

  return (
    <main className="pagina">
      <section className="cartao">
        <span className="marca">OMNI-YAS</span>
        <h1>Suas ideias começam aqui.</h1>
        <p className="descricao">Escreva um texto abaixo e clique em Analisar para ver sua resposta.</p>
        <form onSubmit={analisar}>
          <label htmlFor="entrada">Seu texto</label>
          <textarea id="entrada" value={texto} onChange={(event) => setTexto(event.target.value)} placeholder="Digite seu texto aqui..." rows={5} />
          <button type="submit">Analisar</button>
        </form>
        <div className="resultado" aria-live="polite">
          <h2>Resposta</h2>
          <p>{resposta || 'Sua resposta aparecerá aqui.'}</p>
        </div>
      </section>
    </main>
  );
}
