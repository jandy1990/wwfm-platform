'use client'

import { useState, useEffect } from 'react'
import { PointsToast, type PointsToastData } from './PointsToast'

export function PointsContainer() {
  const [toastData, setToastData] = useState<PointsToastData | null>(null)

  useEffect(() => {
    const handleShowToast = (event: CustomEvent) => {
      setToastData(event.detail)
    }

    window.addEventListener('showPointsToast', handleShowToast as EventListener)
    return () => {
      window.removeEventListener('showPointsToast', handleShowToast as EventListener)
    }
  }, [])

  const handleDismiss = () => {
    setToastData(null)
  }

  return <PointsToast data={toastData} onDismiss={handleDismiss} />
}
