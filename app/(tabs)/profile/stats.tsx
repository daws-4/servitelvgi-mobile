import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/app/contexts/AuthContext';
import { BrandColors } from '@/constants/colors';
import { getStats } from '@/services/api/installers';
import crewService from '@/services/api/crews';
import type { Crew } from '@/types/Crew';

const { width } = Dimensions.get('window');

interface StatsData {
  totalOrders: number;
  pendingOrders: number;
  inProgressOrders: number;
  completedOrders: number;
  completedSpecialOrders: number;
  cancelledOrders: number;
  installationsCount: number;
  averiasCount: number;
  recuperacionesCount: number;
  todayCompletions: number;
  monthCompletions: number;
}

export default function InstallerStatsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { installer } = useAuth();
  
  const startYear = 2026;
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // 1-12

  const years = [];
  for (let y = startYear; y <= Math.max(startYear, currentYear); y++) {
    years.push(y);
  }

  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const spinValue = React.useRef(new Animated.Value(0)).current;
  const spinAnimation = React.useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (refreshing) {
      if (spinAnimation.current) {
        spinAnimation.current.stop();
      }
      spinValue.setValue(0);
      spinAnimation.current = Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      spinAnimation.current.start();
    } else {
      if (spinAnimation.current) {
        spinAnimation.current.stop();
        spinAnimation.current = null;
      }
      Animated.timing(spinValue, {
        toValue: 0,
        duration: 300,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start();
    }
  }, [refreshing]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  
  const [stats, setStats] = useState<StatsData | null>(null);
  const [crew, setCrew] = useState<Crew | null>(null);

  const fetchStatsAndCrew = async (isSilent = false, monthVal?: number, yearVal?: number) => {
    const activeMonth = monthVal !== undefined ? monthVal : selectedMonth;
    const activeYear = yearVal !== undefined ? yearVal : selectedYear;

    if (!isSilent) setLoading(true);
    setError(null);
    try {
      // 1. Fetch stats from API with month and year
      const statsRes = await getStats(activeMonth, activeYear);
      setStats(statsRes.stats);

      // 2. Fetch crew details if available
      const installerAny = installer as any;
      const crewId = statsRes.crewId || installerAny?.crew?._id || installerAny?.currentCrew;
      if (crewId) {
        const crewData = await crewService.getCrewById(crewId);
        setCrew(crewData);
      }
    } catch (err: any) {
      console.error('❌ [InstallerStatsScreen] Error fetching stats:', err);
      setError(err.message || 'Error al conectar con el servidor.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStatsAndCrew(false, selectedMonth, selectedYear);
  }, [selectedMonth, selectedYear]);

  const handleSelectYear = (yr: number) => {
    setSelectedYear(yr);
    if (yr === currentYear && selectedMonth > currentMonth) {
      setSelectedMonth(currentMonth);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStatsAndCrew(true, selectedMonth, selectedYear);
  };

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BrandColors.primary} />
          <Text style={styles.loadingText}>Cargando estadísticas...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !stats) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <FontAwesome name="exclamation-triangle" size={48} color="#ef4444" />
          <Text style={styles.errorTitle}>Error al cargar estadísticas</Text>
          <Text style={styles.errorText}>{error || 'Inténtalo de nuevo más tarde'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchStatsAndCrew()}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backButtonOutline} onPress={handleBack}>
            <Text style={styles.backButtonOutlineText}>Volver al Perfil</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Calculate percentages for type breakdown
  const totalTypeCount = stats.installationsCount + stats.averiasCount + stats.recuperacionesCount;
  const installationPct = totalTypeCount > 0 ? (stats.installationsCount / totalTypeCount) * 100 : 0;
  const averiaPct = totalTypeCount > 0 ? (stats.averiasCount / totalTypeCount) * 100 : 0;
  const recuperacionPct = totalTypeCount > 0 ? (stats.recuperacionesCount / totalTypeCount) * 100 : 0;

  const crewNumberText = crew ? `Cuadrilla #${crew.number}` : 'Cuadrilla';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Premium Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn} activeOpacity={0.7}>
          <FontAwesome name="arrow-left" size={16} color="#0f0f0f" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Mis Estadísticas</Text>
          <Text style={styles.headerSubtitle}>{crewNumberText}</Text>
        </View>
        <TouchableOpacity onPress={handleRefresh} style={styles.backBtn} activeOpacity={0.7}>
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <FontAwesome name="refresh" size={16} color="#0f0f0f" />
          </Animated.View>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        alwaysBounceVertical={true}
        overScrollMode="always"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[BrandColors.primary]}
            tintColor={BrandColors.primary}
          />
        }
      >
        {/* Month and Year Filter Bar */}
        <View style={styles.filterSection}>
          <Text style={styles.filterSectionTitle}>Período de Consulta</Text>
          
          {/* Year selector */}
          <View style={styles.yearContainer}>
            {years.map((yr) => (
              <TouchableOpacity
                key={yr}
                onPress={() => handleSelectYear(yr)}
                style={[
                  styles.yearButton,
                  selectedYear === yr && styles.yearButtonActive
                ]}
              >
                <Text style={[
                  styles.yearButtonText,
                  selectedYear === yr && styles.yearButtonTextActive
                ]}>
                  {yr}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Month selector */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.monthsScroll}
            style={styles.monthsScrollView}
          >
            {[
              { val: 1, label: 'Ene' },
              { val: 2, label: 'Feb' },
              { val: 3, label: 'Mar' },
              { val: 4, label: 'Abr' },
              { val: 5, label: 'May' },
              { val: 6, label: 'Jun' },
              { val: 7, label: 'Jul' },
              { val: 8, label: 'Ago' },
              { val: 9, label: 'Sep' },
              { val: 10, label: 'Oct' },
              { val: 11, label: 'Nov' },
              { val: 12, label: 'Dic' }
            ].map((m) => {
              const disabled = selectedYear === currentYear && m.val > currentMonth;
              return (
                <TouchableOpacity
                  key={m.val}
                  disabled={disabled}
                  onPress={() => setSelectedMonth(m.val)}
                  style={[
                    styles.monthButton,
                    selectedMonth === m.val && styles.monthButtonActive,
                    disabled && styles.monthButtonDisabled
                  ]}
                  activeOpacity={disabled ? 1 : 0.7}
                >
                  <Text style={[
                    styles.monthButtonText,
                    selectedMonth === m.val && styles.monthButtonTextActive,
                    disabled && styles.monthButtonTextDisabled
                  ]}>
                    {m.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Production Highlights Gradient Section */}
        <LinearGradient
          colors={[BrandColors.primary, BrandColors.secondary]}
          style={styles.highlightCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.highlightRow}>
            <View style={styles.highlightCol}>
              <Text style={styles.highlightLabel}>Completadas Hoy</Text>
              <View style={styles.highlightValueContainer}>
                <FontAwesome name="check-circle" size={24} color="#deefb7" style={styles.highlightIcon} />
                <Text style={styles.highlightValue}>{stats.todayCompletions}</Text>
              </View>
            </View>
            <View style={styles.dividerCol} />
            <View style={styles.highlightCol}>
              <Text style={styles.highlightLabel}>Completadas del Mes</Text>
              <View style={styles.highlightValueContainer}>
                <FontAwesome name="calendar" size={22} color="#deefb7" style={styles.highlightIcon} />
                <Text style={styles.highlightValue}>{stats.monthCompletions}</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Section Title */}
        <Text style={styles.sectionTitle}>Distribución de Órdenes</Text>

        {/* State Indicators Grid */}
        <View style={styles.grid}>
          <View style={styles.gridCard}>
            <View style={[styles.gridIconContainer, { backgroundColor: '#f0fdf4' }]}>
              <MaterialCommunityIcons name="check-all" size={20} color="#15803d" />
            </View>
            <Text style={styles.gridCardValue}>{stats.completedOrders}</Text>
            <Text style={styles.gridCardLabel}>Completadas</Text>
          </View>

          <View style={styles.gridCard}>
            <View style={[styles.gridIconContainer, { backgroundColor: '#fef3c7' }]}>
              <MaterialCommunityIcons name="clock-outline" size={20} color="#b45309" />
            </View>
            <Text style={styles.gridCardValue}>{stats.pendingOrders}</Text>
            <Text style={styles.gridCardLabel}>Pendientes</Text>
          </View>

          <View style={styles.gridCard}>
            <View style={[styles.gridIconContainer, { backgroundColor: '#eff6ff' }]}>
              <MaterialCommunityIcons name="progress-wrench" size={20} color="#1d4ed8" />
            </View>
            <Text style={styles.gridCardValue}>{stats.inProgressOrders}</Text>
            <Text style={styles.gridCardLabel}>En Curso</Text>
          </View>

          <View style={styles.gridCard}>
            <View style={[styles.gridIconContainer, { backgroundColor: '#fef2f2' }]}>
              <MaterialCommunityIcons name="cancel" size={20} color="#b91c1c" />
            </View>
            <Text style={styles.gridCardValue}>{stats.cancelledOrders}</Text>
            <Text style={styles.gridCardLabel}>Canceladas</Text>
          </View>
        </View>

        {/* Breakdown of Completed Orders */}
        <Text style={styles.sectionTitle}>Detalle de Trabajos Realizados</Text>
        
        <View style={styles.breakdownCard}>
          <Text style={styles.breakdownHeader}>Total Completados: {totalTypeCount}</Text>
          
          {/* Progress Bar 1: Installations */}
          <View style={styles.progressRow}>
            <View style={styles.progressLabelRow}>
              <View style={styles.progressLabelGroup}>
                <View style={[styles.legendDot, { backgroundColor: '#2563eb' }]} />
                <Text style={styles.progressText}>Instalaciones</Text>
              </View>
              <Text style={styles.progressValue}>{stats.installationsCount} ({installationPct.toFixed(0)}%)</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { backgroundColor: '#2563eb', width: `${installationPct}%` }]} />
            </View>
          </View>

          {/* Progress Bar 2: Averias */}
          <View style={styles.progressRow}>
            <View style={styles.progressLabelRow}>
              <View style={styles.progressLabelGroup}>
                <View style={[styles.legendDot, { backgroundColor: '#ea580c' }]} />
                <Text style={styles.progressText}>Averías</Text>
              </View>
              <Text style={styles.progressValue}>{stats.averiasCount} ({averiaPct.toFixed(0)}%)</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { backgroundColor: '#ea580c', width: `${averiaPct}%` }]} />
            </View>
          </View>

          {/* Progress Bar 3: Recuperaciones */}
          <View style={styles.progressRow}>
            <View style={styles.progressLabelRow}>
              <View style={styles.progressLabelGroup}>
                <View style={[styles.legendDot, { backgroundColor: '#16a34a' }]} />
                <Text style={styles.progressText}>Recuperaciones</Text>
              </View>
              <Text style={styles.progressValue}>{stats.recuperacionesCount} ({recuperacionPct.toFixed(0)}%)</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { backgroundColor: '#16a34a', width: `${recuperacionPct}%` }]} />
            </View>
          </View>
          
          {/* Special status callout if any */}
          {stats.completedSpecialOrders > 0 && (
            <View style={styles.specialCallout}>
              <FontAwesome name="star" size={16} color="#eab308" />
              <Text style={styles.specialCalloutText}>
                Completadas Especiales: {stats.completedSpecialOrders}
              </Text>
            </View>
          )}
        </View>

        {/* Info card */}
        <View style={styles.infoCard}>
          <FontAwesome name="info-circle" size={18} color="#475569" style={styles.infoIcon} />
          <Text style={styles.infoText}>
            Estas estadísticas se calculan a partir de los datos registrados en el sistema central en tiempo real para tu cuadrilla asignada.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc', // slate-50
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 140, // Aumentado para evitar solapamiento con la barra inferior
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f0f0f',
  },
  errorText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 8,
  },
  retryButton: {
    backgroundColor: BrandColors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  backButtonOutline: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
  },
  backButtonOutlineText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    backgroundColor: 'white',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f0f0f',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
    marginTop: 2,
  },
  headerRightPlaceholder: {
    width: 40,
  },
  highlightCard: {
    borderRadius: 24,
    padding: 24,
    marginTop: 24,
    shadowColor: BrandColors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  highlightCol: {
    flex: 1,
    alignItems: 'center',
  },
  dividerCol: {
    width: 1,
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  highlightLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  highlightValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  highlightIcon: {
    opacity: 0.9,
  },
  highlightValue: {
    fontSize: 28,
    fontWeight: '900',
    color: 'white',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0f0f0f',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginTop: 32,
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridCard: {
    width: (width - 48 - 12) / 2,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  gridIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  gridCardValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0f0f0f',
    marginBottom: 4,
  },
  gridCardLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  breakdownCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    gap: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  breakdownHeader: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 4,
  },
  progressRow: {
    gap: 8,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  progressValue: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#64748b',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  specialCallout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fefcbf', // yellow-100
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  specialCalloutText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#854d0e',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    marginTop: 24,
    alignItems: 'center',
  },
  infoIcon: {
    opacity: 0.8,
  },
  infoText: {
    flex: 1,
    fontSize: 11,
    color: '#475569',
    lineHeight: 16,
    fontWeight: '500',
  },
  filterSection: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  filterSectionTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 4,
  },
  yearContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  yearButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  yearButtonActive: {
    backgroundColor: BrandColors.primary,
    borderColor: BrandColors.primary,
  },
  yearButtonText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#475569',
  },
  yearButtonTextActive: {
    color: 'white',
  },
  monthsScrollView: {
    marginTop: 4,
  },
  monthsScroll: {
    gap: 8,
    paddingRight: 10,
  },
  monthButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  monthButtonActive: {
    backgroundColor: BrandColors.primary,
    borderColor: BrandColors.primary,
  },
  monthButtonText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#475569',
  },
  monthButtonTextActive: {
    color: 'white',
  },
  monthButtonDisabled: {
    backgroundColor: '#f8fafc',
    borderColor: '#f1f5f9',
    opacity: 0.35,
  },
  monthButtonTextDisabled: {
    color: '#94a3b8',
  },
});
