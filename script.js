const DEFAULT_COLORS = [
  "#171717",
  "#6B4F3A",
  "#C4A574",
  "#7A1F1F",
  "#2C4A3E",
  "#4A5568",
  "#E8D5B5",
  "#1E3A5F",
];

const LIMITS = {
  minMeters: 0.3,
  maxMeters: 8,
  minSquares: 1,
  maxCols: 40,
  maxRows: 50,
  maxTotal: 800,
  minColors: 1,
  maxColors: 8,
};

const carpet = document.getElementById("carpet");
const colorList = document.getElementById("color-list");
const colorCountInput = document.getElementById("color-count-input");
const statsEl = document.getElementById("stats");
const fillBtn = document.getElementById("fill-btn");
const resetBtn = document.getElementById("reset-btn");
const swapBtn = document.getElementById("swap-btn");
const sizeForm = document.getElementById("size-form");
const widthInput = document.getElementById("width-input");
const lengthInput = document.getElementById("length-input");
const colsInput = document.getElementById("cols-input");
const rowsInput = document.getElementById("rows-input");
const totalPreview = document.getElementById("total-preview");
const sizeError = document.getElementById("size-error");
const widthLabel = document.getElementById("width-label");
const lengthLabel = document.getElementById("length-label");
const colsLabel = document.getElementById("cols-label");
const rowsLabel = document.getElementById("rows-label");

let colors = DEFAULT_COLORS.slice(0, 2);
let selectedIndex = 0;
let config = {
  widthM: 2.1,
  lengthM: 3,
  cols: 7,
  rows: 10,
};

const toArabicDigits = (value) =>
  String(value).replace(/\d/g, (digit) => "٠١٢٣٤٥٦٧٨٩"[digit]);

function selectedColor() {
  return colors[selectedIndex];
}

function formatMeters(value) {
  const text = Number(value).toFixed(2).replace(".", "٫");
  return `${toArabicDigits(text)} م`;
}

function formatSquares(count) {
  return `${toArabicDigits(count)} ${count === 1 ? "مربع" : "مربعات"}`;
}

function totalSquares() {
  return config.cols * config.rows;
}

function normalizeHex(value) {
  let hex = String(value).trim().replace(/^#/, "").replace(/[^0-9a-f]/gi, "");
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((char) => char + char)
      .join("");
  }
  if (hex.length !== 6) {
    return null;
  }
  return `#${hex.toUpperCase()}`;
}

function createCarpet() {
  carpet.replaceChildren();
  const fragment = document.createDocumentFragment();
  const total = totalSquares();
  const baseColor = colors[0];

  for (let i = 0; i < total; i += 1) {
    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = "cell";
    cell.dataset.color = baseColor;
    cell.style.background = baseColor;
    cell.setAttribute("role", "gridcell");
    cell.setAttribute("aria-label", `مربع ${toArabicDigits(i + 1)}`);
    cell.addEventListener("click", () => paintCell(cell));
    fragment.appendChild(cell);
  }

  carpet.appendChild(fragment);
  carpet.style.gridTemplateColumns = `repeat(${config.cols}, 1fr)`;
  carpet.style.gridTemplateRows = `repeat(${config.rows}, 1fr)`;
  carpet.setAttribute(
    "aria-label",
    `سجادة ${toArabicDigits(config.cols)} أعمدة و${toArabicDigits(config.rows)} صفوف`
  );

  updateDimensionLabels();
  sizeCarpet();
  updateCounts();
}

function updateDimensionLabels() {
  widthLabel.textContent = formatMeters(config.widthM);
  lengthLabel.textContent = formatMeters(config.lengthM);
  colsLabel.textContent = formatSquares(config.cols);
  rowsLabel.textContent = formatSquares(config.rows);
}

function sizeCarpet() {
  const stage = document.querySelector(".stage");
  const isNarrow = window.matchMedia("(max-width: 560px)").matches;
  const maxHeight = Math.min(window.innerHeight * (isNarrow ? 0.58 : 0.72), isNarrow ? 520 : 780);
  const maxWidth = Math.max(180, stage.clientWidth - (isNarrow ? 24 : 90));
  const scale = Math.min(maxWidth / config.widthM, maxHeight / config.lengthM);

  carpet.style.width = `${config.widthM * scale}px`;
  carpet.style.height = `${config.lengthM * scale}px`;
}

