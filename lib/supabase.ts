import { createClient } from "@supabase/supabase-js"

// Estas variables se reemplazarán con tus credenciales reales
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Tipos para las tablas de Supabase
export type Material = {
  id: string
  user_email: string
  type: string
  size: string
  length: number
  price: number
  created_at?: string
}

export type Presupuesto = {
  id: string
  user_email: string
  name: string
  client: string
  date: string
  total: number
  status: string
  items: any[] // Detalles de los ítems del presupuesto
  laborCost: number
  notes: string
  statusHistory?: any[]
  created_at?: string
}

export type Corte = {
  id: string
  user_email: string
  material_id: string
  stock_length: number
  kerf: number
  cuts: number[]
  solution: any // Resultado de la optimización
  waste: number
  waste_percentage: number
  bars_needed: number
  created_at?: string
}

// Crear el cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Función para verificar si Supabase está configurado
export function isSupabaseConfigured(): boolean {
  return supabaseUrl !== "" && supabaseAnonKey !== ""
}
