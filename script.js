const COLORS = {
  black: "#171717",
  coffee: "#6B4F3A",
};

const COLS = 7;
const ROWS = 10;
const TOTAL = COLS * ROWS;

const carpet = document.getElementById("carpet");
const swatches = [...document.querySelectorAll(".swatch")];
const fillBtn = document.getElementById("fill-btn");
const resetBtn = document.getElementById("reset-btn");
const swapBtn = document.getElementById("swap-btn");
const blackCountEl = document.getElementById("black-count");
const brownCountEl = document.getElementById("brown-count");

let selectedColor = COLORS.black;

const toArabicDigits = (value) =>
  String(value).replace(/\d/g, (digit) => "٠١٢٣٤٥٦٧٨٩"[digit]);

function createCarpet() {
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < TOTAL; i += 1) {
    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = "cell";
    cell.dataset.color = COLORS.coffee;
    cell.style.background = COLORS.coffee;
    cell.setAttribute("role", "gridcell");
    cell.setAttribute("aria-label", `مربع ${toArabicDigits(i + 1)}`);
    cell.addEventListener("click", () => paintCell(cell));
    fragment.appendChild(cell);
  }

  carpet.appendChild(fragment);
  updateCounts();
}

function paintCell(cell) {
  cell.dataset.color = selectedColor;
  cell.style.background = selectedColor;
  updateCounts();
}

function setActiveSwatch(swatch) {
  selectedColor = swatch.dataset.color;
  swatches.forEach((item) => {
    const isActive = item === swatch;
    item.classList.toggle("is-active", isActive);
    item.setAttribute("aria-checked", String(isActive));
  });
}

function invertColors() {
  carpet.querySelectorAll(".cell").forEach((cell) => {
    const nextColor =
      cell.dataset.color === COLORS.black ? COLORS.coffee : COLORS.black;
    cell.dataset.color = nextColor;
    cell.style.background = nextColor;
  });
  updateCounts();
}

function paintCells(cells, color) {
  cells.forEach((cell) => {
    cell.dataset.color = color;
    cell.style.background = color;
  });
}

function fillCarpet(color) {
  paintCells([...carpet.querySelectorAll(".cell")], color);
  updateCounts();
}

function updateCounts() {
  const cells = [...carpet.querySelectorAll(".cell")];
  const blackCount = cells.filter((cell) => cell.dataset.color === COLORS.black).length;
  const brownCount = TOTAL - blackCount;
  blackCountEl.textContent = toArabicDigits(blackCount);
  brownCountEl.textContent = toArabicDigits(brownCount);
}

swatches.forEach((swatch) => {
  swatch.addEventListener("click", () => setActiveSwatch(swatch));
});

swapBtn.addEventListener("click", invertColors);
fillBtn.addEventListener("click", () => fillCarpet(selectedColor));
resetBtn.addEventListener("click", () => fillCarpet(COLORS.coffee));

createCarpet();
