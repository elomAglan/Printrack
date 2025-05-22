'use client' // 🔥 OBLIGATOIRE pour utiliser useRouter, localStorage, useEffect, etc.

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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<string | null>(null)

  const [totalImpressions, setTotalImpressions] = useState(0)
  const [totalEncreUtilisee, setTotalEncreUtilisee] = useState(0)
  const [totalCopies, setTotalCopies] = useState(0)
  const [impressionsData, setImpressionsData] = useState({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
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

    setUser('admin@example.com')

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

        // Facultatif : si l'API retourne aussi un tableau mensuel
        if (data.monthlyData) {
          const newChartData = {
            labels: data.monthlyData.map((item: any) => item.month),
            datasets: [
              {
                label: 'Impressions',
                data: data.monthlyData.map((item: any) => item.total),
                fill: false,
                borderColor: '#1abc9c',
                tension: 0.1
              }
            ]
          }
          setImpressionsData(newChartData)
        }
      })
      .catch(error => {
        console.error('Erreur lors du chargement des stats :', error)
      })
  }, [])

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-teal-700">Tableau de Bord</h1>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-600 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition duration-200">
            <h2 className="font-semibold text-md mb-2">Impressions du Jour</h2>
            <p className="text-3xl font-bold">{totalImpressions}</p>
          </div>
          <div className="bg-emerald-600 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition duration-200">
            <h2 className="font-semibold text-md mb-2">Total d'Encre Utilisée (ml)</h2>
            <p className="text-3xl font-bold">{totalEncreUtilisee}</p>
          </div>

          <div className="bg-orange-500 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition duration-200">
            <h2 className="font-semibold text-md mb-2">Total Copies</h2>
            <p className="text-3xl font-bold">{totalCopies}</p>
          </div>
        </div>

        <div className="mt-12 bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Statistiques Mensuelles</h2>
          <Line data={impressionsData} />
        </div>
      </div>
    </div>
  )
}