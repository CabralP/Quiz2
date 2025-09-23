// ELEMENTEN
const startPage = document.getElementById("start-page");
const themePage = document.getElementById("theme-page");
const quizPage = document.getElementById("quiz-page");
const resultPage = document.getElementById("result-page");
const scorePage = document.getElementById("score-page");

const form = document.getElementById("start-form");
const spelerNaamEl = document.getElementById("speler-naam");
const teamNaamEls = document.querySelectorAll(".teamnaam");

const answersContainer = document.getElementById("answers");
const vraagTekst = document.getElementById("vraag-tekst");
const timerEl = document.getElementById("timer");

const resultDetailsEl = document.getElementById("result-details");
const toScoreboardBtn = document.getElementById("to-scoreboard-btn");

const scoreboardEl = document.getElementById("scoreboard");
const restartBtn = document.getElementById("restart-btn");

let countdown;
const timePerQuestion = 15;

// QUIZ DATA
const quizData = {
  1: [
    {vraag:"Wat is 2+2?", antwoorden:["4","3","5","6"], correct:"4"},
    {vraag:"Welke kleur heeft de lucht?", antwoorden:["Blauw","Groen","Rood","Geel"], correct:"Blauw"}
  ],
  2: [
    {vraag:"Wat is de hoofdstad van Frankrijk?", antwoorden:["Parijs","Rome","Berlijn","Madrid"], correct:"Parijs"},
    {vraag:"Wat is 10-3?", antwoorden:["7","8","6","5"], correct:"7"}
  ],
  3: [
    {vraag:"Welke planeet staat bekend als rode planeet?", antwoorden:["Mars","Venus","Aarde","Jupiter"], correct:"Mars"},
    {vraag:"Hoeveel ogen heeft een spin?", antwoorden:["8","6","4","2"], correct:"8"}
  ]
};

let currentTheme;
let currentQuestions = [];
let currentIndex = 0;
let score = 0;
let answersHistory = [];

// HELPERS
function shuffle(array){ return array.sort(()=> Math.random()-0.5); }

// START -> THEMA
form.addEventListener("submit", e=>{
  e.preventDefault();
  const name = document.getElementById("name").value || "Gast";
  localStorage.setItem("username", name);
  spelerNaamEl.textContent = name;
  teamNaamEls.forEach(el => el.textContent = name);
  startPage.classList.remove("active");
  themePage.classList.add("active");
});

// THEMA -> QUIZ
document.querySelectorAll(".thema").forEach(block=>{
  block.addEventListener("click", ()=>{
    currentTheme = block.dataset.theme;
    let questions = [...quizData[currentTheme]];
    while(questions.length < 10){
      questions = questions.concat([...quizData[currentTheme]]);
    }
    currentQuestions = shuffle(questions).slice(0,10);
    currentIndex = 0;
    score = 0;
    answersHistory = [];
    themePage.classList.remove("active");
    quizPage.classList.add("active");
    showQuestion();
  });
});

// TOON VRAAG
function showQuestion(){
  const q = currentQuestions[currentIndex];
  vraagTekst.textContent = q.vraag;
  answersContainer.innerHTML="";
  shuffle([...q.antwoorden]).forEach(ans=>{
    const btn = document.createElement("button");
    btn.textContent = ans;
    btn.addEventListener("click", ()=> handleAnswer(ans));
    answersContainer.appendChild(btn);
  });
  startTimer(timePerQuestion);
}

// ANTWOORD VERWERKEN EN DIRECT VOLGENDE VRAAG
function handleAnswer(selected){
  clearInterval(countdown);
  const correct = currentQuestions[currentIndex].correct;
  let correctFlag = selected === correct;
  if(correctFlag) score++;

  answersHistory.push({
    vraag: currentQuestions[currentIndex].vraag,
    gekozen: selected,
    correct: correct,
    correctFlag: correctFlag
  });

  currentIndex++;
  if(currentIndex < currentQuestions.length){
    showQuestion();
  } else {
    showResults();
  }
}

// TIMER
function startTimer(seconds){
  let timeLeft = seconds;
  timerEl.textContent = `Tijd: ${timeLeft}s`;
  countdown = setInterval(()=>{
    timeLeft--;
    timerEl.textContent = `Tijd: ${timeLeft}s`;
    if(timeLeft < 0){
      clearInterval(countdown);
      handleAnswer(""); // leeg antwoord = fout
    }
  }, 1000);
}

// RESULTATEN TONEN
function showResults(){
  quizPage.classList.remove("active");
  resultPage.classList.add("active");
  resultDetailsEl.innerHTML = "";
  answersHistory.forEach((a,i)=>{
    const div = document.createElement("div");
    div.innerHTML = `<strong>Vraag ${i+1}:</strong> ${a.vraag}<br>
      Jouw antwoord: ${a.gekozen || "niet beantwoord"}<br>
      Correct antwoord: ${a.correct} <br>
      ${a.correctFlag ? "✔ Goed" : "✖ Fout"}<hr>`;
    resultDetailsEl.appendChild(div);
  });
}

// RESULTATEN -> SCOREBOARD
toScoreboardBtn.addEventListener("click", ()=>{
  resultPage.classList.remove("active");
  scorePage.classList.add("active");

  // Oude scores ophalen
  let highscores = JSON.parse(localStorage.getItem("highscores") || "[]");

  // Nieuwe score toevoegen
  highscores.push({ name: localStorage.getItem("username"), score });

  // Scores sorteren (hoogste eerst)
  highscores.sort((a, b) => b.score - a.score);

  // Opslaan in localStorage
  localStorage.setItem("highscores", JSON.stringify(highscores));

  // Scoreboard opbouwen (top 3)
  scoreboardEl.innerHTML = "<h3>Top 3 Scores:</h3>";
  highscores.slice(0, 3).forEach((s, index) => {
    const p = document.createElement("p");
    p.textContent = `${index + 1}. ${s.name}: ${s.score}`;
    scoreboardEl.appendChild(p);
  });
  // OPNIEUW STARTEN
restartBtn.addEventListener("click", ()=>{
  scorePage.classList.remove("active");
  startPage.classList.add("active");
});
});
