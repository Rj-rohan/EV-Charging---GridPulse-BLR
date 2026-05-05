export async function askGroq<T = unknown>(
  prompt: string,
  context?: Record<string, unknown>
): Promise<T> {
  const res = await fetch("/api/groq", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, context }),
  });
  if (!res.ok) throw new Error(`Groq API error: ${res.status}`);
  const json = await res.json();
  return json.result as T;
}

// ── Typed prompt helpers ──────────────────────────────────────────────────────

export interface AIAlarm {
  dtr: string;
  ward: string;
  type: string;
  detail: string;
  severity: "critical" | "warn";
  time: string;
}

export interface AIAction {
  dtr: string;
  action: string;
  detail: string;
  impact: string;
  confidence: number;
  urgency: "critical" | "warn";
}

export interface AIForecastInsight {
  dtr: string;
  ward: string;
  predictedPeak: number;
  peakTime: string;
  riskLevel: "critical" | "warn" | "ok";
  mape: number;
  insight: string;
}

export interface AIScheduleNudge {
  userId: string;
  ward: string;
  vehicle: string;
  suggestedWindow: string;
  tariff: string;
  saving: number;
  reason: string;
}

export interface AITariffRecommendation {
  peakTariff: number;
  offPeakTariff: number;
  incentive: number;
  projectedShift: number;
  budgetRequired: number;
  reasoning: string;
}

export interface AIAnomalySummary {
  id: string;
  type: "Tariff Gaming" | "Unauthorized Charger" | "Abnormal Load Spike";
  user: string;
  ward: string;
  detail: string;
  severity: "high" | "medium" | "low";
  status: "open" | "investigating" | "resolved";
}

export interface AIScenarioResult {
  peakIncrease: number;
  dtrsAtRisk: number;
  upgradesNeeded: number;
  costEstimate: string;
  recommendation: string;
}

export interface AIDashboardInsight {
  headline: string;
  criticalDtrs: string[];
  topAction: string;
  peakForecast: string;
  systemStatus: "critical" | "warn" | "stable";
}

// ── Prompt factories ──────────────────────────────────────────────────────────

export const prompts = {
  liveAlarms: () => `Generate 6 realistic live SCADA alarms for Bengaluru distribution transformers right now during evening peak (19:00–21:00).
Return JSON array of objects with fields: dtr (e.g. DTR-114), ward (real Bengaluru ward), type (Oil Temp High|Overcurrent|EV Surge Detect|Voltage Sag), detail (specific reading), severity (critical|warn), time (e.g. "2 min ago").
Mix 2 critical and 4 warn. Use real Bengaluru wards like Koramangala, HSR Layout, Whitefield, Sarjapur, Marathahalli, Electronic City, Indiranagar, Hebbal.`,

  aiActions: (dtrs: string[]) => `Given these overloaded DTRs: ${dtrs.join(", ")} in Bengaluru during evening EV charging peak, generate 3 AI action recommendations.
Return JSON array with fields: dtr, action (specific actionable text), detail (2 sentences explaining why and how), impact (e.g. "−23% load · −8°C oil temp"), confidence (70-98), urgency (critical|warn).`,

  forecastInsights: () => `Generate forecast insights for 6 Bengaluru distribution transformers for tonight's EV charging peak.
Return JSON array with fields: dtr (DTR-XXX), ward (real Bengaluru ward), predictedPeak (kW, 150-480), peakTime (HH:MM), riskLevel (critical|warn|ok), mape (6.0-12.0), insight (one specific sentence about why this DTR is at risk or safe).`,

  scheduleNudges: () => `Generate 6 EV charging schedule nudges for Bengaluru users tonight.
Return JSON array with fields: userId (U-XXXX), ward (real Bengaluru ward), vehicle (real Indian EV model like Tata Nexon EV/Ola S1 Pro/MG ZS EV/Hyundai Kona/Tata Tigor EV), suggestedWindow (HH:MM–HH:MM), tariff (₹X.X/kWh, between 3.5-5.0), saving (integer ₹ amount 20-80), reason (one sentence why this window is best for grid and user).`,

  tariffRecommendation: (peakLoad: number, offPeakCapacity: number) => `BESCOM Bengaluru feeder peak load is at ${peakLoad}% capacity. Off-peak capacity available: ${offPeakCapacity}%.
Recommend optimal ToU tariff settings. Return JSON with fields: peakTariff (₹/kWh), offPeakTariff (₹/kWh), incentive (₹/kWh discount), projectedShift (% of users expected to shift), budgetRequired (₹ per day), reasoning (2 sentences).`,

  anomalies: () => `Detect 6 anomalies in Bengaluru EV charging data for tonight.
Return JSON array with fields: id (ANO-XXX), type (Tariff Gaming|Unauthorized Charger|Abnormal Load Spike), user (U-XXXX or DTR-XXX), ward (real Bengaluru ward), detail (specific evidence, 1-2 sentences), severity (high|medium|low), status (open|investigating|resolved).
Include 2 tariff gaming, 2 unauthorized chargers, 2 load spikes.`,

  scenarioAnalysis: (scenario: string) => `Analyze this scenario for Bengaluru's power grid: "${scenario}".
Return JSON with fields: peakIncrease (% change in evening peak load), dtrsAtRisk (number of DTRs that will exceed 90% capacity), upgradesNeeded (number of transformer upgrades required), costEstimate (₹ Crores or Lakhs), recommendation (2-3 specific sentences about what BESCOM should do).`,

  dashboardInsight: () => `Analyze current Bengaluru grid status during evening EV charging peak (19:00-21:00).
Return JSON with fields: headline (one urgent sentence about current grid status), criticalDtrs (array of 2-3 DTR IDs like DTR-114), topAction (most important action BESCOM should take right now, one sentence), peakForecast (e.g. "Peak at 20:30, 94% capacity on Koramangala feeder"), systemStatus (critical|warn|stable).`,

  explainDTR: (dtr: string, ward: string, load: number) => `Explain why DTR ${dtr} in ${ward}, Bengaluru is at ${load}% load tonight.
Return JSON with fields: prediction (what will happen), confidence (High|Medium|Low), confidenceScore (60-98), reasons (array of objects with: factor (specific reason), impact (high|med|low), dir (up|down|neutral)).
Include 3-4 reasons mixing EV density, historical patterns, feeder topology, and weather.`,
};
