import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useRouter } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';
import { RiskBadge } from './RiskBadge';
import Animated, { FadeIn } from 'react-native-reanimated';

export function FeaturedReport() {
  const { colors } = useTheme();
  const router = useRouter();
  
  // Öne çıkan rapor verisi
  const featuredReport = {
    id: 'report-001',
    title: '3. Çeyrek Gelir Tahmin Analizi',
    summary: 'Mevcut büyüme trendleri ve mevsimsel desenler doğrultusunda, 3. çeyrek için yıllık bazda %12 gelir artışı öngörüyoruz. Ana etkenler arasında yeni ürün lansmanları ve pazar erişiminin genişlemesi yer alıyor.',
    riskLevel: 'low' as const,
  };

  return (
    <Animated.View entering={FadeIn.duration(800).delay(200)}>
      <Pressable
        style={({ pressed }) => [
          styles.container,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          },
        ]}
        onPress={() => router.push(`/report/${featuredReport.id}`)}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <RiskBadge riskLevel={featuredReport.riskLevel} />
          </View>
          
          <Text style={[styles.title, { color: colors.text }]}>
            {featuredReport.title}
          </Text>
          
          <Text style={[styles.summary, { color: colors.textSecondary }]}>
            {featuredReport.summary}
          </Text>
          
          <View style={styles.footer}>
            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                { 
                  backgroundColor: `${colors.primary}10`,
                  opacity: pressed ? 0.7 : 1
                }
              ]}
              onPress={() => router.push(`/report/${featuredReport.id}`)}
            >
              <Text style={[styles.actionText, { color: colors.primary }]}>
                Detayları Görüntüle
              </Text>
              <ArrowRight size={18} color={colors.primary} /> {/* İkon boyutu artırıldı */}
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 14, // Yuvarlaklık artırıldı
    overflow: 'hidden',
    borderWidth: 1,
  },
  content: {
    padding: 20, // Dolgu artırıldı
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16, // Boşluk artırıldı
  },
  title: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 20, // Başlık boyutu artırıldı
    marginBottom: 10, // Boşluk artırıldı
  },
  summary: {
    fontFamily: 'Inter-Regular',
    fontSize: 15, // Metin boyutu artırıldı
    lineHeight: 22, // Satır yüksekliği artırıldı
    marginBottom: 18, // Boşluk artırıldı
  },
  footer: {
    flexDirection: 'row',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10, // Dikey dolgu artırıldı
    paddingHorizontal: 14, // Yatay dolgu artırıldı
    borderRadius: 10, // Yuvarlaklık artırıldı
  },
  actionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 15, // Metin boyutu artırıldı
    marginRight: 6, // Boşluk artırıldı
  },
});