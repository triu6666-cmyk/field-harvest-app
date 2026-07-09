const storage = window.fieldHarvestStorage;

const defaultState = {
  layoutVersion: 2,
  grid: { columns: 20, rows: 5 },
  seedlings: [],
  harvests: [],
  expenses: [],
  activities: [],
  tasks: [],
  pesticideApplications: []
};

const CROP_PICKER_ITEMS = [
  { name: "トマト" },
  { name: "ミニトマト" },
  { name: "ナス" },
  { name: "きゅうり" },
  { name: "ゴーヤ" },
  { name: "ズッキーニ" },
  { name: "ピーマン" },
  { name: "赤パプリカ" },
  { name: "黄パプリカ" },
  { name: "ししとう" },
  { name: "オクラ" },
  { name: "いんげん" },
  { name: "枝豆" },
  { name: "えんどう" },
  { name: "とうもろこし" },
  { name: "かぼちゃ" },
  { name: "スイカ" },
  { name: "メロン" },
  { name: "大根" },
  { name: "かぶ" },
  { name: "にんじん" },
  { name: "じゃがいも" },
  { name: "さつまいも" },
  { name: "さといも" },
  { name: "玉ねぎ" },
  { name: "にんにく" },
  { name: "しょうが" },
  { name: "ねぎ" },
  { name: "レタス" },
  { name: "キャベツ" },
  { name: "白菜" },
  { name: "ブロッコリー" },
  { name: "ほうれん草" },
  { name: "小松菜" },
  { name: "春菊" },
  { name: "パセリ" },
  { name: "シソ" },
  { name: "アスパラ" },
  { name: "いちご" }
];

let state = loadState();
let editingSeedlingId = "";
let modalSeedlingId = "";
let copiedSeedlingTemplate = null;
let copyPlacementTemplate = null;
let pendingReceiptImage = "";
let receiptAmountCandidates = [];
let activeSide = "L";
let mapFilter = "all";
let mapPesticideRegistrationNumber = "";
let aggregateMode = "variety";
let harvestHistoryMonthFilter = "all";
let harvestHistoryCropFilter = "all";
let expenseHistoryMonthFilter = "all";
let expenseHistoryCategoryFilter = "all";
let detailSeedlingId = "";
let harvestModeUnit = "個";
let harvestModeCropFilter = "all";
let harvestModeStatusFilter = "all";
let lastHarvestModeAction = null;
let mobileNavView = "map";
let mobileNavViewBeforeHarvest = "map";
let mobileNavScrollLockUntil = 0;
let mobileNavScrollQueued = false;
let activityViewMode = "records";
let quickHarvestLocalTimer = null;
let quickHarvestRenderTimer = null;
let quickHarvestCloudTimer = null;
let quickHarvestCloudSaving = false;
let quickHarvestCloudDirty = false;

const HARVEST_MODE_UNITS = ["個", "本", "玉", "g", "kg"];
const PESTICIDE_CROP_ALIASES = {
  赤パプリカ: "パプリカ",
  黄パプリカ: "パプリカ",
  アスパラ: "アスパラガス"
};
const PESTICIDE_REFERENCE_CROPS = typeof PESTICIDE_CROP_DATA === "undefined" ? [] : PESTICIDE_CROP_DATA;

const elements = {
  columnsInput: document.querySelector("#columnsInput"),
  rowsInput: document.querySelector("#rowsInput"),
  resizeGridButton: document.querySelector("#resizeGridButton"),
  mapSection: document.querySelector(".map-section"),
  workspace: document.querySelector(".workspace"),
  fieldGrid: document.querySelector("#fieldGrid"),
  summaryText: document.querySelector("#summaryText"),
  cellSelect: document.querySelector("#cellSelect"),
  cropNameInput: document.querySelector("#cropNameInput"),
  varietyInput: document.querySelector("#varietyInput"),
  plantedDateInput: document.querySelector("#plantedDateInput"),
  seedlingMemoInput: document.querySelector("#seedlingMemoInput"),
  seedlingForm: document.querySelector("#seedlingForm"),
  seedlingSubmitButton: document.querySelector("#seedlingSubmitButton"),
  cancelSeedlingEditButton: document.querySelector("#cancelSeedlingEditButton"),
  seedlingModal: document.querySelector("#seedlingModal"),
  seedlingModalTitle: document.querySelector("#seedlingModalTitle"),
  modalSeedlingForm: document.querySelector("#modalSeedlingForm"),
  cropPicker: document.querySelector("#cropPicker"),
  modalCropNameInput: document.querySelector("#modalCropNameInput"),
  modalVarietyInput: document.querySelector("#modalVarietyInput"),
  modalPlantedDateInput: document.querySelector("#modalPlantedDateInput"),
  modalCellSelect: document.querySelector("#modalCellSelect"),
  modalSeedlingMemoInput: document.querySelector("#modalSeedlingMemoInput"),
  modalSeedlingSubmitButton: document.querySelector("#modalSeedlingSubmitButton"),
  pasteSeedlingButton: document.querySelector("#pasteSeedlingButton"),
  closeSeedlingModalButton: document.querySelector("#closeSeedlingModalButton"),
  cancelModalSeedlingButton: document.querySelector("#cancelModalSeedlingButton"),
  seedlingDetailModal: document.querySelector("#seedlingDetailModal"),
  seedlingDetailTitle: document.querySelector("#seedlingDetailTitle"),
  seedlingDetailBody: document.querySelector("#seedlingDetailBody"),
  closeSeedlingDetailButton: document.querySelector("#closeSeedlingDetailButton"),
  openHarvestModeButton: document.querySelector("#openHarvestModeButton"),
  harvestModeModal: document.querySelector("#harvestModeModal"),
  harvestModeSummary: document.querySelector("#harvestModeSummary"),
  harvestModeUnitPicker: document.querySelector("#harvestModeUnitPicker"),
  harvestModeStatusFilters: document.querySelector("#harvestModeStatusFilters"),
  harvestModeCropFilters: document.querySelector("#harvestModeCropFilters"),
  harvestModeList: document.querySelector("#harvestModeList"),
  closeHarvestModeButton: document.querySelector("#closeHarvestModeButton"),
  undoHarvestModeButton: document.querySelector("#undoHarvestModeButton"),
  syncSettingsButton: document.querySelector("#syncSettingsButton"),
  syncMiniStatus: document.querySelector("#syncMiniStatus"),
  syncModal: document.querySelector("#syncModal"),
  closeSyncModalButton: document.querySelector("#closeSyncModalButton"),
  syncStatusText: document.querySelector("#syncStatusText"),
  syncUrlInput: document.querySelector("#syncUrlInput"),
  syncAnonKeyInput: document.querySelector("#syncAnonKeyInput"),
  syncRecordIdInput: document.querySelector("#syncRecordIdInput"),
  generateSyncIdButton: document.querySelector("#generateSyncIdButton"),
  saveSyncSettingsButton: document.querySelector("#saveSyncSettingsButton"),
  testCloudButton: document.querySelector("#testCloudButton"),
  pullCloudButton: document.querySelector("#pullCloudButton"),
  pushCloudButton: document.querySelector("#pushCloudButton"),
  copySyncLinkButton: document.querySelector("#copySyncLinkButton"),
  clearSyncSettingsButton: document.querySelector("#clearSyncSettingsButton"),
  syncLinkBox: document.querySelector("#syncLinkBox"),
  syncLinkOutput: document.querySelector("#syncLinkOutput"),
  harvestSeedlingSelect: document.querySelector("#harvestSeedlingSelect"),
  harvestDateInput: document.querySelector("#harvestDateInput"),
  harvestAmountInput: document.querySelector("#harvestAmountInput"),
  harvestUnitInput: document.querySelector("#harvestUnitInput"),
  harvestMemoInput: document.querySelector("#harvestMemoInput"),
  harvestForm: document.querySelector("#harvestForm"),
  activityDateInput: document.querySelector("#activityDateInput"),
  activityTypeInput: document.querySelector("#activityTypeInput"),
  activityTargetSelect: document.querySelector("#activityTargetSelect"),
  activityMemoInput: document.querySelector("#activityMemoInput"),
  activityForm: document.querySelector("#activityForm"),
  activitySummary: document.querySelector("#activitySummary"),
  activityFocusList: document.querySelector("#activityFocusList"),
  activityList: document.querySelector("#activityList"),
  showActivityRecordsButton: document.querySelector("#showActivityRecordsButton"),
  showTaskPlannerButton: document.querySelector("#showTaskPlannerButton"),
  activityRecordsView: document.querySelector("#activityRecordsView"),
  taskPlannerView: document.querySelector("#taskPlannerView"),
  taskDateInput: document.querySelector("#taskDateInput"),
  taskTypeInput: document.querySelector("#taskTypeInput"),
  taskTargetSelect: document.querySelector("#taskTargetSelect"),
  taskMemoInput: document.querySelector("#taskMemoInput"),
  taskForm: document.querySelector("#taskForm"),
  taskSummary: document.querySelector("#taskSummary"),
  taskList: document.querySelector("#taskList"),
  taskDueBadge: document.querySelector("#taskDueBadge"),
  taskTabBadge: document.querySelector("#taskTabBadge"),
  expenseSeedlingSelect: document.querySelector("#expenseSeedlingSelect"),
  expenseDateInput: document.querySelector("#expenseDateInput"),
  expenseNameInput: document.querySelector("#expenseNameInput"),
  expenseCategoryInput: document.querySelector("#expenseCategoryInput"),
  expenseAmountInput: document.querySelector("#expenseAmountInput"),
  expenseMemoInput: document.querySelector("#expenseMemoInput"),
  receiptImageInput: document.querySelector("#receiptImageInput"),
  receiptPreview: document.querySelector("#receiptPreview"),
  receiptReadButton: document.querySelector("#receiptReadButton"),
  receiptOcrStatus: document.querySelector("#receiptOcrStatus"),
  receiptCandidateList: document.querySelector("#receiptCandidateList"),
  expenseForm: document.querySelector("#expenseForm"),
  expenseSummary: document.querySelector("#expenseSummary"),
  expenseManagerList: document.querySelector("#expenseManagerList"),
  seedlingList: document.querySelector("#seedlingList"),
  aggregateByVarietyButton: document.querySelector("#aggregateByVarietyButton"),
  aggregateByCropButton: document.querySelector("#aggregateByCropButton"),
  recentHarvestDetails: document.querySelector("#recentHarvestDetails"),
  recentHarvestCount: document.querySelector("#recentHarvestCount"),
  harvestList: document.querySelector("#harvestList"),
  expenseList: document.querySelector("#expenseList"),
  harvestMonthFilter: document.querySelector("#harvestMonthFilter"),
  harvestCropFilter: document.querySelector("#harvestCropFilter"),
  expenseMonthFilter: document.querySelector("#expenseMonthFilter"),
  expenseCategoryFilter: document.querySelector("#expenseCategoryFilter"),
  harvestSummary: document.querySelector("#harvestSummary"),
  costPerformanceSummary: document.querySelector("#costPerformanceSummary"),
  emptyStateTemplate: document.querySelector("#emptyStateTemplate"),
  exportButton: document.querySelector("#exportButton"),
  importInput: document.querySelector("#importInput"),
  mapFilterSelect: document.querySelector("#mapFilterSelect"),
  mapPesticideSelect: document.querySelector("#mapPesticideSelect"),
  pesticideMapBar: document.querySelector("#pesticideMapBar"),
  pesticideMapLegend: document.querySelector("#pesticideMapLegend"),
  pesticideMapProductName: document.querySelector("#pesticideMapProductName"),
  pesticideOkCount: document.querySelector("#pesticideOkCount"),
  pesticideCautionCount: document.querySelector("#pesticideCautionCount"),
  pesticideNgCount: document.querySelector("#pesticideNgCount"),
  pesticideUnknownCount: document.querySelector("#pesticideUnknownCount"),
  pesticideSafetySummary: document.querySelector("#pesticideSafetySummary"),
  mapSideButtons: document.querySelectorAll(".page-button"),
  mobileNavButtons: document.querySelectorAll(".mobile-nav-button")
};

const today = currentLocalDate();
elements.plantedDateInput.value = today;
elements.modalPlantedDateInput.value = today;
elements.harvestDateInput.value = today;
elements.activityDateInput.value = today;
elements.taskDateInput.value = today;
elements.expenseDateInput.value = today;
elements.expenseCategoryInput.value = "その他";
elements.columnsInput.value = state.grid.columns;
elements.rowsInput.value = state.grid.rows;
copyCropOptionsToModal();
renderCropPicker();

document.querySelectorAll(".tab-button").forEach((button) => {
  button.addEventListener("click", () => {
    activateTab(button.dataset.tab);
    if (button.dataset.tab === "expenses") {
      setMobileNavActive("expenses");
    } else if (button.dataset.tab === "activities") {
      setMobileNavActive("activities");
    } else if (button.dataset.tab === "records") {
      setMobileNavActive("records");
    } else if (button.dataset.tab === "harvests") {
      setMobileNavActive("harvest");
    }
  });
});

elements.mobileNavButtons.forEach((button) => {
  button.addEventListener("click", () => activateMobileView(button.dataset.mobileView));
});

elements.showActivityRecordsButton.addEventListener("click", () => {
  activityViewMode = "records";
  renderActivityView();
});

elements.showTaskPlannerButton.addEventListener("click", () => {
  activityViewMode = "tasks";
  renderActivityView();
});

window.addEventListener("scroll", queueMobileNavScrollSync, { passive: true });
window.addEventListener("resize", queueMobileNavScrollSync);
window.addEventListener("pagehide", () => {
  if (!quickHarvestLocalTimer) return;
  clearTimeout(quickHarvestLocalTimer);
  quickHarvestLocalTimer = null;
  storage.saveLocal(state);
});

elements.mapSideButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeSide = button.dataset.side;
    renderField();
    renderSideButtons();
  });
});

elements.resizeGridButton.addEventListener("click", () => {
  const columns = clampNumber(elements.columnsInput.value, 1, 30);
  const rows = clampNumber(elements.rowsInput.value, 1, 20);
  const previousGrid = state.grid;
  const nextGrid = { columns, rows };
  state.seedlings = state.seedlings.map((seedling) => ({
    ...seedling,
    cell: remapCellForGridResize(seedling.cell, previousGrid, nextGrid)
  }));
  state.grid = nextGrid;
  saveAndRender();
});

elements.seedlingForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const seedlingData = {
    cropName: elements.cropNameInput.value.trim(),
    variety: elements.varietyInput.value.trim(),
    plantedDate: elements.plantedDateInput.value,
    cell: elements.cellSelect.value,
    memo: elements.seedlingMemoInput.value.trim()
  };

  if (editingSeedlingId) {
    state.seedlings = state.seedlings.map((seedling) => (
      seedling.id === editingSeedlingId ? { ...seedling, ...seedlingData } : seedling
    ));
    finishSeedlingEdit();
  } else {
    const seedling = {
      id: createId("seedling"),
      ...seedlingData
    };
    state.seedlings.push(seedling);
    elements.seedlingForm.reset();
    elements.plantedDateInput.value = today;
    saveAndRender();
    const nextCell = nextAvailableCell(seedling.cell);
    if (nextCell) {
      elements.cellSelect.value = nextCell;
    }
  }
});

elements.cancelSeedlingEditButton.addEventListener("click", () => {
  finishSeedlingEdit();
});

elements.pasteSeedlingButton.addEventListener("click", () => {
  if (!copiedSeedlingTemplate) return;
  applySeedlingTemplateToModal(copiedSeedlingTemplate);
});

elements.modalSeedlingForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!elements.modalCropNameInput.value) {
    alert("野菜を選択してください。");
    return;
  }

  const seedlingData = {
    cropName: elements.modalCropNameInput.value.trim(),
    variety: elements.modalVarietyInput.value.trim(),
    plantedDate: elements.modalPlantedDateInput.value,
    cell: elements.modalCellSelect.value,
    memo: elements.modalSeedlingMemoInput.value.trim()
  };

  if (modalSeedlingId) {
    state.seedlings = state.seedlings.map((seedling) => (
      seedling.id === modalSeedlingId ? { ...seedling, ...seedlingData } : seedling
    ));
  } else {
    state.seedlings.push({
      id: createId("seedling"),
      ...seedlingData
    });
  }

  copiedSeedlingTemplate = createSeedlingTemplate(seedlingData);
  closeSeedlingModal();
  saveAndRender();
});

elements.closeSeedlingModalButton.addEventListener("click", closeSeedlingModal);
elements.cancelModalSeedlingButton.addEventListener("click", closeSeedlingModal);
elements.seedlingModal.addEventListener("click", (event) => {
  if (event.target === elements.seedlingModal) {
    closeSeedlingModal();
  }
});
elements.closeSeedlingDetailButton.addEventListener("click", closeSeedlingDetailModal);
elements.seedlingDetailModal.addEventListener("click", (event) => {
  if (event.target === elements.seedlingDetailModal) {
    closeSeedlingDetailModal();
  }
});
elements.openHarvestModeButton.addEventListener("click", openHarvestMode);
elements.closeHarvestModeButton.addEventListener("click", closeHarvestMode);
elements.undoHarvestModeButton.addEventListener("click", undoLastHarvestModeAction);
elements.harvestModeModal.addEventListener("click", (event) => {
  if (event.target === elements.harvestModeModal) {
    closeHarvestMode();
  }
});

elements.syncSettingsButton.addEventListener("click", openSyncModal);
elements.closeSyncModalButton.addEventListener("click", closeSyncModal);
elements.syncModal.addEventListener("click", (event) => {
  if (event.target === elements.syncModal) {
    closeSyncModal();
  }
});

elements.saveSyncSettingsButton.addEventListener("click", () => {
  storage.saveSettings({
    url: elements.syncUrlInput.value,
    anonKey: elements.syncAnonKeyInput.value,
    recordId: elements.syncRecordIdInput.value
  });
  renderSyncSettings();
  renderSyncMiniStatus("同期設定済み", "ok");
  renderSyncStatus("同期設定を保存しました。次の保存からクラウドにも送ります。");
});

elements.generateSyncIdButton.addEventListener("click", () => {
  elements.syncRecordIdInput.value = createSyncRecordId();
  renderSyncStatus("共有データIDを生成しました。PCとスマホで同じIDを使ってください。");
});

elements.clearSyncSettingsButton.addEventListener("click", () => {
  storage.clearSettings();
  renderSyncSettings();
  renderSyncLink("");
  renderSyncMiniStatus("ローカル", "idle");
  renderSyncStatus("同期設定を削除しました。この端末内だけに保存します。");
});

elements.testCloudButton.addEventListener("click", async () => {
  storage.saveSettings({
    url: elements.syncUrlInput.value,
    anonKey: elements.syncAnonKeyInput.value,
    recordId: elements.syncRecordIdInput.value
  });
  await runCloudAction("接続を確認中です...", async () => {
    await storage.testCloudConnection();
    renderSyncStatus("Supabaseへ接続できました。クラウド保存を試せます。");
  });
});

elements.pushCloudButton.addEventListener("click", async () => {
  await runCloudAction("クラウドへ保存中です...", async () => {
    await storage.pushCloud(state);
    renderSyncStatus("現在のデータをクラウドへ保存しました。");
  });
});

elements.copySyncLinkButton.addEventListener("click", async () => {
  storage.saveSettings({
    url: elements.syncUrlInput.value,
    anonKey: elements.syncAnonKeyInput.value,
    recordId: elements.syncRecordIdInput.value
  });

  try {
    const link = createSyncSetupLink();
    renderSyncLink(link);
    await copyTextToClipboard(link);
    renderSyncStatus("同期設定リンクをコピーしました。スマホで開くと同じ設定を取り込めます。");
  } catch (error) {
    renderSyncLink("");
    renderSyncStatus(error.message || "同期設定リンクを作成できませんでした。");
  }
});

