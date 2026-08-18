export const dashboardChartTones = {
  primary: "#1679a7",
  secondary: "#d85f1b",
  accent: "#7c3aed",
  neutral: "#667085",
};

export function getDashboardTone(tone = "primary") {
  return dashboardChartTones[tone] || dashboardChartTones.primary;
}
