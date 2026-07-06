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
const storage = window.fieldHarvestStorage;
let appState = normalizeApplicationState(storage.load());

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
  referenceCropIcon: document.querySelector("#referenceCropIcon"),
  referenceTitle: document.querySelector("#referenceTitle"),
  cropSummary: document.querySelector("#cropSummary"),
  tableBody: document.querySelector("#pesticideTableBody"),
  emptyTableMessage: document.querySelector("#emptyTableMessage"),
  researchPrompt: document.querySelector("#researchPrompt"),
  copyPromptButton: document.querySelector("#copyPromptButton"),
  copyStatus: document.querySelector("#copyStatus"),
  printButton: document.querySelector("#printButton"),
  openApplicationFormButton: document.querySelector("#openApplicationFormButton"),
  applicationSummary: document.querySelector("#applicationSummary"),
  applicationMonthFilter: document.querySelector("#applicationMonthFilter"),
  applicationCropFilter: document.querySelector("#applicationCropFilter"),
  applicationSaveStatus: document.querySelector("#applicationSaveStatus"),
  applicationHistoryList: document.querySelector("#applicationHistoryList"),
  applicationModal: document.querySelector("#applicationModal"),
  closeApplicationModalButton: document.querySelector("#closeApplicationModalButton"),
  applicationForm: document.querySelector("#applicationForm"),
  applicationDateInput: document.querySelector("#applicationDateInput"),
  applicationCropInput: document.querySelector("#applicationCropInput"),
  applicationProductInput: document.querySelector("#applicationProductInput"),
  applicationDilutionInput: document.querySelector("#applicationDilutionInput"),
  applicationAmountInput: document.querySelector("#applicationAmountInput"),
  applicationUnitInput: document.querySelector("#applicationUnitInput"),
  applicationMemoInput: document.querySelector("#applicationMemoInput"),
  applicationRulePreview: document.querySelector("#applicationRulePreview"),
  applicationSubmitButton: document.querySelector("#applicationSubmitButton")
};

let selectedCrop = crops[0].name;
let viewMode = "detail";
let applicationMonthFilter = "all";
let applicationCropFilter = "all";

function initialize() {
  renderCropSelect();
  renderCropChips();
  renderTable();
  renderOverview();
  renderViewMode();
  renderApplicationCropOptions();
  elements.applicationDateInput.value = currentLocalDate();
  updateApplicationProductOptions();
  renderApplicationRecords();
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
  elements.openApplicationFormButton.addEventListener("click", () => openApplicationModal(selectedCrop));
  elements.closeApplicationModalButton.addEventListener("click", closeApplicationModal);
  elements.applicationModal.addEventListener("click", (event) => {
    if (event.target === elements.applicationModal) closeApplicationModal();
  });
  elements.applicationCropInput.addEventListener("change", () => updateApplicationProductOptions());
  elements.applicationProductInput.addEventListener("change", applySelectedProductDefaults);
  elements.applicationForm.addEventListener("submit", saveApplicationRecord);
  elements.applicationMonthFilter.addEventListener("change", () => {
    applicationMonthFilter = elements.applicationMonthFilter.value;
    renderApplicationHistory();
  });
  elements.applicationCropFilter.addEventListener("change", () => {
    applicationCropFilter = elements.applicationCropFilter.value;
    renderApplicationHistory();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !elements.applicationModal.classList.contains("hidden")) {
      closeApplicationModal();
    }
  });

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./service-worker.js", { updateViaCache: "none" }).catch(() => {});
  }

  pullApplicationRecordsFromCloud();
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
      const icon = createCropIcon(crop.name, "crop-chip-icon");
      const label = document.createElement("span");
      label.textContent = crop.name;
      button.append(icon, label);
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
  elements.referenceCropIcon.innerHTML = window.fieldHarvestCropIconSvg(crop.name);
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
  if (isRecordableProduct(row)) {
    const recordButton = document.createElement("button");
    recordButton.className = "table-record-button";
    recordButton.type = "button";
    recordButton.textContent = "使用を記録";
    recordButton.addEventListener("click", () => openApplicationModal(selectedCrop, row.registrationNumber));
    product.append(recordButton);
  }
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
    const icon = createCropIcon(crop.name, "overview-crop-icon");
    const label = document.createElement("span");
    label.textContent = crop.name;
    cropButton.append(icon, label);
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