[elements.syncUrlInput, elements.syncAnonKeyInput, elements.syncRecordIdInput].forEach((input) => {
  input.addEventListener("input", () => renderSyncLink(""));
});

elements.pullCloudButton.addEventListener("click", async () => {
  await runCloudAction("クラウドから取得中です...", async () => {
    const remote = await storage.pullCloud();
    if (!remote) {
      renderSyncStatus("クラウドにデータがまだありません。先にクラウドへ保存してください。");
      return;
    }

    state = normalizeState(remote.state);
    render();
    renderSyncMiniStatus("取得済み", "ok");
    renderSyncStatus(`クラウドから取得しました。更新: ${formatSyncDate(remote.updatedAt)}`);
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !elements.syncModal.classList.contains("hidden")) {
    closeSyncModal();
  } else if (event.key === "Escape" && !elements.harvestModeModal.classList.contains("hidden")) {
    closeHarvestMode();
  } else if (event.key === "Escape" && !elements.seedlingDetailModal.classList.contains("hidden")) {
    closeSeedlingDetailModal();
  } else if (event.key === "Escape" && !elements.seedlingModal.classList.contains("hidden")) {
    closeSeedlingModal();
  } else if (event.key === "Escape" && copyPlacementTemplate) {
    cancelCopyPlacement();
  }
});

elements.mapFilterSelect.addEventListener("change", () => {
  mapFilter = elements.mapFilterSelect.value;
  renderField();
});

elements.mapPesticideSelect.addEventListener("change", () => {
  mapPesticideRegistrationNumber = elements.mapPesticideSelect.value;
  renderField();
});

elements.aggregateByVarietyButton.addEventListener("click", () => {
  aggregateMode = "variety";
  renderSeedlingList();
  renderAggregateTabs();
});

elements.aggregateByCropButton.addEventListener("click", () => {
  aggregateMode = "crop";
  renderSeedlingList();
  renderAggregateTabs();
});

elements.harvestMonthFilter.addEventListener("change", () => {
  harvestHistoryMonthFilter = elements.harvestMonthFilter.value;
  renderHarvestList();
});

elements.harvestCropFilter.addEventListener("change", () => {
  harvestHistoryCropFilter = elements.harvestCropFilter.value;
  renderHarvestList();
});

elements.recentHarvestDetails.addEventListener("toggle", () => {
  if (elements.recentHarvestDetails.open) {
    renderHarvestList();
  } else {
    elements.harvestList.replaceChildren();
  }
});

elements.expenseMonthFilter.addEventListener("change", () => {
  expenseHistoryMonthFilter = elements.expenseMonthFilter.value;
  renderExpenseList();
});

elements.expenseCategoryFilter.addEventListener("change", () => {
  expenseHistoryCategoryFilter = elements.expenseCategoryFilter.value;
  renderExpenseList();
});

elements.receiptImageInput.addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  receiptAmountCandidates = [];
  renderReceiptAmountCandidates();
  if (!file) {
    pendingReceiptImage = "";
    renderReceiptPreview();
    renderReceiptOcrStatus("レシート画像を選ぶと読み取りできます。");
    return;
  }

  pendingReceiptImage = await resizeReceiptImage(file);
  renderReceiptPreview();
  renderReceiptOcrStatus("画像を保存予定です。必要なら合計金額を読み取れます。");
});

elements.receiptReadButton.addEventListener("click", async () => {
  if (!pendingReceiptImage) return;

  renderReceiptOcrStatus("読み取り中です...");
  elements.receiptReadButton.disabled = true;

  try {
    const detectedText = await detectReceiptText(pendingReceiptImage);
    receiptAmountCandidates = extractReceiptAmountCandidates(detectedText);
    renderReceiptAmountCandidates(receiptAmountCandidates);
    const amount = receiptAmountCandidates[0]?.amount || 0;
    if (!amount) {
      renderReceiptOcrStatus("合計金額を見つけられませんでした。金額欄へ手入力してください。");
      return;
    }

    elements.expenseAmountInput.value = String(amount);
    const suffix = receiptAmountCandidates.length > 1 ? "候補が違う場合は下の金額を押してください。" : "確認して登録してください。";
    renderReceiptOcrStatus(`候補 ${formatNumber(amount)}円 を金額欄に入れました。${suffix}`);
  } catch (error) {
    renderReceiptOcrStatus(error.message || "読み取りに失敗しました。金額欄へ手入力してください。");
  } finally {
    elements.receiptReadButton.disabled = !pendingReceiptImage;
  }
});

elements.receiptCandidateList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-receipt-amount]");
  if (!button) return;

  const amount = Number(button.dataset.receiptAmount);
  if (!amount) return;

  elements.expenseAmountInput.value = String(amount);
  renderReceiptOcrStatus(`${formatNumber(amount)}円 を金額欄に入れました。確認して登録してください。`);
});

elements.harvestForm.addEventListener("submit", (event) => {
  event.preventDefault();
  addHarvest({
    seedlingId: elements.harvestSeedlingSelect.value,
    date: elements.harvestDateInput.value,
    amount: Number(elements.harvestAmountInput.value),
    unit: elements.harvestUnitInput.value,
    memo: elements.harvestMemoInput.value.trim()
  });
  elements.harvestForm.reset();
  elements.harvestDateInput.value = today;
  elements.harvestUnitInput.value = "個";
});

elements.activityForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const seedling = findSeedling(elements.activityTargetSelect.value);
  state.activities.push({
    id: createId("activity"),
    date: elements.activityDateInput.value,
    type: elements.activityTypeInput.value,
    seedlingId: seedling?.id || "",
    targetLabel: seedling ? seedlingLabel(seedling) : "畑全体",
    memo: elements.activityMemoInput.value.trim(),
    createdAt: new Date().toISOString()
  });
  elements.activityForm.reset();
  elements.activityDateInput.value = today;
  elements.activityTypeInput.value = "水やり";
  saveAndRender();
  activateTab("activities");
});

elements.taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const seedling = findSeedling(elements.taskTargetSelect.value);
  state.tasks.push({
    id: createId("task"),
    date: elements.taskDateInput.value,
    type: elements.taskTypeInput.value,
    seedlingId: seedling?.id || "",
    targetLabel: seedling ? seedlingLabel(seedling) : "畑全体",
    memo: elements.taskMemoInput.value.trim(),
    completed: false,
    completedAt: "",
    createdAt: new Date().toISOString()
  });
  elements.taskForm.reset();
  elements.taskDateInput.value = today;
  elements.taskTypeInput.value = "水やり";
  activityViewMode = "tasks";
  saveAndRender();
  activateTab("activities");
});

elements.expenseForm.addEventListener("submit", (event) => {
  event.preventDefault();
  state.expenses.push({
    id: createId("expense"),
    seedlingId: "",
    date: elements.expenseDateInput.value,
    name: elements.expenseNameInput.value.trim() || "費用",
    category: elements.expenseCategoryInput.value,
    amount: Number(elements.expenseAmountInput.value),
    memo: elements.expenseMemoInput.value.trim(),
    source: pendingReceiptImage ? "receipt" : "manual",
    receiptImage: pendingReceiptImage,
    createdAt: new Date().toISOString()
  });
  elements.expenseForm.reset();
  pendingReceiptImage = "";
  renderReceiptPreview();
  renderReceiptOcrStatus("レシート画像を選ぶと読み取りできます。");
  elements.expenseDateInput.value = today;
  elements.expenseCategoryInput.value = "その他";
  saveAndRender();
});

elements.exportButton.addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `harvest-records-${today}.json`;
  link.click();
  URL.revokeObjectURL(url);
});

elements.importInput.addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  try {
    const imported = JSON.parse(await file.text());
    state = normalizeState(imported);
    saveAndRender();
  } catch {
    alert("読み込めないファイルです。");
  } finally {
    elements.importInput.value = "";
  }
});

function render() {
  elements.columnsInput.value = state.grid.columns;
  elements.rowsInput.value = state.grid.rows;
  renderMapFilterOptions();
  renderMapPesticideOptions();
  renderCellOptions();
  renderModalCellOptions();
  renderSeedlingOptions();
  renderActivityTargetOptions();
  renderField();
  renderSideButtons();
  renderRecords();
  renderExpenseDashboard();
  renderExpenseManagerList();
  renderActivitySummary();
  renderActivityFocusList();
  renderActivityList();
  renderTaskSummary();
  renderTaskList();
  renderTaskBadges();
  renderActivityView();
  renderSummary();
  if (!elements.harvestModeModal.classList.contains("hidden")) {
    renderHarvestMode();
  }
}

function renderCellOptions() {
  const occupiedCells = new Set(state.seedlings.map((seedling) => seedling.cell));
  const editingSeedling = findSeedling(editingSeedlingId);
  elements.cellSelect.replaceChildren();

  getCells().forEach((cell) => {
    const isCurrentEditingCell = editingSeedling?.cell === cell;
    const isOccupied = occupiedCells.has(cell) && !isCurrentEditingCell;
    const option = document.createElement("option");
    option.value = cell;
    option.textContent = isOccupied ? `${cellDisplayName(cell)} 使用中` : cellDisplayName(cell);
    option.disabled = isOccupied;
    elements.cellSelect.append(option);
  });
}

function renderSeedlingOptions() {
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = state.seedlings.length ? "苗を選択" : "先に苗を登録";
  placeholder.disabled = true;
  placeholder.selected = true;

  elements.harvestSeedlingSelect.replaceChildren(placeholder.cloneNode(true));
  elements.expenseSeedlingSelect.replaceChildren();

  const allExpenseOption = document.createElement("option");
  allExpenseOption.value = "";
  allExpenseOption.textContent = "畑全体";
  elements.expenseSeedlingSelect.append(allExpenseOption);

  state.seedlings.forEach((seedling) => {
    const option = document.createElement("option");
    option.value = seedling.id;
    option.textContent = seedlingLabel(seedling);
    elements.harvestSeedlingSelect.append(option.cloneNode(true));
    elements.expenseSeedlingSelect.append(option);
  });
}

function renderActivityTargetOptions() {
  populateWorkTargetSelect(elements.activityTargetSelect);
  populateWorkTargetSelect(elements.taskTargetSelect);
}

function populateWorkTargetSelect(select) {
  const selectedValue = select.value;
  select.replaceChildren();

  const fieldOption = document.createElement("option");
  fieldOption.value = "";
  fieldOption.textContent = "畑全体";
  select.append(fieldOption);

  state.seedlings.forEach((seedling) => {
    const option = document.createElement("option");
    option.value = seedling.id;
    option.textContent = seedlingLabel(seedling);
    select.append(option);
  });

  if ([...select.options].some((option) => option.value === selectedValue)) {
    select.value = selectedValue;
  }
}

function renderField() {
  elements.fieldGrid.replaceChildren();
  renderMapPesticideSummary();
  renderPesticideSafetySummary();
  const seedlingsByCell = new Map(state.seedlings.map((seedling) => [seedling.cell, seedling]));
  const harvestCountsBySeedling = state.harvests.reduce((counts, harvest) => {
    if (harvest.unit === "個") {
      counts.set(harvest.seedlingId, (counts.get(harvest.seedlingId) || 0) + harvest.amount);
    }
    return counts;
  }, new Map());

  const title = document.createElement("div");
  title.className = "field-page-title";
  title.textContent = activeSide === "L" ? "左ページ" : "右ページ";
  elements.fieldGrid.append(title);

  if (copyPlacementTemplate) {
    elements.fieldGrid.append(createCopyModeBanner());
  }

  elements.fieldGrid.append(createColumnGuide());

  for (let row = 1; row <= state.grid.rows; row += 1) {
    const fieldRow = document.createElement("div");
    fieldRow.className = "field-row";

    const rowLabel = document.createElement("div");
    rowLabel.className = "row-label";
    rowLabel.textContent = `${row}段`;

    const cells = document.createElement("div");
    cells.className = "compact-cells";
    cells.style.setProperty("--segments", state.grid.columns);

    for (let segment = 1; segment <= state.grid.columns; segment += 1) {
      const cell = cellId(row, activeSide, segment);
      const seedling = seedlingsByCell.get(cell);
      cells.append(createFieldCell(cell, seedling, seedling ? harvestCountsBySeedling.get(seedling.id) || 0 : 0));
    }

    fieldRow.append(rowLabel, cells);
    elements.fieldGrid.append(fieldRow);
  }
}

function createColumnGuide() {
  const guide = document.createElement("div");
  guide.className = "field-column-guide";

  const label = document.createElement("div");
  label.className = "column-guide-label";
  label.textContent = "列";

  const numbers = document.createElement("div");
  numbers.className = "column-guide-cells";
  numbers.style.setProperty("--segments", state.grid.columns);

  for (let segment = 1; segment <= state.grid.columns; segment += 1) {
    const number = document.createElement("div");
    number.className = "column-number";
    number.textContent = displaySegmentNumber(segment);
    numbers.append(number);
  }

  guide.append(label, numbers);
  return guide;
}

function createCopyModeBanner() {
  const banner = document.createElement("div");
  banner.className = "copy-mode-banner";
  applyCropTheme(banner, copyPlacementTemplate.cropName);

  const text = document.createElement("div");
  text.className = "copy-mode-text";
  const cropName = document.createElement("strong");
  cropName.textContent = copyPlacementTemplate.cropName;
  text.append(cropName, "を複製中。空き区画の「置く」を押すと、そのまま登録します。");

  const cancelButton = document.createElement("button");
  cancelButton.className = "copy-mode-cancel";
  cancelButton.type = "button";
  cancelButton.textContent = "終了";
  cancelButton.addEventListener("click", cancelCopyPlacement);

  banner.append(text, cancelButton);
  return banner;
}

function renderModalCellOptions() {
  const occupiedCells = new Set(state.seedlings.map((seedling) => seedling.cell));
  const editingSeedling = findSeedling(modalSeedlingId);
  const selectedCell = elements.modalCellSelect.value;
  elements.modalCellSelect.replaceChildren();

  getCells().forEach((cell) => {
    const isCurrentEditingCell = editingSeedling?.cell === cell;
    const isOccupied = occupiedCells.has(cell) && !isCurrentEditingCell;
    const option = document.createElement("option");
    option.value = cell;
    option.textContent = isOccupied ? `${cellDisplayName(cell)} 使用中` : cellDisplayName(cell);
    option.disabled = isOccupied;
    elements.modalCellSelect.append(option);
  });

  if (selectedCell && [...elements.modalCellSelect.options].some((option) => option.value === selectedCell && !option.disabled)) {
    elements.modalCellSelect.value = selectedCell;
  }
}

function renderMapFilterOptions() {
  const selectedValue = mapFilter;
  elements.mapFilterSelect.replaceChildren();

  const options = [
    { value: "all", label: "全部" },
    { value: "planted", label: "植えてある区画だけ" },
    ...uniqueCropNames().map((cropName) => ({
      value: `crop:${cropName}`,
      label: `${cropName}だけ`
    }))
  ];

  options.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.value;
    option.textContent = item.label;
    elements.mapFilterSelect.append(option);
  });

  elements.mapFilterSelect.value = options.some((item) => item.value === selectedValue) ? selectedValue : "all";
  mapFilter = elements.mapFilterSelect.value;
}

function mapPesticideProducts() {
  const products = new Map();
  PESTICIDE_REFERENCE_CROPS.forEach((crop) => {
    crop.products.forEach((product) => {
      if (!products.has(product.registrationNumber)) {
        products.set(product.registrationNumber, product.productName);
      }
    });
  });
  return [...products.entries()].map(([registrationNumber, productName]) => ({
    registrationNumber,
    productName
  }));
}

function renderMapPesticideOptions() {
  const selectedValue = mapPesticideRegistrationNumber;
  elements.mapPesticideSelect.replaceChildren();
  const offOption = document.createElement("option");
  offOption.value = "";
  offOption.textContent = "表示しない";
  elements.mapPesticideSelect.append(offOption);
  mapPesticideProducts().forEach((product) => {
    const option = document.createElement("option");
    option.value = product.registrationNumber;
    option.textContent = product.productName;
    elements.mapPesticideSelect.append(option);
  });
  elements.mapPesticideSelect.value = mapPesticideProducts()
    .some((product) => product.registrationNumber === selectedValue) ? selectedValue : "";
  mapPesticideRegistrationNumber = elements.mapPesticideSelect.value;
}

function pesticideCompatibilityForCrop(cropName) {
  if (!mapPesticideRegistrationNumber) return null;
  const referenceName = pesticideReferenceCropName(cropName);
  const crop = PESTICIDE_REFERENCE_CROPS.find((item) => item.name === referenceName);
  const product = crop?.products.find((item) => item.registrationNumber === mapPesticideRegistrationNumber);
  if (!product) {
    return { status: "unknown", label: "未確認", detail: "対応表に作物情報がありません" };
  }
  if (product.status === "registered") {
    return { status: "ok", label: "OK", detail: product.useTiming || "登録あり", product };
  }
  if (product.status === "conditional") {
    return { status: "caution", label: "確認", detail: product.useTiming || "条件付き", product };
  }
  if (["not-registered", "expired", "prohibited"].includes(product.status)) {
    return { status: "ng", label: "NG", detail: product.statusDetail || "登録なし", product };
  }
  return { status: "unknown", label: "未確認", detail: product.statusDetail || "登録状況未確認", product };
}

function renderMapPesticideSummary() {
  const active = Boolean(mapPesticideRegistrationNumber);
  elements.pesticideMapBar.classList.toggle("active", active);
  elements.pesticideMapLegend.classList.toggle("hidden", !active);
  if (!active) return;

  const selectedProduct = mapPesticideProducts()
    .find((product) => product.registrationNumber === mapPesticideRegistrationNumber);
  const counts = { ok: 0, caution: 0, ng: 0, unknown: 0 };
  state.seedlings.forEach((seedling) => {
    const compatibility = pesticideCompatibilityForCrop(seedling.cropName);
    counts[compatibility?.status || "unknown"] += 1;
  });
  elements.pesticideMapProductName.textContent = selectedProduct?.productName || "農薬";
  elements.pesticideOkCount.textContent = counts.ok;
  elements.pesticideCautionCount.textContent = counts.caution;
  elements.pesticideNgCount.textContent = counts.ng;
  elements.pesticideUnknownCount.textContent = counts.unknown;
}

function applyPesticideCompatibilityToCell(tile, seedling) {
  const compatibility = pesticideCompatibilityForCrop(seedling.cropName);
  if (!compatibility) return;
  tile.classList.add("pesticide-mode", `pesticide-status-${compatibility.status}`);
  tile.title = `${seedlingLabel(seedling)} / 農薬判定 ${compatibility.label}：${compatibility.detail}`;
  const badge = document.createElement("span");
  badge.className = `pesticide-cell-badge ${compatibility.status}`;
  badge.textContent = compatibility.label;
  badge.title = compatibility.detail;
  tile.append(badge);
}

function renderPesticideSafetySummary() {
  if (!elements.pesticideSafetySummary) return;

  const summaries = state.seedlings
    .map((seedling) => ({ seedling, safety: pesticideSafetyForSeedling(seedling) }))
    .filter((item) => item.safety);
  const waiting = summaries.filter((item) => item.safety.status === "wait");
  const recent = summaries.filter((item) => item.safety.status === "done");

  elements.pesticideSafetySummary.classList.toggle("hidden", !summaries.length);
  elements.pesticideSafetySummary.classList.toggle("alert", Boolean(waiting.length));
  if (!summaries.length) {
    elements.pesticideSafetySummary.textContent = "";
    return;
  }

  if (waiting.length) {
    const examples = waiting.slice(0, 2)
      .map(({ seedling, safety }) => `${compactCropName(seedling.cropName)} ${formatMonthDay(safety.availableDate)}から`)
      .join(" / ");
    elements.pesticideSafetySummary.textContent = `収穫注意 ${waiting.length}区画：${examples}`;
    return;
  }

  elements.pesticideSafetySummary.textContent = `最近の散布 ${recent.length}区画：収穫制限は経過目安`;
}

