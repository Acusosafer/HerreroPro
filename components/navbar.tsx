"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, ShoppingCart, Sun, Moon, LogIn, LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useTheme } from "next-themes"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/hooks/use-cart"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "@/components/ui/use-toast"

export function Navbar() {
  const pathname = usePathname()
  const { setTheme, theme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { items } = useCart()
  const { isAuthenticated, isAdmin, user, logout } = useAuth()

  // Detectar scroll para cambiar la apariencia de la navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const routes = [
    {
      href: "/",
      label: "Inicio",
      active: pathname === "/",
      protected: false,
    },
    {
      href: "/optimizacion",
      label: "Optimización de Cortes",
      active: pathname === "/optimizacion",
      protected: true,
    },
    {
      href: "/materiales",
      label: "Gestión de Materiales",
      active: pathname === "/materiales",
      protected: true,
    },
    {
      href: "/presupuestos",
      label: "Presupuestos",
      active: pathname === "/presupuestos",
      protected: true,
    },
  ]

  // Agregar ruta de administración si el usuario es admin
  if (isAdmin) {
    routes.push({
      href: "/admin",
      label: "Administración",
      active: pathname === "/admin",
      protected: true,
    })
  }

  const handleProtectedLink = (e: React.MouseEvent, route: { href: string; protected: boolean }) => {
    if (!isAuthenticated && route.protected) {
      e.preventDefault()
      toast({
        title: "Acceso restringido",
        description: "Inicia sesión para acceder a esta sección",
        variant: "destructive",
      })
    }
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "navbar-blur shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex flex-col items-start gap-0">
          <span className="text-xl font-bold">HerreroPRO</span>
          <span className="text-xs text-muted-foreground -mt-1">Cortá,Calculá,Creá</span>
        </Link>
        <nav className="hidden md:flex gap-6">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={isAuthenticated || !route.protected ? route.href : "#"}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                route.active ? "text-primary" : "text-muted-foreground"
              } ${!isAuthenticated && route.protected ? "nav-link-disabled" : ""}`}
              onClick={(e) => handleProtectedLink(e, route)}
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
                <div className="flex flex-col items-start gap-0">
                  <span className="text-xl font-bold">HerreroPRO</span>
                  <span className="text-xs text-muted-foreground -mt-1">Cortá,Calculá,Creá</span>
                </div>

                {isAuthenticated && (
                  <div className="flex items-center gap-2 pb-4 border-b">
                    <User className="h-5 w-5" />
                    <span className="font-medium">{user?.username}</span>
                  </div>
                )}

                {routes.map((route) => (
                  <Link
                    key={route.href}
                    href={isAuthenticated || !route.protected ? route.href : "#"}
                    className={`text-sm font-medium transition-colors hover:text-primary ${
                      route.active ? "text-primary" : "text-muted-foreground"
                    } ${!isAuthenticated && route.protected ? "nav-link-disabled" : ""}`}
                    onClick={(e) => {
                      handleProtectedLink(e, route)
                      if (isAuthenticated || !route.protected) {
                        setIsOpen(false)
                      }
                    }}
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
