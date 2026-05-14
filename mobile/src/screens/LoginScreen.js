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

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (key, value) => setForm(current => ({ ...current, [key]: value }));

  async function handleLogin() {
    setError('');
    if (!form.email.trim() || !form.password) {
      setError('Enter your email and password.');
      return;
    }

    setLoading(true);
    try {
      await login(form.email, form.password);
    } catch (err) {
      setError(err.message || 'Login failed.');
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
              <Ionicons name="wallet-outline" size={28} color={colors.surface} />
            </View>
            <View style={styles.brandWrap}>
              <Text style={styles.brand}>SubTracker</Text>
              <Text style={styles.tagline}>Know every renewal before it lands.</Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.copy}>Sign in to your subscription dashboard.</Text>

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
              autoComplete="password"
              label="Password"
              onChangeText={value => set('password', value)}
              placeholder="Password"
              secureTextEntry
              value={form.password}
            />

            <AppButton title="Sign In" icon="log-in-outline" loading={loading} onPress={handleLogin} />

            <Pressable onPress={() => navigation.navigate('Register')} style={styles.switchLink}>
              <Text style={styles.switchText}>New to SubTracker?</Text>
              <Text style={styles.switchAction}>Create account</Text>
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
    backgroundColor: colors.primary,
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
