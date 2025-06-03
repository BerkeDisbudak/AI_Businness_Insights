import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { supabase } from '@/lib/supabase';
import { TrendingUp } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

// Trend verisinin yapısını tanımlar.
interface TrendData {
  trends: string; // Veritabanındaki 'trends' sütununun içeriği
}

export function TrendCapsule() {
  const { colors } = useTheme();
  // Bileşen state'leri
  const [trendData, setTrendData] = useState<TrendData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Supabase'den en son trend verisini çeker.
   * Bu fonksiyon sadece ilk yüklemede çağrılır.
   */
  const fetchLatestTrend = async () => {
    setLoading(true); // Veri çekme başladığında yükleme durumunu ayarla
    setError(null);   // Önceki hataları temizle

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn('Kullanıcı oturumu bulunamadı, trend verisi çekilemiyor.');
        setError('Kullanıcı oturumu bulunamadı.');
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('trend_analyses') // Tablo adı doğruluğunu tekrar kontrol edin
        .select('trends') // Sadece 'trends' sütununu seçiyoruz
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fetchError) {
        console.error('Supabase sorgu hatası:', fetchError);
        throw fetchError;
      }

      if (data) {
        setTrendData({ trends: data.trends });
        console.log('Trend verisi başarıyla çekildi:', data.trends);
      } else {
        setTrendData(null); 
        console.log('Belirtilen kullanıcı için trend verisi bulunamadı.');
      }

    } catch (err: any) {
      console.error('Trend verisi yüklenirken genel bir hata oluştu:', err.message || err);
      setError('Trend verisi yüklenemedi: ' + (err.message || 'Bilinmeyen Hata'));
    } finally {
      setLoading(false);
    }
  };

  // Bileşen yüklendiğinde veriyi çeker. Sadece bir kez çalışır.
  useEffect(() => {
    fetchLatestTrend();
    // Supabase gerçek zamanlı dinleyici tamamen kaldırıldı.
    // Eğer trend_analyses tablosu için gerçek zamanlı dinleyiciye ihtiyacınız yoksa,
    // bu satırları kaldırmanız gerekir.
    // const channel = supabase
    //   .channel('trend_changes')
    //   .on('postgres_changes', {
    //     event: '*',
    //     schema: 'public',
    //     table: 'trend_analyses'
    //   }, (payload) => {
    //     console.log('Supabase gerçek zamanlı değişiklik algılandı:', payload);
    //     fetchLatestTrend();
    //   })
    //   .subscribe();

    // return () => {
    //   channel.unsubscribe();
    //   console.log('Supabase kanal aboneliği kaldırıldı.');
    // };
  }, []); // Bağımlılık dizisi boş olduğu için bu useEffect sadece bir kez çalışır.

  // Yükleme durumu arayüzü
  if (loading) {
    return (
      <Animated.View 
        entering={FadeIn.duration(400)}
        style={[styles.container, { backgroundColor: `${colors.primary}15` }]}
      >
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={[styles.text, { color: colors.primary, marginLeft: 8 }]}>Yükleniyor...</Text>
      </Animated.View>
    );
  }

  // Hata durumu arayüzü
  if (error) {
    return (
      <Animated.View 
        entering={FadeIn.duration(400)}
        style={[styles.container, { backgroundColor: `${colors.error}15` }]}
      >
        <TrendingUp size={16} color={colors.error} style={styles.icon} />
        <Text style={[styles.text, { color: colors.error }]}>{error}</Text>
      </Animated.View>
    );
  }

  // Veri yok durumu arayüzü (trendData null ise veya trends alanı boşsa)
  if (!trendData || !trendData.trends) {
    return (
      <Animated.View 
        entering={FadeIn.duration(400)}
        style={[styles.container, { backgroundColor: `${colors.primary}15` }]}
      >
        <TrendingUp size={16} color={colors.primary} style={styles.icon} />
        <Text style={[styles.text, { color: colors.primary }]}>
          Henüz trend analizi yok
        </Text>
      </Animated.View>
    );
  }

  // Veri başarıyla çekildiğinde trendi gösteren arayüz
  return (
    <Animated.View 
      entering={FadeIn.duration(400)}
      style={[styles.container, { backgroundColor: `${colors.primary}15` }]}
    >
      <TrendingUp size={16} color={colors.primary} style={styles.icon} />
      <View style={styles.contentContainer}>
        <Text 
          style={[styles.text, { color: colors.primary }]}
          numberOfLines={1} // Tek satırda göster, taşarsa kes
        >
          {trendData.trends}
        </Text>
      </View>
    </Animated.View>
  );
}

// React Native stil tanımlamaları
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: 'flex-start',
    maxWidth: '100%',
  },
  icon: {
    marginRight: 8,
    flexShrink: 0,
  },
  contentContainer: {
    flex: 1,
  },
  text: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
});