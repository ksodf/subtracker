import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../components/Card';
import Screen from '../components/Screen';
import SegmentedControl from '../components/SegmentedControl';
import StateBlock from '../components/StateBlock';
import { useSubscriptions } from '../context/SubscriptionContext';
import { colors, radii } from '../styles/theme';
import { SUPPORTED_CURRENCIES, formatMoney } from '../utils/currency';
import { formatDate } from '../utils/dates';
import { buildLocalSummary, formatCycle } from '../utils/subscriptions';

export default function DashboardScreen({ navigation }) {
  const {
    currency,
    setCurrency,
    subscriptions,
    summary,
    loading,
    refreshing,
    error,
    refresh,
  } = useSubscriptions();
  const local = buildLocalSummary(subscriptions, summary);

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
      <View style={styles.hero}>
        <View style={styles.heroText}>
          <Text style={styles.kicker}>Monthly overview</Text>
          <Text style={styles.total}>{formatMoney(local.monthlyTotal, currency)}</Text>
          <Text style={styles.heroCopy}>
            {local.active.length} active subscription{local.active.length === 1 ? '' : 's'} tracked.
          </Text>
        </View>
        <View style={styles.heroIcon}>
          <Ionicons name="trending-up-outline" size={28} color={colors.surface} />
        </View>
      </View>

      <SegmentedControl label="Display currency" options={SUPPORTED_CURRENCIES} value={currency} onChange={setCurrency} />

      <View style={styles.statsGrid}>
        <StatCard icon="albums-outline" label="Active" value={local.active.length} tone="green" />
        <StatCard icon="calendar-outline" label="Upcoming 48h" value={summary?.upcomingBills?.length || 0} tone="orange" />
        <StatCard icon="bar-chart-outline" label="Yearly" value={formatMoney(local.yearlyTotal, currency)} tone="blue" />
        <StatCard
          icon="diamond-outline"
          label="Largest"
          value={local.largest?.name || 'None'}
          hint={local.largest ? formatMoney(local.largest.monthly_display_price ?? local.largest.price, currency) : null}
          tone="teal"
        />
      </View>

      <Card>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Category mix</Text>
          <Text style={styles.sectionLink} onPress={() => navigation.navigate('Reports')}>
            Reports
          </Text>
        </View>
        <CategoryBars breakdown={local.categoryBreakdown} total={local.monthlyTotal} currency={currency} />
      </Card>

      <Card>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Next renewals</Text>
          <Text style={styles.sectionLink} onPress={() => navigation.navigate('Subscriptions')}>
            View all
          </Text>
        </View>
        {subscriptions.slice(0, 3).map(item => (
          <View key={item.id} style={styles.renewalRow}>
            <View style={styles.renewalIcon}>
              <Ionicons name="calendar-clear-outline" size={18} color={colors.primary} />
            </View>
            <View style={styles.renewalText}>
              <Text style={styles.renewalName} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.renewalMeta}>
                {formatCycle(item.billing_cycle)} due {formatDate(item.billing_date)}
              </Text>
            </View>
            <Text style={styles.renewalPrice}>{formatMoney(item.display_price ?? item.price, item.display_currency ?? item.currency)}</Text>
          </View>
        ))}
        {subscriptions.length === 0 ? <Text style={styles.emptyCopy}>Add a subscription to start seeing renewals.</Text> : null}
      </Card>
    </Screen>
  );
}

function StatCard({ icon, label, value, hint, tone }) {
  const toneStyle = toneStyles[tone] || toneStyles.blue;
  return (
    <View style={[styles.statCard, { backgroundColor: toneStyle.bg }]}>
      <View style={[styles.statIcon, { backgroundColor: toneStyle.iconBg }]}>
        <Ionicons name={icon} size={18} color={toneStyle.fg} />
      </View>
      <Text style={[styles.statLabel, { color: toneStyle.fg }]}>{label}</Text>
      <Text style={[styles.statValue, { color: toneStyle.fg }]} numberOfLines={2}>
        {value}
      </Text>
      {hint ? <Text style={[styles.statHint, { color: toneStyle.fg }]}>{hint}</Text> : null}
    </View>
  );
}

function CategoryBars({ breakdown, total, currency }) {
  const entries = Object.entries(breakdown || {}).sort((a, b) => b[1] - a[1]);

  if (entries.length === 0) {
    return <Text style={styles.emptyCopy}>No active subscriptions yet.</Text>;
  }

  return entries.map(([category, amount]) => {
    const percent = total ? Math.max((amount / total) * 100, 6) : 0;
    return (
      <View key={category} style={styles.barWrap}>
        <View style={styles.barHeader}>
          <Text style={styles.barLabel}>{category}</Text>
          <Text style={styles.barValue}>{formatMoney(amount, currency)}</Text>
        </View>
        <View style={styles.barTrack}>
          <View style={[styles.barFill, { width: `${percent}%` }]} />
        </View>
      </View>
    );
  });
}

const toneStyles = {
  green: { bg: colors.successSoft, iconBg: '#BBF7D0', fg: colors.success },
  orange: { bg: colors.warningSoft, iconBg: '#FDE68A', fg: colors.warning },
  blue: { bg: colors.primarySoft, iconBg: '#BFDBFE', fg: colors.primary },
  teal: { bg: colors.accentSoft, iconBg: '#99F6E4', fg: colors.accent },
};

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    backgroundColor: colors.ink,
    borderRadius: radii.xl,
    flexDirection: 'row',
    gap: 14,
    justifyContent: 'space-between',
    padding: 20,
  },
  heroText: {
    flex: 1,
  },
  kicker: {
    color: '#A7F3D0',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  total: {
    color: colors.surface,
    fontSize: 34,
    fontWeight: '900',
    marginTop: 5,
  },
  heroCopy: {
    color: '#CBD5E1',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  heroIcon: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 999,
    height: 58,
    justifyContent: 'center',
    width: 58,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    borderRadius: radii.lg,
    flexBasis: '47%',
    flexGrow: 1,
    minHeight: 132,
    padding: 14,
  },
  statIcon: {
    alignItems: 'center',
    borderRadius: 999,
    height: 34,
    justifyContent: 'center',
    marginBottom: 10,
    width: 34,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '900',
    marginTop: 4,
  },
  statHint: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '900',
  },
  sectionLink: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  barWrap: {
    marginBottom: 14,
  },
  barHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 7,
  },
  barLabel: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '700',
  },
  barValue: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  barTrack: {
    backgroundColor: '#E5E7EB',
    borderRadius: 999,
    height: 9,
    overflow: 'hidden',
  },
  barFill: {
    backgroundColor: colors.accent,
    borderRadius: 999,
    height: 9,
  },
  renewalRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 10,
  },
  renewalIcon: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: 999,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  renewalText: {
    flex: 1,
    minWidth: 0,
  },
  renewalName: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '800',
  },
  renewalMeta: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 2,
  },
  renewalPrice: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '900',
  },
  emptyCopy: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
