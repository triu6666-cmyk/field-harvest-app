const storage = window.fieldHarvestStorage;
const cropProfiles = window.FIELD_HARVEST_CROP_CALENDAR || {};

const cropNames = [
  "トマト", "ミニトマト", "ナス", "きゅうり", "ゴーヤ", "ズッキーニ", "ピーマン", "赤パプリカ", "黄パプリカ", "ししとう",
  "オクラ", "いんげん", "枝豆", "えんどう", "とうもろこし", "かぼちゃ", "スイカ", "メロン", "大根", "かぶ",
  "にんじん", "じゃがいも", "さつまいも", "さといも", "玉ねぎ", "にんにく", "しょうが", "ねぎ", "レタス", "キャベツ",
  "白菜", "ブロッコリー", "ほうれん草", "小松菜", "春菊", "パセリ", "シソ", "アスパラ", "いちご"
];

const elements = {
  planForm: document.querySelector("#plantingPlanForm"),
  planDateInput: document.querySelector("#planDateInput"),
  planMethodInput: document.querySelector("#planMethodInput"),
  planCropSearch: document.querySelector("#planCropSearch"),
  planCropPicker: document.querySelector("#planCropPicker"),
  planCropInput: document.querySelector("#planCropInput"),
  planVarietyInput: document.querySelector("#planVarietyInput"),
  planHarvestDaysInput: document.querySelector("#planHarvestDaysInput"),
  planForecastPreview: document.querySelector("#planForecastPreview"),
  planMemoInput: document.querySelector("#planMemoInput"),
  profileDataStatus: document.querySelector("#profileDataStatus"),
  planningHeroStats: document.querySelector("#planningHeroStats"),
  previousYearButton: document.querySelector("#previousYearButton"),
  nextYearButton: document.querySelector("#nextYearButton"),
  calendarYearLabel: document.querySelector("#calendarYearLabel"),
  annualCalendar: document.querySelector("#annualCalendar"),
  planListCount: document.querySelector("#planListCount"),
  plantingPlanList: document.querySelector("#plantingPlanList"),
  emptyPlanTemplate: document.querySelector("#emptyPlanTemplate")
};

let state = normalizeState(storage.load());
let selectedCropName = "";
let calendarYear = new Date().getFullYear();

elements.planDateInput.value = currentLocalDate();

elements.planCropSearch.addEventListener("input", renderCropPicker);
elements.planMethodInput.addEventListener("change", () => {
  applyCropProfile();
  renderForecastPreview();
});
elements.planDateInput.addEventListener("change", renderForecastPreview);
elements.planHarvestDaysInput.addEventListener("input", renderForecastPreview);
elements.previousYearButton.addEventListener("click", () => {
  calendarYear -= 1;
  renderCalendar();
});
elements.nextYearButton.addEventListener("click", () => {
  calendarYear += 1;
  renderCalendar();
});

elements.planForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!selectedCropName) {
    elements.planCropSearch.focus();
    return;
  }
  const daysToHarvest = Number(elements.planHarvestDaysInput.value);
  if (!Number.isFinite(daysToHarvest) || daysToHarvest <= 0) {
    elements.planHarvestDaysInput.focus();
    return;
  }

  state.plantingPlans.push({
    id: createId("plan"),
    cropName: selectedCropName,
    variety: elements.planVarietyInput.value.trim(),
    method: elements.planMethodInput.value,
    plannedDate: elements.planDateInput.value,
    daysToHarvest: Math.round(daysToHarvest),
    forecastHarvestDate: addDays(elements.planDateInput.value, Math.round(daysToHarvest)),
    memo: elements.planMemoInput.value.trim(),
    createdAt: new Date().toISOString()
  });
  resetPlanForm();
  saveAndRender();
});

function normalizeState(value) {
  const source = value && typeof value === "object" ? value : {};
  return {
    ...source,
    plantingPlans: Array.isArray(source.plantingPlans) ? source.plantingPlans.map(normalizePlan) : []
  };
}

function normalizePlan(plan) {
  const daysToHarvest = Math.max(1, Number(plan?.daysToHarvest) || 1);
  return {
    ...plan,
    cropName: plan?.cropName || "",
    variety: plan?.variety || "",
    method: plan?.method === "seedling" ? "seedling" : "seed",
    plannedDate: plan?.plannedDate || currentLocalDate(),
    daysToHarvest,
    forecastHarvestDate: plan?.forecastHarvestDate || addDays(plan?.plannedDate || currentLocalDate(), daysToHarvest),
    memo: plan?.memo || ""
  };
}

function saveAndRender() {
  storage.save(state).catch(() => {
    // The plan stays on this device even when cloud saving is unavailable.
  });
  render();
}

function render() {
  renderCropPicker();
  renderProfileDataStatus();
  renderForecastPreview();
  renderHeroStats();
  renderCalendar();
  renderPlanList();
}

