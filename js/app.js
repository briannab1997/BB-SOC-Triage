const storageKey = "bb-soc-triage-alerts";

const elements = {
  alertList: document.querySelector("#alertList"),
  closeDrawer: document.querySelector("#closeDrawer"),
  detailDrawer: document.querySelector("#detailDrawer"),
  drawerContent: document.querySelector("#drawerContent"),
  escalatedAlerts: document.querySelector("#escalatedAlerts"),
  focusAlert: document.querySelector("#focusAlert"),
  highAlerts: document.querySelector("#highAlerts"),
  queueRisk: document.querySelector("#queueRisk"),
  queueSummary: document.querySelector("#queueSummary"),
  resetDemo: document.querySelector("#resetDemo"),
  resolvedAlerts: document.querySelector("#resolvedAlerts"),
  resultCount: document.querySelector("#resultCount"),
  scrim: document.querySelector("#scrim"),
  searchInput: document.querySelector("#searchInput"),
  severityFilter: document.querySelector("#severityFilter"),
  statusFilter: document.querySelector("#statusFilter"),
  tacticFilter: document.querySelector("#tacticFilter"),
  terminalFeed: document.querySelector("#terminalFeed"),
  totalAlerts: document.querySelector("#totalAlerts")
};

let alerts = loadAlerts();
let selectedAlertId = alerts[0]?.id;

function loadAlerts() {
  const storedAlerts = localStorage.getItem(storageKey);
  if (!storedAlerts) return triageService.cloneAlerts(seedAlerts);

  try {
    return JSON.parse(storedAlerts);
  } catch {
    return triageService.cloneAlerts(seedAlerts);
  }
}

function saveAlerts() {
  localStorage.setItem(storageKey, JSON.stringify(alerts));
}

function render() {
  renderFilterOptions();
  renderMetrics();
  renderAlertList();
  renderFocusPanel();
}

function getFilters() {
  return {
    query: elements.searchInput.value,
    severity: elements.severityFilter.value,
    status: elements.statusFilter.value,
    tactic: elements.tacticFilter.value
  };
}

function renderFilterOptions() {
  const currentSeverity = elements.severityFilter.value || "all";
  const currentStatus = elements.statusFilter.value || "all";
  const currentTactic = elements.tacticFilter.value || "all";

  populateSelect(elements.severityFilter, "All Severities", triageService.getUniqueValues(alerts, "severity"));
  populateSelect(elements.statusFilter, "All Statuses", triageService.statusOrder);
  populateSelect(elements.tacticFilter, "All Tactics", triageService.getUniqueValues(alerts, "tactic"));

  elements.severityFilter.value = currentSeverity;
  elements.statusFilter.value = currentStatus;
  elements.tacticFilter.value = currentTactic;
}

function populateSelect(select, defaultLabel, options) {
  select.innerHTML = `<option value="all">${defaultLabel}</option>`;
  options.forEach((option) => {
    const item = document.createElement("option");
    item.value = option;
    item.textContent = option;
    select.appendChild(item);
  });
}

function renderMetrics() {
  const metrics = triageService.calculateQueueMetrics(alerts);
  elements.totalAlerts.textContent = metrics.total;
  elements.highAlerts.textContent = metrics.high;
  elements.escalatedAlerts.textContent = metrics.escalated;
  elements.resolvedAlerts.textContent = metrics.resolved;
  elements.queueRisk.textContent = metrics.queueRisk;
  elements.queueRisk.dataset.risk = metrics.queueRisk.toLowerCase();
  elements.queueSummary.textContent = `${metrics.open} open alerts require review.`;
}

function renderAlertList() {
  const filteredAlerts = triageService.sortAlertsByPriority(triageService.filterAlerts(alerts, getFilters()));
  elements.resultCount.textContent = `${filteredAlerts.length} result${filteredAlerts.length === 1 ? "" : "s"}`;

  if (!filteredAlerts.length) {
    elements.alertList.innerHTML = `
      <div class="empty-state">
        <strong>No alerts match those filters.</strong>
        <p>Adjust the queue filters or reset the demo data.</p>
      </div>
    `;
    return;
  }

  elements.alertList.innerHTML = filteredAlerts.map((alert) => `
    <article class="alert-card ${selectedAlertId === alert.id ? "selected" : ""}" data-alert-id="${alert.id}">
      <div class="alert-topline">
        <span class="alert-id">${alert.id}</span>
        <span class="severity ${alert.severity.toLowerCase()}">${alert.severity}</span>
      </div>
      <h3>${alert.title}</h3>
      <p>${alert.summary}</p>
      <div class="alert-meta">
        <span>${alert.tactic}</span>
        <span>${alert.asset}</span>
        <span>${alert.status}</span>
      </div>
    </article>
  `).join("");
}

