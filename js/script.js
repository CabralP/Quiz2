// =======================
// ELEMENTEN OPHALEN
// =======================
const startPage = document.getElementById("start-page");
const themePage = document.getElementById("theme-page");
const quizPage = document.getElementById("quiz-page");
const resultPage = document.getElementById("result-page");
const scorePage = document.getElementById("score-page");

const form = document.getElementById("start-form");
const spelerNaamEl = document.getElementById("speler-naam");
const teamNaamEls = document.querySelectorAll(".teamnaam");
const quizTeamNaam = document.getElementById("quiz-teamnaam");

const answersContainer = document.getElementById("answers");
const vraagTekst = document.getElementById("vraag-tekst");
const vraagAfbeelding = document.getElementById("vraag-afbeelding");
const timerEl = document.getElementById("timer");
const resultDetailsEl = document.getElementById("result-details");
const toScoreboardBtn = document.getElementById("to-scoreboard-btn");
const scoreboardEl = document.getElementById("scoreboard");
const restartBtn = document.getElementById("restart-btn");

// =======================
// VARIABELEN QUIZLOGICA
// =======================
let countdown;
const timePerQuestion = 15;
let quizData = {};
let currentTheme;
let currentQuestions = [];
let currentIndex = 0;
let score = 0;
let answersHistory = [];

// =======================
// QUIZ DATA LADEN VAN JSON
// =======================
fetch("questions.json")
    .then(response => response.json())
    .then(data => {
        quizData = data;
    })
    .catch(error => console.error("Fout bij laden van questions.json:", error));

// =======================
// HELPER FUNCTIE: SHUFFLE
// =======================
function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
}

// =======================
// STARTPAGINA -> THEMAPAGINA
// =======================
form.addEventListener("submit", e => {
    e.preventDefault();
    const name = document.getElementById("name").value || "Gast";
    localStorage.setItem("username", name);

    spelerNaamEl.textContent = name;
    teamNaamEls.forEach(el => el.textContent = name);
    quizTeamNaam.textContent = name;

    startPage.classList.remove("active");
    themePage.classList.add("active");
});

// =======================
// THEMA SELECTEREN -> QUIZ STARTEN
// =======================
document.querySelectorAll(".thema").forEach(block => {
    block.addEventListener("click", () => {
        currentTheme = block.dataset.theme;
        currentQuestions = shuffle([...quizData[currentTheme]]).slice(0, 10);
        currentIndex = 0;
        score = 0;
        answersHistory = [];

        themePage.classList.remove("active");
        quizPage.classList.add("active");
        showQuestion();
    });
});

// =======================
// TOON VRAAG + ANTWOORDEN
// =======================
function showQuestion() {
    const q = currentQuestions[currentIndex];
    vraagTekst.textContent = q.vraag;
    answersContainer.innerHTML = "";

    // ✅ Toon afbeelding via CSS, geen inline styles
    vraagAfbeelding.innerHTML = "";
    if (q.image) {
        const img = document.createElement("img");
        img.src = q.image;
        img.alt = "Afbeelding bij vraag";
        vraagAfbeelding.appendChild(img);
    } else {
        vraagAfbeelding.textContent = "[ Geen afbeelding beschikbaar ]";
    }

    shuffle([...q.antwoorden]).forEach(ans => {
        const btn = document.createElement("button");
        btn.textContent = ans;
        btn.addEventListener("click", () => handleAnswer(ans));
        answersContainer.appendChild(btn);
    });

    startTimer(timePerQuestion);
}

// =======================
// ANTWOORD VERWERKEN
// =======================
function handleAnswer(selected) {
    clearInterval(countdown);
    const correct = currentQuestions[currentIndex].correct;
    const correctFlag = selected === correct;

    if (correctFlag) score++;

    answersHistory.push({
        vraag: currentQuestions[currentIndex].vraag,
        gekozen: selected,
        correct: correct,
        correctFlag: correctFlag,
        afbeelding: currentQuestions[currentIndex].image || null
    });

    currentIndex++;
    if (currentIndex < currentQuestions.length) {
        showQuestion();
    } else {
        showResults();
    }
}

// =======================
// TIMER FUNCTIE
// =======================
function startTimer(seconds) {
    let timeLeft = seconds;
    timerEl.textContent = `Tijd: ${timeLeft}s`;

    countdown = setInterval(() => {
        timeLeft--;
        timerEl.textContent = `Tijd: ${timeLeft}s`;
        if (timeLeft < 0) {
            clearInterval(countdown);
            handleAnswer("");
        }
    }, 1000);
}

// =======================
// RESULTATEN TONEN (zonder afbeeldingen)
// =======================
function showResults() {
    quizPage.classList.remove("active");
    resultPage.classList.add("active");
    resultDetailsEl.innerHTML = "";

    answersHistory.forEach((a, i) => {
        const div = document.createElement("div");
        div.innerHTML = `
            <strong>Vraag ${i + 1}:</strong> ${a.vraag}<br>
            Jouw antwoord: ${a.gekozen || "Niet beantwoord"}<br>
            Correct antwoord: ${a.correct}<br>
            ${a.correctFlag ? "✔ Goed" : "✖ Fout"}
            <hr>
        `;
        resultDetailsEl.appendChild(div);
    });
}

// =======================
// SCOREBOARD
// =======================
toScoreboardBtn.addEventListener("click", () => {
    resultPage.classList.remove("active");
    scorePage.classList.add("active");

    let highscores = JSON.parse(localStorage.getItem("highscores") || "[]");

    highscores.push({
        name: localStorage.getItem("username"),
        score
    });

    highscores.sort((a, b) => b.score - a.score);
    localStorage.setItem("highscores", JSON.stringify(highscores));

    scoreboardEl.innerHTML = "<h3>Top 3 Scores:</h3>";
    highscores.slice(0, 3).forEach((s, index) => {
        const p = document.createElement("p");
        p.textContent = `${index + 1}. ${s.name}: ${s.score}`;
        scoreboardEl.appendChild(p);
    });
});

// =======================
// OPNIEUW STARTEN
// =======================
restartBtn.addEventListener("click", () => {
    scorePage.classList.remove("active");
    startPage.classList.add("active");
});
