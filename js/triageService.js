(function initTriageService(globalScope) {
  const severityRank = {
    Critical: 4,
    High: 3,
    Medium: 2,
    Low: 1
  };

  const statusOrder = ["New", "Investigating", "Escalated", "Resolved"];

  function cloneAlerts(alerts) {
    return alerts.map((alert) => ({ ...alert, evidence: [...alert.evidence] }));
  }

  function calculateQueueMetrics(alerts) {
    const openAlerts = alerts.filter((alert) => alert.status !== "Resolved");
    const highAlerts = alerts.filter((alert) => ["Critical", "High"].includes(alert.severity));
    const escalatedAlerts = alerts.filter((alert) => alert.status === "Escalated");
    const resolvedAlerts = alerts.filter((alert) => alert.status === "Resolved");
    const highestSeverity = openAlerts.reduce((highest, alert) => {
      return Math.max(highest, severityRank[alert.severity] || 0);
    }, 0);

    return {
      total: alerts.length,
      open: openAlerts.length,
      high: highAlerts.length,
      escalated: escalatedAlerts.length,
      resolved: resolvedAlerts.length,
      queueRisk: getQueueRisk(highestSeverity, highAlerts.length)
    };
  }

  function getQueueRisk(highestSeverity, highCount) {
    if (highestSeverity >= severityRank.Critical) return "Critical";
    if (highestSeverity >= severityRank.High || highCount >= 2) return "Elevated";
    if (highestSeverity >= severityRank.Medium) return "Guarded";
    return "Stable";
  }

  function filterAlerts(alerts, filters) {
    const query = (filters.query || "").trim().toLowerCase();

    return alerts.filter((alert) => {
      const matchesQuery = !query || [
        alert.id,
        alert.title,
        alert.asset,
        alert.user,
        alert.tactic,
        alert.summary
      ].some((value) => String(value).toLowerCase().includes(query));
      const matchesSeverity = filters.severity === "all" || alert.severity === filters.severity;
      const matchesStatus = filters.status === "all" || alert.status === filters.status;
      const matchesTactic = filters.tactic === "all" || alert.tactic === filters.tactic;

      return matchesQuery && matchesSeverity && matchesStatus && matchesTactic;
    });
  }

  function sortAlertsByPriority(alerts) {
    return [...alerts].sort((a, b) => {
      const severityDifference = (severityRank[b.severity] || 0) - (severityRank[a.severity] || 0);
      if (severityDifference !== 0) return severityDifference;
      return statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
    });
  }

  function updateAlert(alerts, alertId, changes) {
    return alerts.map((alert) => {
      if (alert.id !== alertId) return alert;
      return { ...alert, ...changes };
    });
  }

  function getUniqueValues(alerts, key) {
    return [...new Set(alerts.map((alert) => alert[key]))].sort();
  }

  const triageService = {
    severityRank,
    statusOrder,
    cloneAlerts,
    calculateQueueMetrics,
    filterAlerts,
    sortAlertsByPriority,
    updateAlert,
    getUniqueValues
  };

  globalScope.triageService = triageService;

  if (typeof module !== "undefined") {
    module.exports = triageService;
  }
})(typeof window !== "undefined" ? window : globalThis);
