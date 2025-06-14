import React, { useState, useEffect } from "react";

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

  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz9zjxV6Y8p-37u0FP000EMFMgoPs4z2rXwPfoER1RdkTv4hhVliXDyqFA_0ScyCMcn/exec";

  const actionGroups = {
    "Structuration / organisation": [
      "Créer un comité de pilotage", "Clarifier les rôles", "Formaliser une stratégie", "Définir un plan d’action", "Instaurer un règlement interne"
    ],
    "Formation / compétences": [
      "Organiser une formation", "Mettre en place du tutorat", "Partager des ressources", "Mettre en œuvre un atelier pratique", "Encourager l’autoformation"
    ],
    "Engagement individuel / initiative": [
      "Lancer une action personnelle", "Porter un plaidoyer", "Mobiliser son réseau", "Animer un atelier", "Représenter l’organisation"
    ],
    "Ouverture externe / coopération": [
      "Rejoindre un collectif", "Initier un partenariat", "Organiser un événement avec d'autres", "Participer à une réunion institutionnelle", "Communiquer à l’extérieur"
    ],
    "Réajustement / adaptation": [
      "Réorienter une action", "Réagir à une crise", "Modifier un outil en place", "Tester une nouvelle méthode", "Réorganiser une activité"
    ],
    "Valorisation / capitalisation": [
      "Écrire un guide", "Partager une expérience", "Créer un support de communication", "Documenter une pratique", "Accompagner une autre structure"
    ],
    "Autre": []
  };

  const mscList = [
    "1. Gouvernance interne", "2. Professionnalisation des équipes", "3. Réseautage et coopérations",
    "4. Plaidoyer par l’action", "5. Leadership individuel", "6. Structuration stratégique et économique",
    "7. Innovation organisationnelle", "8. Apprentissage et adaptation", "9. Capitalisation et transmission"
  ];

  const officialIncidences = [
    "Amélioration des résultats de projets", "Renforcement de l’équipe", "Légitimité accrue",
    "Mobilisation des membres", "Impact territorial renforcé"
  ];

  const toggleIncidence = (name, type) => {
    setSelectedIncidences(prev => {
      const existing = prev.find(i => i.name === name);
      if (existing) {
        return prev.map(i => i.name === name ? { ...i, [type]: !i[type] } : i);
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
    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(chainage)
      });
    } catch (err) {
      console.error("Erreur Google Sheets", err);
    }
  };

  const fetchFromGoogleSheet = async () => {
    try {
      const response = await fetch(GOOGLE_SCRIPT_URL);
      const data = await response.json();
      setChainages(data);
    } catch (err) {
      console.error("Erreur lors du chargement des données :", err);
    }
  };

  const handleAddChainage = () => {
    const incidences = [...selectedIncidences];

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

    setStructure(""); setResponseType(""); setSelectedAction(""); setCustomAction("");
    setMsc(""); setCustomIncidence(""); setCustomPerceived(false); setCustomRealized(false);
    setSelectedIncidences([]); setExpandedIndex(null);
  };

  const handleAdminLogin = () => {
    if (adminPass === "pcpa2025") {
      setAdminMode(true);
      fetchFromGoogleSheet();
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

  useEffect(() => {
    if (adminMode) fetchFromGoogleSheet();
  }, [adminMode]);

  return (
    <div className="p-6 space-y-4 text-sm max-w-4xl mx-auto">
      {!adminMode && (
        <div className="bg-blue-50 p-4 rounded">
          <label>Accès administrateur :</label>
          <input type="password" className="border p-1 mr-2" value={adminPass} onChange={(e) => setAdminPass(e.target.value)} />
          <button onClick={handleAdminLogin} className="bg-blue-600 text-white px-2 py-1 rounded">Valider</button>
        </div>
      )}

      <h2 className="text-lg font-semibold">Chaînage Action ➡️ MSC ➡️ Incidences</h2>
      {/* Champs de saisie ici (identiques à ton code) */}

      {/* [TODO] Recoller ici tout le bloc JSX des champs si nécessaire (saisi des actions, MSC, incidences, bouton ajouter) */}

      {adminMode && chainages.length > 0 && (
        <>
          <h3 className="mt-8 font-semibold text-md">📊 Chaînages enregistrés (admin)</h3>
          <table className="w-full text-sm border mt-2">
            <thead>
              <tr className="bg-gray-100">
                <th>Code</th><th>Structure</th><th>Type</th><th>Action</th><th>MSC</th><th>🔄 Perçues</th><th>✅ Réalisées</th>
              </tr>
            </thead>
            <tbody>
              {chainages.map((c, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="border px-2">{c.label}</td>
                  <td className="border px-2">{c.structure}</td>
                  <td className="border px-2">{c.responseType}</td>
                  <td className="border px-2">{c.action}</td>
                  <td className="border px-2">{c.msc}</td>
                  <td className="border px-2">{c.incidences.filter(x => x.perceived).map(x => x.name).join(" | ")}</td>
                  <td className="border px-2">{c.incidences.filter(x => x.realized).map(x => x.name).join(" | ")}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <button className="mt-4 bg-gray-800 text-white px-4 py-2 rounded" onClick={handleExportCSV}>📁 Exporter CSV</button>
        </>
      )}
    </div>
  );
}
