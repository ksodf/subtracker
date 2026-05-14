import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppButton from '../components/AppButton';
import Field from '../components/Field';
import { useAuth } from '../context/AuthContext';
import { colors, radii, shadow } from '../styles/theme';

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (key, value) => setForm(current => ({ ...current, [key]: value }));

  async function handleRegister() {
    setError('');
    if (!form.email.trim() || !form.password) {
      setError('Email and password are required.');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      await register(form.email, form.password);
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
          <View style={styles.logoRow}>
            <View style={styles.logo}>
              <Ionicons name="sparkles-outline" size={28} color={colors.surface} />
            </View>
            <View style={styles.brandWrap}>
              <Text style={styles.brand}>SubTracker</Text>
              <Text style={styles.tagline}>Start with a clean subscription list.</Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Create account</Text>
            <Text style={styles.copy}>Register with the existing SubTracker backend.</Text>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Field
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              label="Email"
              onChangeText={value => set('email', value)}
              placeholder="you@example.com"
              value={form.email}
            />
            <Field
              autoComplete="new-password"
              label="Password"
              onChangeText={value => set('password', value)}
              placeholder="At least 8 characters"
              secureTextEntry
              value={form.password}
            />

            <AppButton title="Create Account" icon="person-add-outline" loading={loading} onPress={handleRegister} />

            <Pressable onPress={() => navigation.navigate('Login')} style={styles.switchLink}>
              <Text style={styles.switchText}>Already have an account?</Text>
              <Text style={styles.switchAction}>Sign in</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
    marginBottom: 26,
  },
  logo: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: radii.xl,
    height: 60,
    justifyContent: 'center',
    width: 60,
    ...shadow,
  },
  brandWrap: {
    flex: 1,
  },
  brand: {
    color: colors.ink,
    fontSize: 31,
    fontWeight: '900',
  },
  tagline: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.xl,
    borderWidth: 1,
    gap: 14,
    padding: 20,
    ...shadow,
  },
  title: {
    color: colors.ink,
    fontSize: 24,
    fontWeight: '900',
  },
  copy: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 21,
    marginTop: -8,
  },
  error: {
    backgroundColor: colors.dangerSoft,
    borderRadius: radii.md,
    color: colors.danger,
    fontSize: 13,
    fontWeight: '700',
    padding: 12,
  },
  switchLink: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    justifyContent: 'center',
    paddingTop: 4,
  },
  switchText: {
    color: colors.muted,
    fontSize: 14,
  },
  switchAction: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '800',
  },
});
