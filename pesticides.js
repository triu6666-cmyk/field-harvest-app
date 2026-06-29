const crops = [
  { name: "トマト", category: "果菜類" },
  { name: "ミニトマト", category: "果菜類" },
  { name: "ナス", category: "果菜類" },
  { name: "きゅうり", category: "果菜類" },
  { name: "ゴーヤ", category: "果菜類" },
  { name: "ズッキーニ", category: "果菜類" },
  { name: "ピーマン", category: "果菜類" },
  { name: "パプリカ", category: "果菜類" },
  { name: "ししとう", category: "果菜類" },
  { name: "オクラ", category: "果菜類" },
  { name: "いんげん", category: "豆類" },
  { name: "枝豆", category: "豆類" },
  { name: "えんどう", category: "豆類" },
  { name: "とうもろこし", category: "穀類" },
  { name: "かぼちゃ", category: "果菜類" },
  { name: "スイカ", category: "果菜類" },
  { name: "メロン", category: "果菜類" },
  { name: "大根", category: "根菜類" },
  { name: "かぶ", category: "根菜類" },
  { name: "にんじん", category: "根菜類" },
  { name: "じゃがいも", category: "いも類" },
  { name: "さつまいも", category: "いも類" },
  { name: "さといも", category: "いも類" },
  { name: "玉ねぎ", category: "鱗茎類" },
  { name: "にんにく", category: "鱗茎類" },
  { name: "しょうが", category: "根菜類" },
  { name: "ねぎ", category: "葉茎菜類" },
  { name: "レタス", category: "葉菜類" },
  { name: "キャベツ", category: "葉菜類" },
  { name: "白菜", category: "葉菜類" },
  { name: "ブロッコリー", category: "花菜類" },
  { name: "ほうれん草", category: "葉菜類" },
  { name: "小松菜", category: "葉菜類" },
  { name: "春菊", category: "葉菜類" },
  { name: "パセリ", category: "葉菜類" },
  { name: "シソ", category: "葉菜類" },
  { name: "アスパラ", category: "茎菜類" },
  { name: "いちご", category: "果実的野菜" }
];

const statusLabels = {
  registered: "登録あり",
  conditional: "条件付き",
  "not-registered": "登録なし",
  expired: "失効",
  prohibited: "使用禁止",
  unverified: "未確認"
};

const pesticideData = Object.fromEntries(
  crops.map((crop) => [crop.name, createTemplateRows(crop.name)])
);

const elements = {
  cropSelect: document.querySelector("#cropSelect"),
  cropChips: document.querySelector("#cropChips"),
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

function createTemplateRows(cropName) {
  return ["殺菌剤", "殺虫剤", "その他"].map((purpose) => ({
    cropName,
    productName: `${purpose}候補（調査待ち）`,
    registrationNumber: "",
    activeIngredients: [],
    purpose,
    status: "unverified",
    targets: ["対象病害虫・雑草を入力"],
    useTiming: "使用時期を入力",
    maxApplications: "回数を入力",
    dilutionOrRate: "希釈倍率・使用量を入力",
    method: "使用方法を入力",
    totalActiveIngredientUses: "総使用回数を入力",
    mixing: "未確認",
    verifiedAt: "",
    sources: []
  }));
}

function initialize() {
  renderCropSelect();
  renderCropChips();
  renderTable();
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
  crops.forEach((crop) => {
    const button = document.createElement("button");
    button.className = "crop-chip";
    button.classList.toggle("active", crop.name === selectedCrop);
    button.type = "button";
    button.textContent = crop.name;
    button.setAttribute("aria-pressed", String(crop.name === selectedCrop));
    button.addEventListener("click", () => {
      selectedCrop = crop.name;
      elements.cropSelect.value = crop.name;
      renderCropChips();
      renderTable();
    });
    elements.cropChips.append(button);
  });
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
  elements.cropSummary.textContent = `${rows.length}件表示 / 現在は画面確認用の未調査データです`;
  elements.tableBody.replaceChildren();

  rows.forEach((row) => elements.tableBody.append(createTableRow(row)));
  elements.emptyTableMessage.classList.toggle("hidden", rows.length > 0);
}

function createTableRow(row) {
  const tableRow = document.createElement("tr");

  const productCell = document.createElement("td");
  productCell.className = "sticky-column";
  const product = document.createElement("div");
  product.className = "product-name";
  const productTitle = document.createElement("strong");
  productTitle.textContent = row.productName;
  const productMeta = document.createElement("small");
  productMeta.textContent = row.registrationNumber
    ? `登録番号 ${row.registrationNumber}`
    : "登録番号・有効成分を調査後に入力";
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
    createTextCell(row.targets.join("・"), true),
    createTextCell(row.useTiming, true),
    createTextCell(row.maxApplications, true),
    createTextCell(row.dilutionOrRate, true),
    createTextCell(row.method, true),
    createTextCell(row.totalActiveIngredientUses, true),
    createTextCell(row.mixing, row.mixing === "未確認"),
    createSourceCell(row)
  );

  return tableRow;
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