function paintCell(cell) {
  cell.dataset.color = selectedColor();
  cell.style.background = selectedColor();
  updateCounts();
}

function recolorCells(oldColor, newColor) {
  if (oldColor.toLowerCase() === newColor.toLowerCase()) {
    return;
  }

  carpet.querySelectorAll(".cell").forEach((cell) => {
    if (cell.dataset.color.toLowerCase() === oldColor.toLowerCase()) {
      cell.dataset.color = newColor;
      cell.style.background = newColor;
    }
  });
}

function setPaletteColor(index, nextColor, source) {
  const previous = colors[index];
  colors[index] = nextColor;
  recolorCells(previous, nextColor);

  const row = colorList.children[index];
  if (row) {
    const picker = row.querySelector('input[type="color"]');
    const hex = row.querySelector(".hex-input");
    if (picker && source !== "picker") {
      picker.value = nextColor;
    }
    if (hex && source !== "hex") {
      hex.value = nextColor;
    }
  }

  updateCounts();
}

function renderColorList() {
  colorList.replaceChildren();

  colors.forEach((color, index) => {
    const row = document.createElement("div");
    row.className = `color-row${index === selectedIndex ? " is-active" : ""}`;
    row.dataset.index = String(index);
    row.setAttribute("role", "radio");
    row.setAttribute("aria-checked", String(index === selectedIndex));
    row.tabIndex = 0;

    const picker = document.createElement("input");
    picker.type = "color";
    picker.value = color;
    picker.setAttribute("aria-label", `اختيار لون ${toArabicDigits(index + 1)}`);

    const meta = document.createElement("div");
    meta.className = "color-row-meta";

    const name = document.createElement("span");
    name.className = "color-row-name";
    name.textContent = `لون ${toArabicDigits(index + 1)}`;

    const hex = document.createElement("input");
    hex.type = "text";
    hex.className = "hex-input";
    hex.value = color;
    hex.spellcheck = false;
    hex.maxLength = 7;
    hex.setAttribute("aria-label", `رمز لون ${toArabicDigits(index + 1)}`);

    const check = document.createElement("span");
    check.className = "color-row-check";
    check.setAttribute("aria-hidden", "true");
    check.textContent = "✓";

    meta.append(name, hex);
    row.append(picker, meta, check);
    colorList.appendChild(row);

    row.addEventListener("click", () => selectColor(index));
    row.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        selectColor(index);
      }
    });

    picker.addEventListener("input", () => {
      selectColor(index);
      setPaletteColor(index, picker.value.toUpperCase(), "picker");
    });
    picker.addEventListener("click", (event) => event.stopPropagation());

    hex.addEventListener("click", (event) => event.stopPropagation());
    hex.addEventListener("focus", () => selectColor(index));
    hex.addEventListener("input", () => {
      const parsed = normalizeHex(hex.value);
      hex.classList.toggle("is-invalid", !parsed);
      if (parsed) {
        setPaletteColor(index, parsed, "hex");
      }
    });
    hex.addEventListener("blur", () => {
      hex.value = colors[index];
      hex.classList.remove("is-invalid");
    });
  });
}

function selectColor(index) {
  selectedIndex = index;
  colorList.querySelectorAll(".color-row").forEach((row, rowIndex) => {
    const isActive = rowIndex === selectedIndex;
    row.classList.toggle("is-active", isActive);
    row.setAttribute("aria-checked", String(isActive));
  });
}

function setColorCount(count) {
  const nextCount = Math.min(LIMITS.maxColors, Math.max(LIMITS.minColors, count));
  if (nextCount === colors.length) {
    return;
  }

  if (nextCount > colors.length) {
    for (let i = colors.length; i < nextCount; i += 1) {
      colors.push(DEFAULT_COLORS[i] || DEFAULT_COLORS[i % DEFAULT_COLORS.length]);
    }
  } else {
    colors = colors.slice(0, nextCount);
  }

  if (selectedIndex >= colors.length) {
    selectedIndex = colors.length - 1;
  }

  colorCountInput.value = String(colors.length);
  renderColorList();
  updateCounts();
}

