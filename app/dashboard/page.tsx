'use client' // 🔥 Obligatoire pour utiliser useRouter, localStorage, useEffect, etc.

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

// Enregistrement des composants Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

interface MonthlyStat {
  month: string
  total: number
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<string | null>(null)

  const [totalImpressions, setTotalImpressions] = useState(0)
  const [totalEncreUtilisee, setTotalEncreUtilisee] = useState(0)
  const [totalCopies, setTotalCopies] = useState(0)

  const [impressionsData, setImpressionsData] = useState({
    labels: [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ],
    datasets: [
      {
        label: 'Impressions',
        data: Array(12).fill(0),
        fill: false,
        borderColor: '#1abc9c',
        tension: 0.1
      }
    ]
  })

  useEffect(() => {
    const token = localStorage.getItem('token')

    if (!token) {
      router.push('/login')
      return
    }

    setUser('admin@example.com') // Simulé pour le moment

    fetch('http://localhost:3001/impressions/stats', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setTotalImpressions(data.totalImpressions || 0)
        setTotalEncreUtilisee(data.totalEncreUtilisee || 0)
        setTotalCopies(data.totalCopies || 0)

        if (Array.isArray(data.monthlyData)) {
          const chartData = {
            labels: data.monthlyData.map((item: MonthlyStat) => item.month),
            datasets: [
              {
                label: 'Impressions',
                data: data.monthlyData.map((item: MonthlyStat) => item.total),
                fill: false,
                borderColor: '#1abc9c',
                tension: 0.1
              }
            ]
          }
          setImpressionsData(chartData)
        }
      })
      .catch(err => {
        console.error('Erreur lors du chargement des statistiques :', err)
      })
  }, [router])

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-teal-700">Tableau de Bord</h1>
        </header>

        {/* Cartes statistiques */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <StatCard title="Impressions du Jour" value={totalImpressions} color="bg-blue-600" />
          <StatCard title="Total d'Encre Utilisée (ml)" value={totalEncreUtilisee} color="bg-emerald-600" />
          <StatCard title="Total Copies" value={totalCopies} color="bg-orange-500" />
        </section>

        {/* Graphique */}
        <section className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Statistiques Mensuelles</h2>
          <div className="w-full overflow-x-auto" style={{ height: '400px' }}>
            <Line data={impressionsData} />
          </div>
        </section>
      </div>
    </div>
  )
}

// Composant pour afficher les cartes statistiques
function StatCard({ title, value, color }: { title: string; value: number; color: string }) {
  return (
    <div className={`${color} text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition duration-200`}>
      <h2 className="font-semibold text-md mb-2">{title}</h2>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  )
}
