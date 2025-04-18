"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, ShoppingCart, Sun, Moon, LogIn, LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useTheme } from "next-themes"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/hooks/use-cart"
import { useAuth } from "@/hooks/use-auth"

export function Navbar() {
  const pathname = usePathname()
  const { setTheme, theme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const { items } = useCart()
  const { isAuthenticated, isAdmin, user, logout } = useAuth()

  const routes = [
    {
      href: "/",
      label: "Inicio",
      active: pathname === "/",
    },
    {
      href: "/optimizacion",
      label: "Optimización de Cortes",
      active: pathname === "/optimizacion",
    },
    {
      href: "/materiales",
      label: "Gestión de Materiales",
      active: pathname === "/materiales",
    },
    {
      href: "/calculadora",
      label: "Calculadora de Hierro",
      active: pathname === "/calculadora",
    },
    {
      href: "/presupuestos",
      label: "Presupuestos",
      active: pathname === "/presupuestos",
    },
  ]

  // Agregar ruta de administración si el usuario es admin
  if (isAdmin) {
    routes.push({
      href: "/admin",
      label: "Administración",
      active: pathname === "/admin",
    })
  }

  return (
    <header className="border-b bg-background">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold">HerreroPRO</span>
        </Link>
        <nav className="hidden md:flex gap-6">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                route.active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {route.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle Theme"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {isAuthenticated ? (
            <>
              <Link href="/carrito">
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {items.length > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0">
                      {items.length}
                    </Badge>
                  )}
                </Button>
              </Link>
              <div className="hidden md:flex items-center gap-2">
                <span className="text-sm font-medium">{user?.username}</span>
                <Button variant="ghost" size="icon" onClick={logout}>
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </>
          ) : (
            <Link href="/login">
              <Button variant="ghost" size="icon">
                <LogIn className="h-5 w-5" />
              </Button>
            </Link>
          )}

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col gap-6 pt-6">
                {isAuthenticated && (
                  <div className="flex items-center gap-2 pb-4 border-b">
                    <User className="h-5 w-5" />
                    <span className="font-medium">{user?.username}</span>
                  </div>
                )}

                {routes.map((route) => (
                  <Link
                    key={route.href}
                    href={route.href}
                    className={`text-sm font-medium transition-colors hover:text-primary ${
                      route.active ? "text-primary" : "text-muted-foreground"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {route.label}
                  </Link>
                ))}

                {isAuthenticated ? (
                  <Button variant="outline" onClick={logout} className="mt-4">
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar sesión
                  </Button>
                ) : (
                  <Link href="/login" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full mt-4">
                      <LogIn className="mr-2 h-4 w-4" />
                      Iniciar sesión
                    </Button>
                  </Link>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
