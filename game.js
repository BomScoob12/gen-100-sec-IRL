// Initialize Icons
lucide.createIcons();

// Game Data
const INITIAL_BALANCE = 30000;
const TIME_PER_LEVEL = 10;

const levels = [
  {
    title: "รางวัลชีวิต",
    desc: "เงินเดือนออกแล้ว! ให้รางวัลตัวเองหน่อยไหมหลังจากทำงานหนักมาทั้งเดือน?",
    choiceA: {
      text: "ซื้อ Gadget ใหม่",
      cost: -8000,
      imgUrl: "images/gadget.jpg",
    },
    choiceB: { text: "เก็บออมไว้ก่อน", cost: 500, imgUrl: "images/saving.jpg" },
  },
  {
    title: "สังคมเพื่อนฝูง",
    desc: "เพื่อนชวนไปปาร์ตี้ทริปใหญ่สัปดาห์นี้ ปฏิเสธยากซะด้วย",
    choiceA: {
      text: "ทริปใหญ่จัดเต็ม",
      cost: -7000,
      imgUrl: "images/trip.jpg",
    },
    choiceB: {
      text: "กินข้าวเย็นง่ายๆ พอ",
      cost: -1500,
      imgUrl: "images/mama.jpg",
    },
  },
  {
    title: "การลงทุน",
    desc: "มีกระแสการลงทุนมาแรง เพื่อนแห่ลงกันหมด บอกว่ารวยเร็ว",
    choiceA: {
      text: "เสี่ยงสูงตามเพื่อน",
      cost: -10000,
      imgUrl: "images/high-risk.jpg",
    },
    choiceB: {
      text: "กระจายความเสี่ยง",
      cost: -2000,
      imgUrl: "images/low-risk.jpg",
    },
  },
  {
    title: "ความสะดวกสบาย",
    desc: "การเดินทางไปทำงานทุกวันเริ่มเหนื่อย อยากได้ความสบายขึ้น",
    choiceA: {
      text: "ดาวน์รถ/ซื้อของหรู",
      cost: -6000,
      imgUrl: "images/sport-car.jpg",
    },
    choiceB: {
      text: "ใช้ขนส่งสาธารณะ",
      cost: -1000,
      imgUrl: "images/public-transport.jpg",
    },
  },
  {
    title: "ความมั่นคง",
    desc: "เห็นข่าวคนป่วยบ่อยๆ ช่วงนี้ ควรเตรียมพร้อมไหม?",
    choiceA: { text: "ไม่ทำประกัน", cost: 0, imgUrl: "images/im-good.jpg" },
    choiceB: {
      text: "ทำประกันสุขภาพ",
      cost: -4000,
      imgUrl: "images/health-insurance.jpg",
    },
  },
];

// State
let balance = INITIAL_BALANCE;
let currentLevelIndex = 0;
let timer = TIME_PER_LEVEL;
let timerInterval;
let hasInsurance = false;

// Elements
const elApp = document.getElementById("app");
const elHeader = document.getElementById("header");
const elTimerContainer = document.getElementById("timer-container");
const elTimerBar = document.getElementById("timer-bar");
const elBalanceDisplay = document.getElementById("balance-display");
const elLevelBadge = document.getElementById("level-badge");

const screenStart = document.getElementById("screen-start");
const screenGame = document.getElementById("screen-game");
const screenCrisis = document.getElementById("screen-crisis");
const screenResult = document.getElementById("screen-result");

function formatMoney(amount) {
  const sign = amount < 0 ? "-" : amount > 0 ? "+" : "";
  return `${sign}฿${Math.abs(amount).toLocaleString()}`;
}

