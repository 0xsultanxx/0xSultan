let socket; // ما نتصل بالسيرفر مباشرة – نخليه يتصل بعد اختيار الدور

// عناصر التحكم
const lobbyScreen = document.getElementById('lobby');
const gameScreen = document.getElementById('gameScreen');
const leaderboardScreen = document.getElementById('leaderboardScreen');

const presenterControls = document.getElementById('presenterControls');
const playerView = document.getElementById('playerView');

const letterDisplay = document.getElementById('letterDisplay');
const timerDisplay = document.getElementById('timer');
const answersSection = document.getElementById('answersSection');
const leaderboard = document.getElementById('leaderboard');

const startRoundBtn = document.getElementById('startRoundBtn');
const submitAnswersBtn = document.getElementById('submitAnswersBtn');
const nextRoundBtn = document.getElementById('nextRoundBtn');

let isPresenter = false;
let playerName = '';
let scores = {};
let players = [];
let selectedLetter = '';
let round = 1;
const totalRounds = 5;
let timerInterval;

// اختيار الدور
function chooseRole(role) {
    socket = io(); // هنا فقط يتصل بالسيرفر

    if (role === 'presenter') {
        isPresenter = true;
    } else {
        playerName = prompt('اكتب اسمك:');
        players.push(playerName);
        scores[playerName] = 0;
    }

    lobbyScreen.style.display = 'none';
    gameScreen.style.display = 'flex';

    if (isPresenter) {
        presenterControls.style.display = 'block';
    } else {
        playerView.style.display = 'block';
    }

    // ربط استقبال الحروف بعد الاتصال
    setupSocketEvents();
}

// ضبط الأحداث الخاصة بالـ socket بعد الاتصال
function setupSocketEvents() {
    socket.on('receiveLetter', (letter) => {
        selectedLetter = letter;
        letterDisplay.innerText = selectedLetter;

        setTimeout(() => {
            answersSection.innerHTML = `
                <input type="text" class="answer-box" placeholder="كلمة 1">
                <input type="text" class="answer-box" placeholder="كلمة 2">
                <input type="text" class="answer-box" placeholder="كلمة 3">
            `;
            startTimer();
        }, 2000);
    });
}

// توليد حرف عشوائي
function randomLetter() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return letters[Math.floor(Math.random() * letters.length)];
}

// بدء الجولة
function startRound() {
    answersSection.innerHTML = '';
    timerDisplay.innerText = '';
    letterDisplay.innerText = '?';

    submitAnswersBtn.style.display = 'none';
    nextRoundBtn.style.display = 'none';

    if (isPresenter) {
        animateLetters(() => {
            selectedLetter = randomLetter();
            letterDisplay.innerText = selectedLetter;

            answersSection.innerHTML = `
                <input type="text" class="answer-box" placeholder="كلمة 1">
                <input type="text" class="answer-box" placeholder="كلمة 2">
                <input type="text" class="answer-box" placeholder="كلمة 3">
            `;

            submitAnswersBtn.style.display = 'inline-block';
        });
    }
}

// أنيميشن الحروف العشوائية
function animateLetters(callback) {
    let interval = setInterval(() => {
        letterDisplay.innerText = randomLetter();
    }, 100);

    setTimeout(() => {
        clearInterval(interval);
        if (callback) callback();
    }, 5000);
}

// تأكيد الإجابات من المقدم
function submitAnswers() {
    submitAnswersBtn.style.display = 'none';

    // إرسال الحرف لكل اللاعبين عبر Socket
    socket.emit('sendLetter', selectedLetter);

    nextRoundBtn.style.display = 'inline-block';
}

// بدء التايمر
function startTimer() {
    let timeLeft = 15;
    timerDisplay.innerText = timeLeft;

    timerInterval = setInterval(() => {
        timeLeft--;
        timerDisplay.innerText = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            lockAnswers();
        }
    }, 1000);
}

// قفل مربعات الإجابة
function lockAnswers() {
    document.querySelectorAll('.answer-box').forEach(input => input.disabled = true);
}

// توزيع النقاط
function distributePoints() {
    players.forEach(player => {
        let points = parseInt(prompt(`كم نقطة تعطي لـ ${player}؟`, "0"));
        if (!isNaN(points)) {
            scores[player] += points;
        }
    });

    round++;
    if (round > totalRounds) {
        endGame();
    } else {
        startRound();
    }
}

// إنهاء اللعبة
function endGame() {
    gameScreen.style.display = 'none';
    leaderboardScreen.style.display = 'flex';
    leaderboard.innerHTML = '';

    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    sorted.forEach(([player, score]) => {
        leaderboard.innerHTML += `<div class="player-score">${player}: ${score} نقطة</div>`;
    });
}

// تبديل الوضع (دارك / لايت)
function toggleMode() {
    document.body.classList.toggle('light-mode');
}

// ربط الأزرار
startRoundBtn.addEventListener('click', startRound);
submitAnswersBtn.addEventListener('click', submitAnswers);
nextRoundBtn.addEventListener('click', distributePoints);
