import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import AppButton from '../components/AppButton';
import Card from '../components/Card';
import Field from '../components/Field';
import Screen from '../components/Screen';
import SegmentedControl from '../components/SegmentedControl';
import { useSubscriptions } from '../context/SubscriptionContext';
import { colors, radii } from '../styles/theme';
import { SUPPORTED_CURRENCIES } from '../utils/currency';
import { dateInputToUtc, isValidDateInput, todayInput } from '../utils/dates';
import { BILLING_CYCLES, CATEGORIES, STATUSES, formatCycle } from '../utils/subscriptions';

const initialForm = () => ({
  name: '',
  price: '',
  currency: 'USD',
  category: 'Other',
  billing_cycle: 'monthly',
  start_date: todayInput(),
  billing_date: todayInput(),
  payment_method: '',
  status: 'active',
  notes: '',
});

export default function AddSubscriptionScreen({ navigation }) {
  const { createSubscription } = useSubscriptions();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const set = (key, value) => setForm(current => ({ ...current, [key]: value }));

  function validate() {
    const price = Number(form.price);
    if (!form.name.trim()) return 'Subscription name is required.';
    if (!Number.isFinite(price) || price <= 0) return 'Price must be greater than 0.';
    if (!isValidDateInput(form.billing_date)) return 'Next billing date must use YYYY-MM-DD.';
    if (form.start_date && !isValidDateInput(form.start_date)) return 'Start date must use YYYY-MM-DD.';
    if (
      form.start_date &&
      isValidDateInput(form.start_date) &&
      dateInputToUtc(form.billing_date) < dateInputToUtc(form.start_date)
    ) {
      return 'Next billing date cannot be before the start date.';
    }
    return '';
  }

  async function handleSave() {
    setError('');
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    try {
      await createSubscription({
        ...form,
        name: form.name.trim(),
        price: Number(form.price),
        start_date: form.start_date || null,
        payment_method: form.payment_method.trim(),
        notes: form.notes.trim(),
      });
      setForm(initialForm());
      navigation.navigate('Subscriptions');
    } catch (err) {
      setError(err.message || 'Failed to save subscription.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
      <Screen>
        <View style={styles.header}>
          <Text style={styles.title}>Add subscription</Text>
          <Text style={styles.subtitle}>Save a renewal to your Firestore-backed SubTracker account.</Text>
        </View>

        <Card style={styles.formCard}>
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Field
            autoCapitalize="words"
            label="Name"
            onChangeText={value => set('name', value)}
            placeholder="Netflix, Notion, Adobe"
            value={form.name}
          />

          <View style={styles.twoCol}>
            <Field
              containerStyle={styles.flexField}
              keyboardType="decimal-pad"
              label="Price"
              onChangeText={value => set('price', value)}
              placeholder="12.99"
              value={form.price}
            />
            <View style={styles.flexField}>
              <SegmentedControl label="Currency" options={SUPPORTED_CURRENCIES} value={form.currency} onChange={value => set('currency', value)} />
            </View>
          </View>

          <SegmentedControl label="Category" options={CATEGORIES} value={form.category} onChange={value => set('category', value)} />
          <SegmentedControl
            formatter={formatCycle}
            label="Billing cycle"
            options={BILLING_CYCLES}
            value={form.billing_cycle}
            onChange={value => set('billing_cycle', value)}
          />

          <View style={styles.twoCol}>
            <Field
              containerStyle={styles.flexField}
              label="Start date"
              onChangeText={value => set('start_date', value)}
              placeholder="YYYY-MM-DD"
              value={form.start_date}
            />
            <Field
              containerStyle={styles.flexField}
              label="Next billing date"
              onChangeText={value => set('billing_date', value)}
              placeholder="YYYY-MM-DD"
              value={form.billing_date}
            />
          </View>

          <Field
            label="Payment method"
            onChangeText={value => set('payment_method', value)}
            placeholder="Visa ending 1234"
            value={form.payment_method}
          />
          <SegmentedControl label="Status" options={STATUSES} value={form.status} onChange={value => set('status', value)} />
          <Field
            inputStyle={styles.notes}
            label="Notes"
            multiline
            onChangeText={value => set('notes', value)}
            placeholder="Plan, seats, cancellation notes"
            textAlignVertical="top"
            value={form.notes}
          />

          <AppButton title="Save Subscription" icon="checkmark-circle-outline" loading={saving} onPress={handleSave} />
        </Card>
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
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
  formCard: {
    gap: 15,
  },
  error: {
    backgroundColor: colors.dangerSoft,
    borderRadius: radii.md,
    color: colors.danger,
    fontSize: 13,
    fontWeight: '800',
    padding: 12,
  },
  twoCol: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  flexField: {
    flexBasis: 150,
    flexGrow: 1,
  },
  notes: {
    minHeight: 96,
  },
});
