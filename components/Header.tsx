import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

interface HeaderProps {
  title: string;
  showAvatar?: boolean;
  actions?: React.ReactNode;
}

export function Header({ title, showAvatar, actions }: HeaderProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.header, { backgroundColor: colors.background }]}>
      <View style={styles.titleContainer}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      </View>
      
      <View style={styles.rightSection}>
        {actions}
        
        {showAvatar && (
          <Pressable style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>JC</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60, // Padding artırıldı
    paddingBottom: 18, // Padding artırıldı
    paddingHorizontal: 20, // Padding artırıldı
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 32, // Başlık boyutu artırıldı
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48, // Avatar boyutu artırıldı
    height: 48, // Avatar boyutu artırıldı
    borderRadius: 24, // Yuvarlaklık artırıldı
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18, // Avatar metin boyutu artırıldı
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});