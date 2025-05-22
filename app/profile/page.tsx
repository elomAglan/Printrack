'use client'

import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'

export default function ProfilePage() {
  const [email, setEmail] = useState('')
  const [editMode, setEditMode] = useState(false)
  const [loading, setLoading] = useState({ profile: true, saving: false, changingPassword: false })
  const [messages, setMessages] = useState({ success: '', error: '', password: '' })
  const [passwordForm, setPasswordForm] = useState({ show: false, old: '', new: '' })

  useEffect(() => {
    async function fetchProfile() {
      try {
        const userId = localStorage.getItem('userId')
        if (!userId) throw new Error('Utilisateur non authentifié')

        const res = await fetch(`http://localhost:3001/api/user/profile?id=${userId}`)
        if (!res.ok) throw new Error('Erreur réseau')

        const data = await res.json()
        setEmail(data.email || '')
      } catch (error: any) {
        setMessages(m => ({ ...m, error: error.message || 'Erreur inconnue' }))
      } finally {
        setLoading(l => ({ ...l, profile: false }))
      }
    }
    fetchProfile()
  }, [])

  const handleSave = async () => {
    setLoading(l => ({ ...l, saving: true }))
    setMessages(m => ({ ...m, error: '', success: '' }))
    try {
      const userId = localStorage.getItem('userId')
      if (!userId) throw new Error('Utilisateur non authentifié')

      const res = await fetch(`http://localhost:3001/api/user/profile?id=${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) throw new Error('Erreur lors de la sauvegarde')

      setEditMode(false)
      setMessages(m => ({ ...m, success: 'Profil mis à jour avec succès' }))
      setTimeout(() => setMessages(m => ({ ...m, success: '' })), 3000)
    } catch (error: any) {
      setMessages(m => ({ ...m, error: error.message || 'Erreur mise à jour' }))
    } finally {
      setLoading(l => ({ ...l, saving: false }))
    }
  }

  const handlePasswordChange = async () => {
    setLoading(l => ({ ...l, changingPassword: true }))
    setMessages(m => ({ ...m, password: '' }))

    try {
      const userId = localStorage.getItem('userId')
      if (!userId) throw new Error('Utilisateur non authentifié')

      const res = await fetch(`http://localhost:3001/api/user/change-password?id=${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          oldPassword: passwordForm.old,
          newPassword: passwordForm.new,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || 'Échec du changement')
      }

      setMessages(m => ({ ...m, password: 'Mot de passe mis à jour avec succès' }))
      setPasswordForm({ show: false, old: '', new: '' }) // Champ nouveau mot de passe vidé ici !
    } catch (error: any) {
      setMessages(m => ({ ...m, password: error.message || 'Erreur inconnue' }))
    } finally {
      setLoading(l => ({ ...l, changingPassword: false }))
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8 ml-64">
        <section className="max-w-2xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-teal-600 mb-1">Profil</h1>
            <p className="text-gray-600">Gérez vos informations personnelles</p>
          </header>

          <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-teal-500 to-teal-600 p-6 text-white">
              <h2 className="text-xl font-semibold">Profil utilisateur</h2>
              <p className="text-teal-100">{email || '...'}</p>
            </div>

            <form className="p-6 space-y-6" onSubmit={e => e.preventDefault()}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Adresse email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  disabled={!editMode}
                  className={`w-full px-4 py-2.5 rounded-lg border transition ${
                    editMode
                      ? 'border-gray-300 focus:ring-2 focus:ring-teal-500'
                      : 'border-transparent bg-gray-50'
                  }`}
                />
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => setPasswordForm(f => ({ ...f, show: !f.show }))}
                  className="text-sm text-teal-600 hover:underline"
                >
                  {passwordForm.show ? 'Fermer' : 'Changer le mot de passe'}
                </button>

                {passwordForm.show && (
                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ancien mot de passe</label>
                      <input
                        type="password"
                        value={passwordForm.old}
                        onChange={e => setPasswordForm(f => ({ ...f, old: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
                      <input
                        type="password"
                        value={passwordForm.new}
                        onChange={e => setPasswordForm(f => ({ ...f, new: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500"
                        autoComplete="new-password" // Pour éviter autoremplissage navigateur
                      />
                    </div>

                    {messages.password && (
                      <p
                        className={`text-sm ${
                          messages.password.includes('succès') ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {messages.password}
                      </p>
                    )}

                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setPasswordForm({ show: false, old: '', new: '' })}
                        className="px-5 py-2.5 text-sm font-medium rounded-lg border border-gray-300"
                      >
                        Annuler
                      </button>
                      <button
                        type="button"
                        onClick={handlePasswordChange}
                        disabled={loading.changingPassword}
                        className="px-5 py-2.5 text-sm font-medium rounded-lg bg-teal-600 text-white hover:bg-teal-700 min-w-[120px]"
                      >
                        {loading.changingPassword ? 'En cours...' : 'Changer'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {messages.error && <p className="text-sm text-red-600">{messages.error}</p>}
              {loading.profile && !messages.error && <p className="text-sm text-gray-500">Chargement...</p>}
              {messages.success && (
                <p className="text-sm text-green-600 flex items-center space-x-1">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{messages.success}</span>
                </p>
              )}

              <div className="pt-4 border-t border-gray-100 flex justify-end space-x-3">
                {editMode ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setEditMode(false)}
                      className="px-5 py-2.5 text-sm font-medium rounded-lg border border-gray-300"
                    >
                      Annuler
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={loading.saving || loading.profile}
                      className="px-5 py-2.5 text-sm font-medium rounded-lg bg-teal-600 text-white hover:bg-teal-700 min-w-[100px]"
                    >
                      {loading.saving ? 'En cours...' : 'Enregistrer'}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setEditMode(true)}
                    disabled={loading.profile}
                    className="px-5 py-2.5 text-sm font-medium rounded-lg bg-teal-600 text-white hover:bg-teal-700"
                  >
                    Modifier
                  </button>
                )}
              </div>
            </form>
          </div>
        </section>
      </main>
    </div>
  )
}