function renderCropPicker() {
  const query = elements.planCropSearch.value.trim().toLocaleLowerCase("ja");
  const crops = cropNames.filter((cropName) => cropName.toLocaleLowerCase("ja").includes(query));
  elements.planCropPicker.replaceChildren();
  crops.forEach((cropName) => {
    const button = document.createElement("button");
    button.className = "plan-crop-option";
    button.type = "button";
    button.classList.toggle("selected", cropName === selectedCropName);
    button.setAttribute("aria-pressed", String(cropName === selectedCropName));
    button.innerHTML = `${window.fieldHarvestCropIconSvg(cropName)}<span>${cropName}</span>`;
    button.addEventListener("click", () => {
      selectedCropName = cropName;
      elements.planCropInput.value = cropName;
      applyCropProfile();
      renderCropPicker();
      renderForecastPreview();
    });
    elements.planCropPicker.append(button);
  });
}

function renderProfileDataStatus() {
  const profileCount = Object.keys(cropProfiles).length;
  const hasCurrentProfile = Boolean(cropProfiles[selectedCropName]);
  elements.profileDataStatus.classList.toggle("pending", !hasCurrentProfile);
  elements.profileDataStatus.textContent = hasCurrentProfile
    ? "栽培暦データあり"
    : profileCount ? "日数を手入力" : "栽培暦データ準備中";
}

function applyCropProfile() {
  const profile = cropProfiles[selectedCropName];
  if (!profile) {
    renderProfileDataStatus();
    return;
  }
  const days = elements.planMethodInput.value === "seedling" ? profile.seedlingDays : profile.seedDays;
  if (Number.isFinite(days) && days > 0) elements.planHarvestDaysInput.value = String(days);
  renderProfileDataStatus();
}

function renderForecastPreview() {
  const date = elements.planDateInput.value;
  const days = Number(elements.planHarvestDaysInput.value);
  const cropName = selectedCropName || "野菜";
  if (!date || !Number.isFinite(days) || days <= 0) {
    elements.planForecastPreview.textContent = "野菜、予定日、収穫までの日数を入力すると予測を表示します。";
    elements.planForecastPreview.classList.add("empty");
    return;
  }
  const harvestDate = addDays(date, days);
  const profile = cropProfiles[selectedCropName];
  elements.planForecastPreview.textContent = `${cropName}は ${formatDate(harvestDate)} 頃から収穫開始の目安です。${profile?.note ? ` ${profile.note}` : ""}`;
  elements.planForecastPreview.classList.remove("empty");
}

function renderHeroStats() {
  const plans = state.plantingPlans;
  const currentMonth = currentLocalDate().slice(0, 7);
  const monthPlans = plans.filter((plan) => plan.plannedDate.startsWith(currentMonth));
  const upcomingHarvests = plans.filter((plan) => {
    const difference = dateDifference(currentLocalDate(), plan.forecastHarvestDate);
    return difference !== null && difference >= 0 && difference <= 30;
  });
  elements.planningHeroStats.replaceChildren(
    createHeroStat("予定", `${plans.length}件`, "登録済み"),
    createHeroStat("今月植える", `${monthPlans.length}件`, currentMonth.replace("-", "/")),
    createHeroStat("30日以内の収穫", `${upcomingHarvests.length}件`, "予測")
  );
}

function createHeroStat(label, value, note) {
  const card = document.createElement("article");
  card.className = "planning-stat";
  const labelElement = document.createElement("span");
  labelElement.textContent = label;
  const valueElement = document.createElement("strong");
  valueElement.textContent = value;
  const noteElement = document.createElement("small");
  noteElement.textContent = note;
  card.append(labelElement, valueElement, noteElement);
  return card;
}

function renderCalendar() {
  elements.calendarYearLabel.textContent = `${calendarYear}年`;
  elements.annualCalendar.replaceChildren();
  for (let month = 0; month < 12; month += 1) {
    elements.annualCalendar.append(createMonthCalendar(calendarYear, month));
  }
}

function createMonthCalendar(year, monthIndex) {
  const month = document.createElement("section");
  month.className = "month-calendar";
  const title = document.createElement("h3");
  title.textContent = `${monthIndex + 1}月`;
  const weekdays = document.createElement("div");
  weekdays.className = "calendar-weekdays";
  ["日", "月", "火", "水", "木", "金", "土"].forEach((weekday) => {
    const label = document.createElement("span");
    label.textContent = weekday;
    weekdays.append(label);
  });
  const days = document.createElement("div");
  days.className = "calendar-days";
  const firstWeekday = new Date(year, monthIndex, 1).getDay();
  const lastDay = new Date(year, monthIndex + 1, 0).getDate();
  for (let blank = 0; blank < firstWeekday; blank += 1) days.append(document.createElement("span"));
  for (let day = 1; day <= lastDay; day += 1) {
    const date = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    days.append(createCalendarDay(date, new Date(year, monthIndex, day).getDay()));
  }
  month.append(title, weekdays, days);
  return month;
}

