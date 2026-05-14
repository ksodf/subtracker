import React from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../styles/theme';

export default function Screen({ children, scroll = true, refreshing, onRefresh, contentStyle }) {
  if (!scroll) {
    return (
      <SafeAreaView edges={['left', 'right']} style={styles.safe}>
        <View style={[styles.content, contentStyle]}>{children}</View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['left', 'right']} style={styles.safe}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        refreshControl={
          onRefresh ? <RefreshControl refreshing={Boolean(refreshing)} onRefresh={onRefresh} /> : undefined
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, contentStyle]}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    gap: 16,
    padding: 16,
  },
  scrollContent: {
    gap: 16,
    padding: 16,
    paddingBottom: 28,
  },
});
