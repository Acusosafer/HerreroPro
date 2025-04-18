import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Algoritmo de optimización de cortes (basado en cálculo de barras necesarias)
export function optimizeCuts(
  stockLength: number,
  requiredCuts: number[],
  kerfMm = 3, // Kerf en milímetros
): { solution: number[][]; waste: number; wastePercentage: number; barsNeeded: number } {
  // Convertir kerf de milímetros a metros
  const kerf = kerfMm / 1000

  // Calcular la longitud total necesaria
  const totalRequiredLength = requiredCuts.reduce((sum, cut) => sum + cut, 0)

  // Calcular el espacio total de corte (kerf)
  // Solo necesitamos (n-1) cortes para n piezas
  const totalKerfLength = requiredCuts.length > 0 ? (requiredCuts.length - 1) * kerf : 0

  // Longitud total incluyendo el kerf
  const totalLengthWithKerf = totalRequiredLength + totalKerfLength

  // Calcular el número de barras necesarias (redondeando hacia arriba)
  const barsNeeded = Math.ceil(totalLengthWithKerf / stockLength)

  // Calcular el desperdicio total
  const totalWaste = barsNeeded * stockLength - totalLengthWithKerf

  // Calcular el porcentaje de desperdicio
  const wastePercentage = (totalWaste / (barsNeeded * stockLength)) * 100

  // Distribuir los cortes en las barras (First Fit Decreasing)
  // Ordenar los cortes de mayor a menor
  const sortedCuts = [...requiredCuts].sort((a, b) => b - a)

  // Inicializar las barras
  const bars: number[][] = []
  const remainingLengths: number[] = []

  // Crear el número exacto de barras necesarias
  for (let i = 0; i < barsNeeded; i++) {
    bars.push([])
    remainingLengths.push(stockLength)
  }

  // Asignar cada corte a la primera barra donde quepa
  sortedCuts.forEach((cut) => {
    let placed = false

    // Intentar colocar en una barra existente
    for (let i = 0; i < remainingLengths.length; i++) {
      // Si es el primer corte en la barra, no necesitamos considerar el kerf
      const kerfToConsider = bars[i].length > 0 ? kerf : 0

      if (remainingLengths[i] >= cut + kerfToConsider) {
        bars[i].push(cut)
        remainingLengths[i] -= cut + kerfToConsider
        placed = true
        break
      }
    }

    // Si no se pudo colocar (lo cual no debería ocurrir si el cálculo es correcto)
    if (!placed) {
      console.warn("No se pudo colocar un corte en las barras calculadas. Esto no debería suceder.")
      // En caso extremo, crear una barra adicional
      bars.push([cut])
      remainingLengths.push(stockLength - cut)
    }
  })

  // Asegurarse de que solo devolvemos el número exacto de barras calculadas
  const finalBars = bars.slice(0, barsNeeded)

  return {
    solution: finalBars,
    waste: totalWaste,
    wastePercentage: wastePercentage,
    barsNeeded: barsNeeded,
  }
}

// Función para formatear números como moneda argentina
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
  }).format(value)
}

// Función para calcular el precio total de un material
export function calculateTotalPrice(quantity: number, price: number): number {
  return quantity * price
}

// Función para obtener materiales del localStorage o usar los predeterminados
export function getMaterials() {
  if (typeof window === "undefined") return []

  try {
    const storedMaterials = localStorage.getItem("materials")
    return storedMaterials ? JSON.parse(storedMaterials) : []
  } catch (error) {
    console.error("Error al obtener materiales:", error)
    return []
  }
}

// Función para guardar materiales en localStorage
export function saveMaterials(materials: any[]) {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem("materials", JSON.stringify(materials))
  } catch (error) {
    console.error("Error al guardar materiales:", error)
  }
}
