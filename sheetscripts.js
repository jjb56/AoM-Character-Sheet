

// ========== Initialize Constants ==========
const saveMap = { //saving throws
    "strengthsavingthrow": "save-total-strength",
    "dexteritysavingthrow": "save-total-dexterity",
    "constitutionsavingthrow": "save-total-constitution",
    "intelligencesavingthrow": "save-total-intelligence",
    "wisdomsavingthrow": "save-total-wisdom",
    "charismasavingthrow": "save-total-charisma",
    "lucksavingthrow": "save-total-luck"
};
const skillMap = { //skills
    "acrobatics": "skill-total-acrobatics",
    "animalhandling": "skill-total-animal-handling",
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
const skillSaveMap = {
    ...skillMap, ...saveMap
};
const passiveMap = { //basics
    "armorclass": "armor-class",
    "damagereduction": "reduction",
    "initiative": "initiative",
    "speed": "speed",
    "deathsavingthrows": "death-saves-container",
    "passiveperception": "perception-passive",
    "fatedice": "fate-dice-total",
    "spellspreparable": "spells-preparable"
};
const groups = {
    general: ["acrobatics", "animalhandling", "artificing", "athletics", "insight", "intimidation", "perception", "persuasion", "stealth", "survival", "theatrics", "trickery"],
    knowledge: ["anatomy", "arcana", "history", "nature", "religion", "society"],
    combat: ["defenses", "melee", "ranged", "unarmed"],
    magic: ["alteration", "clarity", "energy", "essence", "illusion", "influence", "protection", "summoning"],
    physical: ["strengthsavingthrow", "dexteritysavingthrow", "constitutionsavingthrow"],
    mental: ["intelligencesavingthrow", "wisdomsavingthrow", "charismasavingthrow"]
};
const scoreMap = {
    str: "score-strength",
    dex: "score-dexterity",
    con: "score-constitution",
    int: "score-intelligence",
    wis: "score-wisdom",
    cha: "score-charisma",
    luc: "score-luck"
};


// ========== Parsing Scripts ==========

function getFeatTextAreas() {
    return Array.from(document.querySelectorAll("textarea[id^='feat-']"));
}

function parseFeatBonuses() {
    const text = getFeatTextAreas()
        .map(el => el.value.toLowerCase())
        .join("\n");

    const regex = /([+-]\d+)\s+(\w+)/g;
    const results = [];

    let match;
    while ((match = regex.exec(text)) !== null) {
        const bonus = parseInt(match[1]);
        const target = match[2];
        results.push({ bonus, target });
    }

    return results;
}

// ========== Data Uptating Scripts ==========

// Update all
function updateAll() {
    calculateBenchmark();
    syncManaFields("mana-current-p1", "mana-current-p2");
    calculateSkillsAndSaves();
    applyFeatSkillAndSaveBonuses();
    calculatePassiveValues();
    applyFeatPassiveValueBonuses();
    updateDeathSaves();
}
document.querySelectorAll("input, select, textarea").forEach(el => {
    el.addEventListener("input", updateAll);
});

// Calculate benchmark
function calculateBenchmark() {
    const xp = parseInt(document.getElementById("xp-total").value) || 0;
    
    let benchmark = 4;
    if (xp < 200) benchmark = 1;
    else if (xp < 400) benchmark = 2;
    else if (xp < 800) benchmark = 3;

    document.getElementById("benchmark-p1").value = benchmark;
    document.getElementById("benchmark-p2").value = benchmark;
}

// Sync mana fields
function syncManaFields(id1, id2) {
    const a = document.getElementById(id1);
    const b = document.getElementById(id2);

    a.addEventListener("input", () => b.value = a.value);
    b.addEventListener("input", () => a.value = b.value);
}

// Calculate skills and saves
function calculateSkillsAndSaves() {
    const benchmark = parseInt(document.getElementById("benchmark-p1")?.value || 0);

    for (const [key, id] of Object.entries(skillMap)) {
        const suffix = id.replace("skill-total-", ""); // e.g., animal-handling

        const ranks = parseInt(document.getElementById(`skill-rank-${suffix}`)?.value || 0);
        const abilityKey = document.getElementById(`skill-ability-${suffix}`)?.value?.toLowerCase();
        const abilityScore = abilityKey ? parseInt(document.getElementById(scoreMap[abilityKey])?.value || 0) : 0;

        const total = ranks + abilityScore;

        const el = document.getElementById(id); // full ID already in skillMap
        if (el) {
            el.dataset.base = total;
            el.value = total;
        }
    }

    for (const [key, id] of Object.entries(saveMap)) {
        const suffix = id.replace("save-total-", "");

        const score = parseInt(document.getElementById(`score-${suffix}`)?.value || 0);
        const isFocused = document.getElementById(`save-focus-${suffix}`)?.checked;
        const total = score + (isFocused ? benchmark : 0);

        const el = document.getElementById(id);
        if (el) {
            el.dataset.base = total;
            el.value = total;
        }
    }
}

// Feat skill and save bonuses
function applyFeatSkillAndSaveBonuses() {
    const bonuses = parseFeatBonuses();

    // Reset all skill/save fields to their base values
    for (const id of Object.values(skillSaveMap)) {
        const el = document.getElementById(id);
        if (el && el.dataset.base) {
            el.value = parseInt(el.dataset.base);
        }
    }

    bonuses.forEach(({ bonus, target }) => {
        // If the target is a group name, apply to all in that group
        if (groups[target]) {
            groups[target].forEach(alias => {
                const id = skillSaveMap[alias];
                if (!id) return; // no element for this alias
                const el = document.getElementById(id);
                if (el) el.value = parseInt(el.value) + bonus;
            });
        } else {
            // Single target: check skillSaveMap for element id
            const id = skillSaveMap[target];
            if (!id) return;
            const el = document.getElementById(id);
            if (el) el.value = parseInt(el.value) + bonus;
        }
    });
}

// Calculate passive values
function calculatePassiveValues() {
    const getInt = id => parseInt(document.getElementById(id)?.value || 0);

    // Armor class = 7 + defenses skill
    const defenses = getInt(skillMap["defenses"]);
    document.getElementById(passiveMap["armorclass"]).value = 7 + defenses;

    // Passive perception = 7 + perception skill
    const perception = getInt(skillMap["perception"]);
    document.getElementById(passiveMap["passiveperception"]).value = 7 + perception;

    // Fate dice = luck score
    const luck = getInt("score-luck");
    document.getElementById(passiveMap["fatedice"]).value = luck;

    // Initiative = dexterity score
    const dex = getInt("score-dexterity");
    document.getElementById(passiveMap["initiative"]).value = dex;

    // Speed stays unchanged (unless modified elsewhere)

    // Spell saves and attack = 7 + magic skill
    groups.magic.forEach(school => {
        const skillId = skillMap[school];
        const val = getInt(skillId);
        document.getElementById(`atk-${school}`).value = val;
        document.getElementById(`save-${school}`).value = 7 + val;
    });
}

// Feat passive value bonusees
function applyFeatPassiveValueBonuses() {
    // Reset passive value fields to base
    for (const id of Object.values(passiveMap)) {
        const el = document.getElementById(id);
        if (el && el.dataset.base) {
            el.value = parseInt(el.dataset.base);
        }
    }

    const bonuses = parseFeatBonuses();

    bonuses.forEach(({ bonus, target }) => {
        const id = passiveMap[target];
        if (!id) return;
        const el = document.getElementById(id);
        if (el) el.value = parseInt(el.value) + bonus;
    });
}

// Death Saves
function updateDeathSaves() {
    const con = parseInt(document.getElementById("score-constitution")?.value || 0);
    const base = Math.max(0, 2 + con); // never below 0

    const container = document.getElementById(passiveMap["deathsavingthrows"]);
    if (!container) return;

    container.innerHTML = ""; // Clear old boxes

    for (let i = 0; i < base; i++) {
        const label = document.createElement("label");
        const box = document.createElement("input");
        box.type = "checkbox";
        box.id = `death-save-${i}`;
        label.appendChild(box);
        container.appendChild(label);
    }
}

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