function applyPesticideSafetyToCell(tile, seedling) {
  const safety = pesticideSafetyForSeedling(seedling);
  if (!safety) return;

  tile.classList.add("pesticide-safety-marked", `pesticide-safety-${safety.status}`);
  tile.title = [tile.title, safety.detail].filter(Boolean).join(" / ");

  const badge = document.createElement("span");
  badge.className = `pesticide-safety-cell-badge ${safety.status}`;
  badge.textContent = safety.label;
  badge.title = safety.detail;
  tile.append(badge);
}

function pesticideSafetyForSeedling(seedling) {
  const entries = state.pesticideApplications
    .filter((record) => pesticideApplicationMatchesSeedling(record, seedling))
    .map((record) => pesticideSafetyEntryForRecord(record, seedling))
    .filter(Boolean)
    .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));

  if (!entries.length) return null;

  const waiting = entries
    .filter((entry) => entry.remainingDays > 0)
    .sort((a, b) => b.remainingDays - a.remainingDays || String(b.date || "").localeCompare(String(a.date || "")))[0];
  if (waiting) {
    return {
      status: "wait",
      label: "待",
      availableDate: waiting.availableDate,
      detail: `${waiting.productName}を${formatMonthDay(waiting.date)}散布。${formatMonthDay(waiting.availableDate)}から収穫目安`
    };
  }

  const latest = entries[0];
  if (latest.daysSince > 45) return null;
  return {
    status: "done",
    label: "薬",
    availableDate: latest.availableDate,
    detail: `${latest.productName}を${formatMonthDay(latest.date)}散布。収穫制限は経過目安`
  };
}

function pesticideApplicationMatchesSeedling(record, seedling) {
  const referenceName = pesticideReferenceCropName(seedling.cropName);
  return pesticideApplicationCropNames(record)
    .some((cropName) => pesticideReferenceCropName(cropName) === referenceName);
}

function pesticideSafetyEntryForRecord(record, seedling) {
  const rule = pesticideApplicationRuleForSeedling(record, seedling);
  const waitDays = parsePreHarvestWaitDays(rule?.useTiming || record.useTiming);
  if (waitDays === null || !record.date) return null;

  const daysSince = daysBetweenDates(record.date, today);
  if (daysSince === null) return null;
  const availableDate = addDaysToDate(record.date, waitDays);
  return {
    date: record.date,
    productName: record.productName || "農薬",
    waitDays,
    daysSince,
    remainingDays: waitDays - daysSince,
    availableDate
  };
}

function pesticideApplicationRuleForSeedling(record, seedling) {
  const referenceName = pesticideReferenceCropName(seedling.cropName);
  return (Array.isArray(record.cropRules) ? record.cropRules : [])
    .find((rule) => pesticideReferenceCropName(rule.cropName) === referenceName);
}

function pesticideApplicationCropNames(record) {
  if (Array.isArray(record?.cropNames) && record.cropNames.length) return record.cropNames;
  return record?.cropName ? [record.cropName] : [];
}

function pesticideReferenceCropName(cropName) {
  return PESTICIDE_CROP_ALIASES[cropName] || cropName;
}

function parsePreHarvestWaitDays(useTiming) {
  const text = String(useTiming || "");
  if (!text) return null;
  if (text.includes("収穫当日まで") || text.includes("当日まで")) return 0;
  if (text.includes("収穫前日まで") || text.includes("前日まで")) return 1;
  const match = text.match(/(\d+)\s*日前まで/);
  return match ? Number(match[1]) : null;
}

function daysBetweenDates(startDate, endDate) {
  const start = localDateToUtcMs(startDate);
  const end = localDateToUtcMs(endDate);
  if (start === null || end === null) return null;
  return Math.floor((end - start) / 86400000);
}

function addDaysToDate(dateString, days) {
  const date = parseLocalDateParts(dateString);
  if (!date) return dateString;
  const utcDate = new Date(Date.UTC(date.year, date.month - 1, date.day + days));
  return [
    utcDate.getUTCFullYear(),
    String(utcDate.getUTCMonth() + 1).padStart(2, "0"),
    String(utcDate.getUTCDate()).padStart(2, "0")
  ].join("-");
}

function localDateToUtcMs(dateString) {
  const date = parseLocalDateParts(dateString);
  return date ? Date.UTC(date.year, date.month - 1, date.day) : null;
}

function parseLocalDateParts(dateString) {
  const match = String(dateString || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3])
  };
}

function createFieldCell(cell, seedling, harvestCount) {
  const visibleByFilter = isCellVisibleByFilter(seedling);
  const tile = document.createElement("article");
  tile.className = seedling ? "field-cell planted" : "field-cell";
  tile.classList.toggle("copy-target", !seedling && Boolean(copyPlacementTemplate));
  tile.classList.toggle("filtered-out", !visibleByFilter);
  if (seedling) {
    applyCropTheme(tile, seedling.cropName);
    applyPesticideCompatibilityToCell(tile, seedling);
    applyPesticideSafetyToCell(tile, seedling);
  }

  const code = document.createElement("div");
  code.className = "cell-code";
  code.textContent = cellShortName(cell);
  tile.append(code);

  const content = document.createElement("div");
  if (seedling) {
    content.className = "cell-planted-content";

    const name = document.createElement("div");
    name.className = "plant-name";
    name.textContent = compactCropName(seedling.cropName);
    name.title = seedlingLabel(seedling);
    content.append(name);

    if (seedling.variety) {
      const variety = document.createElement("div");
      variety.className = "plant-variety";
      variety.textContent = compactVarietyName(seedling.variety);
      variety.title = seedling.variety;
      content.append(variety);
    }

    const count = document.createElement("div");
    count.className = "harvest-count";
    const countValue = document.createElement("span");
    countValue.className = "harvest-count-value";
    countValue.dataset.harvestCountSeedlingId = seedling.id;
    countValue.textContent = formatNumber(harvestCount);

    const countUnit = document.createElement("span");
    countUnit.className = "harvest-count-unit";
    countUnit.textContent = "個";

    count.append(countValue, countUnit);
    content.append(count);
  } else {
    content.className = "cell-empty";
  }
  tile.append(content);

  if (seedling) {
    const actionRow = document.createElement("div");
    actionRow.className = "harvest-actions";
    actionRow.addEventListener("click", (event) => event.stopPropagation());
    actionRow.addEventListener("keydown", (event) => event.stopPropagation());

    const copyButton = document.createElement("button");
    copyButton.className = "cell-copy-button";
    copyButton.type = "button";
    copyButton.textContent = "複";
    copyButton.setAttribute("aria-label", `${seedlingLabel(seedling)}をコピーして登録`);
    copyButton.title = "この苗をコピーして空き区画に置く";
    copyButton.addEventListener("click", () => {
      startCopyPlacement(seedling);
    });
    tile.append(copyButton);

    const editButton = document.createElement("button");
    editButton.className = "cell-edit-button";
    editButton.type = "button";
    editButton.textContent = "編";
    editButton.setAttribute("aria-label", `${seedlingLabel(seedling)}を編集`);
    editButton.title = "この苗の情報を編集";
    editButton.addEventListener("click", () => {
      openSeedlingModal({ seedling });
    });
    tile.append(editButton);

    const deleteButton = document.createElement("button");
    deleteButton.className = "cell-delete-button";
    deleteButton.type = "button";
    deleteButton.setAttribute("aria-label", "この区画の苗を削除");
    deleteButton.title = "この区画の苗を削除";
    deleteButton.addEventListener("click", () => {
      if (confirm(`${seedlingLabel(seedling)}を削除しますか？\nこの苗の収穫記録も削除されます。`)) {
        deleteSeedling(seedling.id);
      }
    });
    tile.append(deleteButton);

    const decrementButton = document.createElement("button");
    decrementButton.className = "quick-button undo-button";
    decrementButton.type = "button";
    decrementButton.textContent = "-1";
    decrementButton.title = "最新の収穫を1個取り消し";
    decrementButton.addEventListener("click", () => {
      undoLatestHarvestUnit(seedling.id, "個", {
        quick: true,
        memo: "畑マップから追加",
        date: today
      });
    });

    const incrementButton = document.createElement("button");
    incrementButton.className = "quick-button";
    incrementButton.type = "button";
    incrementButton.textContent = "+1";
    incrementButton.title = "今日の収穫を1個追加";
    incrementButton.addEventListener("click", () => {
      addHarvest({
        seedlingId: seedling.id,
        date: today,
        amount: 1,
        unit: "個",
        memo: "畑マップから追加"
      }, { quick: true });
    });
    actionRow.append(decrementButton, incrementButton);
    content.append(actionRow);
  } else {
    const emptyAction = document.createElement("button");
    emptyAction.className = copyPlacementTemplate ? "quick-button place-copy-button" : "quick-button";
    emptyAction.type = "button";
    emptyAction.textContent = copyPlacementTemplate ? "置く" : "+";
    emptyAction.title = copyPlacementTemplate ? `${cellDisplayName(cell)}にコピーを配置` : `${cellDisplayName(cell)}に登録`;
    if (copyPlacementTemplate) {
      emptyAction.setAttribute("aria-label", `${cellDisplayName(cell)}にここへ置く`);
    }
    emptyAction.addEventListener("click", () => {
      if (copyPlacementTemplate) {
        placeCopiedSeedling(cell);
      } else {
        openSeedlingModal({ cell });
      }
    });
    content.append(emptyAction);
  }

  return tile;
}

function isCellVisibleByFilter(seedling) {
  if (mapFilter === "all") return true;
  if (mapFilter === "planted") return Boolean(seedling);
  if (mapFilter.startsWith("crop:")) {
    return seedling?.cropName === mapFilter.slice(5);
  }
  return true;
}

function createQuickHarvest(seedling) {
  const wrapper = document.createElement("div");
  wrapper.className = "cell-actions";

  const input = document.createElement("input");
  input.className = "quick-input";
  input.type = "number";
  input.min = "0";
  input.step = "0.1";
  input.value = "1";
  input.ariaLabel = `${seedlingLabel(seedling)}の収穫量`;

  const button = document.createElement("button");
  button.className = "quick-button";
  button.type = "button";
  button.textContent = "+";
  button.title = "今日の収穫を追加";
  button.addEventListener("click", () => {
    const amount = Number(input.value);
    if (!amount) return;
    addHarvest({
      seedlingId: seedling.id,
      date: today,
      amount,
      unit: "個",
      memo: "畑マップから追加"
    }, { quick: true });
  });

  wrapper.append(input, button);
  return wrapper;
}

function renderRecords() {
  renderHarvestSummary();
  renderCostPerformanceSummary();
  renderAggregateTabs();
  renderSeedlingList();
  renderHistoryFilterOptions();
  elements.recentHarvestCount.textContent = `${state.harvests.length}件`;
  if (elements.recentHarvestDetails.open) renderHarvestList();
  renderExpenseList();
}

function renderAggregateTabs() {
  elements.aggregateByVarietyButton.classList.toggle("active", aggregateMode === "variety");
  elements.aggregateByCropButton.classList.toggle("active", aggregateMode === "crop");
}

function renderHarvestSummary() {
  elements.harvestSummary.replaceChildren();

  if (!state.harvests.length) {
    appendEmpty(elements.harvestSummary);
    return;
  }

  const currentMonth = today.slice(0, 7);
  const todayTotals = harvestTotalsForPeriod((harvest) => harvest.date === today);
  const monthTotals = harvestTotalsForPeriod((harvest) => harvest.date?.startsWith(currentMonth));
  const allTotals = harvestTotalsForPeriod(() => true);

  elements.harvestSummary.append(
    createSummaryCard("今日", todayTotals || "収穫なし"),
    createSummaryCard("今月", monthTotals || "収穫なし"),
    createSummaryCard("累計", allTotals || "収穫なし"),
    createHarvestChartPanel(
      "今月の野菜別ランキング",
      harvestCropChartRows((harvest) => harvest.date?.startsWith(currentMonth))
    ),
    createHarvestChartPanel(
      "直近7日の推移",
      harvestDailyChartRows(7),
      "日別の収穫記録がありません"
    )
  );
}

function renderCostPerformanceSummary() {
  elements.costPerformanceSummary.replaceChildren();

  const totalExpense = expenseTotalForPeriod(() => true);
  const rows = costPerformanceRows();
  if (!rows.length && !totalExpense) {
    appendEmptyMessage(elements.costPerformanceSummary, "収穫と費用が入ると比較できます。");
    return;
  }

  const totalPieces = rows.reduce((sum, row) => sum + row.amount, 0);
  elements.costPerformanceSummary.append(
    createSummaryCard("費用合計", `${formatNumber(totalExpense)}円`),
    createSummaryCard("個数収穫", totalPieces ? `${formatNumber(totalPieces)}個` : "記録なし"),
    createSummaryCard("1個あたり目安", totalPieces ? `${formatNumber(totalExpense / totalPieces)}円` : "計算なし")
  );

  if (!rows.length) {
    appendEmptyMessage(elements.costPerformanceSummary, "個数での収穫記録が入ると、野菜別の目安コストを表示します。");
    return;
  }

  elements.costPerformanceSummary.append(createCostPerformanceTable(rows, totalExpense, totalPieces));
}

function costPerformanceRows() {
  const groups = new Map();
  state.harvests
    .filter((harvest) => harvest.unit === "個")
    .forEach((harvest) => {
      const seedling = findSeedling(harvest.seedlingId);
      const cropName = seedling?.cropName || "削除済み";
      const group = groups.get(cropName) || { cropName, amount: 0, seedlingIds: new Set() };
      group.amount += Number(harvest.amount || 0);
      if (seedling?.id) group.seedlingIds.add(seedling.id);
      groups.set(cropName, group);
    });

  return [...groups.values()]
    .filter((row) => row.amount > 0)
    .sort((a, b) => b.amount - a.amount || a.cropName.localeCompare(b.cropName, "ja"));
}

function createCostPerformanceTable(rows, totalExpense, totalPieces) {
  const wrapper = document.createElement("div");
  wrapper.className = "cost-performance-table-wrap";
  const table = document.createElement("table");
  table.className = "cost-performance-table";

  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  ["野菜", "収穫数", "目安費用", "1個あたり"].forEach((label) => {
    const th = document.createElement("th");
    th.textContent = label;
    headerRow.append(th);
  });
  thead.append(headerRow);

  const tbody = document.createElement("tbody");
  rows.slice(0, 12).forEach((row) => {
    const estimatedExpense = totalPieces ? totalExpense * (row.amount / totalPieces) : 0;
    const tr = document.createElement("tr");
    applyCropTheme(tr, row.cropName);

    const cropCell = document.createElement("td");
    cropCell.className = "aggregate-crop-cell";
    const cropContent = document.createElement("div");
    cropContent.className = "aggregate-crop-content";
    const cropName = document.createElement("span");
    cropName.className = "aggregate-crop-name";
    cropName.textContent = row.cropName;
    cropContent.append(createCropIllustration(row.cropName), cropName);
    cropCell.append(cropContent);

    const amountCell = document.createElement("td");
    amountCell.className = "number-cell";
    amountCell.textContent = `${formatNumber(row.amount)}個`;

    const expenseCell = document.createElement("td");
    expenseCell.className = "number-cell";
    expenseCell.textContent = `${formatNumber(estimatedExpense)}円`;

    const unitCostCell = document.createElement("td");
    unitCostCell.className = "total-cell";
    unitCostCell.textContent = `${formatNumber(estimatedExpense / row.amount)}円`;

    tr.append(cropCell, amountCell, expenseCell, unitCostCell);
    tbody.append(tr);
  });

  table.append(thead, tbody);
  wrapper.append(table);

  const note = document.createElement("p");
  note.className = "cost-performance-note";
  note.textContent = "目安費用は、畑全体の費用を個数収穫の比率で按分した参考値です。";
  wrapper.append(note);
  return wrapper;
}

function createSummaryCard(label, value) {
  const card = document.createElement("article");
  card.className = "summary-card";

  const labelElement = document.createElement("span");
  labelElement.className = "summary-label";
  labelElement.textContent = label;

  const valueElement = document.createElement("strong");
  valueElement.className = "summary-value";
  valueElement.textContent = String(value).replaceAll(" / ", "\n");

  card.append(labelElement, valueElement);
  return card;
}

function createHarvestChartPanel(title, rows, emptyText = "収穫記録がありません") {
  const panel = document.createElement("article");
  panel.className = "harvest-chart-panel";

  const titleElement = document.createElement("p");
  titleElement.className = "harvest-chart-title";
  titleElement.textContent = title;
  panel.append(titleElement);

  if (!rows.length) {
    const empty = document.createElement("p");
    empty.className = "chart-empty";
    empty.textContent = emptyText;
    panel.append(empty);
    return panel;
  }

  const maxAmount = Math.max(...rows.map((row) => row.amount), 1);
  rows.forEach((row) => {
    const item = document.createElement("div");
    item.className = "harvest-chart-row";
    if (row.cropName) applyCropTheme(item, row.cropName);

    const label = document.createElement("span");
    label.className = "harvest-chart-label";
    label.textContent = row.label;

    const barWrap = document.createElement("div");
    barWrap.className = "harvest-chart-bar-wrap";

    const bar = document.createElement("span");
    bar.className = "harvest-chart-bar";
    bar.style.setProperty("--bar-size", `${Math.max(7, Math.round((row.amount / maxAmount) * 100))}%`);
    barWrap.append(bar);

    const total = document.createElement("strong");
    total.className = "harvest-chart-total";
    total.textContent = row.totalText;

    item.append(label, barWrap, total);
    panel.append(item);
  });

  return panel;
}

function harvestCropChartRows(predicate) {
  const groups = state.harvests
    .filter(predicate)
    .reduce((acc, harvest) => {
      const seedling = findSeedling(harvest.seedlingId);
      const cropName = seedling?.cropName || "不明";
      const key = `${cropName}\u0000${harvest.unit}`;
      acc[key] = acc[key] || { cropName, unit: harvest.unit, amount: 0 };
      acc[key].amount += harvest.amount;
      return acc;
    }, {});

  return Object.values(groups)
    .sort((a, b) => b.amount - a.amount || a.cropName.localeCompare(b.cropName, "ja"))
    .slice(0, 6)
    .map((row) => ({
      label: row.cropName,
      cropName: row.cropName,
      amount: row.amount,
      totalText: `${formatNumber(row.amount)}${row.unit}`
    }));
}

function harvestDailyChartRows(limit) {
  return Object.entries(harvestTotalsByDate())
    .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
    .slice(0, limit)
    .map(([date, totals]) => {
      const entries = Object.values(totals);
      const amount = entries.reduce((sum, item) => sum + item.amount, 0);
      return {
        label: formatMonthDay(date),
        amount,
        totalText: formatHarvestTotals(totals)
      };
    });
}

function renderSeedlingList() {
  elements.seedlingList.replaceChildren();
  if (!state.seedlings.length) {
    appendEmpty(elements.seedlingList);
    return;
  }

  elements.seedlingList.append(createHarvestAggregateTable());
}

