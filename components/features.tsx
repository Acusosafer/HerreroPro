"use client"

import { Calculator, Ruler, ShoppingBag, FileSpreadsheet, Settings } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

export function Features() {
  const { isAuthenticated } = useAuth()

  const features = [
    {
      icon: <Ruler className="h-10 w-10" />,
      title: "Optimización de Cortes",
      description:
        "Algoritmos avanzados que minimizan el desperdicio de material y maximizan la eficiencia en tus proyectos.",
    },
    {
      icon: <Settings className="h-10 w-10" />,
      title: "Gestión de Materiales",
      description:
        "Actualiza precios y especificaciones de materiales en tiempo real según las variaciones del mercado.",
    },
    {
      icon: <Calculator className="h-10 w-10" />,
      title: "Calculadora de Hierro",
      description: "Calcula con precisión las cantidades y costos de los materiales necesarios para tus proyectos.",
    },
    {
      icon: <ShoppingBag className="h-10 w-10" />,
      title: "Carrito de Compras",
      description: "Agrega diferentes tipos de hierro y accesorios, sumando los costos automáticamente.",
    },
    {
      icon: <FileSpreadsheet className="h-10 w-10" />,
      title: "Exportación de Presupuestos",
      description:
        "Genera presupuestos profesionales y expórtalos en formatos Excel y PDF para compartir con tus clientes.",
    },
  ]

  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Características principales</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              {isAuthenticated
                ? "Herramientas diseñadas específicamente para herreros argentinos"
                : "Inicie sesión para acceder a todas las funcionalidades"}
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`flex flex-col items-center space-y-4 rounded-lg border p-6 shadow-sm card-hover-effect ${
                !isAuthenticated ? "opacity-70" : ""
              }`}
            >
              <div className="text-primary">{feature.icon}</div>
              <div className="space-y-2 text-center">
                <h3 className="font-bold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground mobile-text">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