function createCropIcon(cropName, className) {
  const icon = document.createElement("span");
  icon.className = className;
  icon.setAttribute("aria-hidden", "true");
  icon.innerHTML = window.fieldHarvestCropIconSvg(cropName);
  return icon;
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

function isRecordableProduct(product) {
  return product?.status === "registered" || product?.status === "conditional";
}

function normalizeApplicationState(value) {
  const normalized = value && typeof value === "object" ? { ...value } : {};
  normalized.pesticideApplications = Array.isArray(normalized.pesticideApplications)
    ? [...normalized.pesticideApplications]
    : [];
  return normalized;
}

function currentLocalDate() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function renderApplicationCropOptions() {
  elements.applicationCropInput.replaceChildren();
  crops.forEach((crop) => {
    const option = document.createElement("option");
    option.value = crop.name;
    option.textContent = crop.name;
    elements.applicationCropInput.append(option);
  });
}

function openApplicationModal(cropName = selectedCrop, registrationNumber = "") {
  elements.applicationForm.reset();
  elements.applicationDateInput.value = currentLocalDate();
  elements.applicationCropInput.value = crops.some((crop) => crop.name === cropName) ? cropName : crops[0].name;
  elements.applicationUnitInput.value = "L";
  updateApplicationProductOptions(registrationNumber);
  elements.applicationModal.classList.remove("hidden");
  document.body.classList.add("application-modal-open");
  requestAnimationFrame(() => elements.applicationDateInput.focus());
}

function closeApplicationModal() {
  elements.applicationModal.classList.add("hidden");
  document.body.classList.remove("application-modal-open");
}

function updateApplicationProductOptions(preferredRegistrationNumber = "") {
  const cropName = elements.applicationCropInput.value || selectedCrop;
  const products = (pesticideData[cropName] || []).filter(isRecordableProduct);
  const previousValue = preferredRegistrationNumber || elements.applicationProductInput.value;
  elements.applicationProductInput.replaceChildren();

  if (!products.length) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "記録できる登録農薬がありません";
    elements.applicationProductInput.append(option);
    elements.applicationSubmitButton.disabled = true;
    elements.applicationDilutionInput.value = "";
    renderApplicationRulePreview();
    return;
  }

  products.forEach((product) => {
    const option = document.createElement("option");
    option.value = product.registrationNumber;
    option.textContent = product.productName;
    elements.applicationProductInput.append(option);
  });
  elements.applicationProductInput.value = products.some((product) => product.registrationNumber === previousValue)
    ? previousValue
    : products[0].registrationNumber;
  elements.applicationSubmitButton.disabled = false;
  applySelectedProductDefaults();
}

function selectedApplicationProduct() {
  return (pesticideData[elements.applicationCropInput.value] || [])
    .find((product) => product.registrationNumber === elements.applicationProductInput.value);
}

function applySelectedProductDefaults() {
  const product = selectedApplicationProduct();
  elements.applicationDilutionInput.value = product?.dilutionOrRate || "";
  renderApplicationRulePreview(product);
}

function renderApplicationRulePreview(product = selectedApplicationProduct()) {
  elements.applicationRulePreview.replaceChildren();
  if (!product) {
    elements.applicationRulePreview.textContent = "登録内容を確認できる農薬がありません。";
    return;
  }

  const title = document.createElement("strong");
  title.textContent = "登録内容の確認";
  const details = document.createElement("span");
  details.textContent = [
    `使用時期：${product.useTiming || "要確認"}`,
    `本剤回数：${product.maxApplications || "要確認"}`,
    `方法：${product.method || "要確認"}`
  ].join(" / ");
  const note = document.createElement("small");
  note.textContent = "保存前に、手元の製品ラベルと最新の登録内容を必ず確認してください。";
  elements.applicationRulePreview.append(title, details, note);
}

