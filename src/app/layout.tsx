import { ClientProviders } from "@/components/providers/client-providers";
import "@/index.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <title>🧮 Simulador Financeiro de Proposta - Fluyt</title>
        <meta name="description" content="Sistema de Validação - Fluyt" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="antialiased">
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
} 