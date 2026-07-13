window.FIELD_HARVEST_APP_VERSION = {
  updatedAt: "2026-07-13T20:55:00+09:00",
  display: "2026/07/13 20:55"
};

document.querySelectorAll("[data-app-updated]").forEach((element) => {
  element.textContent = `最終更新 ${window.FIELD_HARVEST_APP_VERSION.display}`;
  element.dateTime = window.FIELD_HARVEST_APP_VERSION.updatedAt;
});
