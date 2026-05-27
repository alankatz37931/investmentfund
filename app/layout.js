import './globals.css';

export const metadata = {
  title: 'Investment Fund — Dashboard',
  description: 'Sistema de gestión de portafolio y socios',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="bg-slate-50 text-slate-900 antialiased">{children}</body>
    </html>
  );
}
