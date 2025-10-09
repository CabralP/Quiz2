// =======================
// ELEMENTEN OPHALEN
// =======================
const startPage = document.getElementById("start-page"); // Startpagina container
const themePage = document.getElementById("theme-page"); // Themaselectie container
const quizPage = document.getElementById("quiz-page");   // Quizpagina container
const resultPage = document.getElementById("result-page"); // Resultaten container
const scorePage = document.getElementById("score-page");  // Scoreboard container

const form = document.getElementById("start-form");       // Formulier startpagina
const spelerNaamEl = document.getElementById("speler-naam"); // Naam speler in tekst
const teamNaamEls = document.querySelectorAll(".teamnaam");  // Alle plekken waar teamnaam komt
const quizTeamNaam = document.getElementById("quiz-teamnaam"); // Teamnaam op quizpagina

const answersContainer = document.getElementById("answers"); // Container voor antwoordknoppen
const vraagTekst = document.getElementById("vraag-tekst");   // Vraagtekst
const vraagAfbeelding = document.getElementById("vraag-afbeelding"); // Plek voor afbeelding
const timerEl = document.getElementById("timer");            // Timertekst

const resultDetailsEl = document.getElementById("result-details"); // Resultaatdetails container
const toScoreboardBtn = document.getElementById("to-scoreboard-btn"); // Knop naar scoreboard

const scoreboardEl = document.getElementById("scoreboard"); // Scoreboard
const restartBtn = document.getElementById("restart-btn");  // Knop opnieuw starten

// =======================
// VARIABELEN QUIZLOGICA
// =======================
let countdown;                // Timer interval
const timePerQuestion = 15;   // Tijdslimiet per vraag in seconden

let quizData = {};             // Hier wordt de JSON data geladen
let currentTheme;              // Geselecteerde thema
let currentQuestions = [];     // Lijst met huidige vragen
let currentIndex = 0;          // Index van de huidige vraag
let score = 0;                 // Score van speler
let answersHistory = [];       // Antwoordgeschiedenis voor resultaten

// =======================
// QUIZ DATA LADEN VAN JSON
// =======================
fetch("questions.json")
  .then(response => response.json())
  .then(data => {
    quizData = data; // Zet JSON data in quizData variabele
  })
  .catch(error => console.error("Fout bij laden van questions.json:", error));

// =======================
// HELPER FUNCTIE: SHUFFLE
// =======================
function shuffle(array) {
  // Willekeurige volgorde voor array
  return array.sort(() => Math.random() - 0.5);
}

// =======================
// STARTPAGINA -> THEMAPAGINA
// =======================
form.addEventListener("submit", e => {
  e.preventDefault(); // Voorkom pagina-herladen
  const name = document.getElementById("name").value || "Gast"; // Naam ophalen
  localStorage.setItem("username", name); // Opslaan in localStorage

  // Toon naam op verschillende plekken
  spelerNaamEl.textContent = name;
  teamNaamEls.forEach(el => el.textContent = name);
  quizTeamNaam.textContent = name; // ✅ Zet teamnaam ook op quizpagina

  // Wissel pagina's
  startPage.classList.remove("active");
  themePage.classList.add("active");
});

// =======================
// THEMA SELECTEREN -> QUIZ STARTEN
// =======================
document.querySelectorAll(".thema").forEach(block => {
  block.addEventListener("click", () => {
    currentTheme = block.dataset.theme; // Geselecteerd thema
    currentQuestions = shuffle([...quizData[currentTheme]]).slice(0, 10); // 10 willekeurige vragen
    currentIndex = 0;
    score = 0;
    answersHistory = [];

    themePage.classList.remove("active");
    quizPage.classList.add("active");

    showQuestion(); // Eerste vraag tonen
  });
});

// =======================
// TOON VRAAG + ANTWOORDEN
// =======================
function showQuestion() {
  const q = currentQuestions[currentIndex]; // Huidige vraag
  vraagTekst.textContent = q.vraag;         // Zet vraagtekst
  answersContainer.innerHTML = "";          // Maak oude antwoorden leeg

  // ✅ Toon afbeelding als aanwezig
  if (q.afbeelding) {
    vraagAfbeelding.innerHTML = `<img src="${q.img}" alt="Afbeelding bij vraag" style="max-width:100%; border-radius:8px;">`;
  } else {
    vraagAfbeelding.textContent = "[ Geen afbeelding beschikbaar ]";
  }

  // Maak antwoordknoppen
  shuffle([...q.antwoorden]).forEach(ans => {
    const btn = document.createElement("button");
    btn.textContent = ans;
    btn.addEventListener("click", () => handleAnswer(ans)); // Klik = verwerken
    answersContainer.appendChild(btn);
  });

  startTimer(timePerQuestion); // Start timer
}

// =======================
// ANTWOORD VERWERKEN
// =======================
function handleAnswer(selected) {
  clearInterval(countdown); // Stop timer

  const correct = currentQuestions[currentIndex].correct; // Correcte antwoord
  let correctFlag = selected === correct;

  if (correctFlag) score++; // Score +1 als juist

  // Bewaar resultaat in geschiedenis
  answersHistory.push({
    vraag: currentQuestions[currentIndex].vraag,
    gekozen: selected,
    correct: correct,
    correctFlag: correctFlag,
    afbeelding: currentQuestions[currentIndex].afbeelding || null
  });

  currentIndex++; // Volgende vraag
  if (currentIndex < currentQuestions.length) {
    showQuestion();
  } else {
    showResults(); // Klaar
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
      handleAnswer(""); // Geen antwoord = fout
    }
  }, 1000);
}

// =======================
// RESULTATEN TONEN
// =======================
function showResults() {
  quizPage.classList.remove("active");
  resultPage.classList.add("active");
  resultDetailsEl.innerHTML = "";

  // Toon alle vragen en antwoorden
  answersHistory.forEach((a, i) => {
    const div = document.createElement("div");
    div.innerHTML = `
      <strong>Vraag ${i + 1}:</strong> ${a.vraag}<br>
      ${a.afbeelding ? `<img src="${a.afbeelding}" alt="afbeelding" style="max-width:200px; border-radius:6px;">` : ""}
      <br>Jouw antwoord: ${a.gekozen || "Niet beantwoord"}<br>
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

  // Nieuwe score toevoegen
  highscores.push({ name: localStorage.getItem("username"), score });

  // Sorteren en opslaan
  highscores.sort((a, b) => b.score - a.score);
  localStorage.setItem("highscores", JSON.stringify(highscores));

  // ✅ Top 3 tonen
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