function updateBalance(amount) {
  balance += amount;
  elBalanceDisplay.textContent = `฿${balance.toLocaleString()}`;

  // Visual feedback
  if (amount < 0) {
    elBalanceDisplay.classList.add("text-red-500");
    elApp.classList.add("animate-shake-spend");
    setTimeout(() => {
      elBalanceDisplay.classList.remove("text-red-500");
      elApp.classList.remove("animate-shake-spend");
    }, 400);
  } else if (amount > 0) {
    elBalanceDisplay.classList.add("text-cyan-600");
    elApp.classList.add("animate-pulse-save");
    setTimeout(() => {
      elBalanceDisplay.classList.remove("text-cyan-600");
      elApp.classList.remove("animate-pulse-save");
    }, 500);
  }
}

function switchScreen(screen) {
  [screenStart, screenGame, screenCrisis, screenResult].forEach((s) =>
    s.classList.add("hidden"),
  );
  screen.classList.remove("hidden");
}

function initGame() {
  balance = INITIAL_BALANCE;
  currentLevelIndex = 0;
  hasInsurance = false;
  elBalanceDisplay.textContent = `฿${balance.toLocaleString()}`;
  elHeader.classList.add("hidden");
  elTimerContainer.classList.add("hidden");

  const quote = document.getElementById("final-quote");
  quote.classList.remove("animate-fade-in");
  quote.classList.add("opacity-0");

  const reflection = document.getElementById("reflection-section");
  if (reflection) {
    reflection.classList.add("hidden");
    reflection.classList.remove("animate-fade-in");
  }

  const btnRestart = document.getElementById("btn-restart");
  btnRestart.classList.add("hidden");
  btnRestart.classList.remove("animate-fade-in");

  switchScreen(screenStart);
}

function startGame() {
  elHeader.classList.remove("hidden");
  elTimerContainer.classList.remove("hidden");
  switchScreen(screenGame);
  loadLevel();
}

function loadLevel() {
  const level = levels[currentLevelIndex];
  elLevelBadge.textContent = `Level ${currentLevelIndex + 1}/5`;

  document.getElementById("question-text").textContent = level.title;
  document.getElementById("question-desc").textContent = level.desc;

  document.getElementById("choice-a-text").textContent = level.choiceA.text;
  const costA = document.getElementById("choice-a-cost");
  costA.textContent = formatMoney(level.choiceA.cost);
  costA.className = `text-sm font-bold mt-1 ${level.choiceA.cost < 0 ? "text-red-500" : "text-cyan-600"}`;

  const imgWrapA = document.getElementById("choice-a-img-wrap");
  const imgA = document.getElementById("choice-a-img");
  if (level.choiceA.imgUrl) {
    imgA.src = level.choiceA.imgUrl;
    imgWrapA.classList.remove("hidden");
  } else {
    imgWrapA.classList.add("hidden");
  }

  document.getElementById("choice-b-text").textContent = level.choiceB.text;
  const costB = document.getElementById("choice-b-cost");
  costB.textContent = formatMoney(level.choiceB.cost);
  costB.className = `text-sm font-bold mt-1 ${level.choiceB.cost < 0 ? "text-red-500" : "text-cyan-600"}`;

  const imgWrapB = document.getElementById("choice-b-img-wrap");
  const imgB = document.getElementById("choice-b-img");
  if (level.choiceB.imgUrl) {
    imgB.src = level.choiceB.imgUrl;
    imgWrapB.classList.remove("hidden");
  } else {
    imgWrapB.classList.add("hidden");
  }

  startTimer();
}

function startTimer() {
  clearInterval(timerInterval);
  timer = TIME_PER_LEVEL;
  updateTimerUI();

  timerInterval = setInterval(() => {
    timer -= 0.1;
    updateTimerUI();

    if (timer <= 0) {
      clearInterval(timerInterval);
      makeChoice("A"); // Auto-select A
    }
  }, 100);
}

function updateTimerUI() {
  const percentage = Math.max(0, (timer / TIME_PER_LEVEL) * 100);
  elTimerBar.style.width = `${percentage}%`;

  if (percentage < 30) {
    elTimerBar.classList.remove("bg-cyan-500");
    elTimerBar.classList.add("bg-red-500");
  } else {
    elTimerBar.classList.add("bg-cyan-500");
    elTimerBar.classList.remove("bg-red-500");
  }
}

