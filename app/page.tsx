"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { AttendanceProcessor } from "@/components/attendance-processor"
import { Settings } from "@/components/settings"
import { WorkersManagement } from "@/components/workers-management"
import { ArrowLeft, SettingsIcon, Users } from "lucide-react"
import Swal from "sweetalert2"

export default function Home() {
  const [reportText, setReportText] = useState("")
  const [result, setResult] = useState<any>(null)
  const [showConfig, setShowConfig] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [holidayDays, setHolidayDays] = useState<Set<string>>(new Set())
  const [justifiedDays, setJustifiedDays] = useState<Set<string>>(new Set())

  const handleProcess = async () => {
    setIsProcessing(true)
    try {
      const processor = new AttendanceProcessor()
      const processedResult = await processor.processReport(reportText, holidayDays, justifiedDays)
      setResult(processedResult)

      await Swal.fire({
        icon: "success",
        title: "Reporte Procesado",
        text: `Se procesó correctamente el reporte de ${processedResult.nombre}`,
        timer: 2000,
        showConfirmButton: false,
      })
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Error al Procesar",
        text: error instanceof Error ? error.message : "Error desconocido",
      })
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
    setHolidayDays(new Set())
    setJustifiedDays(new Set())
  }

  const toggleHoliday = async (fecha: string) => {
    const newHolidays = new Set(holidayDays)
    if (newHolidays.has(fecha)) {
      newHolidays.delete(fecha)
    } else {
      newHolidays.add(fecha)
    }
    setHolidayDays(newHolidays)

    if (reportText && result) {
      setIsProcessing(true)
      try {
        const processor = new AttendanceProcessor()
        const processedResult = await processor.processReport(reportText, newHolidays, justifiedDays)
        setResult(processedResult)
      } catch (error) {
        console.error("Error reprocessing:", error)
      } finally {
        setIsProcessing(false)
      }
    }
  }

  const toggleJustified = async (fecha: string) => {
    const newJustified = new Set(justifiedDays)
    if (newJustified.has(fecha)) {
      newJustified.delete(fecha)
    } else {
      newJustified.add(fecha)
    }
    setJustifiedDays(newJustified)

    if (reportText && result) {
      setIsProcessing(true)
      try {
        const processor = new AttendanceProcessor()
        const processedResult = await processor.processReport(reportText, holidayDays, newJustified)
        setResult(processedResult)
      } catch (error) {
        console.error("Error reprocessing:", error)
      } finally {
        setIsProcessing(false)
      }
    }
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
        <div className="space-y-2 text-center animate-fade-in">
          <h1 className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-4xl font-bold tracking-tight text-transparent dark:from-blue-400 dark:to-indigo-400">
            Procesador de Asistencia
          </h1>
          <p className="text-lg text-muted-foreground">
            Calcula pagos y bonos automáticamente de forma rápida y precisa
          </p>
        </div>

        {showConfig && (
          <Card className="border-blue-200 bg-white/50 backdrop-blur-sm dark:border-blue-900 dark:bg-gray-900/50 animate-slide-down">
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

        <Card className="border-blue-200 bg-white/50 backdrop-blur-sm dark:border-blue-900 dark:bg-gray-900/50 animate-fade-in">
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
                className="bg-blue-600 hover:bg-blue-700 transition-all hover:scale-105"
              >
                {isProcessing ? "Procesando..." : "Procesar Reporte"}
              </Button>
              <Button variant="outline" onClick={handleClear} className="transition-all hover:scale-105 bg-transparent">
                Limpiar
              </Button>
            </div>
          </CardContent>
        </Card>

        {result && (
          <Card className="border-blue-200 bg-white/50 backdrop-blur-sm dark:border-blue-900 dark:bg-gray-900/50 animate-slide-up">
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
                  <div className="overflow-hidden rounded-lg border animate-fade-in">
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
                              className={`inline-block rounded-full px-3 py-1 text-sm font-medium transition-all ${
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
                    <div className="mt-6 animate-fade-in">
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
                              <th className="p-2 text-center">F</th>
                              <th className="p-2 text-center">J</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white dark:bg-gray-900">
                            {result.detalles.map((detalle: any, idx: number) => (
                              <tr
                                key={idx}
                                className={`border-t transition-colors ${
                                  detalle.estado === "falta" || detalle.horasDescontadas > 0
                                    ? "bg-rose-50 dark:bg-rose-950/20"
                                    : ""
                                }`}
                              >
                                <td className="p-2">{detalle.fecha}</td>
                                <td className="p-2">{detalle.dia}</td>
                                <td className="p-2">{detalle.entrada || "-"}</td>
                                <td className="p-2">{detalle.salida || "-"}</td>
                                <td className="p-2">
                                  {detalle.horas?.toFixed(2) || "-"}
                                  {detalle.esFeriado && detalle.estado === "feriado trabajado" && (
                                    <span className="ml-1 text-xs text-purple-600 font-semibold">(x2)</span>
                                  )}
                                </td>
                                <td className="p-2">
                                  <span
                                    className={`rounded-full px-2 py-0.5 text-xs font-medium transition-all ${
                                      detalle.estado === "trabajado" || detalle.estado === "feriado trabajado"
                                        ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                        : detalle.estado === "feriado no trabajado"
                                          ? "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                                          : detalle.estado === "falta justificada"
                                            ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                                            : detalle.estado === "falta"
                                              ? "bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300"
                                              : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                                    }`}
                                  >
                                    {detalle.estado}
                                  </span>
                                </td>
                                <td className="p-2 text-center">
                                  <Checkbox
                                    checked={holidayDays.has(detalle.fecha)}
                                    onCheckedChange={() => toggleHoliday(detalle.fecha)}
                                    className="mx-auto transition-all hover:scale-110"
                                    title="Marcar como feriado"
                                  />
                                </td>
                                <td className="p-2 text-center">
                                  <Checkbox
                                    checked={justifiedDays.has(detalle.fecha)}
                                    onCheckedChange={() => toggleJustified(detalle.fecha)}
                                    className="mx-auto transition-all hover:scale-110"
                                    title="Marcar como justificado"
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <span className="font-semibold">F:</span> Feriado (x2 si trabajó, x1 si no trabajó)
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-semibold">J:</span> Justificado (no pierde bono)
                        </div>
                      </div>
                    </div>
                  )}

                  {result.detalles && result.detalles.length > 0 && (
                    <div className="mt-6 space-y-4 animate-fade-in">
                      <h3 className="font-semibold text-lg border-b pb-2">Informe de Asistencia</h3>

                      {result.detalles.some((d: any) => d.minutosTarde > 0) && (
                        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 dark:border-rose-900 dark:bg-rose-950/30 animate-slide-up shadow-sm hover:shadow-md transition-shadow">
                          <h4 className="font-semibold text-rose-900 dark:text-rose-200 mb-3 flex items-center gap-2">
                            <span className="text-xl">⚠️</span>
                            Llegadas Tarde
                          </h4>
                          <div className="space-y-2">
                            {result.detalles
                              .filter((d: any) => d.minutosTarde > 0)
                              .map((detalle: any, idx: number) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between text-sm bg-white/50 dark:bg-gray-900/50 p-2 rounded"
                                >
                                  <span className="text-rose-800 dark:text-rose-300">
                                    <strong>
                                      {detalle.fecha} ({detalle.dia})
                                    </strong>{" "}
                                    - Llegó {detalle.minutosTarde} minutos tarde
                                  </span>
                                  <span className="rounded-full bg-rose-200 px-3 py-1 text-xs font-semibold text-rose-900 dark:bg-rose-900 dark:text-rose-200">
                                    -{detalle.horasDescontadas}h descontada{detalle.horasDescontadas > 1 ? "s" : ""}
                                  </span>
                                </div>
                              ))}
                            <div className="mt-3 pt-3 border-t border-rose-200 dark:border-rose-800">
                              <p className="text-sm font-semibold text-rose-900 dark:text-rose-200">
                                Total descontado: {result.horasDescontadas} hora
                                {result.horasDescontadas !== 1 ? "s" : ""}
                              </p>
                              <p className="text-xs text-rose-700 dark:text-rose-400 mt-1">
                                • 10-59 min tarde = 1 hora descontada | 60+ min tarde = 2 horas descontadas
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {result.detalles.some((d: any) => d.esJustificado) && (
                        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900 dark:bg-yellow-950/30 animate-slide-up shadow-sm hover:shadow-md transition-shadow">
                          <h4 className="font-semibold text-yellow-900 dark:text-yellow-200 mb-3 flex items-center gap-2">
                            <span className="text-xl">📋</span>
                            Días Justificados
                          </h4>
                          <div className="space-y-2">
                            {result.detalles
                              .filter((d: any) => d.esJustificado)
                              .map((detalle: any, idx: number) => (
                                <div
                                  key={idx}
                                  className="text-sm text-yellow-800 dark:text-yellow-300 bg-white/50 dark:bg-gray-900/50 p-2 rounded"
                                >
                                  <strong>
                                    {detalle.fecha} ({detalle.dia})
                                  </strong>{" "}
                                  -{" "}
                                  {detalle.estado === "falta justificada"
                                    ? "Falta justificada"
                                    : "Llegada tarde justificada"}
                                </div>
                              ))}
                            <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-2">
                              ℹ️ Los días justificados no afectan el bono
                            </p>
                          </div>
                        </div>
                      )}

                      {result.detalles.some((d: any) => d.esFeriado) && (
                        <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-900 dark:bg-purple-950/30 animate-slide-up shadow-sm hover:shadow-md transition-shadow">
                          <h4 className="font-semibold text-purple-900 dark:text-purple-200 mb-3 flex items-center gap-2">
                            <span className="text-xl">🎉</span>
                            Días Feriados
                          </h4>
                          <div className="space-y-2">
                            {result.detalles
                              .filter((d: any) => d.esFeriado)
                              .map((detalle: any, idx: number) => (
                                <div
                                  key={idx}
                                  className="text-sm text-purple-800 dark:text-purple-300 bg-white/50 dark:bg-gray-900/50 p-2 rounded"
                                >
                                  <strong>
                                    {detalle.fecha} ({detalle.dia})
                                  </strong>{" "}
                                  -{" "}
                                  {detalle.estado === "feriado trabajado"
                                    ? `Trabajó en feriado (horas x2: ${detalle.horas?.toFixed(2)}h)`
                                    : "No trabajó en feriado (pagado como día normal)"}
                                </div>
                              ))}
                            <p className="text-xs text-purple-700 dark:text-purple-400 mt-2">
                              ℹ️ Los feriados no afectan el bono y se pagan x2 si trabajó o x1 si no trabajó
                            </p>
                          </div>
                        </div>
                      )}

                      {result.diasFaltados > 0 && (
                        <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-900 dark:bg-orange-950/30 animate-slide-up shadow-sm hover:shadow-md transition-shadow">
                          <h4 className="font-semibold text-orange-900 dark:text-orange-200 mb-3 flex items-center gap-2">
                            <span className="text-xl">❌</span>
                            Ausencias
                          </h4>
                          <div className="space-y-2">
                            {result.detalles
                              .filter((d: any) => d.estado === "falta")
                              .map((detalle: any, idx: number) => (
                                <div
                                  key={idx}
                                  className="text-sm text-orange-800 dark:text-orange-300 bg-white/50 dark:bg-gray-900/50 p-2 rounded"
                                >
                                  <strong>
                                    {detalle.fecha} ({detalle.dia})
                                  </strong>{" "}
                                  - Falta sin justificar
                                </div>
                              ))}
                            <div className="mt-3 pt-3 border-t border-orange-200 dark:border-orange-800">
                              <p className="text-sm font-semibold text-orange-900 dark:text-orange-200">
                                Total: {result.diasFaltados} día{result.diasFaltados !== 1 ? "s" : ""} de{" "}
                                {result.totalDiasLaborales} días laborales
                              </p>
                              <p className="text-xs text-orange-700 dark:text-orange-400 mt-1">
                                ⚠️ Las ausencias sin justificar eliminan el bono
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div
                        className={`rounded-lg border p-4 shadow-sm hover:shadow-md transition-all animate-slide-up ${
                          result.bono === "bono1"
                            ? "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30"
                            : result.bono === "bono2"
                              ? "border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30"
                              : "border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/30"
                        }`}
                      >
                        <h4
                          className={`font-semibold mb-3 text-lg flex items-center gap-2 ${
                            result.bono === "bono1"
                              ? "text-green-900 dark:text-green-200"
                              : result.bono === "bono2"
                                ? "text-blue-900 dark:text-blue-200"
                                : "text-gray-900 dark:text-gray-200"
                          }`}
                        >
                          {result.bono === "bono1" && <span className="text-xl">🏆</span>}
                          {result.bono === "bono2" && <span className="text-xl">⭐</span>}
                          {result.bono === "sin bono" && <span className="text-xl">📊</span>}
                          Estado del Bono: {result.bono}
                        </h4>
                        <div className="text-sm space-y-2 bg-white/50 dark:bg-gray-900/50 p-3 rounded">
                          {result.bono === "bono1" && (
                            <p className="text-green-800 dark:text-green-300">
                              ✓ Califica para <strong>Bono 1</strong>: Siempre llegó 10+ minutos temprano
                              {result.valorBono > 0 && (
                                <span className="ml-2 font-bold text-green-600 dark:text-green-400">
                                  +${result.valorBono.toLocaleString("es-CL")}
                                </span>
                              )}
                            </p>
                          )}
                          {result.bono === "bono2" && (
                            <p className="text-blue-800 dark:text-blue-300">
                              ✓ Califica para <strong>Bono 2</strong>: Nunca llegó más de 10 minutos tarde
                              {result.valorBono > 0 && (
                                <span className="ml-2 font-bold text-blue-600 dark:text-blue-400">
                                  +${result.valorBono.toLocaleString("es-CL")}
                                </span>
                              )}
                            </p>
                          )}
                          {result.bono === "sin bono" && (
                            <div className="text-gray-700 dark:text-gray-300">
                              <p className="font-medium mb-2">No califica para bono por:</p>
                              <ul className="list-disc list-inside space-y-1">
                                {result.diasFaltados > 0 && (
                                  <li>
                                    Tuvo {result.diasFaltados} ausencia{result.diasFaltados !== 1 ? "s" : ""} sin
                                    justificar
                                  </li>
                                )}
                                {result.detalles.some((d: any) => d.minutosTarde > 10 && !d.esJustificado) && (
                                  <li>Llegó más de 10 minutos tarde en algunos días</li>
                                )}
                                {!result.detalles.every(
                                  (d: any) => d.minutosTarde < -10 || d.esJustificado || d.esFeriado,
                                ) &&
                                  result.diasFaltados === 0 && <li>No llegó 10+ minutos temprano todos los días</li>}
                              </ul>
                            </div>
                          )}
                        </div>
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
