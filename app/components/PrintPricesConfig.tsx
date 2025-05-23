"use client";
import React, { useState, useEffect } from "react";

type PrintPrice = {
  mode: string;
  pricePerSquareMeter: number;
};

const modeOptions = [
  "Noir & Blanc",
  "Couleur Haute Qualité",
  "Couleur Basse Qualité",
  "Brouillon",
  "Photo HD",
];

export default function PrintPricesConfig() {
  const [printPrices, setPrintPrices] = useState<PrintPrice[]>([]);
  const [selectedMode, setSelectedMode] = useState("");
  const [newPrice, setNewPrice] = useState<number | "">("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const apiUrl = "http://localhost:3001/print-prices";

  useEffect(() => {
    async function fetchPrices() {
      setLoading(true);
      try {
        const res = await fetch(apiUrl);
        if (!res.ok) throw new Error(`Erreur ${res.status}`);
        const data: PrintPrice[] = await res.json();
        setPrintPrices(data);
      } catch {
        setError("Erreur lors du chargement des prix.");
      } finally {
        setLoading(false);
      }
    }
    fetchPrices();
  }, []);

  const handleAdd = () => {
    setError(null);
    setSuccess(null);
    if (!selectedMode || newPrice === "" || Number(newPrice) <= 0) {
      setError("Veuillez sélectionner un mode et entrer un prix valide.");
      return;
    }

    if (printPrices.some(p => p.mode === selectedMode)) {
      setError("Ce mode est déjà configuré.");
      return;
    }

    setPrintPrices([...printPrices, {
      mode: selectedMode,
      pricePerSquareMeter: Number(newPrice),
    }]);
    setSelectedMode("");
    setNewPrice("");
  };

  const handleRemove = async (modeToDelete: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}?mode=${encodeURIComponent(modeToDelete)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Erreur lors de la suppression.");
      setPrintPrices(prev => prev.filter(p => p.mode !== modeToDelete));
    } catch {
      setError("Impossible de supprimer le mode.");
    } finally {
      setLoading(false);
    }
  };

  const handlePriceChange = (index: number, value: string) => {
    const updated = [...printPrices];
    updated[index].pricePerSquareMeter = parseFloat(value);
    setPrintPrices(updated);
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`${apiUrl}/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prices: printPrices }),
      });
      if (!res.ok) throw new Error("Erreur d'enregistrement");
      const updatedPrices: PrintPrice[] = await res.json();
      setPrintPrices(updatedPrices);
      setSuccess("Tarifs enregistrés avec succès !");
    } catch {
      setError("Erreur lors de l'enregistrement des données.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Configuration des tarifs d'impression</h2>
        <p className="text-gray-600">Gérez les différents modes d'impression et leurs tarifs</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="w-full md:w-2/5">
            <label className="block text-sm font-medium text-gray-700 mb-1">Mode d'impression</label>
            <select
              value={selectedMode}
              onChange={(e) => setSelectedMode(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              disabled={loading}
            >
              <option value="">Sélectionnez un mode...</option>
              {modeOptions.map((mode) => (
                <option key={mode} value={mode}>{mode}</option>
              ))}
            </select>
          </div>

          <div className="w-full md:w-2/5">
            <label className="block text-sm font-medium text-gray-700 mb-1">Prix par mm² (FCFA)</label>
            <div className="relative">
              <input
                type="number"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-right transition"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value === "" ? "" : parseFloat(e.target.value))}
                disabled={loading}
                min={0}
                step={0.01}
                placeholder="0.00"
              />
              <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">FCFA</span>
            </div>
          </div>

          <button
            onClick={handleAdd}
            className="w-full md:w-1/5 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg transition font-medium shadow-sm flex items-center justify-center gap-2"
            disabled={loading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Ajouter
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-start gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-lg flex items-start gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>{success}</span>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mode d'impression
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prix (FCFA / mm²)
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {printPrices.map(({ mode, pricePerSquareMeter }, index) => (
                <tr key={`${mode}-${index}`} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{mode}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end">
                      <input
                        type="number"
                        className="w-32 px-3 py-1 border border-gray-200 rounded-lg text-right focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        value={pricePerSquareMeter}
                        onChange={(e) => handlePriceChange(index, e.target.value)}
                        disabled={loading}
                        min={0}
                        step={0.01}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => handleRemove(mode)}
                      className="text-red-600 hover:text-red-900 transition flex items-center justify-center gap-1 mx-auto"
                      disabled={loading}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <span>Supprimer</span>
                    </button>
                  </td>
                </tr>
              ))}
              {printPrices.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                    Aucun tarif configuré pour le moment
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition shadow-md flex items-center gap-2"
          disabled={loading}
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
              Sauvegarder les modifications
            </>
          )}
        </button>
      </div>
    </div>
  );
}