function createHarvestAggregateTable() {
  const wrapper = document.createElement("div");
  wrapper.className = "aggregate-table-wrap";

  const table = document.createElement("table");
  table.className = "aggregate-table";

  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  ["野菜", aggregateMode === "crop" ? "品種数" : "品種", "区画数", "収穫合計"].forEach((label) => {
    const th = document.createElement("th");
    th.textContent = label;
    headerRow.append(th);
  });
  thead.append(headerRow);

  const tbody = document.createElement("tbody");
  harvestAggregateRows().forEach((row) => {
    const tr = document.createElement("tr");
    applyCropTheme(tr, row.cropName);

    const cropCell = document.createElement("td");
    cropCell.className = "aggregate-crop-cell";
    const cropContent = document.createElement("div");
    cropContent.className = "aggregate-crop-content";
    const cropName = document.createElement("span");
    cropName.className = "aggregate-crop-name";
    cropName.textContent = row.cropName;
    cropContent.append(createCropIllustration(row.cropName), cropName);
    cropCell.append(cropContent);

    const varietyCell = document.createElement("td");
    varietyCell.textContent = aggregateMode === "crop" ? row.varietySummary : (row.variety || "品種なし");

    const countCell = document.createElement("td");
    countCell.className = "number-cell";
    countCell.textContent = `${row.seedlingCount}区画`;

    const totalCell = document.createElement("td");
    totalCell.className = "total-cell";
    totalCell.textContent = row.total || "収穫なし";

    tr.append(cropCell, varietyCell, countCell, totalCell);
    tbody.append(tr);
  });

  table.append(thead, tbody);
  wrapper.append(table);
  return wrapper;
}

function harvestAggregateRows() {
  const groups = new Map();

  state.seedlings.forEach((seedling) => {
    const variety = seedling.variety || "";
    const key = aggregateMode === "crop" ? seedling.cropName : `${seedling.cropName}\u0000${variety}`;
    const group = groups.get(key) || {
      cropName: seedling.cropName,
      variety: aggregateMode === "crop" ? "" : variety,
      seedlings: []
    };
    group.seedlings.push(seedling);
    groups.set(key, group);
  });

  return [...groups.values()]
    .map((group) => {
      const seedlingIds = new Set(group.seedlings.map((seedling) => seedling.id));
      const harvests = state.harvests.filter((harvest) => seedlingIds.has(harvest.seedlingId));
      const locations = group.seedlings
        .map((seedling) => cellDisplayName(seedling.cell))
        .sort((a, b) => a.localeCompare(b, "ja"));

      return {
        cropName: group.cropName,
        variety: group.variety,
        varietySummary: aggregateMode === "crop" ? varietySummaryForSeedlings(group.seedlings) : "",
        seedlingCount: group.seedlings.length,
        locations,
        locationSummary: summarizeLocations(locations),
        total: formatUnitTotals(harvests)
      };
    })
    .sort((a, b) => (
      b.seedlingCount - a.seedlingCount
      || a.cropName.localeCompare(b.cropName, "ja")
      || a.variety.localeCompare(b.variety, "ja")
    ));
}

function varietySummaryForSeedlings(seedlings) {
  const varieties = [...new Set(seedlings.map((seedling) => seedling.variety).filter(Boolean))];
  if (!varieties.length) return "品種なし";
  return `${varieties.length}品種`;
}

function summarizeLocations(locations) {
  if (locations.length <= 3) return locations.join(" / ");
  return `${locations.slice(0, 3).join(" / ")} ほか${locations.length - 3}区画`;
}

function formatUnitTotals(harvests) {
  if (!harvests.length) return "";

  const totals = harvests.reduce((acc, harvest) => {
    acc[harvest.unit] = (acc[harvest.unit] || 0) + harvest.amount;
    return acc;
  }, {});

  return Object.entries(totals)
    .sort(([unitA], [unitB]) => unitA.localeCompare(unitB, "ja"))
    .map(([unit, amount]) => `${formatNumber(amount)}${unit}`)
    .join(" / ");
}

function renderHistoryFilterOptions() {
  harvestHistoryMonthFilter = syncSelectOptions(
    elements.harvestMonthFilter,
    [
      { value: "all", label: "全期間" },
      ...uniqueMonths(state.harvests).map((month) => ({ value: month, label: formatYearMonthLabel(month) }))
    ],
    harvestHistoryMonthFilter
  );

  harvestHistoryCropFilter = syncSelectOptions(
    elements.harvestCropFilter,
    [
      { value: "all", label: "全部" },
      ...uniqueHarvestCrops().map((cropName) => ({ value: cropName, label: cropName }))
    ],
    harvestHistoryCropFilter
  );

  expenseHistoryMonthFilter = syncSelectOptions(
    elements.expenseMonthFilter,
    [
      { value: "all", label: "全期間" },
      ...uniqueMonths(state.expenses).map((month) => ({ value: month, label: formatYearMonthLabel(month) }))
    ],
    expenseHistoryMonthFilter
  );

  expenseHistoryCategoryFilter = syncSelectOptions(
    elements.expenseCategoryFilter,
    [
      { value: "all", label: "全部" },
      ...uniqueExpenseCategories().map((category) => ({ value: category, label: category }))
    ],
    expenseHistoryCategoryFilter
  );
}

function syncSelectOptions(select, options, selectedValue) {
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

function uniqueMonths(records) {
  return [...new Set(records.map((record) => record.date?.slice(0, 7)).filter(Boolean))]
    .sort((a, b) => b.localeCompare(a));
}

function uniqueHarvestCrops() {
  return [...new Set(state.harvests
    .map((harvest) => findSeedling(harvest.seedlingId)?.cropName)
    .filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, "ja"));
}

function uniqueExpenseCategories() {
  return [...new Set(state.expenses.map((expense) => expense.category || "その他"))]
    .sort((a, b) => a.localeCompare(b, "ja"));
}

function renderHarvestList() {
  elements.harvestList.replaceChildren();
  if (!state.harvests.length) {
    appendEmpty(elements.harvestList);
    return;
  }

  const filteredHarvests = state.harvests
    .filter((harvest) => harvestHistoryMonthFilter === "all" || harvest.date?.startsWith(harvestHistoryMonthFilter))
    .filter((harvest) => {
      if (harvestHistoryCropFilter === "all") return true;
      return findSeedling(harvest.seedlingId)?.cropName === harvestHistoryCropFilter;
    });

  if (!filteredHarvests.length) {
    appendEmptyMessage(elements.harvestList, "条件に合う収穫記録がありません。");
    return;
  }

  filteredHarvests
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 20)
    .forEach((harvest) => {
      const seedling = findSeedling(harvest.seedlingId);
      const item = createRecordItem({
        variant: "harvest",
        icon: "収",
        badge: harvest.date,
        title: seedling ? seedlingLabel(seedling) : "削除済みの苗",
        meta: [seedling ? "畑マップから記録" : "", harvest.memo].filter(Boolean).join(" / "),
        total: `${formatNumber(harvest.amount)} ${harvest.unit}`,
        onDelete: () => deleteRecord("harvests", harvest.id)
      });
      elements.harvestList.append(item);
    });
}

function renderExpenseList() {
  elements.expenseList.replaceChildren();
  if (!state.expenses.length) {
    appendEmpty(elements.expenseList);
    return;
  }

  const filteredExpenses = state.expenses
    .filter((expense) => expenseHistoryMonthFilter === "all" || expense.date?.startsWith(expenseHistoryMonthFilter))
    .filter((expense) => expenseHistoryCategoryFilter === "all" || (expense.category || "その他") === expenseHistoryCategoryFilter);

  if (!filteredExpenses.length) {
    appendEmptyMessage(elements.expenseList, "条件に合う費用記録がありません。");
    return;
  }

  filteredExpenses
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 20)
    .forEach((expense) => {
      const seedling = findSeedling(expense.seedlingId);
      const related = seedling ? seedlingLabel(seedling) : "畑全体";
      const item = createRecordItem({
        variant: "expense",
        icon: "費",
        badge: expense.category || "その他",
        title: expense.name,
        meta: [expense.date, related, expense.receiptImage ? "レシートあり" : "", expense.memo].filter(Boolean).join(" / "),
        total: `${formatNumber(expense.amount)}円`,
        onDelete: () => deleteRecord("expenses", expense.id)
      });
      elements.expenseList.append(item);
    });
}

function renderExpenseDashboard() {
  elements.expenseSummary.replaceChildren();
  if (!state.expenses.length) {
    appendEmpty(elements.expenseSummary);
    return;
  }

  const currentMonth = today.slice(0, 7);
  const todayTotal = expenseTotalForPeriod((expense) => expense.date === today);
  const monthTotal = expenseTotalForPeriod((expense) => expense.date?.startsWith(currentMonth));
  const allTotal = expenseTotalForPeriod(() => true);

  elements.expenseSummary.append(
    createSummaryCard("今日", `${formatNumber(todayTotal)}円`),
    createSummaryCard("今月", `${formatNumber(monthTotal)}円`),
    createSummaryCard("全体", `${formatNumber(allTotal)}円`)
  );

  elements.expenseSummary.append(
    createExpenseChartPanel("月別推移", expenseTotalsByMonth(), formatYearMonthLabel),
    createExpenseChartPanel("分類別内訳", expenseTotalsByCategory())
  );

  const history = document.createElement("div");
  history.className = "daily-history expense-daily-history";

  const title = document.createElement("p");
  title.className = "daily-history-title";
  title.textContent = "日別";
  history.append(title);

  Object.entries(expenseTotalsByDate())
    .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
    .slice(0, 7)
    .forEach(([date, total]) => {
      const row = document.createElement("div");
      row.className = "daily-history-row";

      const dateElement = document.createElement("span");
      dateElement.textContent = date;

      const totalElement = document.createElement("strong");
      totalElement.textContent = `${formatNumber(total)}円`;

      row.append(dateElement, totalElement);
      history.append(row);
    });

  elements.expenseSummary.append(history);
}

function createExpenseChartPanel(title, rows, labelFormatter = (label) => label) {
  const panel = document.createElement("article");
  panel.className = "expense-chart-panel";

  const titleElement = document.createElement("p");
  titleElement.className = "expense-chart-title";
  titleElement.textContent = title;
  panel.append(titleElement);

  const maxTotal = Math.max(...rows.map((row) => row.total), 1);
  rows.forEach((row) => {
    const item = document.createElement("div");
    item.className = "expense-chart-row";

    const label = document.createElement("span");
    label.className = "expense-chart-label";
    label.textContent = labelFormatter(row.label);

    const barWrap = document.createElement("div");
    barWrap.className = "expense-chart-bar-wrap";

    const bar = document.createElement("span");
    bar.className = "expense-chart-bar";
    bar.style.setProperty("--bar-size", `${Math.max(4, Math.round((row.total / maxTotal) * 100))}%`);
    barWrap.append(bar);

    const total = document.createElement("strong");
    total.className = "expense-chart-total";
    total.textContent = `${formatNumber(row.total)}円`;

    item.append(label, barWrap, total);
    panel.append(item);
  });

  return panel;
}

function renderActivitySummary() {
  elements.activitySummary.replaceChildren();
  const currentMonth = today.slice(0, 7);
  const todayCount = state.activities.filter((activity) => activity.date === today).length;
  const monthCount = state.activities.filter((activity) => activity.date?.startsWith(currentMonth)).length;
  elements.activitySummary.append(
    createSummaryCard("今日", `${todayCount}件`),
    createSummaryCard("今月", `${monthCount}件`),
    createSummaryCard("累計", `${state.activities.length}件`)
  );
}

function renderActivityFocusList() {
  elements.activityFocusList.replaceChildren();

  const dueTasks = state.tasks
    .filter((task) => !task.completed && task.date && task.date <= today)
    .sort((a, b) => (a.date || "").localeCompare(b.date || ""));

  dueTasks.slice(0, 4).forEach((task) => {
    elements.activityFocusList.append(createActivityFocusItem({
      type: task.type,
      title: `${task.type} / ${activityTargetLabel(task)}`,
      meta: `${taskDueLabel(task)} ${task.date}${task.memo ? ` / ${task.memo}` : ""}`,
      actionLabel: "完了",
      onAction: () => toggleTaskComplete(task.id)
    }));
  });

  const availableSlots = Math.max(0, 5 - Math.min(dueTasks.length, 4));
  staleSeedlingRows()
    .slice(0, availableSlots)
    .forEach((row) => {
      elements.activityFocusList.append(createActivityFocusItem({
        type: "その他",
        title: row.seedling ? seedlingLabel(row.seedling) : "苗",
        meta: row.lastDate ? `最後の作業 ${formatMonthDay(row.lastDate)} / ${row.daysSince}日前` : "作業記録なし",
        actionLabel: "記録",
        onAction: () => prepareActivityForSeedling(row.seedling)
      }));
    });

  if (!elements.activityFocusList.children.length) {
    appendEmptyMessage(elements.activityFocusList, "期限が来ている予定や、しばらく作業していない苗はありません。");
  }
}

function staleSeedlingRows() {
  return state.seedlings
    .map((seedling) => {
      const lastDate = latestActivityDateForSeedling(seedling.id);
      const daysSince = lastDate ? daysBetweenDates(lastDate, today) : null;
      return { seedling, lastDate, daysSince };
    })
    .filter((row) => row.daysSince === null || row.daysSince >= 14)
    .sort((a, b) => {
      if (a.daysSince === null && b.daysSince !== null) return -1;
      if (a.daysSince !== null && b.daysSince === null) return 1;
      return (b.daysSince || 0) - (a.daysSince || 0);
    });
}

function latestActivityDateForSeedling(seedlingId) {
  return state.activities
    .filter((activity) => activity.seedlingId === seedlingId && activity.date)
    .map((activity) => activity.date)
    .sort((a, b) => b.localeCompare(a))[0] || "";
}

function createActivityFocusItem({ type, title, meta, actionLabel, onAction }) {
  const item = document.createElement("article");
  item.className = "activity-focus-item";
  item.dataset.activityType = activityTypeKey(type);

  const icon = document.createElement("span");
  icon.className = "activity-focus-icon";
  icon.textContent = activityTypeIcon(type);

  const body = document.createElement("div");
  body.className = "activity-focus-body";
  const titleElement = document.createElement("strong");
  titleElement.textContent = title;
  const metaElement = document.createElement("span");
  metaElement.textContent = meta;
  body.append(titleElement, metaElement);

  const button = document.createElement("button");
  button.className = "activity-focus-action";
  button.type = "button";
  button.textContent = actionLabel;
  button.addEventListener("click", onAction);

  item.append(icon, body, button);
  return item;
}

