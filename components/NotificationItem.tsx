import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useRouter } from 'expo-router';
import { CircleAlert as AlertCircle, TrendingUp, TrendingDown, ChartBar as BarChart2 } from 'lucide-react-native';
import Animated, { FadeInLeft } from 'react-native-reanimated';

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'alert' | 'insight' | 'trend-up' | 'trend-down';
  read: boolean;
}

interface NotificationItemProps {
  notification: Notification;
}

export function NotificationItem({ notification }: NotificationItemProps) {
  const { colors } = useTheme();
  const router = useRouter();
  const [isRead, setIsRead] = React.useState(notification.read);

  const handlePress = () => {
    setIsRead(true);
    router.push(`/notifications/${notification.id}`);
  };

  // Define icon based on notification type
  const getIcon = () => {
    const size = 24; // İkon boyutu artırıldı
    switch (notification.type) {
      case 'alert':
        return (
          <View style={[styles.iconContainer, { backgroundColor: `${colors.error}20` }]}>
            <AlertCircle size={size} color={colors.error} />
          </View>
        );
      case 'insight':
        return (
          <View style={[styles.iconContainer, { backgroundColor: `${colors.info}20` }]}>
            <BarChart2 size={size} color={colors.info} />
          </View>
        );
      case 'trend-up':
        return (
          <View style={[styles.iconContainer, { backgroundColor: `${colors.success}20` }]}>
            <TrendingUp size={size} color={colors.success} />
          </View>
        );
      case 'trend-down':
        return (
          <View style={[styles.iconContainer, { backgroundColor: `${colors.warning}20` }]}>
            <TrendingDown size={size} color={colors.warning} />
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <Animated.View entering={FadeInLeft.duration(400)}>
      <Pressable
        style={({ pressed }) => [
          styles.container,
          {
            backgroundColor: isRead ? colors.background : `${colors.primary}10`,
            borderBottomColor: colors.border,
            opacity: pressed ? 0.7 : 1,
          },
        ]}
        onPress={handlePress}
      >
        {getIcon()}
        
        <View style={styles.content}>
          <Text 
            style={[
              styles.title, 
              { 
                color: colors.text,
                fontFamily: isRead ? 'Inter-Regular' : 'Inter-SemiBold'
              }
            ]}
            numberOfLines={1}
          >
            {notification.title}
          </Text>
          
          <Text 
            style={[styles.message, { color: colors.textSecondary }]}
            numberOfLines={2}
          >
            {notification.message}
          </Text>
          
          <Text style={[styles.timestamp, { color: colors.textTertiary }]}>
            {notification.timestamp}
          </Text>
        </View>
        
        {!isRead && (
          <View style={[styles.unreadIndicator, { backgroundColor: colors.primary }]} />
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 18, // Dikey dolgu artırıldı
    paddingHorizontal: 18, // Yatay dolgu artırıldı
    borderBottomWidth: 1,
  },
  iconContainer: {
    width: 48, // Kapsayıcı boyutu artırıldı
    height: 48, // Kapsayıcı boyutu artırıldı
    borderRadius: 24, // Yuvarlaklık artırıldı
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14, // Boşluk artırıldı
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 17, // Başlık metin boyutu artırıldı
    marginBottom: 6, // Boşluk artırıldı
  },
  message: {
    fontSize: 15, // Mesaj metin boyutu artırıldı
    lineHeight: 22, // Satır yüksekliği artırıldı
    marginBottom: 6, // Boşluk artırıldı
    fontFamily: 'Inter-Regular',
  },
  timestamp: {
    fontSize: 13, // Zaman damgası metin boyutu artırıldı
    fontFamily: 'Inter-Regular',
  },
  unreadIndicator: {
    width: 10, // Gösterge boyutu artırıldı
    height: 10, // Gösterge boyutu artırıldı
    borderRadius: 5, // Yuvarlaklık artırıldı
    marginLeft: 10, // Boşluk artırıldı
    alignSelf: 'center',
  },
});