import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                Optimiza tus cortes de hierro y genera presupuestos profesionales
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                Herramienta especializada para herreros argentinos que minimiza el desperdicio de material y facilita la
                gestión de proyectos.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/optimizacion">
                <Button size="lg">Comenzar a optimizar</Button>
              </Link>
              <Link href="/materiales">
                <Button size="lg" variant="outline">
                  Gestionar materiales
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative">
              <Image
                src="/herrero-argentina.png"
                alt="Herrero argentino soldando"
                width={600}
                height={400}
                className="rounded-xl shadow-xl"
                priority
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/20 to-white/20 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
