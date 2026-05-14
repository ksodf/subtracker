import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import AppButton from './AppButton';
import { colors, radii } from '../styles/theme';

export default function StateBlock({ loading, error, onRetry }) {
  if (loading) {
    return (
      <View style={styles.box}>
        <ActivityIndicator color={colors.primary} />
        <Text style={styles.text}>Loading SubTracker...</Text>
      </View>
    );
  }

  if (!error) return null;

  return (
    <View style={[styles.box, styles.errorBox]}>
      <Text style={styles.errorTitle}>Something went wrong</Text>
      <Text style={styles.errorText}>{error}</Text>
      {onRetry ? <AppButton title="Try again" icon="refresh" onPress={onRetry} style={styles.button} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: 10,
    padding: 24,
  },
  errorBox: {
    backgroundColor: colors.dangerSoft,
    borderColor: '#FECACA',
  },
  text: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '600',
  },
  errorTitle: {
    color: colors.danger,
    fontSize: 16,
    fontWeight: '800',
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  button: {
    marginTop: 4,
    minWidth: 140,
  },
});
