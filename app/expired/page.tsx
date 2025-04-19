"use client"

import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

export default function ExpiredPage() {
  const { logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container py-8 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <AlertTriangle className="h-16 w-16 text-yellow-500" />
            </div>
            <CardTitle className="text-2xl font-bold text-center">Acceso Expirado</CardTitle>
            <CardDescription className="text-center">Su período de acceso a HerreroPRO ha finalizado.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground mb-4">
              Para renovar su acceso, por favor contacte al administrador del sistema.
            </p>
            <div className="border rounded-lg p-4 bg-muted">
              <p className="text-sm text-center">
                <strong>Email de contacto:</strong> admin@herreropro.com
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleLogout} className="w-full">
              Volver al inicio de sesión
            </Button>
          </CardFooter>
        </Card>
      </main>
      <Footer />
    </div>
  )
}
