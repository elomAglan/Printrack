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
      setError('Veuillez renseigner le chemin MainTop avant de sauvegarder.')
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
        setError('Impossible de détecter le chemin automatiquement.')
        return
      }

      setMainTopPath(data.detectedPath)
      setIsSaved(false)
    } catch (error) {
      setError('Erreur lors de la détection automatique.')
      console.error(error)
    } finally {
      setIsLoadingDetect(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 ml-64 p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
            <p className="text-gray-600">Configurez les chemins d'accès et les tarifs d'impression</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Configuration du chemin MainTop</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chemin absolu</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={mainTopPath}
                      onChange={(e) => {
                        setMainTopPath(e.target.value)
                        setIsSaved(false)
                        setError(null)
                      }}
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                      placeholder="Ex: C:/MainTop/Logs"
                      disabled={isLoadingSave || isLoadingDetect}
                    />
                    <button
                      onClick={handleDetectPath}
                      disabled={isLoadingDetect || isLoadingSave}
                      className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition flex items-center gap-2 text-sm"
                    >
                      {isLoadingDetect ? (
                        <svg className="animate-spin h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      )}
                      Détecter
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSave}
                    disabled={isLoadingSave || !mainTopPath.trim() || isSaved}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition flex items-center gap-2"
                  >
                    {isLoadingSave ? (
                      <>
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" />
                        </svg>
                        Enregistrer
                      </>
                    )}
                  </button>
                </div>

                {(error || isSaved) && (
                  <div className={`p-3 rounded-lg flex items-start gap-2 text-sm ${error ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d={error ? "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" : "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"} clipRule="evenodd" />
                    </svg>
                    <span>{error || 'Paramètres enregistrés avec succès'}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <PrintPricesConfig />
        </div>
      </main>
    </div>
  )
}