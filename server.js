const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'classement.json');
const ADMIN_PASSWORD = "MonMotDePasseSecurise123";

app.use(express.json());
app.use(express.static('public'));

// Base de données de secours contenant de vrais pseudos Minecraft populaires et existants
const deVraisPseudosMinecraft = [
    "Fruitberries", "Ninjaxx", "FuzeIII", "FriagneScarlet", "Mathox", "TheGuill84", "Siphano", "Frigiel", "Aypierre",
    "Dream", "Technoblade", "GeorgeNotFound", "Sapnap", "TommyInnit", "Tubbo", "Ranboo", "Philza", "WilburSoot",
    "DanTDM", "CaptainSparklez", "Purpled", "Wallibear", "vape", "Skeppy", "BadBoyHalo", "Antfrost", "Awesamdude",
    "Grian", "MumboJumbo", "Iskall85", "EthosLab", "VintageBeef", "xNestorio", "TapL", "Calvin", "Nestorio",
    "PrestonPlayz", "Lachlan", "JeromeASF", "BajanCanadian", "SkyDoesMinecraft", "SSundee", "PopularMMOs", "GamingWithJen",
    "Notch", "Jeb_", "Dinnerbone", "Grumm", "Marc_IRL", "LadyAgnes", "Vu常", "In绣", "SliceLime", "KingBDogz",
    "shroud", "Pokimane", "Ninja", "Ludwig", "xQc", " Valkyrae", "DisguisedToast", "Sykkuno", "CorpseHusband",
    "KarlJacobs", "Quackity", "FoolishGamers", "Hannahxxrose", "Punz", "JackManifoldTV", "Niki", "Eret", "ConnorEatsPants"
];

if (!fs.existsSync(DATA_FILE)) {
    const joueursInitiaux = Array.from({ length: 1500 }, (_, i) => {
        // Sélectionne un vrai pseudo de la liste ou en génère un basé sur de vrais comptes
        const baseNom = deVraisPseudosMinecraft[i % deVraisPseudosMinecraft.length];
        const num = Math.floor(Math.random() * 900) + 100;
        const pseudoFinal = i < deVraisPseudosMinecraft.length ? baseNom : `${baseNom}_${num}`;
        
        return {
            pseudo: pseudoFinal,
            elo: Math.floor(Math.random() * (2000 - 800) + 800)
        };
    });
    fs.writeFileSync(DATA_FILE, JSON.stringify(joueursInitiaux, null, 2));
}

app.get('/api/leaderboard', (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        res.json(data.sort((a, b) => b.elo - a.elo));
    } catch (err) {
        res.status(500).json({ error: "Erreur de lecture" });
    }
});

app.post('/api/admin/update', (req, res) => {
    const { password, pseudo, newElo } = req.body;
    if (password !== ADMIN_PASSWORD) return res.status(403).json({ error: "Mot de passe incorrect" });
    try {
        let data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        const index = data.findIndex(j => j.pseudo.toLowerCase() === pseudo.toLowerCase());
        if (index !== -1) { data[index].elo = parseInt(newElo); }
        else { data.push({ pseudo, elo: parseInt(newElo) }); }
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
        res.json({ success: true, message: "Classement mis à jour !" });
    } catch (err) {
        res.status(500).json({ error: "Erreur d'écriture" });
    }
});

app.listen(PORT, () => console.log(`Serveur lancé sur http://localhost:${PORT}`));
