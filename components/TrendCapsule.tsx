import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { supabase } from '@/lib/supabase';
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
   * Bu fonksiyon hem ilk yüklemede hem de gerçek zamanlı değişikliklerde çağrılır.
   */
  const fetchLatestTrend = async () => {
    setLoading(true); // Veri çekme başladığında yükleme durumunu ayarla
    setError(null);   // Önceki hataları temizle

    try {
      // Supabase kimlik doğrulama servisinden oturum açmış kullanıcıyı alır.
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Eğer kullanıcı oturumu bulunamazsa, uyarı ver ve işlemi durdur.
        console.warn('Kullanıcı oturumu bulunamadı, trend verisi çekilemiyor.');
        setError('Kullanıcı oturumu bulunamadı.'); // Kullanıcıya gösterilecek hata mesajı
        return;
      }

      // Supabase'den 'trend_analyses' tablosunu sorgular.
      const { data, error: fetchError } = await supabase
        .from('trend_analyses') 
        .select('trends, created_at') // 'trends' sütununu seçiyoruz.
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

  useEffect(() => {
    fetchLatestTrend();

    const channel = supabase
      .channel('trend_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'trend_analyses'
      }, (payload) => {
        console.log('Supabase gerçek zamanlı değişiklik algılandı:', payload);
        fetchLatestTrend();
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
      console.log('Supabase kanal aboneliği kaldırıldı.');
    };
  }, []);

  if (loading) {
    return (
      <Animated.View 
        entering={FadeIn.duration(400)}
        style={styles.container}
      >
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={[styles.text, { color: colors.primary, marginLeft: 8 }]}>Yükleniyor...</Text>
      </Animated.View>
    );
  }

  if (error) {
    return (
      <Animated.View 
        entering={FadeIn.duration(400)}
        style={styles.container}
      >
        <Text style={[styles.text, { color: colors.error }]}>{error}</Text>
      </Animated.View>
    );
  }

  if (!trendData || !trendData.trends) {
    return (
      <Animated.View 
        entering={FadeIn.duration(400)}
        style={styles.container}
      >
        <Text style={[styles.text, { color: colors.primary }]}>
          Veri yok
        </Text>
      </Animated.View>
    );
  }

  return (
    <Animated.View 
      entering={FadeIn.duration(400)}
      style={styles.container}
    >
      <View style={styles.contentContainer}>
        <Text 
          style={[styles.text, { color: colors.primary }]}
          numberOfLines={1}
        >
          {trendData.trends}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    // Bu dolgular ve yuvarlaklık artık parent bileşende yönetilecek
    // paddingVertical: 10,
    // paddingHorizontal: 14,
    // borderRadius: 24,
    alignSelf: 'flex-start',
    maxWidth: '100%',
  },
  contentContainer: {
    flex: 1,
  },
  text: {
    fontFamily: 'Inter-Medium',
    fontSize: 15,
  },
});