function createCalendarDay(date, weekday) {
  const cell = document.createElement("div");
  cell.className = "calendar-day";
  cell.classList.toggle("today", date === currentLocalDate());
  cell.classList.toggle("sunday", weekday === 0);
  cell.classList.toggle("saturday", weekday === 6);
  const day = document.createElement("span");
  day.className = "calendar-day-number";
  day.textContent = String(Number(date.slice(-2)));
  cell.append(day);
  const markers = calendarMarkersForDate(date);
  markers.slice(0, 2).forEach((marker) => {
    const item = document.createElement("span");
    item.className = `calendar-marker ${marker.type}`;
    item.textContent = `${marker.type === "planting" ? "植" : "収"}${marker.cropName.slice(0, 2)}`;
    item.title = marker.title;
    cell.append(item);
  });
  if (markers.length > 2) cell.title = `${markers.map((marker) => marker.title).join("\n")}`;
  return cell;
}

function calendarMarkersForDate(date) {
  const markers = [];
  state.plantingPlans.forEach((plan) => {
    if (plan.plannedDate === date) markers.push({ type: "planting", cropName: plan.cropName, title: `${methodLabel(plan.method)}: ${plan.cropName}${plan.variety ? ` ${plan.variety}` : ""}` });
    if (plan.forecastHarvestDate === date) markers.push({ type: "harvest", cropName: plan.cropName, title: `収穫開始目安: ${plan.cropName}${plan.variety ? ` ${plan.variety}` : ""}` });
  });
  return markers.sort((a, b) => a.type.localeCompare(b.type, "ja"));
}

function renderPlanList() {
  const plans = [...state.plantingPlans].sort((a, b) => a.plannedDate.localeCompare(b.plannedDate));
  elements.planListCount.textContent = `${plans.length}件`;
  elements.plantingPlanList.replaceChildren();
  if (!plans.length) {
    elements.plantingPlanList.append(elements.emptyPlanTemplate.content.cloneNode(true));
    return;
  }
  plans.forEach((plan) => elements.plantingPlanList.append(createPlanCard(plan)));
}

function createPlanCard(plan) {
  const card = document.createElement("article");
  card.className = "planting-plan-card";
  card.style.setProperty("--plan-color", plan.method === "seed" ? "#1677b8" : "#2eaa55");
  const heading = document.createElement("div");
  heading.className = "plan-card-heading";
  heading.innerHTML = window.fieldHarvestCropIconSvg(plan.cropName);
  const identity = document.createElement("div");
  const crop = document.createElement("strong");
  crop.textContent = plan.cropName;
  const variety = document.createElement("span");
  variety.textContent = plan.variety || "品種なし";
  identity.append(crop, variety);
  const method = document.createElement("em");
  method.className = "plan-card-method";
  method.textContent = plan.method === "seed" ? "種" : "苗";
  heading.append(identity, method);

  const dates = document.createElement("div");
  dates.className = "plan-card-dates";
  dates.append(createPlanDate("植える日", formatDate(plan.plannedDate)), createPlanDate("収穫開始目安", formatDate(plan.forecastHarvestDate), "harvest"));
  const memo = document.createElement("p");
  memo.className = "plan-card-memo";
  memo.textContent = plan.memo || `${plan.daysToHarvest}日後の収穫開始を予測`;
  const remove = document.createElement("button");
  remove.className = "plan-card-delete";
  remove.type = "button";
  remove.textContent = "削除";
  remove.addEventListener("click", () => {
    state.plantingPlans = state.plantingPlans.filter((item) => item.id !== plan.id);
    saveAndRender();
  });
  card.append(heading, dates, memo, remove);
  return card;
}

function createPlanDate(label, value, variant = "") {
  const card = document.createElement("div");
  card.className = `plan-card-date ${variant}`;
  const labelElement = document.createElement("span");
  labelElement.textContent = label;
  const valueElement = document.createElement("strong");
  valueElement.textContent = value;
  card.append(labelElement, valueElement);
  return card;
}

function resetPlanForm() {
  elements.planForm.reset();
  elements.planDateInput.value = currentLocalDate();
  selectedCropName = "";
  elements.planCropInput.value = "";
  elements.planForecastPreview.classList.add("empty");
}

function methodLabel(method) {
  return method === "seedling" ? "苗を植える" : "種をまく";
}

function currentLocalDate() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function addDays(dateString, days) {
  const [year, month, day] = String(dateString).split("-").map(Number);
  const date = new Date(year, month - 1, day + days, 12);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function dateDifference(startDate, endDate) {
  const start = Date.parse(`${startDate}T12:00:00`);
  const end = Date.parse(`${endDate}T12:00:00`);
  if (Number.isNaN(start) || Number.isNaN(end)) return null;
  return Math.round((end - start) / 86400000);
}

function formatDate(dateString) {
  const [year, month, day] = String(dateString).split("-").map(Number);
  return year && month && day ? `${year}/${month}/${day}` : "日付未入力";
}

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

async function pullCloudState() {
  if (!storage.isCloudConfigured()) return;
  try {
    const remote = await storage.pullCloud();
    if (!remote) return;
    state = normalizeState(remote.state);
    render();
  } catch {
    // The local plan remains available when cloud retrieval fails.
  }
}

render();
pullCloudState();
