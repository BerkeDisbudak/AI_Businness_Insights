import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { TriangleAlert as AlertTriangle, CircleAlert as AlertCircle, CircleCheck as CheckCircle } from 'lucide-react-native';

type RiskLevel = 'high' | 'medium' | 'low';

interface RiskBadgeProps {
  riskLevel: RiskLevel;
  size?: 'small' | 'medium' | 'large';
}

export function RiskBadge({ riskLevel, size = 'medium' }: RiskBadgeProps) {
  const { colors } = useTheme();
  
  const riskConfig = {
    high: {
      color: colors.high,
      icon: <AlertCircle size={size === 'small' ? 16 : size === 'medium' ? 20 : 24} color={colors.high} />, // İkon boyutu artırıldı
      label: 'Yüksek Risk',
    },
    medium: {
      color: colors.medium,
      icon: <AlertTriangle size={size === 'small' ? 16 : size === 'medium' ? 20 : 24} color={colors.medium} />, // İkon boyutu artırıldı
      label: 'Orta Risk',
    },
    low: {
      color: colors.low,
      icon: <CheckCircle size={size === 'small' ? 16 : size === 'medium' ? 20 : 24} color={colors.low} />, // İkon boyutu artırıldı
      label: 'Düşük Risk',
    }
  };
  
  const config = riskConfig[riskLevel];
  
  const fontSize = size === 'small' ? 13 : size === 'medium' ? 15 : 17; // Metin boyutu artırıldı
  const paddingVertical = size === 'small' ? 5 : size === 'medium' ? 7 : 9; // Dikey dolgu artırıldı
  const paddingHorizontal = size === 'small' ? 9 : size === 'medium' ? 12 : 15; // Yatay dolgu artırıldı
  
  return (
    <View 
      style={[
        styles.badge, 
        { 
          backgroundColor: `${config.color}20`,
          paddingVertical,
          paddingHorizontal,
        }
      ]}
    >
      {config.icon}
      <Text 
        style={[
          styles.text, 
          { color: config.color, fontSize, marginLeft: size === 'small' ? 5 : 7 } // Metin ile ikon arası boşluk artırıldı
        ]}
      >
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18, // Yuvarlaklık artırıldı
  },
  text: {
    fontFamily: 'Inter-Medium',
  },
});