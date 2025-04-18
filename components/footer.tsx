import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} HerreroPRO. Todos los derechos reservados.
          </p>
        </div>
        <div className="flex gap-4">
          <Link
            href="/terminos"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Términos
          </Link>
          <Link
            href="/privacidad"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Privacidad
          </Link>
          <Link
            href="/contacto"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Contacto
          </Link>
        </div>
      </div>
    </footer>
  )
}
