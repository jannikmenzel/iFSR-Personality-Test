let questions = [];

document.addEventListener("DOMContentLoaded", function() {
    fetch("json/fragen.json")
        .then(response => {
            if (!response.ok) {
                throw new Error("Netzwerkantwort war nicht ok");
            }
            return response.json();
        })
        .then(data => {
            questions = data;
            renderQuestions(questions);
        })
        .catch(error => console.error("Fehler beim Laden der Fragen:", error));
});

// Render-Funktion
function renderQuestions(questions) {
    const container = document.getElementById("fragenContainer");

    questions.forEach(({ id, frage, optionen }) => {
        let card = document.createElement("div");
        card.className = "card question-card mb-3";

        let cardBody = document.createElement("div");
        cardBody.className = "card-body";

        let title = document.createElement("h4");
        title.className = "card-title";
        title.textContent = frage;

        cardBody.appendChild(title);

        optionen.forEach(({ wert, text }) => {
            let formCheck = document.createElement("div");
            formCheck.className = "form-check";

            let input = document.createElement("input");
            input.className = "form-check-input";
            input.type = "radio";
            input.name = id;
            input.value = wert;
            input.id = `${id}-${wert}`;

            let label = document.createElement("label");
            label.className = "form-check-label";
            label.htmlFor = input.id;
            label.textContent = text;

            formCheck.appendChild(input);
            formCheck.appendChild(label);
            cardBody.appendChild(formCheck);
        });

        card.appendChild(cardBody);
        container.appendChild(card);
    });
}

// Reset-Funktion
function resetForm() {
    document.querySelectorAll(".form-check-input").forEach(input => input.checked = false);
}

// Test auswerten
function evaluateTest() {
    let results = {};

    document.querySelectorAll(".form-check-input:checked").forEach(input => {
        const selectedOption = input.value;
        const questionId = input.name;

        const question = questions.find(q => q.id === questionId);
        const selectedOptionData = question["optionen"].find(opt => opt["wert"] === selectedOption);

        if (selectedOptionData && selectedOptionData["punkte"]) {
            Object.keys(selectedOptionData["punkte"]).forEach(subject => {
                if (!results[subject]) {
                    results[subject] = 0;
                }
                results[subject] += selectedOptionData["punkte"][subject];
            });
        }
    });

    const queryString = new URLSearchParams(results).toString();
    window.location.href = `ergebnisse.html?${queryString}`;
}

// Ergebnisse anzeigen
document.addEventListener("DOMContentLoaded", async function() {
    const params = new URLSearchParams(window.location.search);
    const results = {};

    params.forEach((value, key) => {
        results[key] = value;
    });

    await displayResults(results);
});

// Daten der Fächer laden
async function loadSubjectDetails() {
    const response = await fetch('json/info.json');
    return await response.json();
}

// Ergebnisse anzeigen
async function displayResults(results) {
    const solutionsElement = document.getElementById("solutions");

    if (Object.keys(results).length === 0) {
        solutionsElement.innerHTML = '<div class="no-results">Es wurden keine Antworten ausgewählt.</div>';
        return;
    }

    const sortedResults = Object.entries(results).sort((a, b) => b[1] - a[1]);

    const subjectDetails = await loadSubjectDetails();

    let resultText = "<ul>";
    for (const [subject, points] of sortedResults) {
        const subjectInfo = subjectDetails[subject];

        resultText += `
            <li>
                <button class="dropdown-btn">${subject}: ${points} Punkte</button>
                <div class="dropdown-content">
                    <p>${subjectInfo ? subjectInfo.info : 'Keine zusätzlichen Informationen.'}</p>
                    <p>${subjectInfo ? subjectInfo.details : 'Keine weiteren Details verfügbar.'}</p>
                </div>
            </li>
        `;
    }
    resultText += "</ul>";

    solutionsElement.innerHTML = resultText;

    // Dropdown-Funktionalität
    document.querySelectorAll(".dropdown-btn").forEach(button => {
        button.addEventListener("click", function () {
            const content = this.nextElementSibling;
            content.style.display = content.style.display === "block" ? "none" : "block";
        });
    });
}