import React, { useState } from "react";

export default function KampDrankRegistratieApp() {
  const [leaders, setLeaders] = useState([
    "Anna",
    "Arne B",
    "Arne M",
    "Brend",
    "Cara",
    "Cas",
    "Dylan",
    "Elien",
    "Emma",
    "Hanne",
    "Isaak",
    "Joni",
    "Joshua",
    "Laura",
    "Lena",
    "Liesa",
    "Lisse",
    "Mats",
    "Marloes",
    "Martyna",
    "Mira",
    "Nand",
    "Nele",
    "Nicolas",
    "Nienke",
    "Oskar",
    "Remco",
    "Sedde",
    "Zita"
  ]);

  const adminUsers = ["Nienke", "Mira"];

  const SHEET_URL = "https://script.google.com/macros/s/AKfycbyEaOFa68hbY8cwClf-66R3eLdSKr1W98ai_s_nVg7fU5DKH7i8sxsjBaYfDRJddoebsA/exec";
  const basePrices = {
    fris: 0.5,
    bier: 0.7,
    speciaal: 1,
    cocktail: 2.5
  };

  const [selectedPeople, setSelectedPeople] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [currentUser, setCurrentUser] = useState("Nienke");
  const [drinkPrices, setDrinkPrices] = useState(basePrices);
  const [newLeaderName, setNewLeaderName] = useState("");

  const isAdmin = adminUsers.includes(currentUser);

  const addLeader = () => {
    const trimmedName = newLeaderName.trim();

    if (!trimmedName) return;
    if (leaders.includes(trimmedName)) return;

    const updatedLeaders = [...leaders, trimmedName].sort((a, b) =>
      a.localeCompare(b)
    );

    setLeaders(updatedLeaders);
    setNewLeaderName("");
  };

  const togglePerson = (person) => {
    if (selectedPeople.includes(person)) {
      setSelectedPeople(selectedPeople.filter((p) => p !== person));
    } else {
      setSelectedPeople([...selectedPeople, person]);
    }
  };
  
const sendToSheet = (person, type) => {
  try {
    const params = new URLSearchParams({
      person,
      type,
      registeredBy: currentUser,
      price: drinkPrices[type],
      timestamp: new Date().toISOString()
    });

    navigator.sendBeacon(SHEET_URL, params);
  } catch (err) {
    // niets doen
  }
};

  const addDrink = (type) => {
    if (selectedPeople.length === 0) return;

    const peopleToRegister = [...selectedPeople];

    const newEntries = peopleToRegister.map((person) => ({
      person,
      type,
      timestamp: new Date().toLocaleTimeString()
    }));

    // Eerst lokaal opslaan
    setRegistrations((prev) => [...newEntries, ...prev]);

    // Meteen selectie leegmaken zodat UI niet blokkeert
    setSelectedPeople([]);

    // Pas daarna achtergrond-sync uitvoeren
    setTimeout(() => {
      peopleToRegister.forEach((person) => {
        sendToSheet(person, type);
      });
    }, 100);
  };

  const undoLast = () => {
    setRegistrations(registrations.slice(1));
  };

  const calculateTotals = () => {
    const totals = {};

    leaders.forEach((leader) => {
      totals[leader] = { fris: 0, bier: 0, speciaal: 0, cocktail: 0, total: 0 };
    });

    registrations.forEach((reg) => {
      if (!totals[reg.person]) return;
      totals[reg.person][reg.type] += 1;
      totals[reg.person].total += drinkPrices[reg.type];
    });

    return totals;
  };

  const totals = calculateTotals();

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6 bg-white rounded-3xl shadow-xl p-6 flex flex-col lg:flex-row gap-4 justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold mb-2">👤 Persoonlijke Pagina</h2>

          {isAdmin ? (
            <div className="flex gap-2 flex-wrap">
              {leaders.map((leader) => (
                <button
                  key={leader}
                  onClick={() => setCurrentUser(leader)}
                  className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                    currentUser === leader
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 hover:bg-gray-300"
                  }`}
                >
                  {leader}
                </button>
              ))}
            </div>
          ) : (
            <div className="px-4 py-3 rounded-xl bg-blue-100 text-blue-800 font-semibold">
              Ingelogd als: {currentUser}
            </div>
          )}
        </div>

        {isAdmin && (
          <div className="px-4 py-2 rounded-xl bg-red-500 text-white font-bold">
            Admin toegang
          </div>
        )}
      </div>

      {/* My overview */}
      <div className="max-w-7xl mx-auto mb-6 bg-white rounded-3xl shadow-xl p-6">
        <h2 className="text-3xl font-bold mb-4">📱 Mijn Overzicht</h2>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-cyan-100 rounded-2xl p-4">
            <div className="text-sm text-gray-600">Fris</div>
            <div className="text-3xl font-bold">{totals[currentUser].fris}</div>
          </div>

          <div className="bg-yellow-100 rounded-2xl p-4">
            <div className="text-sm text-gray-600">Bier</div>
            <div className="text-3xl font-bold">{totals[currentUser].bier}</div>
          </div>

          <div className="bg-red-100 rounded-2xl p-4">
            <div className="text-sm text-gray-600">Speciaal</div>
            <div className="text-3xl font-bold">{totals[currentUser].speciaal}</div>
          </div>

          <div className="bg-purple-100 rounded-2xl p-4">
            <div className="text-sm text-gray-600">Cocktail</div>
            <div className="text-3xl font-bold">{totals[currentUser].cocktail}</div>
          </div>

          <div className="bg-green-100 rounded-2xl p-4">
            <div className="text-sm text-gray-600">Totaal</div>
            <div className="text-3xl font-bold">
              €{totals[currentUser].total.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Admin panel */}
      {isAdmin && (
        <div className="max-w-7xl mx-auto mb-6 bg-white rounded-3xl shadow-xl p-6">
          <h2 className="text-3xl font-bold mb-4">⚙️ Admin Paneel</h2>

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-3">➕ Nieuwe gebruiker toevoegen</h3>

            <div className="flex gap-3 flex-col md:flex-row">
              <input
                type="text"
                placeholder="Naam invoeren"
                value={newLeaderName}
                onChange={(e) => setNewLeaderName(e.target.value)}
                className="flex-1 border rounded-xl p-3"
              />

              <button
                onClick={addLeader}
                className="bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold"
              >
                Toevoegen
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.keys(drinkPrices).map((type) => (
              <div key={type}>
                <label className="block font-semibold mb-2">Prijs {type}</label>
                <input
                  type="number"
                  step="0.1"
                  value={drinkPrices[type]}
                  onChange={(e) =>
                    setDrinkPrices({
                      ...drinkPrices,
                      [type]: Number(e.target.value)
                    })
                  }
                  className="w-full border rounded-xl p-3"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-xl p-6">
          <h2 className="text-2xl font-semibold mb-4">🍻 Drank registratie</h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {leaders.map((leader) => (
              <button
                key={leader}
                onClick={() => togglePerson(leader)}
                className={`p-4 rounded-2xl font-semibold transition-all shadow ${
                  selectedPeople.includes(leader)
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                {leader}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button onClick={() => addDrink("fris")} className="bg-cyan-500 text-white p-6 rounded-2xl">🥤 Fris</button>
            <button onClick={() => addDrink("bier")} className="bg-yellow-500 text-white p-6 rounded-2xl">🍺 Bier</button>
            <button onClick={() => addDrink("speciaal")} className="bg-red-500 text-white p-6 rounded-2xl">🥃 Speciaal</button>
            <button onClick={() => addDrink("cocktail")} className="bg-purple-500 text-white p-6 rounded-2xl">🍹 Cocktail</button>
          </div>

          <button
            onClick={undoLast}
            className="mt-4 bg-gray-800 text-white px-6 py-3 rounded-2xl"
          >
            ↩ Undo
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-6">
          <h2 className="text-2xl font-bold mb-4">📋 Live totaal</h2>

          {leaders.map((leader) => (
            <div key={leader} className="mb-3 border p-3 rounded-xl">
              <div className="font-bold flex justify-between">
                <span>{leader}</span>
                <span>€{totals[leader].total.toFixed(2)}</span>
              </div>
              <div className="text-sm text-gray-600">
                🥤 {totals[leader].fris} | 🍺 {totals[leader].bier} | 🥃 {totals[leader].speciaal} | 🍹 {totals[leader].cocktail}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
