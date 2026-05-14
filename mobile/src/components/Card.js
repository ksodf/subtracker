import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, radii, shadow } from '../styles/theme';

export default function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: 16,
    ...shadow,
  },
});
