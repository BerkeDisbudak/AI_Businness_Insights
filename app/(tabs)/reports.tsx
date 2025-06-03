import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Pressable, RefreshControl, Modal, Dimensions } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { FileText, RefreshCw, Sun, Moon, MoreVertical } from 'lucide-react-native';
import { supabase, Report } from '@/lib/supabase';
import Animated, { FadeInDown, useAnimatedStyle, withRepeat, withTiming, withSequence, FadeIn, SlideInRight, SlideOutRight } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

export default function ReportsScreen() {
  const { colors, theme, toggleTheme, AnimatedView } = useTheme();
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false); // State for menu visibility

  // Animation style for refresh icon
  const refreshIconStyle = useAnimatedStyle(() => {
    if (!isRefreshing) return {};
    return {
      transform: [
        {
          rotate: withRepeat(
            withSequence(
              withTiming('0deg', { duration: 0 }),
              withTiming('360deg', { duration: 1000 })
            ),
            -1,
            false
          ),
        },
      ],
    };
  });

  const themeIconAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: withTiming(isMenuVisible ? 1.1 : 1, { duration: 200 }) },
        { rotate: withTiming(isMenuVisible ? '360deg' : '0deg', { duration: 400 }) },
      ],
    };
  }, [theme, isMenuVisible]);

  useEffect(() => {
    let channel: any = null;

    const setupListenersAndFetch = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn('ReportsScreen: User not authenticated on init, redirecting to login.');
        router.replace('/login');
        setLoading(false);
        return;
      }

      await fetchReports(true);

      channel = supabase
        .channel('reports_channel_reports_screen') // Unique channel name
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'Reports',
          filter: `user_id=eq.${user.id}` // Filter for current user's reports
        }, (payload) => {
          console.log('Realtime change in Reports (ReportsScreen):', payload);
          fetchReports(); // Re-fetch data on change
        })
        .subscribe();
      
      // Ekran odaklandığında raporları yeniden çeker
      const handleFocus = () => {
        console.log('ReportsScreen focused, fetching reports...');
        fetchReports();
      };

      if (typeof window !== 'undefined') {
        window.addEventListener('focus', handleFocus);
      }

      return () => {
        if (channel) {
          console.log('Unsubscribing reports_channel_reports_screen');
          channel.unsubscribe();
        }
        if (typeof window !== 'undefined') {
          window.removeEventListener('focus', handleFocus);
        }
      };
    };

    const cleanup = setupListenersAndFetch();
    return cleanup;
  }, []);

  async function fetchReports(initialLoad = false) {
    if (!initialLoad && (loading || refreshing)) {
      return;
    }

    if (initialLoad) {
      setLoading(true);
    } else {
      if (!loading && !refreshing) setLoading(true);
    }
    
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/login');
        return;
      }

      const { data, error } = await supabase
        .from('Reports')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (err: any) {
      setError('Raporlar yüklenirken bir hata oluştu: ' + (err.message || 'Bilinmeyen hata'));
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setIsRefreshing(false);
    }
  }

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setError(null);
    fetchReports();
  }, []);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setIsMenuVisible(false); // Close menu on refresh
    setError(null);
    fetchReports();
  };

  const handleToggleTheme = () => {
    toggleTheme();
    setIsMenuVisible(false); // Close menu on theme toggle
  };

  const renderReport = ({ item }: { item: Report }) => (
    <Animated.View entering={FadeInDown.duration(400)}>
      <Pressable
        style={({ pressed }) => [
          styles.card,
          {
            backgroundColor: colors.card,
            transform: [{ scale: pressed ? 0.98 : 1 }],
            shadowColor: colors.shadow,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            borderColor: `${colors.border}50`, // Add border to cards
            borderWidth: 1,
          },
        ]}
        onPress={() => router.push(`/report/${item.id}`)}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}15` }]}>
            <FileText size={24} color={colors.primary} />
          </View>
          <View style={styles.contentContainer}>
            <Text 
              style={[styles.content, { color: colors.textSecondary }]}
              numberOfLines={3}
            >
              {item.report}
            </Text>
            <Text style={[styles.date, { color: colors.textTertiary }]}>
              {format(new Date(item.created_at), 'dd MMMM, HH:mm', { locale: tr })}
            </Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Raporlar yükleniyor...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <AnimatedView style={styles.container}>
      {/* Ayarlar ve Yenileme Menüsü Modalı */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isMenuVisible}
        onRequestClose={() => setIsMenuVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setIsMenuVisible(false)}>
          <Animated.View 
            entering={SlideInRight.duration(300)}
            exiting={SlideOutRight.duration(300)}
            style={[styles.menuContainer, { backgroundColor: colors.card }]}
          >
            <Pressable
              style={styles.menuItem}
              onPress={handleManualRefresh}
              disabled={isRefreshing}
            >
              <Text style={[styles.menuItemText, { color: colors.text }]}>
                Raporları Yenile
              </Text>
              {isRefreshing && <ActivityIndicator size="small" color={colors.primary} style={styles.menuItemIcon} />}
            </Pressable>
            <View style={[styles.menuDivider, { backgroundColor: colors.border }]} />
            <Pressable style={styles.menuItem} onPress={handleToggleTheme}>
              <Text style={[styles.menuItemText, { color: colors.text }]}>
                {theme === 'dark' ? "Açık Tema" : "Koyu Tema"}
              </Text>
              <Animated.View style={themeIconAnimatedStyle}>
                {theme === 'dark' ? (
                  <Sun size={20} color={colors.text} style={styles.menuItemIcon} />
                ) : (
                  <Moon size={20} color={colors.text} style={styles.menuItemIcon} />
                )}
              </Animated.View>
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>

      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>Raporlar</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Tüm raporları görüntüle
          </Text>
        </View>
        <View style={styles.headerRight}>
          {/* Three-dot menu button */}
          <Pressable
            style={[styles.iconButton, { backgroundColor: colors.card }]}
            onPress={() => setIsMenuVisible(true)}
          >
            <MoreVertical size={20} color={colors.text} />
          </Pressable>
        </View>
      </View>

      {error ? (
        <Animated.View entering={FadeIn.duration(300)} style={[styles.errorBox, { backgroundColor: `${colors.error}10`, borderColor: colors.error }]}>
          <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
          <Text 
            style={[styles.retryText, { color: colors.primary }]}
            onPress={fetchReports}
          >
            Tekrar Dene
          </Text>
        </Animated.View>
      ) : (
        <FlatList
          data={reports}
          renderItem={renderReport}
          keyExtractor={item => item.id}
          contentContainerStyle={[
            styles.list,
            reports.length === 0 && styles.emptyList
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <FileText size={64} color={colors.textTertiary} style={styles.emptyIcon} />
              <Text style={[styles.emptyTitle, { color: colors.text, marginTop: 16 }]}>
                Henüz Rapor Yok
              </Text>
              <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
                Yeni raporunuz geldiğinde burada görüntülenecektir
              </Text>
            </View>
          )}
        />
      )}
    </AnimatedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonIcon: {
    opacity: 0.8,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 32,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  list: {
    padding: 16,
    paddingBottom: 100,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    borderRadius: 16,
    marginBottom: 16,
    padding: 20,
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contentContainer: {
    flex: 1,
  },
  content: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  date: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
  loadingText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    marginTop: 12,
  },
  errorText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    textAlign: 'center',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 16,
    marginBottom: 16,
    justifyContent: 'center',
    gap: 8,
  },
  retryText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    textDecorationLine: 'underline',
    marginTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    textAlign: 'center',
  },
  // Modal and Menu Styles (Copied from Home Screen for consistency)
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingTop: 100,
    paddingRight: 20,
  },
  menuContainer: {
    borderRadius: 8,
    paddingVertical: 8,
    minWidth: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  menuItemText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
  },
  menuItemIcon: {
    marginLeft: 10,
  },
  menuDivider: {
    height: 1,
    marginVertical: 4,
    marginHorizontal: 16,
  },
});