const assert = require("assert");
const { seedAlerts } = require("../js/data");
const triageService = require("../js/triageService");

const alerts = triageService.cloneAlerts(seedAlerts);

assert.strictEqual(alerts.length, 6, "seed data should include six alerts");
assert.notStrictEqual(alerts[0], seedAlerts[0], "alerts should be cloned before use");

const metrics = triageService.calculateQueueMetrics(alerts);
assert.strictEqual(metrics.total, 6, "metrics should count all alerts");
assert.strictEqual(metrics.high, 3, "metrics should count critical and high alerts");
assert.strictEqual(metrics.escalated, 1, "metrics should count escalated alerts");
assert.strictEqual(metrics.resolved, 1, "metrics should count resolved alerts");
assert.strictEqual(metrics.queueRisk, "Critical", "critical open alerts should drive queue risk");

const credentialAlerts = triageService.filterAlerts(alerts, {
  query: "credential",
  severity: "all",
  status: "all",
  tactic: "all"
});
assert.strictEqual(credentialAlerts.length, 1, "query should match tactic text");
assert.strictEqual(credentialAlerts[0].id, "SOC-1007");

const highNewAlerts = triageService.filterAlerts(alerts, {
  query: "",
  severity: "High",
  status: "Investigating",
  tactic: "all"
});
assert.strictEqual(highNewAlerts.length, 1, "filters should combine severity and status");
assert.strictEqual(highNewAlerts[0].id, "SOC-1012");

const sortedAlerts = triageService.sortAlertsByPriority(alerts);
assert.strictEqual(sortedAlerts[0].severity, "Critical", "critical alerts should sort first");
assert.strictEqual(sortedAlerts[1].severity, "High", "high alerts should follow critical alerts");

const updatedAlerts = triageService.updateAlert(alerts, "SOC-1033", {
  status: "Escalated",
  notes: "Escalated after DNS review."
});
const updatedAlert = updatedAlerts.find((alert) => alert.id === "SOC-1033");
assert.strictEqual(updatedAlert.status, "Escalated", "status updates should be applied");
assert.strictEqual(updatedAlert.notes, "Escalated after DNS review.", "notes should be saved");

const tactics = triageService.getUniqueValues(alerts, "tactic");
assert.ok(tactics.includes("Command and Control"), "unique values should include tactics");
assert.deepStrictEqual([...tactics].sort(), tactics, "unique values should be sorted");

console.log("All SOC Triage tests passed.");
