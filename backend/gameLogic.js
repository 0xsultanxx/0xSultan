// ملف gameLogic.js

// قائمة الحروف
const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

// متغيرات اللعبة
let selectedLetter = '';
let playerAnswers = [];
let scores = {};
let currentRound = 1;
const totalRounds = 5;
let gameTimer;
let players = [];

// توليد حرف عشوائي مع أنيميشن مبدئي
function generateRandomLetterWithAnimation(callback) {
    let animationInterval = setInterval(() => {
        document.getElementById('letterDisplay').innerText = letters[Math.floor(Math.random() * letters.length)];
    }, 100);

    setTimeout(() => {
        clearInterval(animationInterval);
        selectedLetter = letters[Math.floor(Math.random() * letters.length)];
        document.getElementById('letterDisplay').innerText = selectedLetter;
        if (callback) callback(selectedLetter);
    }, 5000); // مدة الأنيميشن 5 ثواني
}

// بدء تايمر الإجابة
function startAnswerTimer(duration, onEnd) {
    const timerDisplay = document.getElementById('timer');
    let timeLeft = duration;
    timerDisplay.innerText = timeLeft;

    gameTimer = setInterval(() => {
        timeLeft--;
        timerDisplay.innerText = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(gameTimer);
            if (onEnd) onEnd();
        }
    }, 1000);
}

// قفل الإجابات بعد انتهاء الوقت
function lockAnswerInputs() {
    const inputs = document.querySelectorAll('.answer-box');
    inputs.forEach(input => {
        input.disabled = true;
    });
}

// تسجيل الإجابات للمقدم
function collectPresenterAnswers() {
    playerAnswers = [];
    const inputs = document.querySelectorAll('.answer-box');
    inputs.forEach(input => {
        playerAnswers.push(input.value.trim());
    });
}

// تسجيل الإجابات لللاعبين
function collectPlayerAnswers(playerName) {
    const inputs = document.querySelectorAll('.answer-box');
    let answers = [];
    inputs.forEach(input => {
        answers.push(input.value.trim());
    });
    if (!scores[playerName]) {
        scores[playerName] = 0;
    }
    return answers;
}

// توزيع النقاط على اللاعبين
function distributePointsManually() {
    players.forEach(player => {
        let points = parseInt(prompt(`كم نقطة تعطي لـ ${player}؟`, "0"));
        if (!isNaN(points)) {
            scores[player] += points;
        }
    });
}

// عرض الليدر بورد
function displayLeaderboard() {
    const leaderboard = document.getElementById('leaderboard');
    leaderboard.innerHTML = '';

    let sortedPlayers = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    sortedPlayers.forEach(([name, score]) => {
        leaderboard.innerHTML += `<div class="player-score">${name}: ${score} نقطة</div>`;
    });
}

// بدء جولة جديدة
function startNewRound() {
    currentRound++;
    if (currentRound > totalRounds) {
        // نهاية اللعبة
        showFinalLeaderboard();
    } else {
        resetForNewRound();
    }
}

// إعادة تحضير الصفحة لجولة جديدة
function resetForNewRound() {
    document.getElementById('answersSection').innerHTML = '';
    document.getElementById('timer').innerText = '';
    document.getElementById('letterDisplay').innerText = '';
}

// عرض الفائز النهائي
function showFinalLeaderboard() {
    document.getElementById('gameScreen').style.display = 'none';
    document.getElementById('leaderboardScreen').style.display = 'flex';
    displayLeaderboard();
}
