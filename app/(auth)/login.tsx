import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { supabase } from '@/lib/supabase';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Mail, Lock, ArrowRight } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    checkSavedCredentials();
  }, []);

  const checkSavedCredentials = async () => {
    try {
      const savedEmail = await AsyncStorage.getItem('userEmail');
      const savedPassword = await AsyncStorage.getItem('userPassword');
      if (savedEmail && savedPassword) {
        setEmail(savedEmail);
        setPassword(savedPassword);
        setRememberMe(true);
      }
    } catch (err) {
      console.error('Error loading saved credentials:', err);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Lütfen tüm alanları doldurun');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (rememberMe) {
        await AsyncStorage.setItem('userEmail', email);
        await AsyncStorage.setItem('userPassword', password);
      } else {
        await AsyncStorage.removeItem('userEmail');
        await AsyncStorage.removeItem('userPassword');
      }

      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.message || 'Giriş yapılırken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Animated.View 
      entering={FadeIn.duration(600)}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Hoş Geldiniz
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Hesabınıza giriş yapın
        </Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Mail size={22} color={colors.textTertiary} /> {/* İkon boyutu artırıldı */}
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="E-posta"
              placeholderTextColor={colors.textTertiary}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Lock size={22} color={colors.textTertiary} /> {/* İkon boyutu artırıldı */}
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Şifre"
              placeholderTextColor={colors.textTertiary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
        </View>

        <Pressable
          style={styles.rememberContainer}
          onPress={() => setRememberMe(!rememberMe)}
        >
          <View 
            style={[
              styles.checkbox,
              {
                backgroundColor: rememberMe ? colors.primary : 'transparent',
                borderColor: rememberMe ? colors.primary : colors.border
              }
            ]}
          >
            {rememberMe && (
              <Text style={styles.checkmark}>✓</Text>
            )}
          </View>
          <Text style={[styles.rememberText, { color: colors.textSecondary }]}>
            Beni Hatırla
          </Text>
        </Pressable>

        {error && (
          <Text style={[styles.errorText, { color: colors.error }]}>
            {error}
          </Text>
        )}

        <Pressable
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 }
          ]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.buttonText}>Giriş Yap</Text>
              <ArrowRight size={22} color="#FFFFFF" /> {/* İkon boyutu artırıldı */}
            </>
          )}
        </Pressable>

        <Pressable
          style={styles.linkContainer}
          onPress={() => router.push('/signup')}
        >
          <Text style={[styles.linkText, { color: colors.textSecondary }]}>
            Hesabınız yok mu?{' '}
            <Text style={[styles.link, { color: colors.primary }]}>
              Kayıt Olun
            </Text>
          </Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24, // Padding artırıldı
    justifyContent: 'center',
  },
  header: {
    marginBottom: 48, // Boşluk artırıldı
  },
  title: {
    fontSize: 34, // Başlık boyutu artırıldı
    fontFamily: 'Inter-Bold',
    marginBottom: 10, // Boşluk artırıldı
  },
  subtitle: {
    fontSize: 18, // Alt başlık boyutu artırıldı
    fontFamily: 'Inter-Regular',
  },
  form: {
    gap: 18, // Form elemanları arası boşluk artırıldı
  },
  inputContainer: {
    gap: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18, // Giriş alanı dolgusu artırıldı
    borderRadius: 14, // Kenar yuvarlaklığı artırıldı
    borderWidth: 1,
  },
  input: {
    flex: 1,
    marginLeft: 14, // Metin ile ikon arası boşluk artırıldı
    fontSize: 17, // Giriş metin boyutu artırıldı
    fontFamily: 'Inter-Regular',
  },
  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10, // Boşluk artırıldı
  },
  checkbox: {
    width: 22, // Checkbox boyutu artırıldı
    height: 22, // Checkbox boyutu artırıldı
    borderRadius: 5, // Checkbox yuvarlaklığı artırıldı
    borderWidth: 2,
    marginRight: 10, // Boşluk artırıldı
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 16, // Checkmark boyutu artırıldı
  },
  rememberText: {
    fontSize: 15, // Metin boyutu artırıldı
    fontFamily: 'Inter-Regular',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18, // Düğme dolgusu artırıldı
    borderRadius: 14, // Düğme yuvarlaklığı artırıldı
    marginTop: 12, // Boşluk artırıldı
    gap: 10, // İkon ile metin arası boşluk artırıldı
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18, // Düğme metin boyutu artırıldı
    fontFamily: 'Inter-SemiBold',
  },
  linkContainer: {
    alignItems: 'center',
    marginTop: 28, // Boşluk artırıldı
  },
  linkText: {
    fontSize: 15, // Metin boyutu artırıldı
    fontFamily: 'Inter-Regular',
  },
  link: {
    fontFamily: 'Inter-SemiBold',
  },
  errorText: {
    fontSize: 15, // Hata metin boyutu artırıldı
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
    marginTop: 10, // Boşluk artırıldı
  },
});