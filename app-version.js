window.FIELD_HARVEST_APP_VERSION = {
  updatedAt: "2026-07-09T20:45:00+09:00",
  display: "2026/07/09 20:45"
};

document.querySelectorAll("[data-app-updated]").forEach((element) => {
  element.textContent = `最終更新 ${window.FIELD_HARVEST_APP_VERSION.display}`;
  element.dateTime = window.FIELD_HARVEST_APP_VERSION.updatedAt;
});