function invertColors() {
  if (colors.length < 2) {
    return;
  }

  carpet.querySelectorAll(".cell").forEach((cell) => {
    const index = colors.findIndex(
      (color) => color.toLowerCase() === cell.dataset.color.toLowerCase()
    );
    if (index === -1) {
      return;
    }
    const nextColor = colors[(index + 1) % colors.length];
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
  const counts = colors.map(
    (color) =>
      cells.filter((cell) => cell.dataset.color.toLowerCase() === color.toLowerCase()).length
  );
  const matched = counts.reduce((sum, count) => sum + count, 0);
  const other = cells.length - matched;

  statsEl.replaceChildren();
  colors.forEach((color, index) => {
    const stat = document.createElement("div");
    stat.className = "stat";
    stat.innerHTML = `
      <span class="stat-dot" style="background: ${color}"></span>
      <span>لون ${toArabicDigits(index + 1)}: <strong>${toArabicDigits(counts[index])}</strong></span>
    `;
    statsEl.appendChild(stat);
  });

  if (other > 0) {
    const stat = document.createElement("div");
    stat.className = "stat";
    stat.innerHTML = `<span>ألوان أخرى: <strong>${toArabicDigits(other)}</strong></span>`;
    statsEl.appendChild(stat);
  }
}

function readSizeInputs() {
  return {
    widthM: Number(widthInput.value),
    lengthM: Number(lengthInput.value),
    cols: Number(colsInput.value),
    rows: Number(rowsInput.value),
  };
}

function updateTotalPreview() {
  const cols = Number(colsInput.value);
  const rows = Number(rowsInput.value);
  if (Number.isInteger(cols) && Number.isInteger(rows) && cols > 0 && rows > 0) {
    totalPreview.textContent = toArabicDigits(cols * rows);
  } else {
    totalPreview.textContent = "—";
  }
}

function validateSize(next) {
  if (
    !Number.isFinite(next.widthM) ||
    !Number.isFinite(next.lengthM) ||
    next.widthM < LIMITS.minMeters ||
    next.lengthM < LIMITS.minMeters ||
    next.widthM > LIMITS.maxMeters ||
    next.lengthM > LIMITS.maxMeters
  ) {
    return "أدخل طولًا وعرضًا بين ٠٫٣٠ و٨ أمتار.";
  }

  if (
    !Number.isInteger(next.cols) ||
    !Number.isInteger(next.rows) ||
    next.cols < LIMITS.minSquares ||
    next.rows < LIMITS.minSquares ||
    next.cols > LIMITS.maxCols ||
    next.rows > LIMITS.maxRows
  ) {
    return "عدد المربعات بالعرض من ١ إلى ٤٠، وبالطول من ١ إلى ٥٠.";
  }

  if (next.cols * next.rows > LIMITS.maxTotal) {
    return "المجموع كبير جدًا. اختر ٨٠٠ مربع أو أقل.";
  }

  return "";
}

function applySize(event) {
  event.preventDefault();
  const next = readSizeInputs();
  const error = validateSize(next);
  sizeError.textContent = error;
  if (error) {
    return;
  }

  config = next;
  createCarpet();
}

colorCountInput.addEventListener("input", () => {
  const count = Number(colorCountInput.value);
  if (Number.isInteger(count)) {
    setColorCount(count);
  }
});

[colsInput, rowsInput].forEach((input) => {
  input.addEventListener("input", updateTotalPreview);
});

sizeForm.addEventListener("submit", applySize);
swapBtn.addEventListener("click", invertColors);
fillBtn.addEventListener("click", () => fillCarpet(selectedColor()));
resetBtn.addEventListener("click", () => fillCarpet(colors[0]));
window.addEventListener("resize", sizeCarpet);

updateTotalPreview();
renderColorList();
createCarpet();
