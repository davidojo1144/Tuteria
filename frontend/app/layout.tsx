import "./globals.css";
export default function RootLayout({ children }: { children: any }) {
  return (
    <html className="light" lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-background-light dark:bg-background-dark text-primary dark:text-white font-display min-h-screen flex flex-col antialiased selection:bg-primary/10 dark:selection:bg-white/10">
        {children}
      </body>
    </html>
  );
}
