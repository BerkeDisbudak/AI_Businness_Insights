import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { RiskBadge } from './RiskBadge';
import { ChevronRight } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface Report {
  id: string;
  title: string;
  summary: string;
  date: string;
  riskLevel: 'high' | 'medium' | 'low';
  confidence: number;
  sentiment: number;
  tags: string[];
  findings: { title: string; description: string; trend: 'up' | 'down' }[];
  notes: string;
}

interface ReportCardProps {
  report: Report;
  onPress: () => void;
}

export function ReportCard({ report, onPress }: ReportCardProps) {
  const { colors } = useTheme();

  return (
    <Animated.View entering={FadeInDown.duration(400)}>
      <Pressable
        style={({ pressed }) => [
          styles.container,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          },
        ]}
        onPress={onPress}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <RiskBadge riskLevel={report.riskLevel} />
            <Text style={[styles.date, { color: colors.textTertiary }]}>
              {report.date}
            </Text>
          </View>

          <Text
            style={[styles.title, { color: colors.text }]}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {report.title}
          </Text>

          <Text
            style={[styles.summary, { color: colors.textSecondary }]}
            numberOfLines={3}
            ellipsizeMode="tail"
          >
            {report.summary}
          </Text>

          <View style={styles.tagsContainer}>
            {report.tags.slice(0, 3).map((tag, index) => (
              <View
                key={index}
                style={[styles.tag, { backgroundColor: `${colors.primaryLight}20` }]}
              >
                <Text
                  style={[styles.tagText, { color: colors.primaryLight }]}
                  numberOfLines={1}
                >
                  {tag}
                </Text>
              </View>
            ))}
            {report.tags.length > 3 && (
              <Text style={[styles.moreTag, { color: colors.textTertiary }]}>
                +{report.tags.length - 3}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.chevronContainer}>
          <ChevronRight color={colors.textTertiary} size={24} /> {/* İkon boyutu artırıldı */}
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 14, // Yuvarlaklık artırıldı
    marginBottom: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    padding: 20, // Dolgu artırıldı
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14, // Boşluk artırıldı
  },
  title: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18, // Başlık boyutu artırıldı
    marginBottom: 8,
  },
  summary: {
    fontFamily: 'Inter-Regular',
    fontSize: 15, // Özet metin boyutu artırıldı
    lineHeight: 22, // Satır yüksekliği artırıldı
    marginBottom: 14, // Boşluk artırıldı
  },
  date: {
    fontFamily: 'Inter-Regular',
    fontSize: 13, // Tarih metin boyutu artırıldı
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    paddingHorizontal: 10, // Yatay dolgu artırıldı
    paddingVertical: 5, // Dikey dolgu artırıldı
    borderRadius: 14, // Yuvarlaklık artırıldı
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    fontFamily: 'Inter-Medium',
    fontSize: 13, // Etiket metin boyutu artırıldı
  },
  moreTag: {
    fontFamily: 'Inter-Regular',
    fontSize: 13, // Etiket metin boyutu artırıldı
    marginLeft: 6, // Boşluk artırıldı
    alignSelf: 'center',
  },
  chevronContainer: {
    justifyContent: 'center',
    paddingRight: 18, // Sağ dolgu artırıldı
  },
});