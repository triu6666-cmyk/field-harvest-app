const crops = PESTICIDE_CROP_DATA.map(({ name, category, registrationCropName }) => ({
  name,
  category,
  registrationCropName
}));

const statusLabels = {
  registered: "登録あり",
  conditional: "条件付き",
  "not-registered": "登録なし",
  expired: "失効",
  prohibited: "使用禁止",
  unverified: "未確認"
};

const pesticideData = Object.fromEntries(
  PESTICIDE_CROP_DATA.map((crop) => [crop.name, crop.products])
);

const elements = {
  cropSelect: document.querySelector("#cropSelect"),
  cropChips: document.querySelector("#cropChips"),
  showCropDetailButton: document.querySelector("#showCropDetailButton"),
  showCropOverviewButton: document.querySelector("#showCropOverviewButton"),
  detailControls: document.querySelector("#detailControls"),
  cropDetailView: document.querySelector("#cropDetailView"),
  cropOverviewView: document.querySelector("#cropOverviewView"),
  overviewBody: document.querySelector("#pesticideOverviewBody"),
  productSearchInput: document.querySelector("#productSearchInput"),
  purposeFilter: document.querySelector("#purposeFilter"),
  statusFilter: document.querySelector("#statusFilter"),
  cropCategory: document.querySelector("#cropCategory"),
  referenceTitle: document.querySelector("#referenceTitle"),
  cropSummary: document.querySelector("#cropSummary"),
  tableBody: document.querySelector("#pesticideTableBody"),
  emptyTableMessage: document.querySelector("#emptyTableMessage"),
  researchPrompt: document.querySelector("#researchPrompt"),
  copyPromptButton: document.querySelector("#copyPromptButton"),
  copyStatus: document.querySelector("#copyStatus"),
  printButton: document.querySelector("#printButton")
};

let selectedCrop = crops[0].name;
let viewMode = "detail";

function initialize() {
  renderCropSelect();
  renderCropChips();
  renderTable();
  renderOverview();
  renderViewMode();
  loadResearchPrompt();

  elements.cropSelect.addEventListener("change", () => {
    selectedCrop = elements.cropSelect.value;
    renderCropChips();
    renderTable();
  });
  elements.productSearchInput.addEventListener("input", renderTable);
  elements.purposeFilter.addEventListener("change", renderTable);
  elements.statusFilter.addEventListener("change", renderTable);
  elements.copyPromptButton.addEventListener("click", copyResearchPrompt);
  elements.printButton.addEventListener("click", () => window.print());
  elements.showCropDetailButton.addEventListener("click", () => setViewMode("detail"));
  elements.showCropOverviewButton.addEventListener("click", () => setViewMode("overview"));

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {});
  }
}

function renderCropSelect() {
  elements.cropSelect.replaceChildren();
  crops.forEach((crop) => {
    const option = document.createElement("option");
    option.value = crop.name;
    option.textContent = crop.name;
    elements.cropSelect.append(option);
  });
  elements.cropSelect.value = selectedCrop;
}

function renderCropChips() {
  elements.cropChips.replaceChildren();
  const categories = [...new Set(crops.map((crop) => crop.category))];
  categories.forEach((category) => {
    const group = document.createElement("section");
    group.className = "crop-picker-group";
    const title = document.createElement("strong");
    title.textContent = category;
    const buttons = document.createElement("div");
    buttons.className = "crop-picker-buttons";

    crops.filter((crop) => crop.category === category).forEach((crop) => {
      const button = document.createElement("button");
      button.className = "crop-chip";
      button.classList.toggle("active", crop.name === selectedCrop);
      button.type = "button";
      button.textContent = crop.name;
      button.setAttribute("aria-pressed", String(crop.name === selectedCrop));
      button.addEventListener("click", () => selectCrop(crop.name));
      buttons.append(button);
    });
    group.append(title, buttons);
    elements.cropChips.append(group);
  });
}