function prepareActivityForSeedling(seedling) {
  if (!seedling) return;
  activityViewMode = "records";
  renderActivityView();
  elements.activityDateInput.value = today;
  elements.activityTypeInput.value = "水やり";
  elements.activityTargetSelect.value = seedling.id;
  elements.activityMemoInput.focus();
  elements.activityForm.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderActivityList() {
  elements.activityList.replaceChildren();
  if (!state.activities.length) {
    appendEmptyMessage(elements.activityList, "まだ作業記録がありません。");
    return;
  }

  [...state.activities]
    .sort((a, b) => `${b.date || ""}${b.createdAt || ""}`.localeCompare(`${a.date || ""}${a.createdAt || ""}`))
    .slice(0, 20)
    .forEach((activity) => {
      const item = createRecordItem({
        title: `${activity.type} / ${activityTargetLabel(activity)}`,
        meta: activity.memo || "メモなし",
        total: activity.date || "日付なし",
        variant: "activity",
        icon: activityTypeIcon(activity.type),
        onDelete: () => deleteRecord("activities", activity.id)
      });
      item.dataset.activityType = activityTypeKey(activity.type);
      elements.activityList.append(item);
    });
}

function activityTargetLabel(activity) {
  if (!activity.seedlingId) return activity.targetLabel || "畑全体";
  return findSeedling(activity.seedlingId)
    ? seedlingLabel(findSeedling(activity.seedlingId))
    : activity.targetLabel || "削除済みの苗";
}

function activityTypeIcon(type) {
  return {
    "水やり": "水",
    "追肥": "肥",
    "薬剤": "薬",
    "整枝・誘引": "整",
    "除草": "草"
  }[type] || "他";
}

function activityTypeKey(type) {
  return {
    "水やり": "water",
    "追肥": "fertilizer",
    "薬剤": "spray",
    "整枝・誘引": "training",
    "除草": "weeding"
  }[type] || "other";
}

function renderActivityView() {
  const showTasks = activityViewMode === "tasks";
  elements.activityRecordsView.classList.toggle("hidden", showTasks);
  elements.taskPlannerView.classList.toggle("hidden", !showTasks);
  elements.showActivityRecordsButton.classList.toggle("active", !showTasks);
  elements.showTaskPlannerButton.classList.toggle("active", showTasks);
  elements.showActivityRecordsButton.setAttribute("aria-pressed", String(!showTasks));
  elements.showTaskPlannerButton.setAttribute("aria-pressed", String(showTasks));
}

function renderTaskSummary() {
  elements.taskSummary.replaceChildren();
  const pending = state.tasks.filter((task) => !task.completed);
  const todayCount = pending.filter((task) => task.date === today).length;
  const overdueCount = pending.filter((task) => task.date && task.date < today).length;
  const completedCount = state.tasks.filter((task) => task.completed).length;
  elements.taskSummary.append(
    createSummaryCard("今日", `${todayCount}件`),
    createSummaryCard("期限超過", `${overdueCount}件`),
    createSummaryCard("完了", `${completedCount}件`)
  );
}

function renderTaskList() {
  elements.taskList.replaceChildren();
  if (!state.tasks.length) {
    appendEmptyMessage(elements.taskList, "まだ作業予定がありません。");
    return;
  }

  [...state.tasks]
    .sort((a, b) => {
      if (a.completed !== b.completed) return Number(a.completed) - Number(b.completed);
      if (!a.completed) return (a.date || "").localeCompare(b.date || "");
      return (b.completedAt || "").localeCompare(a.completedAt || "");
    })
    .slice(0, 30)
    .forEach((task) => elements.taskList.append(createTaskItem(task)));
}

function createTaskItem(task) {
  const item = document.createElement("article");
  item.className = "task-item";
  item.classList.toggle("completed", task.completed);
  item.classList.toggle("overdue", !task.completed && task.date && task.date < today);
  item.dataset.activityType = activityTypeKey(task.type);

  const completeButton = document.createElement("button");
  completeButton.className = "task-complete-button";
  completeButton.type = "button";
  completeButton.textContent = task.completed ? "✓" : "";
  completeButton.setAttribute("aria-label", task.completed ? "完了を取り消す" : "完了にする");
  completeButton.title = task.completed ? "完了を取り消す" : "完了にする";
  completeButton.addEventListener("click", () => toggleTaskComplete(task.id));

  const main = document.createElement("div");
  main.className = "task-main";
  const title = document.createElement("strong");
  title.textContent = `${task.type} / ${activityTargetLabel(task)}`;
  const meta = document.createElement("span");
  meta.textContent = task.memo || "メモなし";
  main.append(title, meta);

  const due = document.createElement("div");
  due.className = "task-due";
  due.dataset.status = taskDueStatus(task);
  const dueLabel = document.createElement("span");
  dueLabel.textContent = taskDueLabel(task);
  const dueDate = document.createElement("strong");
  dueDate.textContent = task.date || "日付なし";
  due.append(dueLabel, dueDate);

  const deleteButton = document.createElement("button");
  deleteButton.className = "task-delete-button";
  deleteButton.type = "button";
  deleteButton.textContent = "削除";
  deleteButton.addEventListener("click", () => deleteRecord("tasks", task.id));

  item.append(completeButton, main, due, deleteButton);
  return item;
}

function taskDueStatus(task) {
  if (task.completed) return "completed";
  if (!task.date) return "none";
  if (task.date < today) return "overdue";
  if (task.date === today) return "today";
  return "upcoming";
}

function taskDueLabel(task) {
  return {
    completed: "完了",
    overdue: "期限超過",
    today: "今日",
    upcoming: "予定",
    none: "日付なし"
  }[taskDueStatus(task)];
}

function toggleTaskComplete(taskId) {
  const task = state.tasks.find((item) => item.id === taskId);
  if (!task) return;

  if (task.completed) {
    task.completed = false;
    task.completedAt = "";
    state.activities = state.activities.filter((activity) => activity.sourceTaskId !== task.id);
  } else {
    task.completed = true;
    task.completedAt = new Date().toISOString();
    if (!state.activities.some((activity) => activity.sourceTaskId === task.id)) {
      state.activities.push({
        id: createId("activity"),
        date: currentLocalDate(),
        type: task.type,
        seedlingId: task.seedlingId,
        targetLabel: task.targetLabel,
        memo: task.memo,
        sourceTaskId: task.id,
        createdAt: task.completedAt
      });
    }
  }
  saveAndRender();
}

function renderTaskBadges() {
  const dueCount = state.tasks.filter((task) => !task.completed && task.date && task.date <= today).length;
  const label = dueCount > 99 ? "99+" : String(dueCount);
  [elements.taskDueBadge, elements.taskTabBadge].forEach((badge) => {
    badge.textContent = label;
    badge.classList.toggle("hidden", dueCount === 0);
    badge.setAttribute("aria-label", `期限が来ている作業予定 ${dueCount}件`);
  });
}

function renderExpenseManagerList() {
  elements.expenseManagerList.replaceChildren();
  if (!state.expenses.length) {
    appendEmpty(elements.expenseManagerList);
    return;
  }

  [...state.expenses]
    .sort((a, b) => `${b.date || ""}${b.createdAt || ""}`.localeCompare(`${a.date || ""}${a.createdAt || ""}`))
    .slice(0, 10)
    .forEach((expense) => {
      elements.expenseManagerList.append(createExpenseManagerItem(expense));
    });
}

function createExpenseManagerItem(expense) {
  const article = document.createElement("article");
  article.className = "expense-manager-item";

  const thumbnail = document.createElement("div");
  thumbnail.className = expense.receiptImage ? "receipt-thumb has-image" : "receipt-thumb";
  if (expense.receiptImage) {
    const image = document.createElement("img");
    image.src = expense.receiptImage;
    image.alt = "レシート画像";
    thumbnail.append(image);
  } else {
    thumbnail.textContent = "手入力";
  }

  const main = document.createElement("div");
  main.className = "record-main";

  const title = document.createElement("p");
  title.className = "record-title";
  title.textContent = `${expense.name || "費用"} (${expense.category || "その他"})`;

  const meta = document.createElement("p");
  meta.className = "record-meta";
  meta.textContent = [expense.date, expense.receiptImage ? "レシートあり" : "手入力", expense.memo].filter(Boolean).join(" / ");

  main.append(title, meta);

  const actions = document.createElement("div");
  actions.className = "record-actions";

  const total = document.createElement("div");
  total.className = "record-total";
  total.textContent = `${formatNumber(expense.amount)}円`;

  const deleteButton = document.createElement("button");
  deleteButton.className = "danger-button";
  deleteButton.type = "button";
  deleteButton.textContent = "削除";
  deleteButton.addEventListener("click", () => deleteRecord("expenses", expense.id));

  actions.append(total, deleteButton);
  article.append(thumbnail, main, actions);
  return article;
}

function expenseTotalForPeriod(predicate) {
  return state.expenses
    .filter(predicate)
    .reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
}

function expenseTotalsByDate() {
  return state.expenses.reduce((acc, expense) => {
    if (!expense.date) return acc;
    acc[expense.date] = (acc[expense.date] || 0) + Number(expense.amount || 0);
    return acc;
  }, {});
}

function expenseTotalsByMonth() {
  const totals = state.expenses.reduce((acc, expense) => {
    const month = expense.date?.slice(0, 7) || "日付なし";
    acc[month] = (acc[month] || 0) + Number(expense.amount || 0);
    return acc;
  }, {});

  return Object.entries(totals)
    .map(([label, total]) => ({ label, total }))
    .sort((a, b) => b.label.localeCompare(a.label))
    .slice(0, 6)
    .reverse();
}

function expenseTotalsByCategory() {
  const totals = state.expenses.reduce((acc, expense) => {
    const category = expense.category || "その他";
    acc[category] = (acc[category] || 0) + Number(expense.amount || 0);
    return acc;
  }, {});

  return Object.entries(totals)
    .map(([label, total]) => ({ label, total }))
    .sort((a, b) => b.total - a.total || a.label.localeCompare(b.label, "ja"));
}

function formatYearMonthLabel(value) {
  if (!/^\d{4}-\d{2}$/.test(value)) return value;
  const [year, month] = value.split("-");
  return `${year}/${Number(month)}月`;
}

function renderReceiptPreview() {
  elements.receiptPreview.replaceChildren();
  elements.receiptPreview.classList.toggle("hidden", !pendingReceiptImage);
  elements.receiptReadButton.disabled = !pendingReceiptImage;
  if (!pendingReceiptImage) return;

  const image = document.createElement("img");
  image.src = pendingReceiptImage;
  image.alt = "保存予定のレシート画像";

  const text = document.createElement("span");
  text.textContent = "このレシート画像を保存します";

  elements.receiptPreview.append(image, text);
}

function renderReceiptOcrStatus(message) {
  elements.receiptOcrStatus.textContent = message;
  elements.receiptReadButton.disabled = !pendingReceiptImage;
}

function renderReceiptAmountCandidates(candidates = []) {
  elements.receiptCandidateList.replaceChildren();
  elements.receiptCandidateList.classList.toggle("hidden", !candidates.length);
  if (!candidates.length) return;

  const label = document.createElement("span");
  label.className = "receipt-candidate-label";
  label.textContent = "候補";
  elements.receiptCandidateList.append(label);

  candidates.slice(0, 6).forEach((candidate, index) => {
    const button = document.createElement("button");
    button.className = "receipt-candidate-button";
    button.type = "button";
    button.dataset.receiptAmount = String(candidate.amount);
    button.title = candidate.line;
    button.textContent = `${formatNumber(candidate.amount)}円`;
    if (index === 0) {
      button.classList.add("primary-candidate");
    }
    elements.receiptCandidateList.append(button);
  });
}

async function detectReceiptText(imageDataUrl) {
  if ("Tesseract" in window) {
    return detectReceiptTextWithTesseract(imageDataUrl);
  }

  if ("TextDetector" in window) {
    return detectReceiptTextWithBrowser(imageDataUrl);
  }

  throw new Error("OCRライブラリを読み込めませんでした。インターネット接続を確認するか、金額欄へ手入力してください。");
}

async function detectReceiptTextWithTesseract(imageDataUrl) {
  renderReceiptOcrStatus("OCRを準備中です...");
  const result = await Tesseract.recognize(imageDataUrl, "jpn+eng", {
    logger: (progress) => {
      if (progress.status === "recognizing text") {
        renderReceiptOcrStatus(`読み取り中です... ${Math.round(progress.progress * 100)}%`);
      }
    }
  });

  const text = result?.data?.text?.trim() || "";
  if (!text) {
    throw new Error("文字を読み取れませんでした。金額欄へ手入力してください。");
  }

  return text;
}

async function detectReceiptTextWithBrowser(imageDataUrl) {
  const detector = new TextDetector();
  const imageBitmap = await createImageBitmap(await dataUrlToBlob(imageDataUrl));
  const detections = await detector.detect(imageBitmap);
  imageBitmap.close?.();

  const text = detections
    .map((detection) => detection.rawValue || "")
    .filter(Boolean)
    .join("\n");

  if (!text) {
    throw new Error("文字を読み取れませんでした。金額欄へ手入力してください。");
  }

  return text;
}

function extractReceiptTotalAmount(text) {
  return extractReceiptAmountCandidates(text)[0]?.amount || 0;
}

function extractReceiptAmountCandidates(text) {
  const lines = text
    .replace(/[￥¥]/g, "円")
    .replace(/[Oo]/g, "0")
    .replace(/[Il]/g, "1")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const candidates = lines.flatMap((line, index) => {
    const amounts = [...line.matchAll(/(?:円\s*)?([0-9０-９]{1,3}(?:[,，][0-9０-９]{3})+|[0-9０-９]{2,7})\s*円?/g)]
      .map((match) => normalizeYenAmount(match[1]))
      .filter((amount) => amount >= 1 && amount <= 9999999);
    return amounts.map((amount) => ({ amount, line, score: scoreReceiptAmountLine(line, amount, index) }));
  });

  const uniqueCandidates = new Map();
  candidates.forEach((candidate) => {
    const existing = uniqueCandidates.get(candidate.amount);
    if (!existing || candidate.score > existing.score) {
      uniqueCandidates.set(candidate.amount, candidate);
    }
  });

  return [...uniqueCandidates.values()].sort((a, b) => b.score - a.score);
}

function scoreReceiptAmountLine(line, amount, index) {
  const normalizedLine = line.toUpperCase();
  let score = 100000 - index * 20;

  const topPriorityWords = ["合計", "総合計", "請求", "お会計", "ご利用額", "支払合計", "TOTAL", "T0TAL"];
  const mediumPriorityWords = ["税込", "税込計", "小計", "買上", "売上"];
  const avoidWords = ["お預", "預り", "預かり", "釣", "お釣", "釣銭", "返金", "ポイント", "消費税", "内税", "外税", "対象", "値引", "割引", "単価"];

  if (topPriorityWords.some((word) => normalizedLine.includes(word))) score += 9000000;
  if (mediumPriorityWords.some((word) => normalizedLine.includes(word))) score += 3000000;
  if (avoidWords.some((word) => normalizedLine.includes(word))) score -= 7000000;
  if (line.includes("円")) score += 10000;
  if (amount >= 100 && amount <= 300000) score += 30000;

  return score;
}

function normalizeYenAmount(value) {
  const normalized = value
    .replace(/[０-９]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0xFEE0))
    .replace(/[,，]/g, "");
  return Number(normalized);
}

function dataUrlToBlob(dataUrl) {
  const [header, data] = dataUrl.split(",");
  const mime = /data:(.*?);base64/.exec(header)?.[1] || "image/jpeg";
  const binary = atob(data);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return new Blob([bytes], { type: mime });
}

function resizeReceiptImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      const image = new Image();
      image.addEventListener("load", () => {
        const maxSize = 2200;
        const ratio = Math.min(1, maxSize / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * ratio));
        canvas.height = Math.max(1, Math.round(image.height * ratio));
        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.92));
      });
      image.addEventListener("error", reject);
      image.src = reader.result;
    });
    reader.addEventListener("error", reject);
    reader.readAsDataURL(file);
  });
}

function createRecordItem({ title, meta, total, onEdit, onDelete, variant = "", icon = "", badge = "" }) {
  const article = document.createElement("article");
  article.className = ["record-item", variant ? `record-item-${variant}` : ""].filter(Boolean).join(" ");

  if (icon) {
    const iconElement = document.createElement("div");
    iconElement.className = "record-icon";
    iconElement.textContent = icon;
    article.append(iconElement);
  }

  const main = document.createElement("div");
  main.className = "record-main";

  if (badge) {
    const badgeElement = document.createElement("span");
    badgeElement.className = "record-badge";
    badgeElement.textContent = badge;
    main.append(badgeElement);
  }

  const titleElement = document.createElement("p");
  titleElement.className = "record-title";
  titleElement.textContent = title;
  main.append(titleElement);

  if (meta) {
    const metaElement = document.createElement("p");
    metaElement.className = "record-meta";
    metaElement.textContent = meta;
    main.append(metaElement);
  }

  const side = document.createElement("div");
  side.className = "record-total";
  side.textContent = total;

  const deleteButton = document.createElement("button");
  deleteButton.className = "danger-button";
  deleteButton.type = "button";
  deleteButton.textContent = "削除";
  deleteButton.addEventListener("click", onDelete);

  const actions = document.createElement("div");
  actions.className = "record-actions";
  actions.append(side);

  if (onEdit) {
    const editButton = document.createElement("button");
    editButton.className = "secondary-button";
    editButton.type = "button";
    editButton.textContent = "編集";
    editButton.addEventListener("click", onEdit);
    actions.append(editButton);
  }

  actions.append(deleteButton);

  article.append(main, actions);
  return article;
}

function startSeedlingEdit(id) {
  const seedling = findSeedling(id);
  if (!seedling) return;

  openSeedlingModal({ seedling });
}

function finishSeedlingEdit() {
  editingSeedlingId = "";
  elements.seedlingForm.reset();
  elements.plantedDateInput.value = today;
  elements.seedlingSubmitButton.textContent = "苗を登録";
  elements.cancelSeedlingEditButton.classList.add("hidden");
  saveAndRender();
}

function openSeedlingModal({ cell = "", seedling = null, template = null } = {}) {
  modalSeedlingId = seedling?.id || "";
  const source = seedling || template;
  renderModalCellOptions();
  elements.seedlingModalTitle.textContent = seedling ? "苗を編集" : template ? "苗をコピー登録" : "苗を登録";
  elements.modalSeedlingSubmitButton.textContent = seedling ? "苗を更新" : "苗を登録";
  elements.modalCropNameInput.value = source?.cropName || "";
  elements.modalVarietyInput.value = source?.variety || "";
  elements.modalPlantedDateInput.value = source?.plantedDate || today;
  elements.modalCellSelect.value = seedling?.cell || cell;
  elements.modalSeedlingMemoInput.value = source?.memo || "";
  renderCropPicker();
  renderPasteSeedlingButton();
  elements.seedlingModal.classList.remove("hidden");
  document.body.classList.add("modal-open");
  const selectedCropCard = elements.cropPicker.querySelector(".crop-card.selected");
  (selectedCropCard || elements.cropPicker.querySelector(".crop-card") || elements.modalVarietyInput).focus();
}

function closeSeedlingModal() {
  modalSeedlingId = "";
  elements.modalSeedlingForm.reset();
  elements.modalPlantedDateInput.value = today;
  renderCropPicker();
  elements.seedlingModal.classList.add("hidden");
  document.body.classList.remove("modal-open");
}

function openSeedlingDetail(seedlingId) {
  const seedling = findSeedling(seedlingId);
  if (!seedling) return;

  detailSeedlingId = seedlingId;
  renderSeedlingDetail(seedling);
  elements.seedlingDetailModal.classList.remove("hidden");
  document.body.classList.add("modal-open");
  elements.closeSeedlingDetailButton.focus();
}

function closeSeedlingDetailModal() {
  detailSeedlingId = "";
  elements.seedlingDetailBody.replaceChildren();
  elements.seedlingDetailModal.classList.add("hidden");
  document.body.classList.remove("modal-open");
}

