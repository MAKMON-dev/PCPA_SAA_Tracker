import React, { useState } from "react";

export default function ChainageBuilder() {
  const [structure, setStructure] = useState("");
  const [responseType, setResponseType] = useState("");
  const [selectedAction, setSelectedAction] = useState("");
  const [customAction, setCustomAction] = useState("");
  const [msc, setMsc] = useState("");
  const [customIncidence, setCustomIncidence] = useState("");
  const [customPerceived, setCustomPerceived] = useState(false);
  const [customRealized, setCustomRealized] = useState(false);
  const [selectedIncidences, setSelectedIncidences] = useState([]);
  const [chainages, setChainages] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [structureCount, setStructureCount] = useState({});
  const [adminMode, setAdminMode] = useState(false);
  const [adminPass, setAdminPass] = useState("");

  const actionGroups = {
    "Structuration / organisation": [
      "Créer un comité de pilotage",
      "Clarifier les rôles",
      "Formaliser une stratégie",
      "Définir un plan d’action",
      "Instaurer un règlement interne"
    ],
    "Formation / compétences": [
      "Organiser une formation",
      "Mettre en place du tutorat",
      "Partager des ressources",
      "Mettre en œuvre un atelier pratique",
      "Encourager l’autoformation"
    ],
    "Engagement individuel / initiative": [
      "Lancer une action personnelle",
      "Porter un plaidoyer",
      "Mobiliser son réseau",
      "Animer un atelier",
      "Représenter l’organisation"
    ],
    "Ouverture externe / coopération": [
      "Rejoindre un collectif",
      "Initier un partenariat",
      "Organiser un événement avec d'autres",
      "Participer à une réunion institutionnelle",
      "Communiquer à l’extérieur"
    ],
    "Réajustement / adaptation": [
      "Réorienter une action",
      "Réagir à une crise",
      "Modifier un outil en place",
      "Tester une nouvelle méthode",
      "Réorganiser une activité"
    ],
    "Valorisation / capitalisation": [
      "Écrire un guide",
      "Partager une expérience",
      "Créer un support de communication",
      "Documenter une pratique",
      "Accompagner une autre structure"
    ],
    "Autre": []
  };

  const mscList = [
    "1. Gouvernance interne",
    "2. Professionnalisation des équipes",
    "3. Réseautage et coopérations",
    "4. Plaidoyer par l’action",
    "5. Leadership individuel",
    "6. Structuration stratégique et économique",
    "7. Innovation organisationnelle",
    "8. Apprentissage et adaptation",
    "9. Capitalisation et transmission"
  ];

  const officialIncidences = [
    "Amélioration des résultats de projets",
    "Renforcement de l’équipe",
    "Légitimité accrue",
    "Mobilisation des membres",
    "Impact territorial renforcé"
  ];
  
  const fetchFromGoogleSheet = async () => {
    const url = "https://script.google.com/macros/s/AKfycbz9zjxV6Y8p-37u0FP000EMFMgoPs4z2rXwPfoER1RdkTv4hhVliXDyqFA_0ScyCMcn/exec";
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (Array.isArray(data)) {
        setChainages(data);
      }
    } catch (err) {
      console.error("Erreur lors du chargement des données Google Sheets", err);
    }
  };


  const toggleIncidence = (name, type) => {
    setSelectedIncidences(prev => {
      const existing = prev.find(i => i.name === name);
      if (existing) {
        return prev.map(i =>
          i.name === name ? { ...i, [type]: !i[type] } : i
        );
      } else {
        return [...prev, { name, perceived: type === "perceived", realized: type === "realized" }];
      }
    });
  };

  const isChecked = (name, type) => {
    const item = selectedIncidences.find(i => i.name === name);
    return item ? item[type] : false;
  };

  const handleAddAction = () => {
    if (customAction.trim()) {
      actionGroups["Autre"].push(customAction.trim());
      setSelectedAction(customAction.trim());
      setCustomAction("");
    }
  };

  const sendToGoogleSheet = async (chainage) => {
    const url = "https://script.google.com/macros/s/AKfycbz9zjxV6Y8p-37u0FP000EMFMgoPs4z2rXwPfoER1RdkTv4hhVliXDyqFA_0ScyCMcn/exec";
    try {
      await fetch(url, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(chainage)
      });
    } catch (err) {
      console.error("Erreur Google Sheets", err);
    }
  };

  const handleAddChainage = () => {
    const incidences = [...selectedIncidences];

    // 🔄 Ajout de l'incidence personnalisée si cochée
    if (customIncidence && (customPerceived || customRealized)) {
      incidences.push({
        name: customIncidence,
        perceived: customPerceived,
        realized: customRealized
      });
    }

    if (!responseType || !selectedAction || !msc || incidences.length === 0) {
      alert("Merci de remplir tous les champs obligatoires.");
      return;
    }

    const prefix = structure.trim().toUpperCase() || "RESP";
    const count = (structureCount[prefix] || 0) + 1;
    const label = `${prefix}${count}`;
    setStructureCount(prev => ({ ...prev, [prefix]: count }));

    const newChainage = {
      label,
      structure: prefix,
      responseType,
      action: selectedAction,
      msc,
      incidences
    };

    setChainages(prev => [...prev, newChainage]);
    sendToGoogleSheet(newChainage);

    // Réinitialisation complète
    setStructure("");
    setResponseType("");
    setSelectedAction("");
    setCustomAction("");
    setMsc("");
    setCustomIncidence("");
    setCustomPerceived(false);
    setCustomRealized(false);
    setSelectedIncidences([]);
    setExpandedIndex(null);
  };

  
  const handleAdminLogin = () => {
    if (adminPass === "pcpa2025") {
      setAdminMode(true);
      fetchFromGoogleSheet();  // Ajout ici
    } else {
      alert("Mot de passe incorrect.");
    }
    setAdminPass("");
  };


  const handleExportCSV = () => {
    const rows = chainages.map(c => {
      const perçues = c.incidences.filter(x => x.perceived).map(x => x.name).join(" | ");
      const réalisées = c.incidences.filter(x => x.realized).map(x => x.name).join(" | ");
      return {
        Code: c.label,
        Structure: c.structure,
        Type: c.responseType,
        Action: c.action,
        MSC: c.msc,
        "Incidences perçues": perçues,
        "Incidences réalisées": réalisées
      };
    });

    const headers = Object.keys(rows[0]);
    const csv = [
      headers.join(","),
      ...rows.map(row => headers.map(h => `"${row[h] || ""}"`).join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "chainages_pcpa.csv";
    link.click();
  };
  return (
    <div className="p-6 space-y-4 text-sm max-w-4xl mx-auto">

      {!adminMode && (
        <div className="bg-blue-50 p-4 rounded">
          <label className="block text-sm mb-1">Accès administrateur :</label>
          <input
            type="password"
            className="border p-1 mr-2"
            value={adminPass}
            onChange={(e) => setAdminPass(e.target.value)}
          />
          <button
            onClick={handleAdminLogin}
            className="bg-blue-600 text-white px-2 py-1 rounded"
          >
            Valider
          </button>
        </div>
      )}

      <h2 className="text-lg font-semibold">Chaînage Action ➡️ MSC ➡️ Incidences</h2>

      <input
        className="border p-2 w-full"
        placeholder="Nom de la structure (facultatif)"
        value={structure}
        onChange={(e) => setStructure(e.target.value)}
      />

      <select
        className="border p-2 w-full"
        value={responseType}
        onChange={(e) => setResponseType(e.target.value)}
      >
        <option value="">-- Type de réponse --</option>
        <option value="Individuelle">Individuelle</option>
        <option value="Collective">Collective</option>
      </select>

      <select
        className="border p-2 w-full"
        value={selectedAction}
        onChange={(e) => setSelectedAction(e.target.value)}
      >
        <option value="">-- Sélectionner une action --</option>
        {Object.entries(actionGroups).map(([groupe, actions]) => (
          <optgroup key={groupe} label={groupe}>
            {actions.map((action, idx) => (
              <option key={idx} value={action}>{action}</option>
            ))}
          </optgroup>
        ))}
      </select>

      <div className="flex items-center gap-2">
        <input
          className="border p-2 w-full"
          placeholder="Nouvelle action"
          value={customAction}
          onChange={(e) => setCustomAction(e.target.value)}
        />
        <button
          onClick={handleAddAction}
          className="bg-gray-600 text-white px-3 py-1 rounded"
        >
          Ajouter
        </button>
      </div>

      <select
        className="border p-2 w-full"
        value={msc}
        onChange={(e) => setMsc(e.target.value)}
      >
        <option value="">-- Sélectionner un MSC --</option>
        {mscList.map((m, i) => (
          <option key={i} value={m}>{m}</option>
        ))}
      </select>

      <h3 className="font-semibold mt-4">Incidences perçues / réalisées</h3>
      {officialIncidences.map((inc, idx) => (
        <div key={idx} className="flex gap-4 items-center py-1">
          <span className="w-1/2">{inc}</span>
          <label><input type="checkbox" checked={isChecked(inc, 'perceived')} onChange={() => toggleIncidence(inc, 'perceived')} /> 🔄 Perçue</label>
          <label><input type="checkbox" checked={isChecked(inc, 'realized')} onChange={() => toggleIncidence(inc, 'realized')} /> ✅ Réalisée</label>
        </div>
      ))}

      <div className="pt-3 space-y-1">
        <label>Ajouter une incidence personnalisée :</label>
        <input
          className="border p-2 w-full"
          placeholder="Nom de l'incidence"
          value={customIncidence}
          onChange={(e) => setCustomIncidence(e.target.value)}
        />
        <div className="flex gap-4 mt-1">
          <label><input type="checkbox" checked={customPerceived} onChange={() => setCustomPerceived(!customPerceived)} /> 🔄 Perçue</label>
          <label><input type="checkbox" checked={customRealized} onChange={() => setCustomRealized(!customRealized)} /> ✅ Réalisée</label>
        </div>
      </div>

      <button
        onClick={handleAddChainage}
        className="bg-green-600 text-white mt-4 px-4 py-2 rounded"
      >
        ➕ Ajouter
      </button>
    {chainages.length > 0 && (
      <div className="mt-8 space-y-2">
        <h3 className="font-semibold text-md">Chaînages enregistrés</h3>

        <div className="text-sm text-gray-600">
          <span>🔄 : incidence perçue</span> &nbsp;&nbsp;
          <span>✅ : incidence réalisée</span>
        </div>

        <table className="w-full mt-2 border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-2">Code</th>
              <th className="border px-2">Structure</th>
              <th className="border px-2">Type</th>
              <th className="border px-2">Action</th>
              <th className="border px-2">MSC</th>
              <th className="border px-2">🔄 Perçues</th>
              <th className="border px-2">✅ Réalisées</th>
            </tr>
          </thead>
          <tbody>
            {chainages.map((c, i) => {
              const perçues = c.incidences.filter(x => x.perceived).map(x => x.name);
              const réalisées = c.incidences.filter(x => x.realized).map(x => x.name);

              return (
                <React.Fragment key={i}>
                  <tr
                    className="cursor-pointer hover:bg-gray-100"
                    onClick={() => setExpandedIndex(i === expandedIndex ? null : i)}
                  >
                    <td className="border px-2">{c.label}</td>
                    <td className="border px-2">{c.structure}</td>
                    <td className="border px-2">{c.responseType}</td>
                    <td className="border px-2">{c.action}</td>
                    <td className="border px-2">{c.msc}</td>
                    <td className="border px-2">{perçues.join(", ")}</td>
                    <td className="border px-2">{réalisées.join(", ")}</td>
                  </tr>

                  {expandedIndex === i && (
                    <tr className="bg-blue-50">
                      <td colSpan={7} className="p-4">
                        <div className="flex flex-col items-start space-y-1">
                          <div><strong>{c.action}</strong> ➡️</div>
                          <div className="ml-4">{c.msc} ➡️</div>
                          <div className="ml-8">
                            ✅ <strong>Réalisées :</strong> {réalisées.join(" | ") || "Aucune"}
                          </div>
                          <div className="ml-8">
                            🔄 <strong>Perçues :</strong> {perçues.join(" | ") || "Aucune"}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>

        {adminMode && (
          <button
            className="bg-gray-800 text-white mt-4 px-4 py-2 rounded"
            onClick={handleExportCSV}
          >
            📁 Exporter CSV
          </button>
        )}
      </div>
    )}
  </div>
);
}


