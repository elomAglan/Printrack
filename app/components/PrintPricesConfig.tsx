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
    <div className="gestion-roles-container">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4"> Configuration des tarifs d’impression</h2>

      <div className="flex flex-col md:flex-row gap-4 items-center gestion-roles-content bg-white p-4 rounded-xl shadow-md border">
        <select
          value={selectedMode}
          onChange={(e) => setSelectedMode(e.target.value)}
          className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-teal-500"
          disabled={loading}
        >
          <option value="">-- Choisir un mode --</option>
          {modeOptions.map((mode) => (
            <option key={mode} value={mode}>{mode}</option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Prix / mm²"
          className="w-full md:w-1/4 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-right"
          value={newPrice}
          onChange={(e) => setNewPrice(e.target.value === "" ? "" : parseFloat(e.target.value))}
          disabled={loading}
          min={0}
          step={0.01}
        />

        <button
          onClick={handleAdd}
          className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg transition font-medium shadow-sm"
          disabled={loading}
        >
          ➕ Ajouter
        </button>
      </div>

      {error && <p className="ce-error mt-2">{error}</p>}
      {success && <p className="text-green-600 font-semibold mt-2">{success}</p>}

      <div className="mt-6 overflow-x-auto rounded-lg border">
        <table className="billet-table w-full">
          <thead>
            <tr className="bg-gray-100 text-gray-600 uppercase text-sm">
              <th className="px-4 py-3 text-left">Mode</th>
              <th className="px-4 py-3 text-right">Prix (FCFA / mm²)</th>
              <th className="px-4 py-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {printPrices.map(({ mode, pricePerSquareMeter }, index) => (
              <tr key={`${mode}-${index}`} className="border-t hover:bg-gray-50 transition">
                <td className="px-4 py-3 font-medium text-gray-800">{mode}</td>
                <td className="px-4 py-3 text-right">
                  <input
                    type="number"
                    className="w-24 px-2 py-1 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-teal-500"
                    value={pricePerSquareMeter}
                    onChange={(e) => handlePriceChange(index, e.target.value)}
                    disabled={loading}
                    min={0}
                    step={0.01}
                  />
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => handleRemove(mode)}
                    className="text-red-500 hover:underline disabled:opacity-50"
                    disabled={loading}
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
            {printPrices.length === 0 && (
              <tr>
                <td colSpan={3} className="text-center py-4 text-gray-500">Aucun tarif configuré</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end mt-6">
        <button
          onClick={handleSave}
          className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-lg font-semibold transition shadow-md"
          disabled={loading}
        >
          {loading ? "⏳ Enregistrement..." : "💾 Sauvegarder"}
        </button>
      </div>
    </div>
  );
}
