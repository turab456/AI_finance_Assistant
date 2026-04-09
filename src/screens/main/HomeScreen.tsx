import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { AlertTriangle, Bell, ChevronRight, Sparkles, TrendingDown, TrendingUp, Wallet } from 'lucide-react-native';
import Screen from '../../components/ui/Screen';
import ElevatedCard from '../../components/ui/ElevatedCard';
import PageHeader from '../../components/ui/PageHeader';
import SectionHeader from '../../components/ui/SectionHeader';
import { BORDER_RADIUS, COLORS, GRADIENTS, SPACING } from '../../utils/theme';
import { capitalize, formatCurrency, formatMonthYear } from '../../utils/format';
import socketService from '../../services/socket';
import storage from '../../services/storage';
import api, { authApi, transactionsApi } from '../../services/api';

type SummaryItem = {
  id: string;
  label: string;
  amount: string;
  note: string;
  colors: string[];
  icon: any;
};

type CategoryTrend = {
  id: string;
  label: string;
  amount: number;
  share: number;
};

const HomeScreen = ({ navigation }: any) => {
  const [userName, setUserName] = useState('User');
  const [summary, setSummary] = useState<SummaryItem[]>([
    {
      id: 'balance',
      label: 'Available Balance',
      amount: formatCurrency(0),
      note: 'Waiting for live balance',
      colors: GRADIENTS.indigo,
      icon: Wallet,
    },
    {
      id: 'income',
      label: 'Monthly Income',
      amount: formatCurrency(0),
      note: 'Income overview',
      colors: GRADIENTS.income,
      icon: TrendingUp,
    },
    {
      id: 'expense',
      label: 'Total Expense',
      amount: formatCurrency(0),
      note: 'Spend overview',
      colors: GRADIENTS.expense,
      icon: TrendingDown,
    },
  ]);
  const [insightData, setInsightData] = useState<any>(null);
  const [categoryTrends, setCategoryTrends] = useState<CategoryTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSalaryPrompt, setShowSalaryPrompt] = useState(false);
  const [isEstimated, setIsEstimated] = useState(false);

  const fetchPrediction = useCallback(async () => {
    try {
      const res = await api.get('/insights/prediction');
      return {
        predictions: res.data?.predictions || [],
        estimated: res.data?.is_estimated || false,
      };
    } catch (error) {
      console.error('PREDICTION ERROR:', error);
      return {
        predictions: [],
        estimated: false,
      };
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    let connectedUserId: string | number | null = null;

    const fetchData = async (forceRefresh = false) => {
      try {
        if (isMounted) {
          setLoading(true);
        }

        let incomeFromApi = 0;
        let currentBalanceFromMe: number | undefined;
        let currentBalanceFromCache: number | undefined;

        try {
          const me = await authApi.getMe();
          incomeFromApi = me.monthly_income || 0;

          if (me.current_balance !== undefined && me.current_balance !== null) {
            currentBalanceFromMe = Number(me.current_balance);
          }

          if (isMounted) {
            setUserName(me.phone || 'User');
            setShowSalaryPrompt(!me.monthly_income);
          }

          const existing = (await storage.getUserProfile()) || {};
          await storage.setUserProfile({
            ...existing,
            id: me.id,
            phone: me.phone,
            monthly_income: me.monthly_income,
            current_balance: me.current_balance ?? existing.current_balance,
          });
        } catch (error) {
          const cached = await storage.getUserProfile();
          const incomeFromCache = cached?.monthly_income || 0;
          currentBalanceFromCache =
            cached?.current_balance !== undefined && cached?.current_balance !== null ? Number(cached.current_balance) : undefined;

          if (isMounted) {
            setUserName(cached?.phone || 'User');
            setShowSalaryPrompt(incomeFromCache === 0);
          }
        }

        const { predictions, estimated } = await fetchPrediction();
        const predictedBalance = predictions[0]?.balance ?? 0;
        const currentBalance =
          currentBalanceFromMe !== undefined
            ? currentBalanceFromMe
            : currentBalanceFromCache !== undefined
              ? currentBalanceFromCache
              : predictedBalance;

        if (isMounted) {
          setIsEstimated(estimated);
        }

        const insightResponse = await transactionsApi.getInsights(forceRefresh);
        if (!insightResponse || !isMounted) {
          return;
        }

        const totalSpend = Number(insightResponse.total_spend || 0);
        const income = Number(incomeFromApi || insightResponse.total_income || 0);
        const breakdown = Array.isArray(insightResponse.breakdown) ? insightResponse.breakdown : [];
        const trendRows = breakdown
          .map((item: any, index: number) => {
            const amount = Number(item?.amount || 0);
            const share = totalSpend > 0 ? (amount / totalSpend) * 100 : 0;

            return {
              id: `trend-${index}`,
              label: capitalize(item?.category || 'Other'),
              amount,
              share,
            };
          })
          .sort((first: CategoryTrend, second: CategoryTrend) => second.amount - first.amount);

        setInsightData(insightResponse);
        setCategoryTrends(trendRows);
        setSummary([
          {
            id: 'balance',
            label: estimated ? 'Estimated Balance' : 'Available Balance',
            amount: formatCurrency(currentBalance),
            note: estimated ? 'Add live balance for sharper forecasts' : 'Live snapshot from your profile',
            colors: GRADIENTS.indigo,
            icon: Wallet,
          },
          {
            id: 'income',
            label: 'Monthly Income',
            amount: formatCurrency(income),
            note: income > 0 ? 'Synced to your account' : 'Complete your profile setup',
            colors: GRADIENTS.income,
            icon: TrendingUp,
          },
          {
            id: 'expense',
            label: 'Total Expense',
            amount: formatCurrency(totalSpend),
            note: trendRows.length > 0 ? `${trendRows.length} categories tracked` : 'No categories tracked yet',
            colors: GRADIENTS.expense,
            icon: TrendingDown,
          },
        ]);
      } catch (error) {
        console.error('Failed to fetch home data', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    const handleNewTransaction = async () => {
      await fetchData(true);
    };

    const handleConnect = () => {
      if (connectedUserId !== null) {
        socketService.emit('join', connectedUserId);
      }
    };

    const setupApp = async () => {
      await fetchData(false);
      const profile = await storage.getUserProfile();
      const userId = profile?.id;

      if (userId) {
        connectedUserId = userId;
        socketService.connect(userId);
        socketService.on('new_transaction', handleNewTransaction);
        socketService.on('connect', handleConnect);
      }
    };

    setupApp();

    return () => {
      isMounted = false;
      socketService.off('new_transaction', handleNewTransaction);
      socketService.off('connect', handleConnect);
      socketService.disconnect();
    };
  }, [fetchPrediction]);

  const headlineCard = summary[0];
  const HeadlineIcon = headlineCard.icon;
  const secondaryCards = summary.slice(1);
  const topTrend = categoryTrends[0];
  const trendPills = categoryTrends.slice(0, 3);

  const renderPrompt = (variant: 'setup' | 'balance') => {
    const isSetup = variant === 'setup';

    return (
      <TouchableOpacity
        activeOpacity={0.86}
        onPress={() => navigation.navigate('Profile')}
        style={[styles.noticeCard, isSetup ? styles.noticeSetup : styles.noticeWarning]}
      >
        <View style={[styles.noticeIcon, isSetup ? styles.noticeSetupIcon : styles.noticeWarningIcon]}>
          <AlertTriangle size={18} color={isSetup ? '#C2410C' : '#92400E'} />
        </View>
        <View style={styles.noticeCopy}>
          <Text style={[styles.noticeTitle, { color: isSetup ? '#9A3412' : '#92400E' }]}>
            {isSetup ? 'Finish your profile setup' : 'Balance is estimated'}
          </Text>
          <Text style={[styles.noticeDescription, { color: isSetup ? '#C2410C' : '#B45309' }]}>
            {isSetup
              ? 'Add your monthly income to unlock better trend analysis and cleaner AI insights.'
              : 'Add your current balance so the dashboard can stop relying on predictions.'}
          </Text>
        </View>
        <ChevronRight size={18} color={isSetup ? '#C2410C' : '#92400E'} />
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <Screen safeAreaStyle={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {showSalaryPrompt ? renderPrompt('setup') : null}
        {isEstimated ? renderPrompt('balance') : null}

        <PageHeader
          eyebrow="Overview"
          title={`Hello, ${userName}`}
          subtitle={formatMonthYear()}
          rightSlot={
            <TouchableOpacity activeOpacity={0.85} style={styles.headerButton}>
              <Bell size={20} color={COLORS.textDark} />
              <View style={styles.headerButtonBadge} />
            </TouchableOpacity>
          }
        />

        <LinearGradient colors={headlineCard.colors} style={styles.balanceCard}>
          <View style={styles.balanceCardTop}>
            <View>
              <Text style={styles.balanceLabel}>{headlineCard.label}</Text>
              <Text style={styles.balanceAmount}>{headlineCard.amount}</Text>
            </View>
            <View style={styles.balanceIconWrap}>
              <HeadlineIcon size={22} color={COLORS.white} />
            </View>
          </View>
          <Text style={styles.balanceNote}>{headlineCard.note}</Text>
        </LinearGradient>

        <View style={styles.secondaryGrid}>
          {secondaryCards.map(item => {
            const Icon = item.icon;

            return (
              <ElevatedCard key={item.id} style={styles.metricCard}>
                <View style={styles.metricIcon}>
                  <Icon size={18} color={item.id === 'income' ? COLORS.income : COLORS.expense} />
                </View>
                <Text style={styles.metricLabel}>{item.label}</Text>
                <Text style={styles.metricAmount}>{item.amount}</Text>
                <Text style={styles.metricNote}>{item.note}</Text>
              </ElevatedCard>
            );
          })}
        </View>

        {trendPills.length > 0 ? (
          <View style={styles.trendPillRow}>
            {trendPills.map(item => (
              <View key={item.id} style={styles.trendPill}>
                <Sparkles size={14} color={COLORS.primary} />
                <Text style={styles.trendPillText}>
                  {item.label} {item.share.toFixed(0)}%
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('Insights')}>
          <ElevatedCard style={styles.insightCard}>
            <View style={styles.insightIcon}>
              <Sparkles size={18} color={COLORS.primary} />
            </View>
            <View style={styles.insightCopy}>
              <Text style={styles.insightTitle}>AI insight</Text>
              <Text style={styles.insightBody}>
                {insightData?.message || 'We are preparing a fresh read on your latest spending pattern.'}
              </Text>
            </View>
            <ChevronRight size={18} color={COLORS.primary} />
          </ElevatedCard>
        </TouchableOpacity>

        <SectionHeader
          title="Trending categories"
          subtitle="Top spend areas shaping this month"
          actionText="See all"
          onPressAction={() => navigation.navigate('Transactions')}
          containerStyle={styles.sectionHeader}
        />

        <ElevatedCard style={styles.trendsCard}>
          {categoryTrends.length > 0 ? (
            categoryTrends.slice(0, 4).map((item, index) => (
              <View key={item.id} style={[styles.trendRow, index === Math.min(categoryTrends.length, 4) - 1 && styles.trendRowLast]}>
                <View style={styles.trendRowCopy}>
                  <Text style={styles.trendRowLabel}>{item.label}</Text>
                  <Text style={styles.trendRowMeta}>{item.share.toFixed(1)}% of this month's spend</Text>
                </View>
                <Text style={styles.trendRowAmount}>{formatCurrency(item.amount)}</Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No trends yet</Text>
              <Text style={styles.emptyBody}>New categories will start appearing here once transactions are captured.</Text>
            </View>
          )}
        </ElevatedCard>

        <SectionHeader title="Focus alert" subtitle="One quick thing worth watching" containerStyle={styles.sectionHeader} />
        <ElevatedCard style={styles.alertCard}>
          <View style={styles.alertIndicator} />
          <View style={styles.alertCopy}>
            <Text style={styles.alertTitle}>
              {topTrend ? `${topTrend.label} is leading this month` : 'Your dashboard is ready'}
            </Text>
            <Text style={styles.alertText}>
              {topTrend
                ? `${topTrend.share.toFixed(0)}% of your tracked spend is concentrated here. Reviewing this category first will give the fastest payoff.`
                : 'Add more activity to unlock focused alerts and cleaner recommendations.'}
            </Text>
          </View>
        </ElevatedCard>
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: SPACING.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  headerButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerButtonBadge: {
    position: 'absolute',
    top: 11,
    right: 12,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: COLORS.expense,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  noticeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
  },
  noticeSetup: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FED7AA',
  },
  noticeWarning: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FCD34D',
  },
  noticeIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  noticeSetupIcon: {
    backgroundColor: '#FFEDD5',
  },
  noticeWarningIcon: {
    backgroundColor: '#FDE68A',
  },
  noticeCopy: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  noticeTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  noticeDescription: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 19,
  },
  balanceCard: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
    borderRadius: 28,
    padding: SPACING.xl,
  },
  balanceCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  balanceLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.78)',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  balanceAmount: {
    marginTop: SPACING.sm,
    fontSize: 34,
    lineHeight: 42,
    fontWeight: '800',
    color: COLORS.white,
  },
  balanceIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceNote: {
    marginTop: SPACING.xl,
    fontSize: 14,
    lineHeight: 21,
    color: 'rgba(255,255,255,0.82)',
  },
  secondaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.md,
  },
  metricCard: {
    width: '48.5%',
    padding: SPACING.lg,
  },
  metricIcon: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    marginBottom: SPACING.md,
  },
  metricLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  metricAmount: {
    marginTop: SPACING.sm,
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  metricNote: {
    marginTop: SPACING.sm,
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.textMedium,
  },
  trendPillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
  },
  trendPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 999,
    backgroundColor: COLORS.primarySurface,
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  trendPillText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.sm,
    padding: SPACING.lg,
  },
  insightIcon: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primarySurface,
    marginRight: SPACING.md,
  },
  insightCopy: {
    flex: 1,
    marginRight: SPACING.md,
  },
  insightTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  insightBody: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 20,
    color: COLORS.textMedium,
  },
  sectionHeader: {
    paddingHorizontal: SPACING.lg,
  },
  trendsCard: {
    marginHorizontal: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  trendRowLast: {
    borderBottomWidth: 0,
  },
  trendRowCopy: {
    flex: 1,
    marginRight: SPACING.md,
  },
  trendRowLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  trendRowMeta: {
    marginTop: 4,
    fontSize: 13,
    color: COLORS.textMedium,
  },
  trendRowAmount: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  emptyState: {
    paddingVertical: SPACING.xl,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  emptyBody: {
    marginTop: SPACING.sm,
    fontSize: 13,
    lineHeight: 20,
    color: COLORS.textMedium,
    textAlign: 'center',
  },
  alertCard: {
    flexDirection: 'row',
    marginHorizontal: SPACING.lg,
    padding: SPACING.lg,
  },
  alertIndicator: {
    width: 10,
    borderRadius: 999,
    backgroundColor: COLORS.warning,
    marginRight: SPACING.md,
  },
  alertCopy: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  alertText: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 20,
    color: COLORS.textMedium,
  },
});

export default HomeScreen;
