import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import Screen from '../components/Screen';
import StateBlock from '../components/StateBlock';
import { useSubscriptions } from '../context/SubscriptionContext';
import { colors, radii } from '../styles/theme';
import { formatMoney } from '../utils/currency';
import { buildLocalSummary, formatCycle } from '../utils/subscriptions';

export default function ReportsScreen() {
  const { currency, subscriptions, summary, loading, refreshing, error, refresh } = useSubscriptions();
  const local = buildLocalSummary(subscriptions, summary);
  const cycleBreakdown = subscriptions
    .filter(item => item.status === 'active')
    .reduce((map, item) => {
      map[item.billing_cycle] = (map[item.billing_cycle] || 0) + 1;
      return map;
    }, {});

  if (loading && subscriptions.length === 0) {
    return (
      <Screen>
        <StateBlock loading />
      </Screen>
    );
  }

  if (error && subscriptions.length === 0) {
    return (
      <Screen>
        <StateBlock error={error} onRetry={refresh} />
      </Screen>
    );
  }

  return (
    <Screen refreshing={refreshing} onRefresh={() => refresh({ silent: true })}>
      <View style={styles.header}>
        <Text style={styles.title}>Reports</Text>
        <Text style={styles.subtitle}>Simple spend insights from your current subscriptions.</Text>
      </View>

      {subscriptions.length === 0 ? (
        <EmptyState icon="pie-chart-outline" title="No report data yet" message="Add a subscription to build your first report." />
      ) : (
        <>
          <View style={styles.summaryGrid}>
            <ReportTile label="Monthly total" value={formatMoney(local.monthlyTotal, currency)} icon="calendar-outline" />
            <ReportTile label="Yearly forecast" value={formatMoney(local.yearlyTotal, currency)} icon="rocket-outline" tone="teal" />
            <ReportTile label="Average active" value={formatMoney(local.averageMonthly, currency)} icon="analytics-outline" tone="orange" />
            <ReportTile label="Inactive saved" value={local.inactive.length} icon="pause-circle-outline" tone="gray" />
          </View>

          <Card>
            <Text style={styles.sectionTitle}>Spend by category</Text>
            <BreakdownRows breakdown={local.categoryBreakdown} total={local.monthlyTotal} currency={currency} />
          </Card>

          <Card>
            <Text style={styles.sectionTitle}>Billing cadence</Text>
            {Object.entries(cycleBreakdown).length === 0 ? (
              <Text style={styles.emptyText}>No active billing cycles.</Text>
            ) : (
              Object.entries(cycleBreakdown).map(([cycle, count]) => (
                <View key={cycle} style={styles.cycleRow}>
                  <View style={styles.cycleIcon}>
                    <Ionicons name="repeat-outline" size={18} color={colors.accent} />
                  </View>
                  <Text style={styles.cycleName}>{formatCycle(cycle)}</Text>
                  <Text style={styles.cycleCount}>
                    {count} active {count === 1 ? 'service' : 'services'}
                  </Text>
                </View>
              ))
            )}
          </Card>
        </>
      )}
    </Screen>
  );
}

function ReportTile({ label, value, icon, tone = 'blue' }) {
  const style = reportTones[tone] || reportTones.blue;
  return (
    <View style={[styles.tile, { backgroundColor: style.bg }]}>
      <View style={[styles.tileIcon, { backgroundColor: style.iconBg }]}>
        <Ionicons name={icon} size={19} color={style.fg} />
      </View>
      <Text style={[styles.tileLabel, { color: style.fg }]}>{label}</Text>
      <Text style={[styles.tileValue, { color: style.fg }]} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

function BreakdownRows({ breakdown, total, currency }) {
  const entries = Object.entries(breakdown || {}).sort((a, b) => b[1] - a[1]);

  if (entries.length === 0) return <Text style={styles.emptyText}>No active subscription spend.</Text>;

  return entries.map(([category, amount]) => {
    const percent = total ? Math.round((amount / total) * 100) : 0;
    return (
      <View key={category} style={styles.breakdownRow}>
        <View style={styles.breakdownTop}>
          <Text style={styles.breakdownName}>{category}</Text>
          <Text style={styles.breakdownAmount}>{formatMoney(amount, currency)}</Text>
        </View>
        <View style={styles.reportTrack}>
          <View style={[styles.reportFill, { width: `${Math.max(percent, 6)}%` }]} />
        </View>
        <Text style={styles.percent}>{percent}% of monthly spend</Text>
      </View>
    );
  });
}

const reportTones = {
  blue: { bg: colors.primarySoft, iconBg: '#BFDBFE', fg: colors.primary },
  teal: { bg: colors.accentSoft, iconBg: '#99F6E4', fg: colors.accent },
  orange: { bg: colors.warningSoft, iconBg: '#FDE68A', fg: colors.warning },
  gray: { bg: '#F1F5F9', iconBg: '#E2E8F0', fg: colors.muted },
};

const styles = StyleSheet.create({
  header: {
    gap: 4,
  },
  title: {
    color: colors.ink,
    fontSize: 26,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  tile: {
    borderRadius: radii.lg,
    flexBasis: '47%',
    flexGrow: 1,
    minHeight: 138,
    padding: 14,
  },
  tileIcon: {
    alignItems: 'center',
    borderRadius: 999,
    height: 36,
    justifyContent: 'center',
    marginBottom: 10,
    width: 36,
  },
  tileLabel: {
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  tileValue: {
    fontSize: 22,
    fontWeight: '900',
    marginTop: 5,
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 14,
  },
  breakdownRow: {
    marginBottom: 16,
  },
  breakdownTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 7,
  },
  breakdownName: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '800',
  },
  breakdownAmount: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '800',
  },
  reportTrack: {
    backgroundColor: '#E5E7EB',
    borderRadius: 999,
    height: 10,
    overflow: 'hidden',
  },
  reportFill: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    height: 10,
  },
  percent: {
    color: colors.softText,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 5,
  },
  cycleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 10,
  },
  cycleIcon: {
    alignItems: 'center',
    backgroundColor: colors.accentSoft,
    borderRadius: 999,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  cycleName: {
    color: colors.ink,
    flex: 1,
    fontSize: 15,
    fontWeight: '900',
  },
  cycleCount: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  emptyText: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
