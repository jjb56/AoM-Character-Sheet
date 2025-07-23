

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

// ========== Parsing Scripts ==========

function getFeatTextAreas() {
    return Array.from(document.querySelectorAll("textarea[id^='feat-']"));
}

// Attatch to input event
getFeatTextAreas().forEach(box => {
    box.addEventListener("input", applyFeatSkillAndSaveBonuses);
});

function applyFeatSkillAndSaveBonuses() {
    const text = getFeatTextAreas()
        .map(el => el.value.toLowerCase())
        .join("\n");

    //reset everything to base
    const allInputs = { ...skillMap, ...saveMap };
    for (let key in allInputs) {
        const input = document.getElementById(allInputs[key]);
        if (input) {
            if (!input.dataset.base) input.dataset.base = input.value;
            input.value = parseInt(input.dataset.base);
        }
    }

    //match patterns like +1 stealth or -2 mental
    const regex = /([+-]\d+)\s+(\w+)/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
        const bonus = parseInt(match[1]);
        const target = match[2];

        if (groups[target]) {
            // Apply to group
            groups[target].forEach(ref => {
                const id = skillMap[ref] || saveMap[ref] || ref;
                const input = document.getElementById(id);
                if (input) input.value = parseInt(input.value) + bonus;
            });
        } else if (skillMap[target]) {
            // Apply to skill
            const input = document.getElementById(skillMap[target]);
            if (input) input.value = parseInt(input.value) + bonus;
        } else if (saveMap[target]) {
            // Apply to save
            const input = document.getElementById(saveMap[target]);
            if (input) input.value = parseInt(input.value) + bonus;
        }
    }
}


// ========== Data Uptating Scripts ==========

// Update all
function updateAll() {
    updateBenchmark();
    updateSkillsAndSaves();
    applyFeatSkillAndSaveBonuses();
    updatePassiveValues();
    updateDeathSaves();
    //updateFeatPassiveBonuses
    syncManaFields("mana-current-p1", "mana-current-p2");
}
document.querySelectorAll("input, select, textarea").forEach(el => {
    el.addEventListener("input", updateAll);
});

// Skills and saves
function updateSkillsAndSaves() {
    const benchmark = parseInt(document.getElementById("benchmark-p1").value) || 0;

    for (const [ability, saveId] of Object.entries(saveMap)) {
        const abilityScore = parseInt(document.getElementById(`score-${ability}`)?.value || 0);
        const isFocused = document.getElementById(`save-focus-${ability}`)?.checked; // You must have checkboxes with these IDs
        const baseValue = abilityScore + (isFocused ? benchmark : 0);

        const input = document.getElementById(saveId);
        if (input) {
            input.dataset.base = baseValue;
            input.value = baseValue;
        }
    }

    for (const [skill, skillId] of Object.entries(skillMap)) {
        const ranks = parseInt(document.getElementById(`skill-rank-${skill}`)?.value || 0);
        
        const select = document.getElementById(`skill-ability-${skill}`);
        let abilityScore = 0;

        if (select) {
            const selected = select.value.toLowerCase(); // e.g., "int"
            const abilityId = abilityScoreMap[selected];
            if (abilityId) {
                abilityScore = parseInt(document.getElementById(abilityId)?.value || 0);
            }
        }

        const base = ranks + abilityScore;
        const input = document.getElementById(skillId);
        if (input) {
            input.dataset.base = base;
            input.value = base;
        }
    }
}

// Passive values
function updatePassiveValues() {
    const getInt = id => parseInt(document.getElementById(id)?.value || 0);

    const perception = getInt("skill-total-perception");
    document.getElementById("perception-passive").value = 7 + perception;

    const defenses = getInt("skill-total-defenses");
    document.getElementById("armor-class").value = 7 + defenses;

    const luck = getInt("score-luck");
    document.getElementById("fate-dice-total").value = luck;

    const magicSkills = groups.magic;
    magicSkills.forEach(school => {
        const val = getInt(`skill-total-${school}`);
        document.getElementById(`atk-${school}`).value = val;
        document.getElementById(`save-${school}`).value = 7 + val;
    });
}

// Death Saves
function updateDeathSaves() {
    const con = parseInt(document.getElementById("score-constitution")?.value || 0);
    const base = Math.max(0, 2 + con); // Ensure non-negative

    const container = document.getElementById("death-saves-container");
    container.innerHTML = ""; // Clear existing

    for (let i = 0; i < base; i++) {
        const wrapper = document.createElement("label");

        const box = document.createElement("input");
        box.type = "checkbox";
        box.id = `death-save-${i}`;

        wrapper.appendChild(box);
        container.appendChild(wrapper);
    }
}


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