function renderFocusPanel() {
  const focusAlert = alerts.find((alert) => alert.id === selectedAlertId) || triageService.sortAlertsByPriority(alerts)[0];
  if (!focusAlert) return;

  selectedAlertId = focusAlert.id;
  elements.focusAlert.innerHTML = `
    <span class="alert-id">${focusAlert.id}</span>
    <h3>${focusAlert.title}</h3>
    <p>${focusAlert.summary}</p>
    <dl>
      <div><dt>Asset</dt><dd>${focusAlert.asset}</dd></div>
      <div><dt>User</dt><dd>${focusAlert.user}</dd></div>
      <div><dt>Confidence</dt><dd>${focusAlert.confidence}%</dd></div>
      <div><dt>Status</dt><dd>${focusAlert.status}</dd></div>
    </dl>
    <button type="button" class="primary-action" data-open-detail="${focusAlert.id}">Review Alert</button>
  `;

  elements.terminalFeed.textContent = [
    `timestamp=${focusAlert.detectedAt}`,
    `alert=${focusAlert.id}`,
    `severity=${focusAlert.severity}`,
    `tactic="${focusAlert.tactic}"`,
    focusAlert.log
  ].join("\n");
}

function openDrawer(alertId) {
  const alert = alerts.find((item) => item.id === alertId);
  if (!alert) return;

  selectedAlertId = alertId;
  elements.drawerContent.innerHTML = `
    <p class="eyebrow">Alert Detail</p>
    <h2>${alert.title}</h2>
    <div class="drawer-badges">
      <span class="severity ${alert.severity.toLowerCase()}">${alert.severity}</span>
      <span>${alert.status}</span>
      <span>${alert.tactic}</span>
    </div>
    <p>${alert.summary}</p>
    <dl class="detail-list">
      <div><dt>Alert ID</dt><dd>${alert.id}</dd></div>
      <div><dt>Affected Asset</dt><dd>${alert.asset}</dd></div>
      <div><dt>User</dt><dd>${alert.user}</dd></div>
      <div><dt>Source IP</dt><dd>${alert.sourceIp}</dd></div>
      <div><dt>Detected</dt><dd>${alert.detectedAt}</dd></div>
      <div><dt>Confidence</dt><dd>${alert.confidence}%</dd></div>
    </dl>
    <section>
      <h3>Evidence</h3>
      <ul class="evidence-list">
        ${alert.evidence.map((item) => `<li>${item}</li>`).join("")}
      </ul>
    </section>
    <section>
      <h3>Mock Log</h3>
      <pre class="log-block">${alert.log}</pre>
    </section>
    <section>
      <h3>Recommended Action</h3>
      <p>${alert.recommendation}</p>
    </section>
    <label class="notes-field">
      <span>Analyst Notes</span>
      <textarea id="analystNotes" rows="4">${alert.notes || ""}</textarea>
    </label>
    <div class="status-actions">
      ${triageService.statusOrder.map((status) => `
        <button type="button" data-status="${status}" class="${status === alert.status ? "active" : ""}">${status}</button>
      `).join("")}
    </div>
  `;

  elements.detailDrawer.classList.add("open");
  elements.scrim.classList.add("active");
  elements.detailDrawer.setAttribute("aria-hidden", "false");
  renderAlertList();
  renderFocusPanel();
}

function closeDrawer() {
  elements.detailDrawer.classList.remove("open");
  elements.scrim.classList.remove("active");
  elements.detailDrawer.setAttribute("aria-hidden", "true");
}

function updateSelectedAlert(changes) {
  alerts = triageService.updateAlert(alerts, selectedAlertId, changes);
  saveAlerts();
  render();
  openDrawer(selectedAlertId);
}

function resetDemo() {
  alerts = triageService.cloneAlerts(seedAlerts);
  selectedAlertId = alerts[0]?.id;
  saveAlerts();
  closeDrawer();
  render();
}

document.addEventListener("click", (event) => {
  const alertCard = event.target.closest("[data-alert-id]");
  const reviewButton = event.target.closest("[data-open-detail]");
  const statusButton = event.target.closest("[data-status]");
  const navItem = event.target.closest("[data-view]");

  if (alertCard) {
    openDrawer(alertCard.dataset.alertId);
  }

  if (reviewButton) {
    openDrawer(reviewButton.dataset.openDetail);
  }

  if (statusButton) {
    updateSelectedAlert({ status: statusButton.dataset.status });
  }

  if (navItem) {
    document.querySelectorAll(".nav-item").forEach((item) => item.classList.remove("active"));
    navItem.classList.add("active");
    if (navItem.dataset.view === "playbook") document.querySelector("#playbook").scrollIntoView({ behavior: "smooth" });
    if (navItem.dataset.view === "alerts") document.querySelector(".alert-panel").scrollIntoView({ behavior: "smooth" });
    if (navItem.dataset.view === "overview") window.scrollTo({ top: 0, behavior: "smooth" });
  }
});

elements.drawerContent.addEventListener("input", (event) => {
  if (event.target.id !== "analystNotes") return;
  alerts = triageService.updateAlert(alerts, selectedAlertId, { notes: event.target.value });
  saveAlerts();
});

[elements.searchInput, elements.severityFilter, elements.statusFilter, elements.tacticFilter].forEach((control) => {
  control.addEventListener("input", render);
});

elements.closeDrawer.addEventListener("click", closeDrawer);
elements.scrim.addEventListener("click", closeDrawer);
elements.resetDemo.addEventListener("click", resetDemo);

render();
