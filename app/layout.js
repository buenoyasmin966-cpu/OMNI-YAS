import './globals.css';

export const metadata = {
  title: 'OMNI-YAS',
  description: 'Seu espaço para analisar textos.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
