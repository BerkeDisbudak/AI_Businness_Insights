// app/(tabs)/index.tsx dosyasının tamamı

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Pressable, RefreshControl, TextInput, Modal, Dimensions } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { FileText, RefreshCw, Sun, Moon, MoreVertical } from 'lucide-react-native';
import { Report, createReport, getReports, supabase } from '@/lib/supabase';
// Animated importunu geçici olarak devre dışı bırakalım
// import Animated, { FadeInDown, FadeOut, Layout, useAnimatedStyle, withRepeat, withTiming, withSequence, FadeIn, SlideInRight, SlideOutRight } from 'react-native-reanimated';
import { TrendCapsule } from '@/components/TrendCapsule'; 

// Ekran boyutlarını alalım, modal konumlandırması için
const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
  const { colors, theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNewReport, setShowNewReport] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [creating, setCreating] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [user, setUser] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  // Animasyon stillerini ve ilgili hook'ları geçici olarak devre dışı bırakalım
  // const refreshIconStyle = useAnimatedStyle(() => {
  //   if (!isRefreshing) return {};
  //   return {
  //     transform: [
  //       {
  //         rotate: withRepeat(
  //           withSequence(
  //             withTiming('0deg', { duration: 0 }),
  //             withTiming('360deg', { duration: 1000 })
  //           ),
  //           -1,
  //           false
  //         ),
  //       },
  //     ],
  //   };
  // });

  // const themeIconAnimatedStyle = useAnimatedStyle(() => {
  //   return {
  //     transform: [
  //       { scale: withTiming(isMenuVisible ? 1.1 : 1, { duration: 200 }) },
  //       { rotate: withTiming(isMenuVisible ? '360deg' : '0deg', { duration: 400 }) },
  //     ],
  //   };
  // }, [theme, isMenuVisible]);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting('Günaydın');
    } else if (hour >= 12 && hour < 18) {
      setGreeting('İyi Günler');
    } else {
      setGreeting('İyi Akşamlar');
    }
  }, []);

  useEffect(() => {
    fetchUserData();
    fetchReports();

    // Supabase channel listener'ı burada da kaldırılabilir eğer Homepage'in kendi listener'ı yoksa
    // ve TrendCapsule yeterliyse.
    // Eğer Reports tablosu için gerçek zamanlı güncellemeler istiyorsanız bu bloğu tutabilirsiniz.
    // Ancak test için sorun çıkaran her yeri kapatmak faydalı olabilir.
    const channel = supabase
      .channel('reports_channel')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'Reports'
      }, () => {
        fetchReports();
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  async function fetchUserData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  }

  async function fetchReports() {
    try {
      const data = await getReports();
      setReports(data || []);
    } catch (err) {
      setError('Raporlar yüklenirken bir hata oluştu.');
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
    setIsMenuVisible(false);
    fetchReports();
  };

  const handleToggleTheme = () => {
    toggleTheme();
    setIsMenuVisible(false);
  };

  const handleCreateReport = async () => {
    if (!newContent.trim()) {
      setError('Lütfen rapor içeriği giriniz');
      return;
    }

    setCreating(true);
    setError(null);

    try {
      await createReport('Untitled Report', newContent.trim());
      setNewContent('');
      setShowNewReport(false);
      fetchReports();
    } catch (err) {
      setError('Rapor oluşturulurken bir hata oluştu');
      console.error('Error creating report:', err);
    } finally {
      setCreating(false);
    }
  };

  const renderReport = ({ item }: { item: Report }) => (
    // Animated.View yerine normal View kullanalım
    <View style={styles.cardWrapper}> 
      <Pressable
        style={({ pressed }) => [
          styles.card,
          {
            backgroundColor: colors.card,
            transform: [{ scale: pressed ? 0.98 : 1 }],
            borderColor: `${colors.border}50`,
            borderWidth: 1,
          },
        ]}
        onPress={() => router.push(`/report/${item.id}`)}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.cardIconContainer, { backgroundColor: `${colors.primary}15` }]}>
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
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Raporlar yükleniyor...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Ayarlar ve Yenileme Menüsü Modalı */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isMenuVisible}
        onRequestClose={() => setIsMenuVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setIsMenuVisible(false)}>
          {/* Animated.View yerine normal View kullanalım */}
          <View style={[styles.menuContainer, { backgroundColor: colors.card }]}>
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
              {/* Animated.View yerine normal View kullanalım */}
              <View>
                {theme === 'dark' ? (
                  <Sun size={20} color={colors.text} style={styles.menuItemIcon} />
                ) : (
                  <Moon size={20} color={colors.text} style={styles.menuItemIcon} />
                )}
              </View>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* Ana Sayfa Başlık ve Tuş Bölümü */}
      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <Text style={[styles.greeting, { color: colors.textSecondary }]}>
            {greeting},
          </Text>
          <Text style={[styles.userName, { color: colors.text }]}>
            {user?.user_metadata?.display_name || 'Kullanıcı'}
          </Text>
          <View style={styles.trendCapsuleWrapper}>
            <TrendCapsule />
          </View>
          <Text style={[styles.aiText, { color: colors.primary }]}>
            Yapay Zeka Raporlarınız Hazır
          </Text>
        </View>
        
        <Pressable
          style={[styles.settingsButton, { backgroundColor: colors.card }]}
          onPress={() => setIsMenuVisible(true)}
        >
          {/* Animated.View yerine normal View kullanalım */}
          <View>
            {isRefreshing ? (
              <RefreshCw size={20} color={colors.primary} />
            ) : (
              <MoreVertical size={20} color={colors.text} />
            )}
          </View>
        </Pressable>
      </View>

      {/* Hata Mesajı */}
      {error && (
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
      )}

      {/* Yeni Rapor Oluşturma Formu (Gerektiğinde Görünür) */}
      {showNewReport && (
        <View style={[styles.newReportContainer, { backgroundColor: colors.card }]}>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.border, height: 100 }]}
            placeholder="Rapor İçeriği"
            placeholderTextColor={colors.textTertiary}
            value={newContent}
            onChangeText={setNewContent}
            multiline
            textAlignVertical="top"
          />
          <Pressable
            style={[styles.createButton, { backgroundColor: colors.primary }]}
            onPress={handleCreateReport}
            disabled={creating}
          >
            {creating ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.createButtonText}>Rapor Oluştur</Text>
            )}
          </Pressable>
        </View>
      )}

      {/* Rapor Listesi */}
      <FlatList
        data={reports}
        renderItem={renderReport}
        keyExtractor={item => item.id}
        contentContainerStyle={[
          styles.list,
          reports.length === 0 && styles.emptyList,
          { paddingBottom: 100 }
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
            <FileText size={48} color={colors.textTertiary} style={styles.emptyIcon} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              Henüz Rapor Yok
            </Text>
            <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
              Yeni raporunuz geldiğinde ana sayfada görüntülenecektir
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    position: 'relative',
  },
  headerTextContainer: {
    flex: 1,
    marginRight: 60,
  },
  greeting: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    marginBottom: 4,
  },
  userName: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    marginBottom: 8,
  },
  trendCapsuleWrapper: {
    marginBottom: 8,
  },
  aiText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginTop: 8,
  },
  settingsButton: {
    position: 'absolute',
    top: 50,
    right: 10,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  refreshIcon: {
    opacity: 0.8,
  },
  list: {
    padding: 16,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardWrapper: { // Added for the temporary View replacement of Animated.View
    marginBottom: 16, // Matches the margin-bottom of the original Animated.View
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  cardIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  content: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
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
  newReportContainer: {
    padding: 16,
    margin: 16,
    borderRadius: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
  createButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
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