function renderSeedlingDetail(seedling) {
  elements.seedlingDetailTitle.textContent = seedlingLabel(seedling);
  elements.seedlingDetailBody.replaceChildren();

  const harvests = state.harvests
    .filter((harvest) => harvest.seedlingId === seedling.id)
    .sort((a, b) => b.date.localeCompare(a.date));
  const expenses = state.expenses
    .filter((expense) => expense.seedlingId === seedling.id)
    .sort((a, b) => b.date.localeCompare(a.date));
  const activities = state.activities
    .filter((activity) => activity.seedlingId === seedling.id)
    .sort((a, b) => b.date.localeCompare(a.date));
  const pesticideRecords = state.pesticideApplications
    .filter((record) => pesticideApplicationMatchesSeedling(record, seedling))
    .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
  const pesticideSafety = pesticideSafetyForSeedling(seedling);

  const hero = document.createElement("section");
  hero.className = "seedling-detail-hero";
  applyCropTheme(hero, seedling.cropName);
  hero.append(createCropIllustration(seedling.cropName));

  const heroText = document.createElement("div");
  const crop = document.createElement("strong");
  crop.textContent = seedling.cropName;
  const meta = document.createElement("span");
  meta.textContent = [seedling.variety || "品種なし", cellDisplayName(seedling.cell)].join(" / ");
  heroText.append(crop, meta);
  hero.append(heroText);

  const editButton = document.createElement("button");
  editButton.className = "secondary-button";
  editButton.type = "button";
  editButton.textContent = "編集";
  editButton.addEventListener("click", () => {
    closeSeedlingDetailModal();
    openSeedlingModal({ seedling });
  });

  const activityButton = document.createElement("button");
  activityButton.className = "secondary-button";
  activityButton.type = "button";
  activityButton.textContent = "作業を記録";
  activityButton.addEventListener("click", () => {
    closeSeedlingDetailModal();
    activityViewMode = "records";
    activateTab("activities");
    renderActivityTargetOptions();
    elements.activityTargetSelect.value = seedling.id;
    renderActivityView();
    setMobileNavActive("activities");
    elements.workspace.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  const heroActions = document.createElement("div");
  heroActions.className = "seedling-detail-actions";
  heroActions.append(activityButton, editButton);
  hero.append(heroActions);

  const stats = document.createElement("section");
  stats.className = "seedling-detail-stats";
  stats.append(
    createDetailStat("収穫合計", harvestTotalsForSeedling(seedling.id) || "収穫なし"),
    createDetailStat("収穫回数", `${harvests.length}回`),
    createDetailStat("植えた日", seedling.plantedDate || "未入力"),
    createDetailStat("費用", expenses.length ? `${formatNumber(expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0))}円` : "記録なし"),
    createDetailStat("農薬注意", pesticideSafetySummaryText(pesticideSafety), pesticideSafety?.status === "wait" ? "warning" : "")
  );

  const memo = document.createElement("section");
  memo.className = "seedling-detail-section";
  memo.append(createDetailSectionTitle("メモ"));
  const memoText = document.createElement("p");
  memoText.className = "seedling-detail-note";
  memoText.textContent = seedling.memo || "メモはありません。";
  memo.append(memoText);

  const harvestList = document.createElement("section");
  harvestList.className = "seedling-detail-section";
  harvestList.append(createDetailSectionTitle("最近の収穫"));
  const harvestRecordList = document.createElement("div");
  harvestRecordList.className = "detail-record-list";
  if (harvests.length) {
    harvests.slice(0, 8).forEach((harvest) => {
      harvestRecordList.append(createDetailRecord(harvest.date, [harvest.memo].filter(Boolean).join(" / "), `${formatNumber(harvest.amount)}${harvest.unit}`));
    });
  } else {
    appendEmptyMessage(harvestRecordList, "まだ収穫記録がありません。");
  }
  harvestList.append(harvestRecordList);

  const activityList = document.createElement("section");
  activityList.className = "seedling-detail-section";
  activityList.append(createDetailSectionTitle("最近の作業"));
  const activityRecordList = document.createElement("div");
  activityRecordList.className = "detail-record-list";
  if (activities.length) {
    activities.slice(0, 8).forEach((activity) => {
      activityRecordList.append(createDetailRecord(activity.date, activity.memo, activity.type));
    });
  } else {
    appendEmptyMessage(activityRecordList, "まだ作業記録がありません。");
  }
  activityList.append(activityRecordList);

  const pesticideList = document.createElement("section");
  pesticideList.className = "seedling-detail-section";
  pesticideList.append(createDetailSectionTitle("最近の農薬散布"));
  const pesticideRecordList = document.createElement("div");
  pesticideRecordList.className = "detail-record-list";
  if (pesticideRecords.length) {
    pesticideRecords.slice(0, 8).forEach((record) => {
      pesticideRecordList.append(createPesticideDetailRecord(record, seedling));
    });
  } else {
    appendEmptyMessage(pesticideRecordList, "この苗に関係する農薬散布記録はありません。");
  }
  pesticideList.append(pesticideRecordList);

  elements.seedlingDetailBody.append(hero, stats, memo, pesticideList, activityList, harvestList);
}

function pesticideSafetySummaryText(safety) {
  if (!safety) return "記録なし";
  if (safety.status === "wait") return `収穫待ち\n${formatMonthDay(safety.availableDate)}から`;
  return "散布記録あり\n制限経過目安";
}

function createPesticideDetailRecord(record, seedling) {
  const rule = pesticideApplicationRuleForSeedling(record, seedling);
  const details = [
    record.dilution,
    record.amount ? `${formatNumber(record.amount)}${record.unit || "L"}` : "",
    record.memo
  ].filter(Boolean).join(" / ");
  return createDetailRecord(record.date || "日付なし", details, rule?.useTiming || record.useTiming || "要確認");
}

function createDetailStat(label, value, modifier = "") {
  const card = document.createElement("article");
  card.className = "detail-stat-card";
  if (modifier) card.classList.add(`detail-stat-card-${modifier}`);
  const labelElement = document.createElement("span");
  labelElement.textContent = label;
  const valueElement = document.createElement("strong");
  valueElement.textContent = String(value).replaceAll(" / ", "\n");
  card.append(labelElement, valueElement);
  return card;
}

function createDetailSectionTitle(text) {
  const title = document.createElement("h3");
  title.className = "detail-section-title";
  title.textContent = text;
  return title;
}

function createDetailRecord(date, meta, total) {
  const row = document.createElement("article");
  row.className = "detail-record-item";
  const main = document.createElement("div");
  const dateElement = document.createElement("strong");
  dateElement.textContent = date;
  const metaElement = document.createElement("span");
  metaElement.textContent = meta || "メモなし";
  main.append(dateElement, metaElement);
  const totalElement = document.createElement("b");
  totalElement.textContent = total;
  row.append(main, totalElement);
  return row;
}

function activateMobileView(view) {
  if (view === "harvest") {
    openHarvestMode();
    return;
  }

  mobileNavScrollLockUntil = Date.now() + 700;
  if (view === "map") {
    setMobileNavActive("map");
    elements.mapSection.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  activateTab(view);
  setMobileNavActive(view);
  elements.workspace.scrollIntoView({ behavior: "smooth", block: "start" });
}

function setMobileNavActive(view) {
  mobileNavView = view;
  elements.mobileNavButtons.forEach((button) => {
    const isActive = button.dataset.mobileView === view;
    button.classList.toggle("active", isActive);
    if (isActive) {
      button.setAttribute("aria-current", "page");
    } else {
      button.removeAttribute("aria-current");
    }
  });
}

function queueMobileNavScrollSync() {
  if (mobileNavScrollQueued || window.innerWidth > 640 || Date.now() < mobileNavScrollLockUntil) return;
  mobileNavScrollQueued = true;
  window.requestAnimationFrame(() => {
    mobileNavScrollQueued = false;
    syncMobileNavFromScroll();
  });
}

function syncMobileNavFromScroll() {
  if (!elements.harvestModeModal.classList.contains("hidden")) return;

  const workspaceTop = elements.workspace.getBoundingClientRect().top;
  if (workspaceTop > window.innerHeight * 0.55) {
    setMobileNavActive("map");
    return;
  }

  const activePanel = document.querySelector(".tab-panel.active");
  if (activePanel?.id === "expensesPanel") {
    setMobileNavActive("expenses");
  } else if (activePanel?.id === "activitiesPanel") {
    setMobileNavActive("activities");
  } else if (activePanel?.id === "harvestsPanel") {
    setMobileNavActive("harvest");
  } else {
    setMobileNavActive("records");
  }
}

function openHarvestMode() {
  if (elements.harvestModeModal.classList.contains("hidden")) {
    mobileNavViewBeforeHarvest = mobileNavView === "harvest" ? "map" : mobileNavView;
  }
  harvestModeCropFilter = "all";
  harvestModeStatusFilter = "all";
  lastHarvestModeAction = null;
  renderHarvestMode();
  elements.harvestModeModal.classList.remove("hidden");
  document.body.classList.add("modal-open");
  setMobileNavActive("harvest");
  elements.closeHarvestModeButton.focus();
}

function closeHarvestMode() {
  elements.harvestModeModal.classList.add("hidden");
  document.body.classList.remove("modal-open");
  setMobileNavActive(mobileNavViewBeforeHarvest);
}

function renderHarvestMode() {
  if (!elements.harvestModeList) return;

  renderHarvestModeSummary();
  elements.undoHarvestModeButton.disabled = !lastHarvestModeAction;

  renderHarvestModeUnits();
  renderHarvestModeStatusFilters();
  renderHarvestModeFilters();
  elements.harvestModeList.replaceChildren();

  const seedlings = [...state.seedlings]
    .filter((seedling) => isSeedlingVisibleInHarvestMode(seedling))
    .filter((seedling) => harvestModeCropFilter === "all" || seedling.cropName === harvestModeCropFilter)
    .sort((a, b) => (
      Number(hasHarvestToday(b.id)) - Number(hasHarvestToday(a.id))
      || a.cropName.localeCompare(b.cropName, "ja")
      || cellDisplayName(a.cell).localeCompare(cellDisplayName(b.cell), "ja", { numeric: true })
    ));

  if (!seedlings.length) {
    appendEmptyMessage(
      elements.harvestModeList,
      state.seedlings.length ? "条件に合う苗はありません。" : "先に畑マップへ苗を登録してください。"
    );
    return;
  }

  seedlings.forEach((seedling) => {
    elements.harvestModeList.append(createHarvestModeCard(seedling));
  });
}

function renderHarvestModeSummary() {
  const todayTotal = harvestTotalsForPeriod((harvest) => harvest.date === today);
  const touchedCount = state.seedlings.filter((seedling) => hasHarvestToday(seedling.id)).length;
  const untouchedCount = Math.max(0, state.seedlings.length - touchedCount);
  elements.harvestModeSummary.textContent = [
    todayTotal || "まだ収穫はありません",
    state.seedlings.length ? `今日済 ${touchedCount}苗 / 未収穫 ${untouchedCount}苗` : ""
  ].filter(Boolean).join(" ・ ");
}

function renderHarvestModeUnits() {
  elements.harvestModeUnitPicker.replaceChildren();
  HARVEST_MODE_UNITS.forEach((unit) => {
    const button = document.createElement("button");
    button.className = "harvest-mode-unit";
    button.classList.toggle("active", unit === harvestModeUnit);
    button.type = "button";
    button.textContent = unit;
    button.setAttribute("aria-pressed", String(unit === harvestModeUnit));
    button.addEventListener("click", () => {
      harvestModeUnit = unit;
      renderHarvestMode();
    });
    elements.harvestModeUnitPicker.append(button);
  });
}

function renderHarvestModeStatusFilters() {
  elements.harvestModeStatusFilters.replaceChildren();
  const touchedCount = state.seedlings.filter((seedling) => hasHarvestToday(seedling.id)).length;
  const untouchedCount = Math.max(0, state.seedlings.length - touchedCount);
  [
    { value: "all", label: `すべて ${state.seedlings.length}` },
    { value: "today", label: `今日済 ${touchedCount}` },
    { value: "untouched", label: `未収穫 ${untouchedCount}` }
  ].forEach((filter) => {
    const button = document.createElement("button");
    button.className = "harvest-mode-status-filter";
    button.classList.toggle("active", filter.value === harvestModeStatusFilter);
    button.type = "button";
    button.textContent = filter.label;
    button.setAttribute("aria-pressed", String(filter.value === harvestModeStatusFilter));
    button.addEventListener("click", () => {
      harvestModeStatusFilter = filter.value;
      renderHarvestMode();
    });
    elements.harvestModeStatusFilters.append(button);
  });
}

function renderHarvestModeFilters() {
  elements.harvestModeCropFilters.replaceChildren();
  const filters = [
    { value: "all", label: "すべて" },
    ...uniqueCropNames().map((cropName) => ({ value: cropName, label: cropName }))
  ];

  if (!filters.some((filter) => filter.value === harvestModeCropFilter)) {
    harvestModeCropFilter = "all";
  }

  filters.forEach((filter) => {
    const button = document.createElement("button");
    button.className = "harvest-mode-filter";
    button.classList.toggle("active", filter.value === harvestModeCropFilter);
    button.type = "button";
    button.textContent = filter.label;
    button.setAttribute("aria-pressed", String(filter.value === harvestModeCropFilter));
    button.addEventListener("click", () => {
      harvestModeCropFilter = filter.value;
      renderHarvestMode();
    });
    elements.harvestModeCropFilters.append(button);
  });
}

function isSeedlingVisibleInHarvestMode(seedling) {
  if (harvestModeStatusFilter === "today") return hasHarvestToday(seedling.id);
  if (harvestModeStatusFilter === "untouched") return !hasHarvestToday(seedling.id);
  return true;
}

function hasHarvestToday(seedlingId) {
  return state.harvests.some((harvest) => (
    harvest.seedlingId === seedlingId
    && harvest.date === today
    && Number(harvest.amount || 0) > 0
  ));
}

function createHarvestModeCard(seedling) {
  const card = document.createElement("article");
  card.className = "harvest-mode-card";
  card.classList.toggle("harvested-today", hasHarvestToday(seedling.id));
  card.dataset.harvestModeSeedlingId = seedling.id;
  applyCropTheme(card, seedling.cropName);

  const identity = document.createElement("div");
  identity.className = "harvest-mode-identity";
  identity.append(createCropIllustration(seedling.cropName));

  const identityText = document.createElement("div");
  const cropName = document.createElement("strong");
  cropName.textContent = seedling.cropName;
  const meta = document.createElement("span");
  meta.textContent = [seedling.variety || "品種なし", cellDisplayName(seedling.cell)].join(" / ");
  identityText.append(cropName, meta);
  if (hasHarvestToday(seedling.id)) {
    const done = document.createElement("em");
    done.className = "harvest-mode-done-badge";
    done.textContent = "今日済";
    identityText.append(done);
  }
  identity.append(identityText);

  const todayCount = document.createElement("div");
  todayCount.className = "harvest-mode-count";
  const countLabel = document.createElement("span");
  countLabel.textContent = `今日・${harvestModeUnit}`;
  const countValue = document.createElement("strong");
  countValue.className = "harvest-mode-count-value";
  const amount = harvestTotalForSeedlingDateUnit(seedling.id, today, harvestModeUnit);
  countValue.textContent = formatNumber(amount);
  const lifetime = document.createElement("small");
  lifetime.className = "harvest-mode-lifetime";
  lifetime.textContent = `累計 ${harvestTotalsForSeedling(seedling.id) || "収穫なし"}`;
  todayCount.append(countLabel, countValue, lifetime);

  const actions = document.createElement("div");
  actions.className = "harvest-mode-actions";

  const decrementButton = document.createElement("button");
  decrementButton.className = "harvest-mode-step decrement";
  decrementButton.type = "button";
  decrementButton.textContent = "-1";
  decrementButton.disabled = amount <= 0;
  decrementButton.setAttribute("aria-label", `${seedlingLabel(seedling)}を1${harvestModeUnit}減らす`);
  decrementButton.addEventListener("click", () => applyHarvestModeDelta(seedling.id, -1));

  const incrementButton = document.createElement("button");
  incrementButton.className = "harvest-mode-step increment";
  incrementButton.type = "button";
  incrementButton.textContent = "+1";
  incrementButton.setAttribute("aria-label", `${seedlingLabel(seedling)}を1${harvestModeUnit}増やす`);
  incrementButton.addEventListener("click", () => applyHarvestModeDelta(seedling.id, 1));

  actions.append(decrementButton, incrementButton);
  card.append(identity, todayCount, actions);
  return card;
}

function applyHarvestModeDelta(seedlingId, delta) {
  if (delta > 0) {
    const harvest = {
      id: createId("harvest"),
      seedlingId,
      date: today,
      amount: 1,
      unit: harvestModeUnit,
      memo: "収穫モードから追加"
    };
    state.harvests.push(harvest);
    lastHarvestModeAction = { type: "add", harvestId: harvest.id };
    saveQuickHarvest(seedlingId);
    return;
  }

  const index = findLatestTodayHarvestIndex(seedlingId, harvestModeUnit);
  if (index === -1) return;

  const previous = structuredClone(state.harvests[index]);
  if (previous.amount <= 1) {
    state.harvests.splice(index, 1);
  } else {
    state.harvests[index] = { ...previous, amount: previous.amount - 1 };
  }
  lastHarvestModeAction = { type: "subtract", previous, index };
  saveQuickHarvest(seedlingId);
}

function findLatestTodayHarvestIndex(seedlingId, unit) {
  for (let index = state.harvests.length - 1; index >= 0; index -= 1) {
    const harvest = state.harvests[index];
    if (harvest.seedlingId === seedlingId && harvest.unit === unit && harvest.date === today) {
      return index;
    }
  }
  return -1;
}

function undoLastHarvestModeAction() {
  if (!lastHarvestModeAction) return;

  if (lastHarvestModeAction.type === "add") {
    state.harvests = state.harvests.filter((harvest) => harvest.id !== lastHarvestModeAction.harvestId);
  } else if (lastHarvestModeAction.type === "subtract") {
    const { previous, index } = lastHarvestModeAction;
    const currentIndex = state.harvests.findIndex((harvest) => harvest.id === previous.id);
    if (currentIndex >= 0) {
      state.harvests[currentIndex] = previous;
    } else {
      state.harvests.splice(Math.min(index, state.harvests.length), 0, previous);
    }
  }

  lastHarvestModeAction = null;
  saveAndRender();
}

function harvestTotalForSeedlingDateUnit(seedlingId, date, unit) {
  return state.harvests
    .filter((harvest) => harvest.seedlingId === seedlingId && harvest.date === date && harvest.unit === unit)
    .reduce((sum, harvest) => sum + Number(harvest.amount || 0), 0);
}

function openSyncModal() {
  renderSyncSettings();
  renderSyncLink("");
  elements.syncModal.classList.remove("hidden");
  document.body.classList.add("modal-open");
}

function closeSyncModal() {
  elements.syncModal.classList.add("hidden");
  document.body.classList.remove("modal-open");
}

function renderSyncSettings() {
  const settings = storage.loadSettings();
  elements.syncUrlInput.value = settings.url;
  elements.syncAnonKeyInput.value = settings.anonKey;
  elements.syncRecordIdInput.value = settings.recordId || "";
  renderSyncStatus(storage.isCloudConfigured()
    ? `同期設定あり: ${settings.recordId}`
    : "未設定です。設定するまでは、この端末内だけに保存します。");
}

function renderSyncStatus(message) {
  elements.syncStatusText.textContent = message;
}

function renderSyncLink(link) {
  elements.syncLinkOutput.value = link;
  elements.syncLinkBox.classList.toggle("hidden", !link);
}

async function runCloudAction(loadingMessage, action) {
  renderSyncStatus(loadingMessage);
  setSyncButtonsDisabled(true);
  try {
    await action();
  } catch (error) {
    renderSyncStatus(error.message || "クラウド同期に失敗しました。設定と通信状態を確認してください。");
  } finally {
    setSyncButtonsDisabled(false);
  }
}

function setSyncButtonsDisabled(disabled) {
  [
    elements.saveSyncSettingsButton,
    elements.generateSyncIdButton,
    elements.testCloudButton,
    elements.pullCloudButton,
    elements.pushCloudButton,
    elements.copySyncLinkButton,
    elements.clearSyncSettingsButton
  ].forEach((button) => {
    button.disabled = disabled;
  });
}

function formatSyncDate(value) {
  if (!value) return "不明";
  return new Intl.DateTimeFormat("ja-JP", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));
}

function createSyncRecordId() {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  return `farm-${[...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("")}`;
}

function createSyncSetupLink() {
  const settings = storage.loadSettings();
  if (!settings.url || !settings.anonKey || !settings.recordId) {
    throw new Error("URL、anon key、共有データIDを入力してから作成してください。");
  }

  const url = new URL(window.location.href);
  url.searchParams.set("sync", encodeSyncSettings(settings));
  return url.toString();
}

function encodeSyncSettings(settings) {
  const json = JSON.stringify({
    url: settings.url,
    anonKey: settings.anonKey,
    recordId: settings.recordId
  });
  const bytes = new TextEncoder().encode(json);
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decodeSyncSettings(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
}

async function copyTextToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.append(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

function applySyncSettingsFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const encodedSettings = params.get("sync");
  if (!encodedSettings) return;

  try {
    const settings = decodeSyncSettings(encodedSettings);
    storage.saveSettings(settings);
    const cleanUrl = new URL(window.location.href);
    cleanUrl.searchParams.delete("sync");
    window.history.replaceState({}, "", cleanUrl.toString());
    openSyncModal();
    renderSyncStatus("同期設定を取り込みました。自動取得を試します。反映されない場合は「クラウドから取得」を押してください。");
  } catch {
    openSyncModal();
    renderSyncStatus("同期設定リンクを読み込めませんでした。");
  }
}

function copyCropOptionsToModal() {
  elements.modalCropNameInput.replaceChildren(
    ...[...elements.cropNameInput.options].map((option) => option.cloneNode(true))
  );
}

function renderCropPicker() {
  const selectedCrop = elements.modalCropNameInput.value;
  elements.cropPicker.replaceChildren();

  CROP_PICKER_ITEMS.forEach((crop) => {
    const card = document.createElement("button");
    card.className = "crop-card";
    card.type = "button";
    card.setAttribute("role", "option");
    card.setAttribute("aria-selected", crop.name === selectedCrop ? "true" : "false");
    card.classList.toggle("selected", crop.name === selectedCrop);
    applyCropTheme(card, crop.name);

    const icon = createCropIllustration(crop.name);

    const label = document.createElement("span");
    label.className = "crop-card-label";
    label.textContent = crop.name;

    card.append(icon, label);
    card.addEventListener("click", () => {
      elements.modalCropNameInput.value = crop.name;
      renderCropPicker();
      elements.modalVarietyInput.focus();
    });
    elements.cropPicker.append(card);
  });
}

function createCropIllustration(cropName) {
  const icon = document.createElement("span");
  icon.className = "crop-illustration";
  icon.innerHTML = cropIconSvg(cropName);
  return icon;
}

function cropIconSvg(cropName) {
  const svg = (body) => `<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">${body}</svg>`;
  const leaf = `<path d="M23 11c-3-7 8-9 12-5-2 7-8 9-12 5Z" fill="#35b85a"/><path d="M22 13c-5-4-2-11 4-12 3 6 1 11-4 12Z" fill="#178f45"/>`;

  const icons = {
    "トマト": svg(`${leaf}<circle cx="24" cy="27" r="14" fill="#ef3f32"/><path d="M15 22c4-5 12-8 21-2" fill="none" stroke="#ff9b88" stroke-width="3" stroke-linecap="round"/><circle cx="19" cy="24" r="3" fill="#ff7664"/>`),
    "ミニトマト": svg(`${leaf}<circle cx="18" cy="29" r="9" fill="#ef3f32"/><circle cx="30" cy="27" r="10" fill="#ff5543"/><path d="M14 26c3-3 7-4 11-2" fill="none" stroke="#ffb09f" stroke-width="2" stroke-linecap="round"/>`),
    "ナス": svg(`<path d="M18 16c12-6 23 4 16 19-4 9-17 10-22 1-4-7-2-16 6-20Z" fill="#7b44dc"/><path d="M17 18c2 9 6 18 16 18" fill="none" stroke="#b793ff" stroke-width="3" stroke-linecap="round"/><path d="M17 16c1-7 10-9 16-5-3 6-9 8-16 5Z" fill="#35b85a"/>`),
    "きゅうり": svg(`<g transform="rotate(-35 24 24)"><rect x="13" y="11" width="22" height="30" rx="11" fill="#29a847"/><path d="M18 14c-2 9-1 17 4 24" fill="none" stroke="#7ee18d" stroke-width="3" stroke-linecap="round"/><circle cx="26" cy="18" r="1.4" fill="#c6ffd0"/><circle cx="21" cy="26" r="1.3" fill="#c6ffd0"/><circle cx="29" cy="32" r="1.3" fill="#c6ffd0"/></g>`),
    "ゴーヤ": svg(`<g transform="rotate(-32 24 24)"><path d="M16 9c13 2 20 14 16 30-12-1-21-13-16-30Z" fill="#239f48"/><path d="M20 13c-3 9 1 18 9 23" fill="none" stroke="#92e58c" stroke-width="3" stroke-linecap="round"/><circle cx="23" cy="17" r="1.6" fill="#c8ffd0"/><circle cx="28" cy="22" r="1.5" fill="#c8ffd0"/><circle cx="24" cy="29" r="1.5" fill="#c8ffd0"/><circle cx="31" cy="32" r="1.4" fill="#c8ffd0"/></g>`),
    "ズッキーニ": svg(`<g transform="rotate(-28 24 24)"><rect x="13" y="10" width="21" height="32" rx="10" fill="#218f45"/><path d="M18 14c-1 9 1 18 7 25" fill="none" stroke="#79d96f" stroke-width="3" stroke-linecap="round"/><path d="M19 10c0-4 6-6 10-3-1 4-5 5-10 3Z" fill="#f6d65a"/></g>`),
    "ピーマン": svg(`<path d="M18 15c3-5 10-4 12 0 7 0 11 8 6 17-4 8-20 9-25 0-5-9 0-17 7-17Z" fill="#25a84a"/><path d="M24 15c-3 8-3 16 0 25" fill="none" stroke="#77df82" stroke-width="3" stroke-linecap="round"/><path d="M22 15c1-5 7-7 11-3-2 5-7 6-11 3Z" fill="#178f45"/>`),
    "赤パプリカ": svg(`<path d="M18 15c3-5 10-4 12 0 7 0 11 8 6 17-4 8-20 9-25 0-5-9 0-17 7-17Z" fill="#e73b32"/><path d="M24 15c-3 8-3 16 0 25" fill="none" stroke="#ff9a88" stroke-width="3" stroke-linecap="round"/><path d="M22 15c1-5 7-7 11-3-2 5-7 6-11 3Z" fill="#178f45"/>`),
    "黄パプリカ": svg(`<path d="M18 15c3-5 10-4 12 0 7 0 11 8 6 17-4 8-20 9-25 0-5-9 0-17 7-17Z" fill="#f6c431"/><path d="M24 15c-3 8-3 16 0 25" fill="none" stroke="#fff08a" stroke-width="3" stroke-linecap="round"/><path d="M22 15c1-5 7-7 11-3-2 5-7 6-11 3Z" fill="#178f45"/>`),
    "ししとう": svg(`<path d="M14 34c7-19 19-23 25-18-1 12-10 23-25 18Z" fill="#43c15f"/><path d="M17 31c7-2 14-8 19-15" fill="none" stroke="#bff2a9" stroke-width="3" stroke-linecap="round"/><path d="M37 16c1-4 4-5 7-4" fill="none" stroke="#178f45" stroke-width="3" stroke-linecap="round"/>`),
    "オクラ": svg(`<polygon points="24,7 37,17 32,39 16,39 11,17" fill="#2eaf55"/><polygon points="24,14 31,20 28,32 20,32 17,20" fill="#d9ffd3"/><circle cx="24" cy="23" r="2" fill="#68bf55"/><circle cx="20" cy="27" r="1.8" fill="#68bf55"/><circle cx="28" cy="27" r="1.8" fill="#68bf55"/><path d="M24 7c-1-4 4-6 8-4" fill="none" stroke="#178f45" stroke-width="3" stroke-linecap="round"/>`),
    "いんげん": svg(`<path d="M12 33c8-16 18-23 28-18-3 15-14 23-28 18Z" fill="#36b657"/><path d="M15 31c8-3 15-9 22-16" fill="none" stroke="#bdf5a4" stroke-width="3" stroke-linecap="round"/><circle cx="23" cy="28" r="2" fill="#7bd96b"/><circle cx="29" cy="23" r="2" fill="#7bd96b"/><circle cx="35" cy="18" r="1.8" fill="#7bd96b"/>`),
    "枝豆": svg(`<path d="M13 31c4-17 17-22 25-12-1 15-16 21-25 12Z" fill="#60c957"/><circle cx="21" cy="28" r="4" fill="#c8f489"/><circle cx="28" cy="24" r="4" fill="#c8f489"/><circle cx="34" cy="20" r="3.3" fill="#c8f489"/><path d="M14 31c9-3 17-8 24-14" fill="none" stroke="#239548" stroke-width="2" stroke-linecap="round"/>`),
    "えんどう": svg(`<path d="M11 30c8-15 21-18 30-9-6 14-20 19-30 9Z" fill="#78d85f"/><circle cx="20" cy="28" r="3.4" fill="#e0ffad"/><circle cx="27" cy="25" r="3.4" fill="#e0ffad"/><circle cx="34" cy="22" r="3.1" fill="#e0ffad"/><path d="M13 30c10-1 18-5 28-11" fill="none" stroke="#38a64e" stroke-width="2" stroke-linecap="round"/>`),
    "とうもろこし": svg(`<path d="M17 13c8-9 20 0 16 19-2 10-16 12-20 2-2-6-1-15 4-21Z" fill="#ffd33d"/><path d="M17 17h16M15 24h19M16 31h17M21 12v28M27 13v27" stroke="#e0a51b" stroke-width="1.4"/><path d="M14 25c-6 5-6 13 5 17" fill="#45bf5e"/><path d="M33 25c7 5 6 13-4 17" fill="#31a54f"/>`),
    "かぼちゃ": svg(`<path d="M12 26c0-12 24-13 24 0 0 12-8 16-12 16s-12-4-12-16Z" fill="#ff9f28"/><path d="M24 10c3 8 3 24 0 32M17 14c-4 9-4 18 0 25M31 14c4 9 4 18 0 25" fill="none" stroke="#d97717" stroke-width="2"/><path d="M24 11c0-6 6-6 8-3" fill="none" stroke="#178f45" stroke-width="3" stroke-linecap="round"/>`),
    "スイカ": svg(`<path d="M8 30c5-18 29-22 36-1-8 12-27 13-36 1Z" fill="#2ebc63"/><path d="M13 29c6-10 20-14 27-1-6 8-20 9-27 1Z" fill="#ff4866"/><circle cx="22" cy="29" r="1.4" fill="#4b1c1c"/><circle cx="30" cy="27" r="1.4" fill="#4b1c1c"/>`),
    "メロン": svg(`<circle cx="24" cy="25" r="15" fill="#b9dc72"/><path d="M13 20c8 5 15 5 22 0M13 30c8-5 15-5 22 0M19 12c-4 8-4 17 0 26M29 12c4 8 4 17 0 26" fill="none" stroke="#79ad54" stroke-width="2"/><path d="M23 10c-1-5 5-7 9-4" fill="none" stroke="#178f45" stroke-width="3" stroke-linecap="round"/>`),
    "大根": svg(`<path d="M19 15c8-3 15 0 14 8-1 10-5 17-9 22-5-5-9-12-10-21-1-4 1-7 5-9Z" fill="#fffdf2"/><path d="M18 24c4 2 9 2 14 0" fill="none" stroke="#d6dfd7" stroke-width="2" stroke-linecap="round"/><path d="M22 16c-5-7-1-13 6-13 0 7-2 11-6 13Z" fill="#35b85a"/><path d="M26 15c2-8 8-10 13-5-3 6-7 8-13 5Z" fill="#46c86a"/><path d="M20 16c-7-3-8-9-3-13 5 4 6 8 3 13Z" fill="#248f43"/>`),
    "かぶ": svg(`<path d="M15 27c0-9 18-12 20 0 1 9-6 16-10 18-5-2-11-9-10-18Z" fill="#fff7ee"/><path d="M17 29c5 3 11 3 17 0" fill="none" stroke="#d9d2c4" stroke-width="2" stroke-linecap="round"/><path d="M24 18c-5-7-2-14 6-14 1 8-2 12-6 14Z" fill="#32a852"/><path d="M26 18c4-8 11-9 15-3-4 5-9 6-15 3Z" fill="#4cc86a"/>`),
    "にんじん": svg(`<path d="M16 17c5-5 14-4 17 2-2 10-7 18-14 25-4-9-5-18-3-27Z" fill="#ff8a24"/><path d="M18 25c4 2 7 2 11 0M19 32c3 1 5 1 8 0" fill="none" stroke="#d96a18" stroke-width="2" stroke-linecap="round"/><path d="M23 17c-5-6-2-13 4-14 2 6 0 11-4 14Z" fill="#32a852"/><path d="M25 17c2-7 8-9 13-5-3 5-7 7-13 5Z" fill="#45c469"/>`),
    "じゃがいも": svg(`<path d="M13 28c-2-10 8-20 20-15 9 4 9 18 0 23-9 6-18 2-20-8Z" fill="#c98f47"/><circle cx="20" cy="24" r="1.6" fill="#7a4b20"/><circle cx="30" cy="21" r="1.4" fill="#7a4b20"/><circle cx="28" cy="31" r="1.6" fill="#7a4b20"/><path d="M16 22c4-5 11-7 17-4" fill="none" stroke="#e1b270" stroke-width="2" stroke-linecap="round"/>`),
    "さつまいも": svg(`<path d="M11 31c2-14 16-24 29-13-1 15-16 24-29 13Z" fill="#7b3f84"/><path d="M16 29c5-6 12-10 20-11" fill="none" stroke="#b474b8" stroke-width="3" stroke-linecap="round"/><path d="M36 17c1-4 5-5 8-3" fill="none" stroke="#178f45" stroke-width="3" stroke-linecap="round"/>`),
    "さといも": svg(`<path d="M13 27c-1-10 8-18 19-14 8 3 9 16 2 22-8 8-20 3-21-8Z" fill="#b98762"/><path d="M18 22c4-5 11-6 16-2" fill="none" stroke="#dfb58a" stroke-width="2" stroke-linecap="round"/><circle cx="21" cy="28" r="1.5" fill="#7b543c"/><circle cx="30" cy="25" r="1.4" fill="#7b543c"/><path d="M25 14c-2-6 3-10 9-8-1 6-4 8-9 8Z" fill="#49b85d"/>`),
    "玉ねぎ": svg(`<path d="M13 28c0-10 6-17 11-19 6 2 11 9 11 19 0 10-6 16-11 16s-11-6-11-16Z" fill="#f1c86a"/><path d="M24 9c-2 8-2 23 0 35M17 22c-2 8 0 15 5 20M31 22c2 8 0 15-5 20" fill="none" stroke="#c89136" stroke-width="2" stroke-linecap="round"/><path d="M24 10c-2-5 2-9 7-8-1 5-3 7-7 8Z" fill="#39a856"/><path d="M24 10c2-5-1-8-6-8 1 5 3 7 6 8Z" fill="#4fbd65"/>`),
    "にんにく": svg(`<path d="M15 29c0-9 4-15 9-18 5 3 9 9 9 18 0 9-5 14-9 15-4-1-9-6-9-15Z" fill="#fff6df"/><path d="M24 12c-2 8-2 21 0 31M18 24c-2 7 0 13 4 18M30 24c2 7 0 13-4 18" fill="none" stroke="#d9caa8" stroke-width="2" stroke-linecap="round"/><path d="M24 11c-3-4 0-8 5-8" fill="none" stroke="#5eb85d" stroke-width="3" stroke-linecap="round"/>`),
    "しょうが": svg(`<path d="M10 31c5-8 12-8 17-4 4-6 12-8 16-2-2 8-12 9-17 5-4 6-12 8-16 1Z" fill="#d99b4a"/><path d="M15 31c5-2 9-4 13-7M27 29c4-3 8-4 13-4" fill="none" stroke="#f0c47c" stroke-width="2" stroke-linecap="round"/><path d="M26 25c-2-5 2-9 8-8" fill="none" stroke="#49a856" stroke-width="3" stroke-linecap="round"/>`),
    "ねぎ": svg(`<path d="M12 35c7-8 15-17 23-28" fill="none" stroke="#2eaf55" stroke-width="8" stroke-linecap="round"/><path d="M10 38c8-8 15-17 23-28" fill="none" stroke="#f9fff2" stroke-width="7" stroke-linecap="round"/><path d="M26 17c5-5 10-8 17-7M28 15c3-6 7-9 12-11" fill="none" stroke="#238f45" stroke-width="3" stroke-linecap="round"/>`),
    "レタス": svg(`<path d="M12 27c-5-11 8-20 16-12 9-4 18 8 10 18-4 8-22 10-26-6Z" fill="#8ee66d"/><path d="M17 30c7-5 11-8 17-13M23 35c-1-8 1-15 5-21" fill="none" stroke="#3fae4b" stroke-width="2" stroke-linecap="round"/>`),
    "キャベツ": svg(`<circle cx="24" cy="26" r="16" fill="#8ee66d"/><path d="M12 26c7-8 16-11 25-5M15 34c6-8 15-10 24-7M22 11c-4 9-3 19 2 31" fill="none" stroke="#3fae4b" stroke-width="2" stroke-linecap="round"/>`),
    "白菜": svg(`<path d="M12 27c0-12 8-20 12-22 5 2 13 10 13 22 0 10-6 17-13 18-7-1-12-8-12-18Z" fill="#eef6c9"/><path d="M24 6c-2 12-2 25 0 38M16 18c5 6 11 8 19 7M15 29c6 5 13 6 21 3" fill="none" stroke="#80bd55" stroke-width="2" stroke-linecap="round"/><path d="M13 24c-6-9 3-17 10-13-4 8-6 13-10 13Z" fill="#84d66a"/><path d="M35 24c7-8-2-17-10-13 5 7 7 12 10 13Z" fill="#73c95f"/>`),
    "ブロッコリー": svg(`<circle cx="18" cy="18" r="7" fill="#36ad48"/><circle cx="28" cy="17" r="8" fill="#2f9d43"/><circle cx="33" cy="25" r="7" fill="#3cbc52"/><circle cx="16" cy="27" r="8" fill="#42bd55"/><path d="M24 28v13M18 39h13" fill="none" stroke="#7ccf62" stroke-width="6" stroke-linecap="round"/>`),
    "ほうれん草": svg(`<path d="M23 41c-2-12-1-25 2-36" fill="none" stroke="#196f35" stroke-width="3" stroke-linecap="round"/><path d="M23 21c-11-9-8-19 3-18 5 8 2 15-3 18Z" fill="#2eaf55"/><path d="M25 22c12-7 14-18 4-20-7 6-8 14-4 20Z" fill="#3ec665"/><path d="M23 31c-10-4-12-13-3-17 6 3 7 10 3 17Z" fill="#2b9d48"/>`),
    "小松菜": svg(`<path d="M24 42c-1-12 0-24 2-36" fill="none" stroke="#196f35" stroke-width="3" stroke-linecap="round"/><path d="M22 20c-12-7-10-16 1-17 6 6 5 13-1 17Z" fill="#31ad4f"/><path d="M27 21c12-6 13-16 3-18-7 5-8 12-3 18Z" fill="#44c564"/><path d="M22 33c-11-3-14-11-5-16 6 2 8 9 5 16Z" fill="#3bb65a"/><path d="M27 34c11-4 13-12 5-17-6 2-8 9-5 17Z" fill="#2ea24e"/>`),
    "春菊": svg(`<path d="M24 42V9" fill="none" stroke="#176f37" stroke-width="3" stroke-linecap="round"/><path d="M23 18c-7-8-3-14 5-14 4 7 1 12-5 14Z" fill="#38b95a"/><path d="M25 21c9-7 14-4 14 4-7 4-12 2-14-4Z" fill="#4bc86a"/><path d="M22 29c-10-4-11-10-4-15 6 3 8 9 4 15Z" fill="#2fa44f"/><path d="M26 31c10-4 11-11 4-15-6 3-8 9-4 15Z" fill="#43bd61"/>`),
    "パセリ": svg(`<circle cx="18" cy="17" r="6" fill="#2f9d43"/><circle cx="27" cy="15" r="7" fill="#35ad4d"/><circle cx="34" cy="22" r="6" fill="#3cbf55"/><circle cx="15" cy="27" r="7" fill="#42bd55"/><circle cx="27" cy="28" r="8" fill="#2fa34a"/><path d="M24 29v13" fill="none" stroke="#176f37" stroke-width="4" stroke-linecap="round"/>`),
    "シソ": svg(`<path d="M24 43c-9-9-14-18-12-28 10-8 22-5 25 5-2 10-7 17-13 23Z" fill="#4aa850"/><path d="M24 41V12M16 20c7 3 13 3 20 0M18 29c6 2 11 2 17-1" fill="none" stroke="#d5ffd0" stroke-width="2" stroke-linecap="round"/><path d="M23 12c-2-5 4-8 9-5" fill="#73d36e"/>`),
    "アスパラ": svg(`<path d="M17 42c3-11 8-22 14-36" fill="none" stroke="#2ea652" stroke-width="8" stroke-linecap="round"/><path d="M24 19c4-2 8-2 12-1M21 26c4-2 8-2 12-1M18 33c4-2 8-2 12-1" fill="none" stroke="#a8ef8a" stroke-width="2" stroke-linecap="round"/><path d="M31 6c3 2 5 5 5 8-5 1-9-1-11-5 1-2 3-3 6-3Z" fill="#5cc66c"/>`),
    "いちご": svg(`<path d="M14 21c1-11 19-12 20 0 0 10-10 20-10 20S14 31 14 21Z" fill="#ef3f5f"/><path d="M19 13c-4-5 4-9 8-5-2 5-5 6-8 5Z" fill="#35b85a"/><path d="M25 13c1-6 8-7 11-2-4 4-7 5-11 2Z" fill="#42bd55"/><circle cx="20" cy="23" r="1.2" fill="#ffe78a"/><circle cx="27" cy="22" r="1.2" fill="#ffe78a"/><circle cx="24" cy="30" r="1.2" fill="#ffe78a"/>`)
  };

  return icons[cropName] || svg(`<circle cx="24" cy="24" r="15" fill="#55d768"/><path d="M18 24c6-10 15-12 22-5" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>`);
}

function renderPasteSeedlingButton() {
  elements.pasteSeedlingButton.classList.toggle("hidden", !copiedSeedlingTemplate || Boolean(modalSeedlingId));
  if (copiedSeedlingTemplate) {
    elements.pasteSeedlingButton.textContent = `${copiedSeedlingTemplate.cropName}を貼り付け`;
  }
}

function applySeedlingTemplateToModal(template) {
  elements.modalCropNameInput.value = template.cropName || "";
  elements.modalVarietyInput.value = template.variety || "";
  elements.modalPlantedDateInput.value = template.plantedDate || today;
  elements.modalSeedlingMemoInput.value = template.memo || "";
  renderCropPicker();
  elements.modalVarietyInput.focus();
}

function startCopyPlacement(seedling) {
  copiedSeedlingTemplate = createSeedlingTemplate(seedling);
  copyPlacementTemplate = copiedSeedlingTemplate;
  mapFilter = "all";
  elements.mapFilterSelect.value = "all";
  closeSeedlingModal();
  renderField();
}

function cancelCopyPlacement() {
  copyPlacementTemplate = null;
  renderField();
}

function placeCopiedSeedling(cell) {
  if (!copyPlacementTemplate || state.seedlings.some((seedling) => seedling.cell === cell)) return;

  state.seedlings.push({
    id: createId("seedling"),
    ...copyPlacementTemplate,
    cell
  });
  saveAndRender();
}

function createSeedlingTemplate(seedling) {
  return {
    cropName: seedling.cropName,
    variety: seedling.variety || "",
    plantedDate: seedling.plantedDate || today,
    memo: seedling.memo || ""
  };
}

function renderSummary() {
  const totalExpense = state.expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const planted = state.seedlings.length;
  const cells = state.grid.columns * state.grid.rows * 2;
  elements.summaryText.textContent = `左ページ・右ページ / ${state.grid.rows}段 x ${state.grid.columns}区画 x 2 / ${cells}区画中 ${planted}区画使用 / 費用合計 ${formatNumber(totalExpense)}円`;
}

function addHarvest(data, { quick = false } = {}) {
  if (!data.seedlingId || !data.amount) return;
  let existingQuickHarvest = null;
  if (quick) {
    for (let index = state.harvests.length - 1; index >= 0; index -= 1) {
      const harvest = state.harvests[index];
      if (
        harvest.seedlingId === data.seedlingId
        && harvest.date === data.date
        && harvest.unit === data.unit
        && harvest.memo === data.memo
      ) {
        existingQuickHarvest = harvest;
        break;
      }
    }
  }

  if (existingQuickHarvest) {
    existingQuickHarvest.amount += data.amount;
  } else {
    state.harvests.push({
      id: createId("harvest"),
      ...data
    });
  }

  if (quick) {
    saveQuickHarvest(data.seedlingId);
  } else {
    saveAndRender();
  }
}

function undoLatestHarvestUnit(seedlingId, unit, { quick = false, memo = "", date = "" } = {}) {
  let index;
  for (let currentIndex = state.harvests.length - 1; currentIndex >= 0; currentIndex -= 1) {
    const harvest = state.harvests[currentIndex];
    if (
      harvest.seedlingId === seedlingId
      && harvest.unit === unit
      && (!memo || harvest.memo === memo)
      && (!date || harvest.date === date)
    ) {
      index = currentIndex;
      break;
    }
  }

  if (index === undefined) return;

  const harvest = state.harvests[index];
  if (harvest.amount <= 1) {
    state.harvests.splice(index, 1);
  } else {
    state.harvests[index] = { ...harvest, amount: harvest.amount - 1 };
  }
  if (quick) {
    saveQuickHarvest(seedlingId);
  } else {
    saveAndRender();
  }
}

function saveQuickHarvest(seedlingId) {
  updateQuickHarvestDisplays(seedlingId);
  scheduleQuickHarvestLocalSave();
  scheduleQuickHarvestRender();
  scheduleQuickHarvestCloudSave();
}

function scheduleQuickHarvestLocalSave() {
  clearTimeout(quickHarvestLocalTimer);
  quickHarvestLocalTimer = setTimeout(() => {
    quickHarvestLocalTimer = null;
    storage.saveLocal(state);
  }, 80);
}

function updateQuickHarvestDisplays(seedlingId) {
  const mapCount = formatNumber(harvestTotalForSeedlingUnit(seedlingId, "個"));
  document.querySelectorAll("[data-harvest-count-seedling-id]").forEach((element) => {
    if (element.dataset.harvestCountSeedlingId === seedlingId) {
      element.textContent = mapCount;
    }
  });

  document.querySelectorAll("[data-harvest-mode-seedling-id]").forEach((card) => {
    if (card.dataset.harvestModeSeedlingId !== seedlingId) return;
    const amount = harvestTotalForSeedlingDateUnit(seedlingId, today, harvestModeUnit);
    const count = card.querySelector(".harvest-mode-count-value");
    const lifetime = card.querySelector(".harvest-mode-lifetime");
    const decrement = card.querySelector(".harvest-mode-step.decrement");
    const doneBadge = card.querySelector(".harvest-mode-done-badge");
    const harvestedToday = hasHarvestToday(seedlingId);
    if (count) count.textContent = formatNumber(amount);
    if (lifetime) lifetime.textContent = `累計 ${harvestTotalsForSeedling(seedlingId) || "収穫なし"}`;
    if (decrement) decrement.disabled = amount <= 0;
    card.classList.toggle("harvested-today", harvestedToday);
    if (harvestedToday && !doneBadge) {
      const badge = document.createElement("em");
      badge.className = "harvest-mode-done-badge";
      badge.textContent = "今日済";
      card.querySelector(".harvest-mode-identity > div:last-child")?.append(badge);
    } else if (!harvestedToday && doneBadge) {
      doneBadge.remove();
    }
  });

  if (!elements.harvestModeModal.classList.contains("hidden")) {
    renderHarvestModeSummary();
    renderHarvestModeStatusFilters();
    elements.undoHarvestModeButton.disabled = !lastHarvestModeAction;
    if (harvestModeStatusFilter !== "all") {
      renderHarvestMode();
    }
  }
}

function scheduleQuickHarvestRender() {
  clearTimeout(quickHarvestRenderTimer);
  quickHarvestRenderTimer = setTimeout(() => {
    quickHarvestRenderTimer = null;
    renderRecords();
  }, 600);
}

function scheduleQuickHarvestCloudSave() {
  if (!storage.isCloudConfigured()) {
    renderSyncMiniStatus("ローカル", "idle");
    return;
  }

  quickHarvestCloudDirty = true;
  renderSyncMiniStatus("保存待ち", "syncing");
  if (quickHarvestCloudTimer || quickHarvestCloudSaving) return;

  quickHarvestCloudTimer = setTimeout(flushQuickHarvestCloudSave, 250);
}

async function flushQuickHarvestCloudSave() {
  quickHarvestCloudTimer = null;
  quickHarvestCloudSaving = true;
  quickHarvestCloudDirty = false;
  renderSyncMiniStatus("保存中", "syncing");
  try {
    await storage.pushCloud(state);
    renderSyncMiniStatus("保存済み", "ok");
  } catch {
    renderSyncMiniStatus("保存失敗", "error");
  } finally {
    quickHarvestCloudSaving = false;
    if (quickHarvestCloudDirty && !quickHarvestCloudTimer) {
      quickHarvestCloudTimer = setTimeout(flushQuickHarvestCloudSave, 250);
    }
  }
}

function deleteSeedling(id) {
  state.seedlings = state.seedlings.filter((seedling) => seedling.id !== id);
  state.harvests = state.harvests.filter((harvest) => harvest.seedlingId !== id);
  state.expenses = state.expenses.map((expense) => (
    expense.seedlingId === id ? { ...expense, seedlingId: "" } : expense
  ));
  if (editingSeedlingId === id) {
    editingSeedlingId = "";
    elements.seedlingForm.reset();
    elements.plantedDateInput.value = today;
    elements.seedlingSubmitButton.textContent = "苗を登録";
    elements.cancelSeedlingEditButton.classList.add("hidden");
  }
  saveAndRender();
}

function deleteRecord(collection, id) {
  state[collection] = state[collection].filter((item) => item.id !== id);
  saveAndRender();
}

function harvestTotalsForSeedling(seedlingId) {
  const totals = state.harvests
    .filter((harvest) => harvest.seedlingId === seedlingId)
    .reduce((acc, harvest) => {
      acc[harvest.unit] = (acc[harvest.unit] || 0) + harvest.amount;
      return acc;
    }, {});

  return Object.entries(totals)
    .map(([unit, amount]) => `${formatNumber(amount)} ${unit}`)
    .join(" / ");
}

function harvestTotalsForPeriod(predicate) {
  return formatHarvestTotals(state.harvests
    .filter(predicate)
    .reduce((acc, harvest) => {
      const seedling = findSeedling(harvest.seedlingId);
      const cropName = seedling?.cropName || "不明";
      const key = `${cropName}:${harvest.unit}`;
      acc[key] = {
        cropName,
        unit: harvest.unit,
        amount: (acc[key]?.amount || 0) + harvest.amount
      };
      return acc;
    }, {}));
}

function harvestTotalsByDate() {
  return state.harvests.reduce((acc, harvest) => {
    acc[harvest.date] = acc[harvest.date] || {};
    const seedling = findSeedling(harvest.seedlingId);
    const cropName = seedling?.cropName || "不明";
    const key = `${cropName}:${harvest.unit}`;
    acc[harvest.date][key] = {
      cropName,
      unit: harvest.unit,
      amount: (acc[harvest.date][key]?.amount || 0) + harvest.amount
    };
    return acc;
  }, {});
}

function formatHarvestTotals(totals) {
  const entries = Object.values(totals);
  if (!entries.length) return "";

  return entries
    .sort((a, b) => b.amount - a.amount)
    .map((item) => `${item.cropName} ${formatNumber(item.amount)}${item.unit}`)
    .join(" / ");
}

function harvestTotalForSeedlingUnit(seedlingId, unit) {
  return state.harvests
    .filter((harvest) => harvest.seedlingId === seedlingId && harvest.unit === unit)
    .reduce((sum, harvest) => sum + harvest.amount, 0);
}

function getCells() {
  const cells = [];
  for (let row = 1; row <= state.grid.rows; row += 1) {
    ["L", "R"].forEach((side) => {
      for (let segment = 1; segment <= state.grid.columns; segment += 1) {
        cells.push(cellId(row, side, segment));
      }
    });
  }
  return cells;
}

function uniqueCropNames() {
  return [...new Set(state.seedlings.map((seedling) => seedling.cropName))]
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, "ja"));
}

function cellExists(cell) {
  return getCells().includes(cell);
}

function remapCellForGridResize(cell, previousGrid, nextGrid) {
  const position = parseCellPosition(cell);
  if (!position) return cell;

  const displaySegment = previousGrid.columns - position.segment + 1;
  const nextSegment = nextGrid.columns - displaySegment + 1;
  return cellId(position.row, position.side, nextSegment);
}

function parseCellPosition(cell) {
  const match = /^(\d+)-(L|R)-(-?\d+)$/.exec(cell);
  if (!match) return null;

  return {
    row: Number(match[1]),
    side: match[2],
    segment: Number(match[3])
  };
}

function nextAvailableCell(currentCell) {
  const cells = getCells();
  const occupiedCells = new Set(state.seedlings.map((seedling) => seedling.cell));
  const startIndex = Math.max(0, cells.indexOf(currentCell));
  return cells.slice(startIndex + 1).find((cell) => !occupiedCells.has(cell))
    || cells.find((cell) => !occupiedCells.has(cell))
    || "";
}

function seedlingLabel(seedling) {
  const variety = seedling.variety ? ` / ${seedling.variety}` : "";
  return `${cellDisplayName(seedling.cell)} ${seedling.cropName}${variety}`;
}

function cellId(row, side, segment) {
  return `${row}-${side}-${segment}`;
}

function cellDisplayName(cell) {
  const position = parseCellPosition(cell);
  if (!position) return cell;

  const sideName = position.side === "L" ? "左" : "右";
  return `${position.row}段目 ${sideName} ${displaySegmentNumber(position.segment)}番`;
}

function cellShortName(cell) {
  const position = parseCellPosition(cell);
  if (!position) return cell;

  const segment = displaySegmentNumber(position.segment);
  return segment === 1 || segment % 5 === 0 ? String(segment) : "";
}

function displaySegmentNumber(segment) {
  return state.grid.columns - Number(segment) + 1;
}

function compactCropName(cropName) {
  return cropName.length > 3 ? cropName.slice(0, 2) : cropName;
}

function compactVarietyName(variety) {
  return variety.length > 6 ? `${variety.slice(0, 6)}…` : variety;
}

function applyCropTheme(element, cropName) {
  const themes = [
    { crops: ["トマト", "ミニトマト"], start: "#ffe3d8", end: "#ff6b4a", ink: "#6f1608" },
    { crops: ["ナス"], start: "#eee2ff", end: "#8f62ff", ink: "#2e155f" },
    { crops: ["赤パプリカ"], start: "#ffe1d8", end: "#f2553f", ink: "#6f1608" },
    { crops: ["黄パプリカ"], start: "#fff7bf", end: "#f6c431", ink: "#674600" },
    { crops: ["きゅうり", "ゴーヤ", "ズッキーニ", "ピーマン", "ししとう", "オクラ", "いんげん"], start: "#e0ffd7", end: "#45d56d", ink: "#064428" },
    { crops: ["枝豆", "えんどう"], start: "#ddffbe", end: "#7ed957", ink: "#315000" },
    { crops: ["とうもろこし"], start: "#fff2a8", end: "#f6c431", ink: "#674600" },
    { crops: ["かぼちゃ"], start: "#ffe6b8", end: "#ff9c32", ink: "#5c3100" },
    { crops: ["スイカ", "メロン"], start: "#dfffc8", end: "#28c587", ink: "#063d2b" },
    { crops: ["大根", "かぶ", "にんじん", "じゃがいも", "さつまいも", "さといも", "玉ねぎ", "にんにく", "しょうが", "ねぎ"], start: "#fff0d6", end: "#d99b4a", ink: "#583000" },
    { crops: ["レタス", "キャベツ", "白菜", "ブロッコリー", "ほうれん草", "小松菜", "春菊", "パセリ", "シソ", "アスパラ"], start: "#ecffd9", end: "#6edc55", ink: "#15430d" },
    { crops: ["いちご"], start: "#ffdbe8", end: "#ff4d79", ink: "#6b0925" }
  ];
  const theme = themes.find((item) => item.crops.includes(cropName))
    || { start: "#f0ffd9", end: "#55d768", ink: "#053c25" };

  element.style.setProperty("--crop-start", theme.start);
  element.style.setProperty("--crop-end", theme.end);
  element.style.setProperty("--crop-ink", theme.ink);
}

function renderSideButtons() {
  elements.mapSideButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.side === activeSide);
  });
}

