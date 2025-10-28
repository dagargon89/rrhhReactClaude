/**
 * Servicio de predicción de tendencias usando Machine Learning básico
 *
 * Implementa regresión lineal simple para predecir valores futuros de incidencias
 * basado en datos históricos
 */

interface DataPoint {
  x: number // Tiempo (índice, días, meses, etc.)
  y: number // Valor de la incidencia
}

interface PredictionResult {
  predictions: Array<{
    period: number
    predictedValue: number
    confidence: "low" | "medium" | "high"
  }>
  trend: "increasing" | "decreasing" | "stable"
  slope: number
  intercept: number
  r2Score: number
  accuracy: number
}

export class PredictionService {
  /**
   * Calcula la regresión lineal de un conjunto de datos
   */
  private static linearRegression(data: DataPoint[]): { slope: number; intercept: number; r2: number } {
    const n = data.length

    if (n < 2) {
      throw new Error("Se necesitan al menos 2 puntos de datos para la regresión")
    }

    // Calcular medias
    const meanX = data.reduce((sum, point) => sum + point.x, 0) / n
    const meanY = data.reduce((sum, point) => sum + point.y, 0) / n

    // Calcular pendiente (slope)
    let numerator = 0
    let denominator = 0

    for (const point of data) {
      numerator += (point.x - meanX) * (point.y - meanY)
      denominator += Math.pow(point.x - meanX, 2)
    }

    const slope = denominator !== 0 ? numerator / denominator : 0
    const intercept = meanY - slope * meanX

    // Calcular R² (coeficiente de determinación)
    let ssTotal = 0
    let ssResidual = 0

    for (const point of data) {
      const predicted = slope * point.x + intercept
      ssTotal += Math.pow(point.y - meanY, 2)
      ssResidual += Math.pow(point.y - predicted, 2)
    }

    const r2 = ssTotal !== 0 ? 1 - (ssResidual / ssTotal) : 0

    return { slope, intercept, r2 }
  }

  /**
   * Predice valores futuros basado en datos históricos
   */
  static predictFutureTrend(
    historicalData: DataPoint[],
    periodsToPredict: number = 3
  ): PredictionResult {
    if (historicalData.length < 3) {
      throw new Error("Se necesitan al menos 3 puntos de datos históricos para hacer predicciones")
    }

    // Calcular regresión lineal
    const { slope, intercept, r2 } = this.linearRegression(historicalData)

    // Determinar tendencia
    let trend: "increasing" | "decreasing" | "stable"
    if (Math.abs(slope) < 0.1) {
      trend = "stable"
    } else if (slope > 0) {
      trend = "increasing"
    } else {
      trend = "decreasing"
    }

    // Generar predicciones
    const lastX = historicalData[historicalData.length - 1].x
    const predictions = []

    for (let i = 1; i <= periodsToPredict; i++) {
      const futureX = lastX + i
      const predictedValue = slope * futureX + intercept

      // Calcular nivel de confianza basado en R²
      let confidence: "low" | "medium" | "high"
      if (r2 >= 0.8) {
        confidence = "high"
      } else if (r2 >= 0.5) {
        confidence = "medium"
      } else {
        confidence = "low"
      }

      predictions.push({
        period: i,
        predictedValue: Math.max(0, predictedValue), // No permitir valores negativos
        confidence,
      })
    }

    // Calcular precisión como porcentaje
    const accuracy = Math.round(r2 * 100)

    return {
      predictions,
      trend,
      slope,
      intercept,
      r2Score: r2,
      accuracy,
    }
  }

  /**
   * Analiza anomalías en los datos (valores atípicos)
   */
  static detectAnomalies(data: DataPoint[], threshold: number = 2): Array<{
    index: number
    value: number
    deviation: number
  }> {
    if (data.length < 3) {
      return []
    }

    // Calcular media y desviación estándar
    const values = data.map(d => d.y)
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
    const stdDev = Math.sqrt(variance)

    // Detectar valores que se desvían más de 'threshold' desviaciones estándar
    const anomalies = []

    for (let i = 0; i < data.length; i++) {
      const deviation = Math.abs(data[i].y - mean) / stdDev

      if (deviation > threshold) {
        anomalies.push({
          index: i,
          value: data[i].y,
          deviation,
        })
      }
    }

    return anomalies
  }

