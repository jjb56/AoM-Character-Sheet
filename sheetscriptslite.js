

// ========== Initialize Constants ==========
const abilityScoreMap = {
    str: "score-strength",
    dex: "score-dexterity",
    con: "score-constitution",
    int: "score-intelligence",
    wis: "score-wisdom",
    cha: "score-charisma",
    luc: "score-luck"
}

const saveMap = {
    strength: "save-total-strength",
    dexterity: "save-total-dexterity",
    constitution: "save-total-constitution",
    intelligence: "save-total-intelligence",
    wisdom: "save-total-wisdom",
    charisma: "save-total-charisma",
    luck: "save-total-luck"
};

const skillMap = {
    "acrobatics": "skill-total-acrobatics",
    "animal-handling": "skill-total-animal-handling",
    "artificing": "skill-total-artificing",
    "athletics": "skill-total-athletics",
    "insight": "skill-total-insight",
    "intimidation": "skill-total-intimidation",
    "perception": "skill-total-perception",
    "persuasion": "skill-total-persuasion",
    "stealth": "skill-total-stealth",
    "survival": "skill-total-survival",
    "theatrics": "skill-total-theatrics",
    "trickery": "skill-total-trickery",
    "anatomy": "skill-total-anatomy",
    "arcana": "skill-total-arcana",
    "history": "skill-total-history",
    "nature": "skill-total-nature",
    "religion": "skill-total-religion",
    "society": "skill-total-society",
    "defenses": "skill-total-defenses",
    "melee": "skill-total-melee",
    "ranged": "skill-total-ranged",
    "unarmed": "skill-total-unarmed",
    "alteration": "skill-total-alteration",
    "clarity": "skill-total-clarity",
    "energy": "skill-total-energy",
    "essence": "skill-total-essence",
    "illusion": "skill-total-illusion",
    "influence": "skill-total-influence",
    "protection": "skill-total-protection",
    "summoning": "skill-total-summoning"
};


const groups = {
    general: ["acrobatics", "animal-handling", "artificing", "athletics", "insight", "intimidation", "perception", "persuasion", "stealth", "survival", "theatrics", "trickery"],
    knowledge: ["anatomy", "arcana", "history", "nature", "religion", "society"],
    combat: ["defenses", "melee", "ranged", "unarmed"],
    magic: ["alteration", "clarity", "energy", "essence", "illusion", "influence", "protection", "summoning"],
    physical: ["strength", "dexterity", "constitution"],
    mental: ["intelligence", "wisdom", "charisma"]
};


// ========== Data Uptating Scripts ==========

// Equalize current mana fields
function syncManaFields(id1, id2) {
    const a = document.getElementById(id1);
    const b = document.getElementById(id2);

    a.addEventListener("input", () => b.value = a.value);
    b.addEventListener("input", () => a.value = b.value);
}
syncManaFields("mana-current-p1", "mana-current-p2");

// Update benchmark based on xp
function updateBenchmark() {
    const xp = parseInt(document.getElementById("xp-total").value) || 0;
    
    let benchmark = 4;
    if (xp < 200) benchmark = 1;
    else if (xp < 400) benchmark = 2;
    else if (xp < 800) benchmark = 3;

    document.getElementById("benchmark-p1").value = benchmark;
    document.getElementById("benchmark-p2").value = benchmark;
}
document.getElementById("xp-total").addEventListener("input", updateBenchmark);

// ========== Save and Load Data ==========

function saveData() {
    const data = {};
    const inputs = document.querySelectorAll("input, select, textarea");
    inputs.forEach((input) => {
        if (input.id) {
            if (input.type === "checkbox") {
                data[input.id] = input.checked;
            } else {
                data[input.id] = input.value;
            }
        }
    });

    const characterName = document.getElementById("character-name")?.value || "myCharacter";
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${characterName}.json`;
    a.click();
} 

function loadData() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.addEventListener("change", function () {
        const file = input.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function () {
            try {
                const data = JSON.parse(reader.result);
                Object.keys(data).forEach((id) => {
                    const el = document.getElementById(id);
                    if (el) {
                        if (el.type === "checkbox") {
                            el.checked = data[id];
                        } else {
                            el.value = data[id];
                        }
                    }
                });
            } catch (e) {
                alert("Failed to load file: Invalid JSON");
            }
        };
        reader.readAsText(file);
    });
    input.click();
}

// ========== Page Load ==========

window.addEventListener("DOMContentLoaded", () => {
    updateAll();
});