import { create } from "zustand";

export type AppMode = "live" | "simulation";

export type WalkthroughStep = {
  id: number;
  label: string;
  page: string;
  description: string;
  metric: string;
  color: string;
};

export const walkthroughSteps: WalkthroughStep[] = [
  { id: 1, label: "Forecast Risk",      page: "/forecasting",    description: "GNN detects DTR-114 will hit 94% load at 20:30. MAPE 8.2% — high confidence.", metric: "94% load predicted", color: "#ef4444" },
  { id: 2, label: "Detect Peak Issue",  page: "/operations",     description: "SCADA confirms oil temp at 88°C. Overcurrent alarm raised. 2 critical DTRs flagged.", metric: "2 critical alarms", color: "#f97316" },
  { id: 3, label: "Apply Tariff",       page: "/tariff",         description: "Peak tariff raised to ₹7.5/kWh. Off-peak set to ₹3.8/kWh. ₹3 incentive issued.", metric: "₹3.7/kWh spread", color: "#f59e0b" },
  { id: 4, label: "Shift Behavior",     page: "/scheduling",     description: "120 users nudged via BESCOM app. 64% acceptance. Avg delay 28 min.", metric: "21.4% peak reduction", color: "#6366f1" },
  { id: 5, label: "Validate Twin",      page: "/digital-twin",   description: "SUMO simulation confirms peak drops from 460 kW to 362 kW. Feeder stays below limit.", metric: "−98 kW peak", color: "#00d4aa" },
  { id: 6, label: "Plan Infra",         page: "/capex",          description: "Demand shifting defers DTR-412 upgrade by 2 years. ₹22L CAPEX avoided this cycle.", metric: "₹22L saved", color: "#10b981" },
  { id: 7, label: "Monitor Anomalies",  page: "/anomaly",        description: "2 tariff gaming cases detected. 1 unauthorized charger flagged for field inspection.", metric: "3 anomalies caught", color: "#ec4899" },
];

export type ImpactMetrics = {
  peakReduced: number;
  capexSaved: number;
  transformersSaved: number;
  userSatisfaction: number;
  co2Avoided: number;
};

interface AppStore {
  mode: AppMode;
  setMode: (m: AppMode) => void;
  walkthroughActive: boolean;
  walkthroughStep: number;
  startWalkthrough: () => void;
  nextStep: () => void;
  prevStep: () => void;
  stopWalkthrough: () => void;
  impact: ImpactMetrics;
  feedbackLoop: { event: string; action: string; time: string; color: string }[];
  addFeedback: (event: string, action: string, color: string) => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  mode: "live",
  setMode: (m) => set({ mode: m }),

  walkthroughActive: false,
  walkthroughStep: 0,
  startWalkthrough: () => set({ walkthroughActive: true, walkthroughStep: 0 }),
  nextStep: () => {
    const { walkthroughStep } = get();
    if (walkthroughStep < walkthroughSteps.length - 1) {
      set({ walkthroughStep: walkthroughStep + 1 });
    } else {
      set({ walkthroughActive: false, walkthroughStep: 0 });
    }
  },
  prevStep: () => {
    const { walkthroughStep } = get();
    if (walkthroughStep > 0) set({ walkthroughStep: walkthroughStep - 1 });
  },
  stopWalkthrough: () => set({ walkthroughActive: false, walkthroughStep: 0 }),

  impact: {
    peakReduced: 21.4,
    capexSaved: 22,
    transformersSaved: 3,
    userSatisfaction: 74,
    co2Avoided: 4.8,
  },

  feedbackLoop: [
    { event: "User U-0891 ignored nudge",          action: "Bandit model updated · lower weight for this user",    time: "2 min ago",  color: "#f59e0b" },
    { event: "Load didn't reduce on DTR-278",       action: "Tariff increased ₹0.5/kWh · 15 more users targeted",  time: "8 min ago",  color: "#ef4444" },
    { event: "Forecast error >15% on DTR-203",      action: "Model retrain triggered · SCADA gap filled",          time: "22 min ago", color: "#6366f1" },
    { event: "64% acceptance rate achieved",        action: "Bandit reward logged · policy reinforced",            time: "35 min ago", color: "#10b981" },
  ],
  addFeedback: (event, action, color) => {
    const prev = get().feedbackLoop;
    set({ feedbackLoop: [{ event, action, time: "just now", color }, ...prev.slice(0, 4)] });
  },
}));