function findSeedling(id) {
  return state.seedlings.find((seedling) => seedling.id === id);
}

function activateTab(tabName) {
  document.querySelectorAll(".tab-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === tabName);
  });
  document.querySelectorAll(".tab-panel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === `${tabName}Panel`);
  });
}

function appendEmpty(target) {
  target.append(elements.emptyStateTemplate.content.cloneNode(true));
}

function appendEmptyMessage(target, message) {
  const empty = document.createElement("p");
  empty.className = "empty-state";
  empty.textContent = message;
  target.append(empty);
}

function saveAndRender() {
  clearTimeout(quickHarvestLocalTimer);
  quickHarvestLocalTimer = null;
  clearTimeout(quickHarvestRenderTimer);
  quickHarvestRenderTimer = null;
  clearTimeout(quickHarvestCloudTimer);
  quickHarvestCloudTimer = null;
  quickHarvestCloudDirty = false;
  const saveResult = storage.save(state);
  render();
  renderSyncMiniStatus(storage.isCloudConfigured() ? "保存中" : "ローカル", storage.isCloudConfigured() ? "syncing" : "idle");
  saveResult
    .then((result) => {
      if (result?.skipped) {
        renderSyncMiniStatus("ローカル", "idle");
        return;
      }
      renderSyncMiniStatus("保存済み", "ok");
    })
    .catch(() => {
      renderSyncMiniStatus("保存失敗", "error");
    });
}

