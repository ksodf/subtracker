import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import Screen from '../components/Screen';
import StateBlock from '../components/StateBlock';
import { useSubscriptions } from '../context/SubscriptionContext';
import { colors, radii } from '../styles/theme';
import { formatMoney } from '../utils/currency';
import { daysUntil, formatDate } from '../utils/dates';
import { formatCycle } from '../utils/subscriptions';

const statusColors = {
  active: { bg: colors.successSoft, fg: colors.success },
  inactive: { bg: '#F1F5F9', fg: colors.muted },
  cancelled: { bg: colors.dangerSoft, fg: colors.danger },
};

export default function SubscriptionsScreen({ navigation }) {
  const { subscriptions, loading, refreshing, error, refresh, deleteSubscription } = useSubscriptions();
  const [expandedId, setExpandedId] = useState(null);

  function confirmDelete(item) {
    Alert.alert('Delete subscription?', `${item.name} will be removed from your account.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteSubscription(item.id),
      },
    ]);
  }

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
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Subscriptions</Text>
          <Text style={styles.subtitle}>{subscriptions.length} total services</Text>
        </View>
        <Pressable onPress={() => navigation.navigate('Add')} style={styles.addButton}>
          <Ionicons name="add" size={22} color={colors.surface} />
        </Pressable>
      </View>

      {subscriptions.length === 0 ? (
        <EmptyState
          icon="receipt-outline"
          title="No subscriptions yet"
          message="Tap the Add tab to save your first renewal."
        />
      ) : (
        <View style={styles.list}>
          {subscriptions.map(item => (
            <SubscriptionCard
              expanded={expandedId === item.id}
              item={item}
              key={item.id}
              onDelete={() => confirmDelete(item)}
              onToggle={() => setExpandedId(expandedId === item.id ? null : item.id)}
            />
          ))}
        </View>
      )}
    </Screen>
  );
}

function SubscriptionCard({ item, expanded, onToggle, onDelete }) {
  const status = statusColors[item.status] || statusColors.inactive;
  const dueIn = daysUntil(item.billing_date);
  const dueLabel =
    dueIn === null ? 'Date not set' : dueIn < 0 ? `${Math.abs(dueIn)} days overdue` : dueIn === 0 ? 'Due today' : `Due in ${dueIn} days`;

  return (
    <Card style={styles.card}>
      <Pressable onPress={onToggle} style={styles.cardTop}>
        <View style={styles.serviceIcon}>
          <Text style={styles.serviceInitial}>{item.name?.charAt(0)?.toUpperCase() || 'S'}</Text>
        </View>
        <View style={styles.mainInfo}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.meta} numberOfLines={1}>
            {item.category} | {formatCycle(item.billing_cycle)}
          </Text>
        </View>
        <View style={styles.priceWrap}>
          <Text style={styles.price}>{formatMoney(item.price, item.currency)}</Text>
          <Text style={[styles.status, { backgroundColor: status.bg, color: status.fg }]}>{item.status}</Text>
        </View>
      </Pressable>

      <View style={styles.dueRow}>
        <Ionicons name="calendar-outline" size={16} color={colors.primary} />
        <Text style={styles.dueText}>
          {dueLabel} | {formatDate(item.billing_date)}
        </Text>
      </View>

      {expanded ? (
        <View style={styles.details}>
          <Detail label="Monthly value" value={formatMoney(item.monthly_display_price ?? item.price, item.display_currency ?? item.currency)} />
          <Detail label="Start date" value={formatDate(item.start_date)} />
          <Detail label="Payment method" value={item.payment_method || 'Not set'} />
          <Detail label="Notes" value={item.notes || 'No notes'} wide />
          <Pressable onPress={onDelete} style={styles.deleteButton}>
            <Ionicons name="trash-outline" size={17} color={colors.danger} />
            <Text style={styles.deleteText}>Delete</Text>
          </Pressable>
        </View>
      ) : null}
    </Card>
  );
}

function Detail({ label, value, wide }) {
  return (
    <View style={[styles.detail, wide && styles.detailWide]}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    color: colors.ink,
    fontSize: 26,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.muted,
    fontSize: 14,
    marginTop: 3,
  },
  addButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 999,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  list: {
    gap: 12,
  },
  card: {
    padding: 14,
  },
  cardTop: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  serviceIcon: {
    alignItems: 'center',
    backgroundColor: colors.accentSoft,
    borderRadius: radii.md,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  serviceInitial: {
    color: colors.accent,
    fontSize: 18,
    fontWeight: '900',
  },
  mainInfo: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '900',
  },
  meta: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 3,
  },
  priceWrap: {
    alignItems: 'flex-end',
    gap: 5,
  },
  price: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '900',
  },
  status: {
    borderRadius: 999,
    fontSize: 11,
    fontWeight: '800',
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 3,
    textTransform: 'capitalize',
  },
  dueRow: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radii.md,
    flexDirection: 'row',
    gap: 7,
    marginTop: 12,
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  dueText: {
    color: colors.primaryDark,
    flex: 1,
    fontSize: 12,
    fontWeight: '800',
  },
  details: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 13,
    paddingTop: 13,
  },
  detail: {
    flexBasis: '47%',
    flexGrow: 1,
  },
  detailWide: {
    flexBasis: '100%',
  },
  detailLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  detailValue: {
    color: colors.ink,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 3,
  },
  deleteButton: {
    alignItems: 'center',
    backgroundColor: colors.dangerSoft,
    borderRadius: radii.md,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    marginTop: 2,
    minHeight: 42,
    width: '100%',
  },
  deleteText: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '900',
  },
});