function saveApplicationRecord(event) {
  event.preventDefault();
  const product = selectedApplicationProduct();
  const amount = Number(elements.applicationAmountInput.value);
  if (!product || !elements.applicationDateInput.value || !Number.isFinite(amount) || amount <= 0) return;

  const crop = crops.find((item) => item.name === elements.applicationCropInput.value);
  appState.pesticideApplications.push({
    id: createApplicationId(),
    date: elements.applicationDateInput.value,
    cropName: elements.applicationCropInput.value,
    registrationCropName: crop?.registrationCropName || elements.applicationCropInput.value,
    productName: product.productName,
    registrationNumber: product.registrationNumber,
    dilution: elements.applicationDilutionInput.value.trim(),
    amount,
    unit: elements.applicationUnitInput.value,
    method: product.method || "",
    useTiming: product.useTiming || "",
    maxApplications: product.maxApplications || "",
    activeIngredients: [...product.activeIngredients],
    memo: elements.applicationMemoInput.value.trim(),
    createdAt: new Date().toISOString()
  });

  persistApplicationState();
  renderApplicationRecords();
  closeApplicationModal();
}

function createApplicationId() {
  return `pesticide-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function persistApplicationState() {
  elements.applicationSaveStatus.textContent = storage.isCloudConfigured() ? "クラウドへ保存中..." : "端末に保存しました";
  storage.save(appState)
    .then((result) => {
      elements.applicationSaveStatus.textContent = result?.skipped ? "端末に保存しました" : "クラウドに保存しました";
    })
    .catch(() => {
      elements.applicationSaveStatus.textContent = "端末には保存済み / クラウド保存に失敗";
    });
}

async function pullApplicationRecordsFromCloud() {
  if (!storage.isCloudConfigured()) return;
  elements.applicationSaveStatus.textContent = "クラウドを確認中...";
  try {
    const remote = await storage.pullCloud();
    if (remote?.state) {
      appState = normalizeApplicationState(remote.state);
      renderApplicationRecords();
      elements.applicationSaveStatus.textContent = "クラウドから取得しました";
    } else {
      elements.applicationSaveStatus.textContent = "クラウドに保存データがありません";
    }
  } catch {
    elements.applicationSaveStatus.textContent = "クラウド取得に失敗 / 端末データを表示中";
  }
}

function renderApplicationRecords() {
  renderApplicationFilterOptions();
  renderApplicationSummary();
  renderApplicationHistory();
}

function renderApplicationFilterOptions() {
  const records = appState.pesticideApplications;
  const months = [...new Set(records.map((record) => record.date?.slice(0, 7)).filter(Boolean))]
    .sort((a, b) => b.localeCompare(a));
  const cropNames = [...new Set(records.map((record) => record.cropName).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, "ja"));
  applicationMonthFilter = replaceApplicationFilterOptions(
    elements.applicationMonthFilter,
    [{ value: "all", label: "全期間" }, ...months.map((month) => ({ value: month, label: formatApplicationMonth(month) }))],
    applicationMonthFilter
  );
  applicationCropFilter = replaceApplicationFilterOptions(
    elements.applicationCropFilter,
    [{ value: "all", label: "すべて" }, ...cropNames.map((cropName) => ({ value: cropName, label: cropName }))],
    applicationCropFilter
  );
}

function replaceApplicationFilterOptions(select, options, selectedValue) {
  select.replaceChildren();
  options.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.value;
    option.textContent = item.label;
    select.append(option);
  });
  const nextValue = options.some((item) => item.value === selectedValue) ? selectedValue : "all";
  select.value = nextValue;
  return nextValue;
}

function renderApplicationSummary() {
  const records = appState.pesticideApplications;
  const currentMonth = currentLocalDate().slice(0, 7);
  const monthCount = records.filter((record) => record.date?.startsWith(currentMonth)).length;
  const latest = [...records].sort(compareApplicationRecords)[0];
  elements.applicationSummary.replaceChildren(
    createApplicationSummaryCard("累計", `${records.length}回`),
    createApplicationSummaryCard("今月", `${monthCount}回`),
    createApplicationSummaryCard("最終使用", latest ? `${formatApplicationDate(latest.date)}\n${latest.productName}` : "記録なし")
  );
}

function createApplicationSummaryCard(label, value) {
  const card = document.createElement("article");
  const labelElement = document.createElement("span");
  labelElement.textContent = label;
  const valueElement = document.createElement("strong");
  valueElement.textContent = value;
  card.append(labelElement, valueElement);
  return card;
}

function renderApplicationHistory() {
  elements.applicationHistoryList.replaceChildren();
  const records = appState.pesticideApplications
    .filter((record) => applicationMonthFilter === "all" || record.date?.startsWith(applicationMonthFilter))
    .filter((record) => applicationCropFilter === "all" || record.cropName === applicationCropFilter)
    .sort(compareApplicationRecords);

  if (!records.length) {
    const empty = document.createElement("p");
    empty.className = "application-empty";
    empty.textContent = appState.pesticideApplications.length ? "条件に一致する散布記録がありません。" : "まだ散布記録がありません。";
    elements.applicationHistoryList.append(empty);
    return;
  }

  records.forEach((record) => elements.applicationHistoryList.append(createApplicationHistoryItem(record)));
}

function compareApplicationRecords(a, b) {
  return String(b.date || "").localeCompare(String(a.date || ""))
    || String(b.createdAt || "").localeCompare(String(a.createdAt || ""));
}

function createApplicationHistoryItem(record) {
  const item = document.createElement("article");
  item.className = "application-history-item";
  const icon = createCropIcon(record.cropName, "application-crop-icon");
  const body = document.createElement("div");
  const heading = document.createElement("div");
  heading.className = "application-history-item-heading";
  const title = document.createElement("strong");
  title.textContent = `${record.cropName} / ${record.productName}`;
  const date = document.createElement("time");
  date.dateTime = record.date || "";
  date.textContent = formatApplicationDate(record.date);
  heading.append(title, date);
  const details = document.createElement("p");
  details.textContent = `${record.dilution || "希釈記録なし"} / ${formatApplicationAmount(record.amount)}${record.unit || "L"}`;
  const meta = document.createElement("small");
  meta.textContent = [record.method, record.memo].filter(Boolean).join(" / ") || "メモなし";
  body.append(heading, details, meta);
  const deleteButton = document.createElement("button");
  deleteButton.className = "application-delete-button";
  deleteButton.type = "button";
  deleteButton.textContent = "削除";
  deleteButton.addEventListener("click", () => deleteApplicationRecord(record.id));
  item.append(icon, body, deleteButton);
  return item;
}

function deleteApplicationRecord(recordId) {
  if (!window.confirm("この散布記録を削除しますか？")) return;
  appState.pesticideApplications = appState.pesticideApplications.filter((record) => record.id !== recordId);
  persistApplicationState();
  renderApplicationRecords();
}

function formatApplicationDate(date) {
  const [year, month, day] = String(date || "").split("-");
  return year && month && day ? `${Number(month)}/${Number(day)}` : "日付なし";
}

function formatApplicationMonth(month) {
  const [year, monthNumber] = String(month || "").split("-");
  return year && monthNumber ? `${year}年${Number(monthNumber)}月` : month;
}

function formatApplicationAmount(amount) {
  return new Intl.NumberFormat("ja-JP", { maximumFractionDigits: 2 }).format(Number(amount) || 0);
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
