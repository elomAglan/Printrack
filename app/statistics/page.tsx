'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '../components/Sidebar'

type Impression = {
  id: number
  quantite: number
  largeur: number
  hauteur: number
  mode: string
}

type Price = {
  mode: string
  pricePerSquareMeter: number // Interprété comme prix par mm²
  isActive: boolean
}

export default function StatisticsPage() {
  const router = useRouter()
  const [user, setUser] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState(() =>
    new Date().toISOString().split('T')[0]
  )
  const [impressions, setImpressions] = useState<Impression[]>([])
  const [monthlyImpressions, setMonthlyImpressions] = useState<Impression[]>([])
  const [prices, setPrices] = useState<Price[]>([])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) router.push('/login')
    else setUser('admin@example.com')
  }, [router])

  // Charger les prix
  useEffect(() => {
    fetch('http://localhost:3001/print-prices')
      .then(res => res.json())
      .then(data => setPrices(data.filter((p: Price) => p.isActive)))
      .catch(err => console.error('Erreur de chargement des prix :', err))
  }, [])

  // Charger les impressions du jour
  useEffect(() => {
    fetch(`http://localhost:3001/maintop/by-date?date=${selectedDate}`)
      .then(res => res.ok ? res.json() : [])
      .then(data => setImpressions(Array.isArray(data) ? data : []))
      .catch(() => setImpressions([]))
  }, [selectedDate])

  // Charger les impressions du mois
  useEffect(() => {
    const [year, month] = selectedDate.split('-')
    fetch(`http://localhost:3001/maintop/by-month?year=${year}&month=${month}`)
      .then(res => res.ok ? res.json() : [])
      .then(data => setMonthlyImpressions(Array.isArray(data) ? data : []))
      .catch(() => setMonthlyImpressions([]))
  }, [selectedDate])

  const getPricePerMM = (mode: string) => {
    const found = prices.find(p => p.mode === mode)
    return found ? found.pricePerSquareMeter : 0
  }

  // Calculs du jour
  const totalCopies = impressions.reduce((sum, i) => sum + i.quantite, 0)
  const totalCost = impressions.reduce((sum, i) => {
    const surface = i.largeur * i.hauteur
    return sum + getPricePerMM(i.mode) * surface * i.quantite
  }, 0)

  // Calculs du mois
  const totalMonthlyCopies = monthlyImpressions.reduce((sum, i) => sum + i.quantite, 0)
  const totalMonthlyCost = monthlyImpressions.reduce((sum, i) => {
    const surface = i.largeur * i.hauteur
    return sum + getPricePerMM(i.mode) * surface * i.quantite
  }, 0)

  // Regroupement pour le résumé du jour
  const grouped = impressions.reduce((acc, { largeur, hauteur, quantite, mode }) => {
    const key = `${largeur}x${hauteur} [${mode}]`
    acc[key] = (acc[key] || 0) + quantite
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-6 ml-64">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-[#1abc9c] mb-6">Impressions</h1>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Choisissez une date :
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 shadow-sm focus:outline-none focus:ring focus:border-[#1abc9c]"
            />
          </div>

          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-[#1abc9c] mb-4">
              Impressions du {new Date(selectedDate).toLocaleDateString()}
            </h2>

            {impressions.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full table-auto border border-gray-200 rounded-md overflow-hidden">
                    <thead className="bg-gray-100 text-gray-700 text-sm font-semibold">
                      <tr>
                        <th className="px-4 py-2 text-left">ID</th>
                        <th className="px-4 py-2 text-left">Dimensions (mm)</th>
                        <th className="px-4 py-2 text-left">Copies</th>
                        <th className="px-4 py-2 text-left">Mode</th>
                        <th className="px-4 py-2 text-left">Prix/mm²</th>
                        <th className="px-4 py-2 text-left">Total</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm text-gray-700">
                      {impressions.map(imp => {
                        const surface = imp.largeur * imp.hauteur
                        const unitPrice = getPricePerMM(imp.mode)
                        const total = unitPrice * surface * imp.quantite
                        return (
                          <tr key={imp.id} className="hover:bg-gray-50 transition">
                            <td className="px-4 py-2">{imp.id}</td>
                            <td className="px-4 py-2">{imp.largeur} x {imp.hauteur}</td>
                            <td className="px-4 py-2">{imp.quantite}</td>
                            <td className="px-4 py-2">{imp.mode}</td>
                            <td className="px-4 py-2">{unitPrice.toLocaleString()} FCFA</td>
                            <td className="px-4 py-2">{total.toLocaleString()} FCFA</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 bg-gray-50 p-4 rounded shadow-sm">
                  <h3 className="font-semibold text-gray-700 mb-2">Résumé :</h3>
                  <ul className="list-disc pl-6 space-y-1 text-sm">
                    {Object.entries(grouped).map(([key, qty]) => {
                      const [dim, modePart] = key.split(' [')
                      const [w, h] = dim.split('x').map(Number)
                      const mode = modePart.replace(']', '')
                      const cost = getPricePerMM(mode) * w * h * qty
                      return (
                        <li key={key}>
                          {qty} copie(s) en {w} x {h} mm (Mode: {mode}) → {cost.toLocaleString()} FCFA
                        </li>
                      )
                    })}
                  </ul>
                  <p className="mt-2 font-semibold text-sm">
                    Total copies : {totalCopies.toLocaleString()}
                  </p>
                  <p className="text-xl font-bold text-[#1e40af]">
                    Coût total : {totalCost.toLocaleString()} FCFA
                  </p>
                </div>
              </>
            ) : (
              <div className="text-gray-500 text-sm bg-gray-100 p-4 rounded">
                Aucune impression enregistrée pour cette date.
              </div>
            )}
          </section>

          {/* Section mensuelle */}
          <section className="mt-10 bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-[#2ecc71] mb-2">
              Total mensuel – {new Date(selectedDate).toLocaleString('fr-FR', { month: 'long', year: 'numeric' })}
            </h2>
            <p className="text-sm text-gray-700">
              Total copies : <span className="font-semibold">{totalMonthlyCopies.toLocaleString()}</span>
            </p>
            <p className="text-sm text-gray-700">
              Coût total : <span className="font-semibold text-[#1e40af]">{totalMonthlyCost.toLocaleString()} FCFA</span>
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
