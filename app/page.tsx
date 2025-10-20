"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AttendanceProcessor } from "@/components/attendance-processor"
import { Settings } from "@/components/settings"
import { WorkersManagement } from "@/components/workers-management"
import { ArrowLeft, SettingsIcon, Users } from "lucide-react"

export default function Home() {
  const [reportText, setReportText] = useState("")
  const [result, setResult] = useState<any>(null)
  const [showConfig, setShowConfig] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleProcess = async () => {
    setIsProcessing(true)
    try {
      const processor = new AttendanceProcessor()
      const processedResult = await processor.processReport(reportText)
      setResult(processedResult)
    } catch (error) {
      setResult({
        error: `Error al procesar: ${error instanceof Error ? error.message : "Error desconocido"}`,
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClear = () => {
    setReportText("")
    setResult(null)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950">
      <div className="border-b bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={() => window.open("https://alfonsa-tools-modern.vercel.app/", "_blank")}
            >
              <ArrowLeft className="h-4 w-4" />
              Volver a Alfonsa Tools
            </Button>
          </div>
          <Button
            variant={showConfig ? "default" : "outline"}
            size="sm"
            className="gap-2"
            onClick={() => setShowConfig(!showConfig)}
          >
            <SettingsIcon className="h-4 w-4" />
            {showConfig ? "Ocultar" : "Configuración"}
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-8">
        <div className="space-y-2 text-center">
          <h1 className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-4xl font-bold tracking-tight text-transparent dark:from-blue-400 dark:to-indigo-400">
            Procesador de Asistencia
          </h1>
          <p className="text-lg text-muted-foreground">
            Calcula pagos y bonos automáticamente de forma rápida y precisa
          </p>
        </div>

        {showConfig && (
          <Card className="border-blue-200 bg-white/50 backdrop-blur-sm dark:border-blue-900 dark:bg-gray-900/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5" />
                Configuración
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="workers" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="workers" className="gap-2">
                    <Users className="h-4 w-4" />
                    Trabajadores
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="gap-2">
                    <SettingsIcon className="h-4 w-4" />
                    Ajustes
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="workers">
                  <WorkersManagement />
                </TabsContent>
                <TabsContent value="settings">
                  <Settings />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        <Card className="border-blue-200 bg-white/50 backdrop-blur-sm dark:border-blue-900 dark:bg-gray-900/50">
          <CardHeader>
            <CardTitle>Reporte de Asistencia</CardTitle>
            <CardDescription>Pega el reporte crudo de asistencia en el campo de texto</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="report">Texto del Reporte</Label>
              <Textarea
                id="report"
                placeholder="Pega aquí el reporte de asistencia..."
                value={reportText}
                onChange={(e) => setReportText(e.target.value)}
                className="min-h-[300px] font-mono text-sm"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleProcess}
                disabled={!reportText.trim() || isProcessing}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isProcessing ? "Procesando..." : "Procesar Reporte"}
              </Button>
              <Button variant="outline" onClick={handleClear}>
                Limpiar
              </Button>
            </div>
          </CardContent>
        </Card>

        {result && (
          <Card className="border-blue-200 bg-white/50 backdrop-blur-sm dark:border-blue-900 dark:bg-gray-900/50">
            <CardHeader>
              <CardTitle>Resultado del Cálculo</CardTitle>
            </CardHeader>
            <CardContent>
              {result.error ? (
                <div className="rounded-lg bg-destructive/10 p-4 text-destructive">
                  <p className="font-semibold">Error:</p>
                  <p>{result.error}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="overflow-hidden rounded-lg border">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-blue-50 dark:bg-blue-950">
                          <th className="p-3 text-left font-semibold">Empleado</th>
                          <th className="p-3 text-left font-semibold">Horas</th>
                          <th className="p-3 text-left font-semibold">Tarifa x Hora</th>
                          <th className="p-3 text-left font-semibold">Total a Pagar</th>
                          <th className="p-3 text-left font-semibold">Bono</th>
                          <th className="p-3 text-left font-semibold">Total Final</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-t bg-white dark:bg-gray-900">
                          <td className="p-3 font-medium">{result.nombre}</td>
                          <td className="p-3">{result.horasTrabajadas}</td>
                          <td className="p-3">${result.tarifa?.toLocaleString("es-CL") || "0"}</td>
                          <td className="p-3 font-semibold">${result.totalPagar?.toLocaleString("es-CL") || "0"}</td>
                          <td className="p-3">
                            <span
                              className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${
                                result.bono === "bono1"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                  : result.bono === "bono2"
                                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                    : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                              }`}
                            >
                              {result.bono}
                              {result.valorBono > 0 && ` (+$${result.valorBono?.toLocaleString("es-CL") || "0"})`}
                            </span>
                          </td>
                          <td className="p-3 text-lg font-bold text-blue-600 dark:text-blue-400">
                            ${result.totalFinal?.toLocaleString("es-CL") || "0"}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {result.detalles && result.detalles.length > 0 && (
                    <div className="mt-6">
                      <h3 className="mb-3 font-semibold">Detalle por Día</h3>
                      <div className="overflow-hidden rounded-lg border">
                        <table className="w-full border-collapse text-sm">
                          <thead>
                            <tr className="bg-muted/50">
                              <th className="p-2 text-left">Fecha</th>
                              <th className="p-2 text-left">Día</th>
                              <th className="p-2 text-left">Entrada</th>
                              <th className="p-2 text-left">Salida</th>
                              <th className="p-2 text-left">Horas</th>
                              <th className="p-2 text-left">Estado</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white dark:bg-gray-900">
                            {result.detalles.map((detalle: any, idx: number) => (
                              <tr key={idx} className="border-t">
                                <td className="p-2">{detalle.fecha}</td>
                                <td className="p-2">{detalle.dia}</td>
                                <td className="p-2">{detalle.entrada || "-"}</td>
                                <td className="p-2">{detalle.salida || "-"}</td>
                                <td className="p-2">{detalle.horas?.toFixed(2) || "-"}</td>
                                <td className="p-2">
                                  <span
                                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                      detalle.estado === "trabajado"
                                        ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                        : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                                    }`}
                                  >
                                    {detalle.estado}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}
