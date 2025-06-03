import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, Pressable, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Bell, User, CircleHelp as HelpCircle, LogOut, Check } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { FadeIn } from 'react-native-reanimated';

export default function SettingsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [user, setUser] = React.useState<any>(null);
  const [displayName, setDisplayName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const { data: { user } = {} } = await supabase.auth.getUser(); // Destructure with default empty object
      if (user) {
        setUser(user);
        setDisplayName(user.user_metadata?.display_name || '');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };


  const handleUpdateDisplayName = async () => {
    if (!displayName.trim()) {
      setError('İsim boş olamaz');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        data: { display_name: displayName.trim() }
      });

      if (updateError) throw updateError;

      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({ display_name: displayName.trim() })
        .eq('id', user.id);

      if (profileError) throw profileError;

      setIsEditing(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
      // Refresh user data
      fetchUserData();
    } catch (err: any) {
      setError(err.message || 'İsim güncellenirken bir hata oluştu');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userEmail');
      await AsyncStorage.removeItem('userPassword');
      await supabase.auth.signOut();
      router.replace('/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const sections = [
    {
      title: 'Hesap',
      items: [
        {
          icon: <User size={24} color={colors.text} />, // İkon boyutu artırıldı
          label: 'İsim',
          action: 'edit',
          value: displayName,
          onPress: () => setIsEditing(true),
        },
      ]
    },
    {
      title: 'Tercihler',
      items: [
        {
          icon: <Bell size={24} color={colors.text} />, // İkon boyutu artırıldı
          label: 'Bildirimler',
          action: 'toggle',
          value: notificationsEnabled,
          onToggle: () => setNotificationsEnabled(!notificationsEnabled),
        },
      ]
    },
    {
      title: 'Destek',
      items: [
        {
          icon: <HelpCircle size={24} color={colors.text} />, // İkon boyutu artırıldı
          label: 'Yardım ve Destek',
          action: 'link',
        },
      ]
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Ayarlar</Text>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileSection}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>
              {displayName?.split(' ').map((n: string) => n[0]).join('') || '...'}
            </Text>
          </View>
          <Text style={[styles.userName, { color: colors.text }]}>
            {displayName || 'Yükleniyor...'}
          </Text>
          <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
            {user?.email || 'Yükleniyor...'}
          </Text>
        </View>
        
        {sections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              {section.title}
            </Text>
            
            <View style={[styles.sectionCard, { backgroundColor: colors.card }]}>
              {section.items.map((item, index) => (
                <View 
                  key={item.label}
                  style={[
                    styles.settingItem,
                    index !== section.items.length - 1 && {
                      borderBottomWidth: 1,
                      borderBottomColor: colors.border,
                    },
                  ]}
                >
                  <View style={styles.settingLeft}>
                    {item.icon}
                    <Text style={[styles.settingLabel, { color: colors.text }]}>
                      {item.label}
                    </Text>
                  </View>
                  
                  <View style={styles.settingRight}>
                    {item.action === 'edit' && !isEditing && (
                      <Pressable
                        onPress={item.onPress}
                        style={({ pressed }) => ({
                          opacity: pressed ? 0.7 : 1,
                        })}
                      >
                        <Text style={[styles.editButton, { color: colors.primary }]}>
                          Düzenle
                        </Text>
                      </Pressable>
                    )}
                    
                    {item.action === 'toggle' && (
                      <Switch
                        value={item.value}
                        onValueChange={item.onToggle}
                        trackColor={{ false: colors.border, true: colors.primary }}
                        ios_backgroundColor={colors.border}
                      />
                    )}
                    
                    {item.action === 'link' && (
                      <Text style={[styles.linkValue, { color: colors.primary }]}>
                        Görüntüle
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>
        ))}

        {isEditing && (
          <View style={[styles.editSection, { backgroundColor: colors.card }]}>
            <TextInput
              style={[styles.input, { 
                color: colors.text,
                borderColor: error ? colors.error : colors.border,
                backgroundColor: colors.background,
              }]}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="İsminizi girin"
              placeholderTextColor={colors.textTertiary}
              autoFocus
            />
            
            {error && (
              <Text style={[styles.errorText, { color: colors.error }]}>
                {error}
              </Text>
            )}

            <View style={styles.editButtons}>
              <Pressable
                style={[styles.cancelButton, { borderColor: colors.border }]}
                onPress={() => {
                  setIsEditing(false);
                  setError(null);
                  setDisplayName(user?.user_metadata?.display_name || '');
                }}
              >
                <Text style={[styles.cancelButtonText, { color: colors.text }]}>
                  İptal
                </Text>
              </Pressable>
              
              <Pressable
                style={[styles.saveButton, { backgroundColor: colors.primary }]}
                onPress={handleUpdateDisplayName}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveButtonText}>
                    Kaydet
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        )}
        
        <Pressable 
          style={[styles.logoutButton, { borderColor: colors.error }]}
          onPress={handleLogout}
        >
          <LogOut size={22} color={colors.error} /> {/* İkon boyutu artırıldı */}
          <Text style={[styles.logoutText, { color: colors.error }]}>
            Çıkış Yap
          </Text>
        </Pressable>
        
        <Text style={[styles.version, { color: colors.textTertiary }]}>
          Versiyon 1.0.0
        </Text>
      </ScrollView>

      {showSuccess && (
        <Animated.View 
          entering={FadeIn.duration(400)}
          style={[styles.toast, { backgroundColor: colors.success }]}
        >
          <Check size={22} color="#FFFFFF" /> {/* İkon boyutu artırıldı */}
          <Text style={styles.toastText}>İsminiz başarıyla güncellendi</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 36, // Başlık boyutu artırıldı
    marginBottom: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 28, // Dikey dolgu artırıldı
  },
  avatar: {
    width: 88, // Avatar boyutu artırıldı
    height: 88, // Avatar boyutu artırıldı
    borderRadius: 44, // Yuvarlaklık artırıldı
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18, // Boşluk artırıldı
  },
  avatarText: {
    fontFamily: 'Inter-Bold',
    fontSize: 32, // Metin boyutu artırıldı
    color: '#FFFFFF',
  },
  userName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 22, // Metin boyutu artırıldı
    marginBottom: 6, // Boşluk artırıldı
  },
  userEmail: {
    fontFamily: 'Inter-Regular',
    fontSize: 15, // Metin boyutu artırıldı
  },
  section: {
    marginBottom: 28, // Boşluk artırıldı
    paddingHorizontal: 18, // Yatay dolgu artırıldı
  },
  sectionTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 15, // Metin boyutu artırıldı
    marginBottom: 10, // Boşluk artırıldı
    textTransform: 'uppercase',
    letterSpacing: 0.6, // Harf aralığı artırıldı
  },
  sectionCard: {
    borderRadius: 14, // Kart yuvarlaklığı artırıldı
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18, // Dikey dolgu artırıldı
    paddingHorizontal: 18, // Yatay dolgu artırıldı
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 17, // Metin boyutu artırıldı
    marginLeft: 14, // Boşluk artırıldı
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    fontFamily: 'Inter-Medium',
    fontSize: 15, // Metin boyutu artırıldı
  },
  linkValue: {
    fontFamily: 'Inter-Medium',
    fontSize: 15, // Metin boyutu artırıldı
  },
  editSection: {
    margin: 18, // Dış boşluk artırıldı
    padding: 20, // İç dolgu artırıldı
    borderRadius: 14, // Yuvarlaklık artırıldı
  },
  input: {
    fontFamily: 'Inter-Regular',
    fontSize: 17, // Metin boyutu artırıldı
    paddingVertical: 14, // Dikey dolgu artırıldı
    paddingHorizontal: 18, // Yatay dolgu artırıldı
    borderWidth: 1,
    borderRadius: 10, // Yuvarlaklık artırıldı
    marginBottom: 18, // Boşluk artırıldı
  },
  errorText: {
    fontFamily: 'Inter-Medium',
    fontSize: 15, // Metin boyutu artırıldı
    marginBottom: 18, // Boşluk artırıldı
  },
  editButtons: {
    flexDirection: 'row',
    gap: 14, // Boşluk artırıldı
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14, // Dikey dolgu artırıldı
    borderRadius: 10, // Yuvarlaklık artırıldı
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 15, // Metin boyutu artırıldı
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14, // Dikey dolgu artırıldı
    borderRadius: 10, // Yuvarlaklık artırıldı
    alignItems: 'center',
  },
  saveButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 15, // Metin boyutu artırıldı
    color: '#FFFFFF',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 18, // Yatay boşluk artırıldı
    marginTop: 12, // Dikey boşluk artırıldı
    marginBottom: 28, // Dikey boşluk artırıldı
    paddingVertical: 14, // Dikey dolgu artırıldı
    borderRadius: 10, // Yuvarlaklık artırıldı
    borderWidth: 1,
  },
  logoutText: {
    fontFamily: 'Inter-Medium',
    fontSize: 17, // Metin boyutu artırıldı
    marginLeft: 10, // Boşluk artırıldı
  },
  version: {
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
    fontSize: 13, // Metin boyutu artırıldı
  },
  toast: {
    position: 'absolute',
    bottom: 90,
    left: 18, // Yatay boşluk artırıldı
    right: 18, // Yatay boşluk artırıldı
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18, // Dolgu artırıldı
    borderRadius: 10, // Yuvarlaklık artırıldı
    gap: 10, // Boşluk artırıldı
  },
  toastText: {
    fontFamily: 'Inter-Medium',
    fontSize: 15, // Metin boyutu artırıldı
    color: '#FFFFFF',
  },
});