function loadState() {
  const stored = storage.load();
  return stored ? normalizeState(stored) : structuredClone(defaultState);
}

async function autoPullCloudOnStartup() {
  if (!storage.isCloudConfigured()) {
    renderSyncMiniStatus("ローカル", "idle");
    return;
  }

  renderSyncMiniStatus("取得中", "syncing");
  try {
    const remote = await storage.pullCloud();
    if (!remote) {
      renderSyncMiniStatus("クラウド空", "idle");
      return;
    }

    state = normalizeState(remote.state);
    render();
    renderSyncMiniStatus("取得済み", "ok");
  } catch {
    renderSyncMiniStatus("取得失敗", "error");
  }
}

function renderSyncMiniStatus(message, status = "idle") {
  elements.syncMiniStatus.textContent = message;
  elements.syncMiniStatus.dataset.status = status;
}

function normalizeState(value) {
  const seedlings = Array.isArray(value?.seedlings) ? value.seedlings : [];
  const harvests = Array.isArray(value?.harvests) ? value.harvests : [];
  const expenses = Array.isArray(value?.expenses) ? value.expenses : [];
  const activities = Array.isArray(value?.activities) ? value.activities : [];
  const tasks = Array.isArray(value?.tasks) ? value.tasks : [];
  const pesticideApplications = Array.isArray(value?.pesticideApplications) ? value.pesticideApplications : [];
  const hasRecords = seedlings.length || harvests.length || expenses.length || activities.length || tasks.length || pesticideApplications.length;
  const savedColumns = value?.grid?.columns;
  const savedRows = value?.grid?.rows;
  const isOldLayout = value?.layoutVersion !== defaultState.layoutVersion;
  const shouldUseNewDefault = !hasRecords && (
    (savedColumns === 6 && savedRows === 4) ||
    (savedColumns === 7 && savedRows === 5)
  );
  const shouldExpandOldLayout = isOldLayout && savedColumns < defaultState.grid.columns;
  const grid = {
    columns: clampNumber((shouldUseNewDefault || shouldExpandOldLayout) ? defaultState.grid.columns : savedColumns ?? defaultState.grid.columns, 1, 30),
    rows: clampNumber(shouldUseNewDefault ? defaultState.grid.rows : savedRows ?? defaultState.grid.rows, 1, 20)
  };

  return {
    layoutVersion: defaultState.layoutVersion,
    grid,
    seedlings: repairStaleOverflowCells(seedlings, grid),
    harvests: compactQuickHarvests(harvests),
    expenses,
    activities,
    tasks,
    pesticideApplications
  };
}

function compactQuickHarvests(harvests) {
  const compactableMemos = new Set(["畑マップから追加", "収穫モードから追加"]);
  const compacted = [];
  const groups = new Map();

  harvests.forEach((harvest) => {
    if (!compactableMemos.has(harvest.memo)) {
      compacted.push(harvest);
      return;
    }

    const key = [harvest.seedlingId, harvest.date, harvest.unit, harvest.memo].join("\u0000");
    const existing = groups.get(key);
    if (existing) {
      existing.amount += Number(harvest.amount) || 0;
      return;
    }

    const entry = { ...harvest, amount: Number(harvest.amount) || 0 };
    groups.set(key, entry);
    compacted.push(entry);
  });

  return compacted;
}

function repairStaleOverflowCells(seedlings, grid) {
  const maxSegmentsByLine = new Map();

  seedlings.forEach((seedling) => {
    const position = parseCellPosition(seedling.cell);
    if (!position || position.segment <= grid.columns) return;

    const key = `${position.row}-${position.side}`;
    maxSegmentsByLine.set(key, Math.max(maxSegmentsByLine.get(key) || grid.columns, position.segment));
  });

  if (!maxSegmentsByLine.size) return seedlings;

  return seedlings.map((seedling) => {
    const position = parseCellPosition(seedling.cell);
    if (!position || position.segment <= grid.columns) return seedling;

    const key = `${position.row}-${position.side}`;
    const effectiveColumns = maxSegmentsByLine.get(key) || grid.columns;
    const displaySegment = effectiveColumns - position.segment + 1;
    return {
      ...seedling,
      cell: cellId(position.row, position.side, grid.columns - displaySegment + 1)
    };
  });
}

function clampNumber(value, min, max) {
  const number = Number(value);
  if (Number.isNaN(number)) return min;
  return Math.min(max, Math.max(min, Math.trunc(number)));
}

function currentLocalDate() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatNumber(value) {
  return new Intl.NumberFormat("ja-JP", { maximumFractionDigits: 1 }).format(value);
}

function formatMonthDay(date) {
  const [, , month, day] = String(date).match(/^(\d{4})-(\d{2})-(\d{2})$/) || [];
  return month && day ? `${Number(month)}/${Number(day)}` : date;
}

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  if (!["http:", "https:"].includes(window.location.protocol)) return;

  let refreshing = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });

  navigator.serviceWorker.register("./service-worker.js", { updateViaCache: "none" })
    .then((registration) => registration.update())
    .catch(() => {
      // The app still works without offline caching.
    });
}

registerServiceWorker();
render();
applySyncSettingsFromUrl();
autoPullCloudOnStartup();