function makeChoice(choiceKey) {
  clearInterval(timerInterval);
  const level = levels[currentLevelIndex];
  const choice = choiceKey === "A" ? level.choiceA : level.choiceB;

  if (currentLevelIndex === 4 && choiceKey === "B") {
    hasInsurance = true;
  }

  updateBalance(choice.cost);

  currentLevelIndex++;
  if (currentLevelIndex < levels.length) {
    setTimeout(loadLevel, 500); // Small delay for visual feedback
  } else {
    setTimeout(triggerCrisis, 500);
  }
}

function triggerCrisis() {
  elTimerContainer.classList.add("hidden");
  switchScreen(screenCrisis);

  let crisisCost = -10000;
  let desc =
    "เกิดเหตุเจ็บป่วยฉุกเฉินกะทันหัน ต้องเข้ารับการรักษาด่วน ค่าใช้จ่ายพุ่งสูงถึง 10,000 บาท!";

  if (hasInsurance) {
    crisisCost = -2000;
    desc =
      "เกิดเหตุเจ็บป่วยฉุกเฉินกะทันหัน แต่โชคดีที่คุณมีประกันสุขภาพ! จ่ายส่วนต่างเพียง 2,000 บาท";
  }

  document.getElementById("crisis-desc").textContent = desc;
  document.getElementById("crisis-cost").textContent = formatMoney(crisisCost);

  updateBalance(crisisCost);
}

function showResults() {
  elHeader.classList.add("hidden");
  switchScreen(screenResult);

  const elFinalBalance = document.getElementById("final-balance");
  elFinalBalance.textContent = `฿${balance.toLocaleString()}`;

  const elResultTitle = document.getElementById("result-title");
  const elResultDesc = document.getElementById("result-desc");
  const elResultIconContainer = document.getElementById(
    "result-icon-container",
  );
  const elResultIcon = document.getElementById("result-icon");

  if (balance > 0) {
    elFinalBalance.classList.add("text-cyan-600");
    elFinalBalance.classList.remove("text-red-500");
    elResultTitle.textContent = "รอดไปนะเรา";
    elResultDesc.textContent =
      "คุณบริหารจังหวะชีวิตได้ดีเยี่ยม แม้มีพายุพัดมา คุณยังยืนหยัดได้อย่างสง่างาม";
    elResultIconContainer.className =
      "w-24 h-24 rounded-full flex items-center justify-center mb-6 mx-auto bg-cyan-50 border-4 border-cyan-100";
    elResultIcon.setAttribute("data-lucide", "building-2");
    elResultIcon.className = "w-12 h-12 text-cyan-600";
  } else {
    elFinalBalance.classList.add("text-red-500");
    elFinalBalance.classList.remove("text-cyan-600");
    elResultTitle.textContent = "ใจเย็นๆ ตั้งสติหน่อยนะ";
    elResultDesc.textContent =
      "อาจจะต้องกินมาม่าไปอีก 2-3 เดือน แต่ไม่เป็นไร ชีวิตยังมีพรุ่งนี้เสมอ";
    elResultIconContainer.className =
      "w-24 h-24 rounded-full flex items-center justify-center mb-6 mx-auto bg-red-50 border-4 border-red-100";
    elResultIcon.setAttribute("data-lucide", "home"); // or building
    elResultIcon.className = "w-12 h-12 text-red-500 opacity-75";
  }

  lucide.createIcons();

  setTimeout(() => {
    const reflection = document.getElementById("reflection-section");
    if (reflection) {
      reflection.classList.remove("hidden");
      reflection.classList.add("animate-fade-in");
    }

    setTimeout(() => {
      const quote = document.getElementById("final-quote");
      quote.classList.add("animate-fade-in");

      setTimeout(() => {
        const btnRestart = document.getElementById("btn-restart");
        btnRestart.classList.remove("hidden");
        btnRestart.classList.add("animate-fade-in");
      }, 1500);
    }, 1000);
  }, 200);
}
