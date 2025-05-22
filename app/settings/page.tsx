'use client'

import { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import PrintPricesConfig from '../components/PrintPricesConfig'

export default function SettingsPage() {
  const [mainTopPath, setMainTopPath] = useState('')
  const [isSaved, setIsSaved] = useState(false)
  const [isLoadingSave, setIsLoadingSave] = useState(false)
  const [isLoadingDetect, setIsLoadingDetect] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPath() {
      try {
        const res = await fetch('http://localhost:3001/settings/main-top-path')
        if (!res.ok) throw new Error('Erreur lors du chargement')
        const data = await res.json()
        setMainTopPath(data.mainTopPath || '')
      } catch (err) {
        console.error(err)
        setError('Impossible de charger les paramètres')
      }
    }
    fetchPath()
  }, [])

  const handleSave = async () => {
    if (!mainTopPath.trim()) {
      alert('Veuillez renseigner le chemin MainTop avant de sauvegarder.')
      return
    }

    setIsLoadingSave(true)
    setError(null)

    try {
      const res = await fetch('http://localhost:3001/settings/main-top-path', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mainTopPath: mainTopPath.trim() }),
      })

      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(errorText || 'Erreur lors de la sauvegarde du chemin')
      }

      setIsSaved(true)
    } catch (err) {
      setError((err as Error).message || 'Erreur lors de la sauvegarde')
    } finally {
      setIsLoadingSave(false)
    }
  }

  const handleDetectPath = async () => {
    setIsLoadingDetect(true)
    setError(null)
    try {
      const res = await fetch('http://localhost:3001/settings/main-top-path/detect')
      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(errorText || 'Erreur lors de la détection')
      }
      const data = await res.json()

      if (!data.detectedPath) {
        alert('Impossible de détecter le chemin automatiquement.')
        return
      }

      setMainTopPath(data.detectedPath)
      setIsSaved(false)
    } catch (error) {
      alert('Erreur lors de la détection automatique.')
      console.error(error)
    } finally {
      setIsLoadingDetect(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800">
      <Sidebar />

      <main className="flex-1 ml-64 p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <section>
            <h1 className="text-2xl font-semibold text-gray-900">Paramètres d'impression</h1>
            <p className="text-sm text-gray-500">Configurez le chemin vers les fichiers MainTop</p>
          </section>

          <div className="bg-white p-6 rounded-xl shadow border border-gray-200 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Chemin MainTop</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={mainTopPath}
                  onChange={(e) => {
                    setMainTopPath(e.target.value)
                    setIsSaved(false)
                    setError(null)
                  }}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="Ex: C:/MainTop/Logs"
                  disabled={isLoadingSave || isLoadingDetect}
                />
                <span className="text-xs text-gray-400">(Chemin absolu)</span>
              </div>
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
              {isSaved && (
                <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Chemin enregistré
                </p>
              )}
            </div>

            <div className="flex items-center justify-between gap-4 pt-4 border-t border-gray-100">
              <button
                onClick={handleDetectPath}
                className={`text-sm px-4 py-2 border rounded-md transition ${
                  isLoadingDetect
                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
                }`}
                disabled={isLoadingDetect || isLoadingSave}
              >
                {isLoadingDetect ? 'Détection en cours...' : 'Détecter automatiquement'}
              </button>

              <button
                onClick={handleSave}
                className={`ml-auto px-5 py-2 text-sm font-medium rounded-md transition focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${
                  isLoadingSave || !mainTopPath.trim() || isSaved
                    ? 'bg-teal-300 text-white cursor-not-allowed'
                    : 'bg-teal-600 text-white hover:bg-teal-700'
                }`}
                disabled={isLoadingSave || !mainTopPath.trim() || isSaved}
              >
                {isLoadingSave ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </div>

          <PrintPricesConfig />
        </div>
      </main>
    </div>
  )
}
