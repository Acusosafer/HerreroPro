"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"

export function Hero() {
  const { isAuthenticated } = useAuth()

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-muted mt-16">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                Cortes precisos, presupuestos al instante
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                Diseñada por herreros, para herreros. Con más acero que excusas.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              {isAuthenticated ? (
                <Link href="/optimizacion">
                  <Button size="lg" className="gradient-button">
                    Comenzar a optimizar
                  </Button>
                </Link>
              ) : (
                <Button size="lg" className="gradient-button" disabled>
                  Comenzar a optimizar
                </Button>
              )}
              {isAuthenticated && (
                <Link href="/materiales">
                  <Button size="lg" variant="outline" className="card-hover-effect">
                    Gestionar materiales
                  </Button>
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative">
              <Image
                src="/herrero-pro-logo-principal.png"
                alt="Herrero profesional con casco futurista y bulldog francés"
                width={600}
                height={400}
                className="rounded-xl shadow-xl card-hover-effect"
                priority
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-transparent pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
