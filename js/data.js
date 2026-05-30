const seedAlerts = [
  {
    id: "SOC-1007",
    title: "Impossible travel sign-in pattern",
    severity: "Critical",
    status: "New",
    tactic: "Credential Access",
    asset: "identity-gateway-02",
    user: "m.harris",
    sourceIp: "185.220.101.44",
    detectedAt: "2026-05-29 08:14",
    confidence: 94,
    summary: "Successful login from South Carolina followed by a second login from Amsterdam within nine minutes.",
    evidence: [
      "MFA challenge accepted from unmanaged device",
      "New browser fingerprint detected",
      "Geo velocity rule exceeded baseline"
    ],
    log: "auth.success user=m.harris src=185.220.101.44 country=NL device=unknown mfa=accepted rule=geo_velocity",
    recommendation: "Reset credentials, revoke active sessions, and escalate to identity team for account review.",
    notes: "Confirm with user before marking resolved."
  },
  {
    id: "SOC-1012",
    title: "PowerShell encoded command execution",
    severity: "High",
    status: "Investigating",
    tactic: "Execution",
    asset: "finance-laptop-17",
    user: "r.patel",
    sourceIp: "10.18.4.22",
    detectedAt: "2026-05-29 08:41",
    confidence: 88,
    summary: "Endpoint telemetry detected an encoded PowerShell command launched from a temp directory.",
    evidence: [
      "Command included -EncodedCommand flag",
      "Parent process originated from Downloads folder",
      "Unsigned script attempted outbound connection"
    ],
    log: "edr.alert host=finance-laptop-17 proc=powershell.exe arg=-EncodedCommand parent=invoice_viewer.exe dst=45.77.91.12",
    recommendation: "Isolate host if confirmed malicious, collect process tree, and escalate to incident response.",
    notes: "User reported opening an unexpected invoice attachment."
  },
  {
    id: "SOC-1021",
    title: "Privileged group membership changed",
    severity: "High",
    status: "Escalated",
    tactic: "Privilege Escalation",
    asset: "domain-controller-01",
    user: "svc_backup",
    sourceIp: "10.10.1.5",
    detectedAt: "2026-05-29 09:03",
    confidence: 91,
    summary: "Service account was added to a privileged administrative group outside the approved change window.",
    evidence: [
      "Group membership changed after hours",
      "No matching ticket found",
      "Service account rarely performs directory writes"
    ],
    log: "win.event id=4728 group=Domain Admins actor=svc_backup target=svc_backup change_ticket=none",
    recommendation: "Remove unauthorized access, preserve logs, and continue escalation with infrastructure support.",
    notes: "Escalated because privileged access change lacked a ticket."
  },
  {
    id: "SOC-1033",
    title: "Suspicious outbound DNS volume",
    severity: "Medium",
    status: "New",
    tactic: "Command and Control",
    asset: "clinical-kiosk-04",
    user: "shared-kiosk",
    sourceIp: "10.30.7.18",
    detectedAt: "2026-05-29 09:25",
    confidence: 76,
    summary: "Kiosk generated unusually high DNS requests to random-looking subdomains over a short window.",
    evidence: [
      "Request rate 8x higher than baseline",
      "Domains appear algorithmically generated",
      "No matching business application owner"
    ],
    log: "dns.query host=clinical-kiosk-04 count=484 domain=px9d2.check-sync-example.net window=10m",
    recommendation: "Block domain, validate kiosk image, and review endpoint telemetry for beaconing.",
    notes: ""
  },
  {
    id: "SOC-1044",
    title: "Multiple failed VPN attempts",
    severity: "Medium",
    status: "Investigating",
    tactic: "Initial Access",
    asset: "vpn-edge-01",
    user: "a.nguyen",
    sourceIp: "203.0.113.77",
    detectedAt: "2026-05-29 09:47",
    confidence: 69,
    summary: "VPN gateway logged repeated failed attempts against a valid user account from a new region.",
    evidence: [
      "18 failures in six minutes",
      "Account had no prior activity from source ASN",
      "No successful login observed"
    ],
    log: "vpn.fail user=a.nguyen src=203.0.113.77 failures=18 reason=bad_password region=unknown",
    recommendation: "Confirm user activity, monitor for password spray pattern, and enforce account lockout if attempts continue.",
    notes: "No successful authentication yet."
  },
  {
    id: "SOC-1058",
    title: "Endpoint quarantine completed",
    severity: "Low",
    status: "Resolved",
    tactic: "Defense Evasion",
    asset: "hr-desktop-09",
    user: "j.williams",
    sourceIp: "10.22.8.19",
    detectedAt: "2026-05-29 10:06",
    confidence: 61,
    summary: "Endpoint protection quarantined a known adware file before execution.",
    evidence: [
      "File hash matched known unwanted software",
      "No persistence observed",
      "Endpoint scan completed clean"
    ],
    log: "av.quarantine host=hr-desktop-09 file=setup_helper.exe verdict=adware action=blocked",
    recommendation: "Document closure and remind user to use approved download sources.",
    notes: "Resolved after clean follow-up scan."
  }
];

if (typeof module !== "undefined") {
  module.exports = { seedAlerts };
}