  /**
   * Calcula el promedio móvil para suavizar tendencias
   */
  static movingAverage(data: DataPoint[], window: number = 3): DataPoint[] {
    if (data.length < window) {
      return data
    }

    const smoothed: DataPoint[] = []

    for (let i = 0; i < data.length; i++) {
      if (i < window - 1) {
        // Para los primeros puntos, usar el valor original
        smoothed.push(data[i])
      } else {
        // Calcular promedio de la ventana
        const windowData = data.slice(i - window + 1, i + 1)
        const avg = windowData.reduce((sum, point) => sum + point.y, 0) / window

        smoothed.push({
          x: data[i].x,
          y: avg,
        })
      }
    }

    return smoothed
  }

  /**
   * Calcula la tasa de cambio promedio
   */
  static calculateChangeRate(data: DataPoint[]): {
    averageChange: number
    percentageChange: number
    direction: "increasing" | "decreasing" | "stable"
  } {
    if (data.length < 2) {
      return {
        averageChange: 0,
        percentageChange: 0,
        direction: "stable",
      }
    }

    const changes = []
    for (let i = 1; i < data.length; i++) {
      changes.push(data[i].y - data[i - 1].y)
    }

    const averageChange = changes.reduce((sum, change) => sum + change, 0) / changes.length

    const firstValue = data[0].y
    const lastValue = data[data.length - 1].y
    const percentageChange = firstValue !== 0
      ? ((lastValue - firstValue) / firstValue) * 100
      : 0

    let direction: "increasing" | "decreasing" | "stable"
    if (Math.abs(averageChange) < 0.1) {
      direction = "stable"
    } else if (averageChange > 0) {
      direction = "increasing"
    } else {
      direction = "decreasing"
    }

    return {
      averageChange,
      percentageChange,
      direction,
    }
  }

  /**
   * Genera recomendaciones basadas en las predicciones
   */
  static generateRecommendations(prediction: PredictionResult, currentValue: number): string[] {
    const recommendations: string[] = []

    // Recomendaciones basadas en la tendencia
    if (prediction.trend === "increasing") {
      recommendations.push(
        "⚠️ Se detecta una tendencia al alza. Se recomienda implementar medidas preventivas."
      )

      if (prediction.slope > 1) {
        recommendations.push(
          "🚨 La tendencia de crecimiento es acelerada. Requiere atención inmediata."
        )
      }
    } else if (prediction.trend === "decreasing") {
      recommendations.push(
        "✅ Se detecta una tendencia a la baja. Las medidas actuales están funcionando."
      )
    } else {
      recommendations.push(
        "📊 La tendencia se mantiene estable. Continuar monitoreando."
      )
    }

    // Recomendaciones basadas en la precisión
    if (prediction.accuracy < 50) {
      recommendations.push(
        "⚠️ La precisión de la predicción es baja. Se recomienda recopilar más datos históricos."
      )
    }

    // Recomendaciones basadas en el valor predicho
    const nextPrediction = prediction.predictions[0]
    if (nextPrediction.predictedValue > currentValue * 1.5) {
      recommendations.push(
        "🔴 Se predice un aumento significativo (>50%). Implementar plan de acción urgente."
      )
    } else if (nextPrediction.predictedValue > currentValue * 1.2) {
      recommendations.push(
        "🟡 Se predice un aumento moderado (>20%). Revisar procedimientos actuales."
      )
    }

    return recommendations
  }

  /**
   * Crea un análisis completo de tendencias
   */
  static analyzeTrends(historicalData: DataPoint[]): {
    prediction: PredictionResult
    anomalies: Array<{ index: number; value: number; deviation: number }>
    smoothedData: DataPoint[]
    changeRate: { averageChange: number; percentageChange: number; direction: string }
    recommendations: string[]
  } {
    // Predicción
    const prediction = this.predictFutureTrend(historicalData)

    // Detectar anomalías
    const anomalies = this.detectAnomalies(historicalData)

    // Datos suavizados
    const smoothedData = this.movingAverage(historicalData)

    // Tasa de cambio
    const changeRate = this.calculateChangeRate(historicalData)

    // Recomendaciones
    const currentValue = historicalData[historicalData.length - 1].y
    const recommendations = this.generateRecommendations(prediction, currentValue)

    return {
      prediction,
      anomalies,
      smoothedData,
      changeRate,
      recommendations,
    }
  }
}
