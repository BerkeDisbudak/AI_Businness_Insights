import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { ArrowDown, ArrowUp } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

export function StatusOverview() {
  const { colors } = useTheme();
  
  const metrics = [
    { 
      label: 'Risk Skoru', 
      value: '32%', 
      change: -3, 
      isPositive: true 
    },
    { 
      label: 'Yeni Öngörüler', 
      value: '18', 
      change: 5, 
      isPositive: true 
    },
    { 
      label: 'Bildirimler', 
      value: '4', 
      change: 2, 
      isPositive: false 
    }
  ];

  return (
    <Animated.View 
      entering={FadeIn.duration(800)}
      style={styles.container}
    >
      <View style={[styles.metricsContainer, { backgroundColor: colors.card }]}>
        {metrics.map((metric, index) => (
          <React.Fragment key={index}>
            {index > 0 && (
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
            )}
            <View style={styles.metricItem}>
              <Text style={[styles.metricValue, { color: colors.text }]}>
                {metric.value}
              </Text>
              
              <View style={styles.metricDetails}>
                <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
                  {metric.label}
                </Text>
                
                <View style={styles.changeContainer}>
                  {metric.change !== 0 && (
                    <>
                      {metric.isPositive ? (
                        <ArrowUp size={14} color={colors.success} /> {/* İkon boyutu artırıldı */}
                      ) : (
                        <ArrowDown size={14} color={colors.error} /> {/* İkon boyutu artırıldı */}
                      )}
                      <Text 
                        style={[
                          styles.changeText, 
                          { 
                            color: metric.isPositive ? colors.success : colors.error 
                          }
                        ]}
                      >
                        {Math.abs(metric.change)}
                      </Text>
                    </>
                  )}
                </View>
              </View>
            </View>
          </React.Fragment>
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 18, // Yatay dolgu artırıldı
    marginTop: 20, // Üst boşluk artırıldı
  },
  metricsContainer: {
    flexDirection: 'row',
    borderRadius: 14, // Yuvarlaklık artırıldı
    padding: 20, // Dolgu artırıldı
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    marginHorizontal: 10, // Yatay boşluk artırıldı
  },
  metricValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 22, // Metin boyutu artırıldı
    marginBottom: 6, // Boşluk artırıldı
  },
  metricDetails: {
    alignItems: 'center',
  },
  metricLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14, // Metin boyutu artırıldı
    textAlign: 'center',
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6, // Üst boşluk artırıldı
  },
  changeText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14, // Metin boyutu artırıldı
    marginLeft: 4, // Boşluk artırıldı
  },
});