function selectCrop(cropName) {
  const returnFromOverview = viewMode === "overview";
  selectedCrop = cropName;
  elements.cropSelect.value = cropName;
  renderCropChips();
  renderTable();
  setViewMode("detail");
  if (returnFromOverview) {
    requestAnimationFrame(() => {
      elements.cropDetailView.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }
}

function setViewMode(mode) {
  viewMode = mode;
  renderViewMode();
}

function renderViewMode() {
  const showOverview = viewMode === "overview";
  elements.detailControls.classList.toggle("hidden", showOverview);
  elements.cropDetailView.classList.toggle("hidden", showOverview);
  elements.cropOverviewView.classList.toggle("hidden", !showOverview);
  elements.showCropDetailButton.classList.toggle("active", !showOverview);
  elements.showCropOverviewButton.classList.toggle("active", showOverview);
  elements.showCropDetailButton.setAttribute("aria-pressed", String(!showOverview));
  elements.showCropOverviewButton.setAttribute("aria-pressed", String(showOverview));
}

function renderTable() {
  const crop = crops.find((item) => item.name === selectedCrop) || crops[0];
  const searchTerm = elements.productSearchInput.value.trim().toLocaleLowerCase("ja");
  const purpose = elements.purposeFilter.value;
  const status = elements.statusFilter.value;
  const rows = (pesticideData[selectedCrop] || []).filter((row) => {
    const searchableText = [row.productName, ...row.activeIngredients].join(" ").toLocaleLowerCase("ja");
    return (!searchTerm || searchableText.includes(searchTerm))
      && (purpose === "all" || row.purpose === purpose)
      && (status === "all" || row.status === status);
  });

  elements.cropCategory.textContent = crop.category;
  elements.referenceTitle.textContent = `${crop.name}の農薬対応表`;
  elements.cropSummary.textContent = `${rows.length}製品を表示 / 登録上の作物名：${crop.registrationCropName} / 2026年6月30日調査`;
  elements.tableBody.replaceChildren();

  rows.forEach((row) => elements.tableBody.append(createTableRow(row)));
  elements.emptyTableMessage.classList.toggle("hidden", rows.length > 0);
}

function createTableRow(row) {
  const tableRow = document.createElement("tr");
  tableRow.dataset.status = row.status;

  const productCell = document.createElement("td");
  productCell.className = "sticky-column";
  const product = document.createElement("div");
  product.className = "product-name";
  const productTitle = document.createElement("strong");
  productTitle.textContent = row.productName;
  const productMeta = document.createElement("small");
  productMeta.textContent = `登録番号 ${row.registrationNumber} / ${row.activeIngredients.join("、")}`;
  product.append(productTitle, productMeta);
  productCell.append(product);
  tableRow.append(productCell);

  tableRow.append(createTextCell(row.purpose));

  const statusCell = document.createElement("td");
  const badge = document.createElement("span");
  badge.className = `status-badge ${row.status}`;
  badge.textContent = statusLabels[row.status] || statusLabels.unverified;
  statusCell.append(badge);
  tableRow.append(statusCell);

  tableRow.append(
    createTextCell(row.targets.join("・"), row.status !== "registered" && row.status !== "conditional"),
    createTextCell(row.useTiming, !row.useTiming),
    createTextCell(row.maxApplications, !row.maxApplications),
    createTextCell(row.dilutionOrRate, !row.dilutionOrRate),
    createTextCell(row.method, !row.method),
    createTextCell(row.totalActiveIngredientUses, Boolean(row.totalActiveIngredientUses)),
    createTextCell(row.mixing, row.mixing === "未確認"),
    createSourceCell(row)
  );

  return tableRow;
}

function renderOverview() {
  elements.overviewBody.replaceChildren();
  PESTICIDE_CROP_DATA.forEach((crop) => {
    const row = document.createElement("tr");
    const cropCell = document.createElement("th");
    cropCell.scope = "row";
    const cropButton = document.createElement("button");
    cropButton.className = "overview-crop-button";
    cropButton.type = "button";
    cropButton.textContent = crop.name;
    cropButton.addEventListener("click", () => selectCrop(crop.name));
    cropCell.append(cropButton);

    const registrationCell = document.createElement("td");
    registrationCell.textContent = crop.registrationCropName;

    row.append(
      cropCell,
      registrationCell,
      createOverviewProductCell(crop.products[0]),
      createOverviewProductCell(crop.products[1])
    );
    elements.overviewBody.append(row);
  });
}

function createOverviewProductCell(product) {
  const cell = document.createElement("td");
  cell.className = "overview-product-cell";
  cell.dataset.status = product.status;

  const badge = document.createElement("span");
  badge.className = `status-badge ${product.status}`;
  badge.textContent = statusLabels[product.status] || statusLabels.unverified;
  cell.append(badge);

  if (product.status === "registered" || product.status === "conditional") {
    const timing = document.createElement("strong");
    timing.textContent = product.useTiming || "使用時期を確認";
    const meta = document.createElement("small");
    meta.textContent = `${product.maxApplications || "回数確認"} / ${product.dilutionOrRate || "希釈確認"}`;
    cell.append(timing, meta);
  } else {
    const note = document.createElement("small");
    note.textContent = product.targets.join("・");
    cell.append(note);
  }
  return cell;
}

function createTextCell(text, placeholder = false) {
  const cell = document.createElement("td");
  cell.textContent = text || "-";
  cell.classList.toggle("placeholder-cell", placeholder);
  return cell;
}

function createSourceCell(row) {
  const cell = document.createElement("td");
  if (!row.sources.length) {
    cell.className = "placeholder-cell";
    cell.textContent = "調査日・公的出典URLを入力";
    return cell;
  }

  const date = document.createElement("div");
  date.textContent = row.verifiedAt || "確認日なし";
  cell.append(date);
  row.sources.forEach((source) => {
    const link = document.createElement("a");
    link.className = "source-link";
    link.href = source.url;
    link.target = "_blank";
    link.rel = "noreferrer";
    link.textContent = source.title;
    cell.append(document.createElement("br"), link);
  });
  return cell;
}

async function loadResearchPrompt() {
  try {
    const response = await fetch("./pesticide-deep-research-prompt.md");
    if (!response.ok) throw new Error("Prompt load failed");
    elements.researchPrompt.value = await response.text();
  } catch {
    elements.researchPrompt.value = "pesticide-deep-research-prompt.md を開いて使用してください。";
  }
}

async function copyResearchPrompt() {
  const text = elements.researchPrompt.value;
  if (!text) return;

  elements.copyStatus.textContent = "コピーしています...";
  try {
    if (!navigator.clipboard?.writeText) throw new Error("Clipboard API unavailable");
    await Promise.race([
      navigator.clipboard.writeText(text),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Clipboard timeout")), 800))
    ]);
  } catch {
    elements.researchPrompt.focus();
    elements.researchPrompt.select();
    if (!document.execCommand("copy")) {
      elements.copyStatus.textContent = "コピーできませんでした。本文を選択してコピーしてください。";
      return;
    }
  }
  elements.copyStatus.textContent = "プロンプトをコピーしました。";
}

initialize();
