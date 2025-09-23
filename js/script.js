// =======================
// ELEMENTEN OPHALEN
// =======================
const startPage = document.getElementById("start-page"); // Startpagina container
const themePage = document.getElementById("theme-page"); // Themaselectie container
const quizPage = document.getElementById("quiz-page");   // Quizpagina container
const resultPage = document.getElementById("result-page"); // Resultaten container
const scorePage = document.getElementById("score-page");  // Scoreboard container

const form = document.getElementById("start-form");       // Formulier startpagina
const spelerNaamEl = document.getElementById("speler-naam"); // Element waar spelernaam wordt getoond
const teamNaamEls = document.querySelectorAll(".teamnaam");  // Alle elementen met teamnaam

const answersContainer = document.getElementById("answers"); // Container voor antwoord-buttons
const vraagTekst = document.getElementById("vraag-tekst");   // Element voor vraagtekst
const timerEl = document.getElementById("timer");            // Element voor timer

const resultDetailsEl = document.getElementById("result-details"); // Container resultaten
const toScoreboardBtn = document.getElementById("to-scoreboard-btn"); // Knop naar scoreboard

const scoreboardEl = document.getElementById("scoreboard"); // Scoreboard container
const restartBtn = document.getElementById("restart-btn");  // Knop opnieuw starten

// =======================
// VARIABELEN QUIZLOGICA
// =======================
let countdown;                // Timer interval
const timePerQuestion = 15;   // Tijdslimiet per vraag (seconden)

let quizData = {};             // Hier komt JSON-data in
let currentTheme;              // Huidig gekozen thema
let currentQuestions = [];     // Huidige set van 10 vragen
let currentIndex = 0;          // Huidige vraagindex
let score = 0;                 // Score van de speler
let answersHistory = [];       // Historie van antwoorden (voor resultaten)

// =======================
// QUIZ DATA LADEN VAN JSON
// =======================
fetch("questions.json")
  .then(response => response.json())
  .then(data => {
    quizData = data; // JSON-data in quizData
  })
  .catch(error => console.error("Fout bij laden van questions.json:", error));

// =======================
// HELPER FUNCTIE
// =======================
function shuffle(array){ 
  // Husselt een array willekeurig
  return array.sort(()=> Math.random()-0.5); 
}

// =======================
// STARTPAGINA -> THEMAPAGINA
// =======================
form.addEventListener("submit", e=>{
  e.preventDefault(); // Voorkomt herladen van pagina
  const name = document.getElementById("name").value || "Gast"; // Haal naam op
  localStorage.setItem("username", name); // Sla naam op in localStorage
  spelerNaamEl.textContent = name; // Toon naam in intro
  teamNaamEls.forEach(el => el.textContent = name); // Update alle teamnaam velden
  startPage.classList.remove("active"); // Verberg startpagina
  themePage.classList.add("active");    // Toon themapagina
});

// =======================
// THEMA SELECTEREN -> QUIZ STARTEN
// =======================
document.querySelectorAll(".thema").forEach(block=>{
  block.addEventListener("click", ()=>{
    currentTheme = block.dataset.theme; // Kies thema
    // Kies 10 willekeurige vragen uit het thema
    currentQuestions = shuffle([...quizData[currentTheme]]).slice(0,10);
    currentIndex = 0;  // Reset vraagindex
    score = 0;         // Reset score
    answersHistory = []; // Reset antwoordgeschiedenis
    themePage.classList.remove("active"); // Verberg themapagina
    quizPage.classList.add("active");     // Toon quizpagina
    showQuestion();                       // Start quiz met eerste vraag
  });
});

// =======================
// TOON VRAAG EN ANTWOORDEN
// =======================
function showQuestion(){
  const q = currentQuestions[currentIndex]; // Huidige vraag
  vraagTekst.textContent = q.vraag;         // Zet vraagtekst
  answersContainer.innerHTML = "";          // Maak oude antwoorden leeg

  // Maak buttons voor elk antwoord
  shuffle([...q.antwoorden]).forEach(ans=>{
    const btn = document.createElement("button");
    btn.textContent = ans;
    btn.addEventListener("click", ()=> handleAnswer(ans)); // Klik = antwoord verwerken
    answersContainer.appendChild(btn);
  });

  startTimer(timePerQuestion); // Start de timer voor deze vraag
}

// =======================
// ANTWOORD VERWERKEN EN VOLGENDE VRAAG
// =======================
function handleAnswer(selected){
  clearInterval(countdown); // Stop timer
  const correct = currentQuestions[currentIndex].correct; // Correct antwoord
  let correctFlag = selected === correct; // Check of goed
  if(correctFlag) score++; // Score verhogen als correct

  // Sla antwoord op in historie
  answersHistory.push({
    vraag: currentQuestions[currentIndex].vraag,
    gekozen: selected,
    correct: correct,
    correctFlag: correctFlag
  });

  currentIndex++; // Volgende vraag
  if(currentIndex < currentQuestions.length){
    showQuestion(); // Toon volgende vraag
  } else {
    showResults();  // Toon resultaten als klaar
  }
}

// =======================
// TIMER PER VRAAG
// =======================
function startTimer(seconds){
  let timeLeft = seconds;
  timerEl.textContent = `Tijd: ${timeLeft}s`;

  countdown = setInterval(()=>{
    timeLeft--;
    timerEl.textContent = `Tijd: ${timeLeft}s`;

    if(timeLeft < 0){
      clearInterval(countdown);   // Stop timer
      handleAnswer("");           // Leeg antwoord = fout
    }
  }, 1000);
}

// =======================
// RESULTATEN TONEN
// =======================
function showResults(){
  quizPage.classList.remove("active");  // Verberg quizpagina
  resultPage.classList.add("active");    // Toon resultatenpagina
  resultDetailsEl.innerHTML = "";        // Maak oude resultaten leeg

  // Loop door alle antwoorden
  answersHistory.forEach((a,i)=>{
    const div = document.createElement("div");
    div.innerHTML = `<strong>Vraag ${i+1}:</strong> ${a.vraag}<br>
      Jouw antwoord: ${a.gekozen || "niet beantwoord"}<br>
      Correct antwoord: ${a.correct} <br>
      ${a.correctFlag ? "✔ Goed" : "✖ Fout"}<hr>`;
    resultDetailsEl.appendChild(div);
  });
}

// =======================
// SCOREBOARD
// =======================
toScoreboardBtn.addEventListener("click", ()=>{
  resultPage.classList.remove("active"); // Verberg resultatenpagina
  scorePage.classList.add("active");     // Toon scoreboard

  // Haal bestaande highscores op
  let highscores = JSON.parse(localStorage.getItem("highscores")||"[]");

  // Voeg nieuwe score toe
  highscores.push({ name: localStorage.getItem("username"), score });
  highscores.sort((a,b)=>b.score-a.score); // Sorteer van hoog naar laag
  localStorage.setItem("highscores", JSON.stringify(highscores)); // Opslaan

  // Toon top 3 scores
  scoreboardEl.innerHTML = "<h3>Top 3 Scores:</h3>";
  highscores.slice(0,3).forEach((s,index)=>{
    const p = document.createElement("p");
    p.textContent = `${index+1}. ${s.name}: ${s.score}`;
    scoreboardEl.appendChild(p);
  });
});

// =======================
// OPNIEUW STARTEN
// =======================
restartBtn.addEventListener("click", ()=>{
  scorePage.classList.remove("active"); // Verberg scoreboard
  startPage.classList.add("active");    // Toon startpagina
});
