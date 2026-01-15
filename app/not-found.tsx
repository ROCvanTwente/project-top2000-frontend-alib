import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-[calc(100vh-6rem)] flex items-center justify-center bg-background text-foreground">
      <div className="max-w-md text-center p-8">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <p className="text-lg mb-6">Pagina niet gevonden — de URL kan onjuist zijn of de pagina is verplaatst.</p>
        <Link href="/" className="inline-block rounded-md bg-primary text-primary-foreground px-4 py-2">
          Naar homepagina
        </Link>
      </div>
    </main>
  );
}
