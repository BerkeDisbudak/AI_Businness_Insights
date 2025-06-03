import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { supabase } from '@/lib/supabase';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Mail, Lock, ArrowRight, ArrowLeft, User } from 'lucide-react-native';

export default function SignupScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async () => {
    if (!email || !password || !confirmPassword || !displayName) {
      setError('Lütfen tüm alanları doldurun');
      return;
    }

    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName
          }
        }
      });

      if (signUpError) throw signUpError;

      if (authData.user) {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert([
            {
              id: authData.user.id,
              display_name: displayName,
              email: email
            }
          ]);

        if (profileError) throw profileError;
      }

      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.message || 'Kayıt olurken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Animated.View 
      entering={FadeIn.duration(600)}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Pressable
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <ArrowLeft size={24} color={colors.text} />
      </Pressable>

      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Hesap Oluşturun
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          DijitalPi'ye hoş geldiniz
        </Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <User size={22} color={colors.textTertiary} /> {/* İkon boyutu artırıldı */}
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Ad Soyad"
              placeholderTextColor={colors.textTertiary}
              value={displayName}
              onChangeText={setDisplayName}
              autoCapitalize="words"
            />
          </View>
        </View>

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

        <View style={styles.inputContainer}>
          <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Lock size={22} color={colors.textTertiary} /> {/* İkon boyutu artırıldı */}
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Şifre Tekrar"
              placeholderTextColor={colors.textTertiary}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>
        </View>

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
          onPress={handleSignup}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.buttonText}>Kayıt Ol</Text>
              <ArrowRight size={22} color="#FFFFFF" /> {/* İkon boyutu artırıldı */}
            </>
          )}
        </Pressable>

        <Pressable
          style={styles.linkContainer}
          onPress={() => router.push('/login')}
        >
          <Text style={[styles.linkText, { color: colors.textSecondary }]}>
            Zaten hesabınız var mı?{' '}
            <Text style={[styles.link, { color: colors.primary }]}>
              Giriş Yapın
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
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    padding: 8,
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