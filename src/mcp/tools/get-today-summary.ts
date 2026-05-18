import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { getTodayFoodLogs, getUserProfile, getHealthSnapshot, todayDate } from '../../deficit-client/client.js';

export function registerGetTodaySummary(server: McpServer, getToken: () => string | undefined) {
  server.registerTool(
    'get_today_summary',
    {
      title: 'Get today\'s summary',
      description:
        'Returns today\'s calorie intake, deficit progress, macros, and health metrics (steps, sleep, HRV) for the connected DEFICIT account.',
      inputSchema: {},
      annotations: { readOnlyHint: true },
    },
    async () => {
      const token = getToken();
      const date = todayDate();

      const [logs, profile, health] = await Promise.all([
        getTodayFoodLogs(date, token),
        getUserProfile(token),
        getHealthSnapshot(date, token),
      ]);

      const totalCalories = logs.reduce((s, l) => s + l.calories, 0);
      const totalProtein = logs.reduce((s, l) => s + (l.protein ?? 0), 0);
      const totalCarbs = logs.reduce((s, l) => s + (l.carbs ?? 0), 0);
      const totalFat = logs.reduce((s, l) => s + (l.fat ?? 0), 0);
      const target = profile.baseLimit ?? 1800;
      const remaining = target - totalCalories;

      const lines: string[] = [
        `Date: ${date}`,
        `Calories eaten: ${totalCalories} / ${target} (${remaining >= 0 ? remaining + ' remaining' : Math.abs(remaining) + ' over'})`,
        `Macros: ${totalProtein}g protein, ${totalCarbs}g carbs, ${totalFat}g fat`,
        `Meals logged: ${logs.length}`,
      ];

      if (logs.length > 0) {
        lines.push('Meals:');
        for (const l of logs) {
          lines.push(`  - ${l.description} (${l.calories} kcal)`);
        }
      }

      if (health) {
        lines.push('Health metrics:');
        if (health.stepsToday != null) lines.push(`  Steps: ${health.stepsToday.toLocaleString()}`);
        if (health.activeKcalToday != null) lines.push(`  Active calories: ${Math.round(health.activeKcalToday)} kcal`);
        if (health.sleepHours != null) lines.push(`  Sleep: ${health.sleepHours.toFixed(1)}h`);
        if (health.hrvMs != null) lines.push(`  HRV: ${Math.round(health.hrvMs)} ms`);
        if (health.rhrBpm != null) lines.push(`  Resting HR: ${Math.round(health.rhrBpm)} bpm`);
        if (health.weightKg != null) lines.push(`  Weight: ${health.weightKg} kg`);
      }

      return {
        content: [{ type: 'text' as const, text: lines.join('\n') }],
      };
    }
  );
}
