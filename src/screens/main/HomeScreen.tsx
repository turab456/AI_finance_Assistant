import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  StatusBar,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Bell, TrendingUp, TrendingDown, Wallet, Zap, ChevronRight, AlertTriangle } from 'lucide-react-native';
import { COLORS, GRADIENTS, SPACING, BORDER_RADIUS, SHADOW } from '../../utils/theme';
import socketService from '../../services/socket';
import storage from '../../services/storage';
import api, { transactionsApi, authApi } from '../../services/api';
import Screen from '../../components/ui/Screen';
import SectionHeader from '../../components/ui/SectionHeader';
import ElevatedCard from '../../components/ui/ElevatedCard';

const HomeScreen = ({ navigation }: any) => {
  type SummaryItem = {
    id: string;
    label: string;
    amount: string;
    colors: string[];
    icon: any;
  };

  type TransactionItem = {
    id: string;
    merchant: string;
    amount: string;
    time: string;
    type: 'credit' | 'debit';
    category: string;
  };

  const [userName, setUserName] = useState('User');
  const [summary, setSummary] = useState<SummaryItem[]>([
    { id: 'income', label: 'Monthly Income', amount: '₹0', colors: GRADIENTS.income, icon: TrendingUp },
    { id: 'expense', label: 'Total Expense', amount: '₹0', colors: GRADIENTS.expense, icon: TrendingDown },
    { id: 'balance', label: 'Net Balance', amount: '₹0', colors: GRADIENTS.indigo, icon: Wallet },
  ]);
  const [insightData, setInsightData] = useState<any>(null);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSalaryPrompt, setShowSalaryPrompt] = useState(false);
  const [isEstimated, setIsEstimated] = useState(false);
  const formatCurrency = (value: unknown) => `₹${Number(value || 0).toLocaleString()}`;

  const fetchPrediction = useCallback(async () => {
    try {
      const res = await api.get('/insights/prediction');
      const predictions = res.data?.predictions || [];
      const estimated = res.data?.is_estimated || false;
      return { predictions, estimated };
    } catch (err) {
      console.error('PREDICTION ERROR:', err);
      return { predictions: [], estimated: false };
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async (forceRefresh = false) => {
      try {
        if (isMounted) {
          setLoading(true);
        }
        let incomeFromApi = 0;

        try {
          const me = await authApi.getMe();
          incomeFromApi = me.monthly_income || 0;
          if (isMounted) {
            setUserName(me.phone || 'User');
            setShowSalaryPrompt(!me.monthly_income);
          }

          const existing = await storage.getUserProfile() || {};
          await storage.setUserProfile({
            ...existing,
            id: me.id,
            phone: me.phone,
            monthly_income: me.monthly_income,
          });
        } catch (e) {
          const cached = await storage.getUserProfile();
          const incomeFromCache = cached?.monthly_income || 0;
          if (isMounted) {
            setUserName(cached?.phone || 'User');
            setShowSalaryPrompt(incomeFromCache === 0);
          }
        }

        const { predictions, estimated } = await fetchPrediction();
        const currentBalance = predictions[0]?.balance || 0;
        if (isMounted) {
          setIsEstimated(estimated);
        }

        const insightDataResponse = await transactionsApi.getInsights(forceRefresh);
        if (insightDataResponse && isMounted) {
          setInsightData(insightDataResponse);
          const totalSpend = insightDataResponse.total_spend || 0;
          const income = incomeFromApi || insightDataResponse.total_income || 0;

          setSummary([
            {
              id: 'balance',
              label: estimated ? 'Estimated Balance ⚠️' : 'Available Balance',
              amount: formatCurrency(currentBalance),
              colors: GRADIENTS.indigo,
              icon: Wallet,
            },
            {
              id: 'income',
              label: 'Monthly Income',
              amount: formatCurrency(income),
              colors: GRADIENTS.income,
              icon: TrendingUp,
            },
            {
              id: 'expense',
              label: 'Total Expense',
              amount: formatCurrency(totalSpend),
              colors: GRADIENTS.expense,
              icon: TrendingDown,
            },
          ]);

          if (insightDataResponse.breakdown) {
            const transformed = insightDataResponse.breakdown.map((item: any, idx: number) => ({
              id: `bk-${idx}`,
              merchant: String(item?.category || 'Unknown').charAt(0).toUpperCase() + String(item?.category || 'Unknown').slice(1),
              amount: `-${formatCurrency(item?.amount)}`,
              time: 'Total this month',
              type: 'debit',
              category: String(item?.category || 'unknown')
            }));
            setTransactions(transformed as TransactionItem[]);
          } else {
            setTransactions([]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch home data', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    const setupApp = async () => {
      await fetchData(false);
      const profile = await storage.getUserProfile();
      const userId = profile?.id;

      if (userId) {
        socketService.connect(userId);
      const handleConnect = () => {
          socketService.emit('join', userId);
      };
        socketService.on('connect', handleConnect);
      }
    };

    setupApp();

    const handleNewTransaction = async () => {
      await fetchData(true);
    };

    socketService.on('new_transaction', handleNewTransaction);

    return () => {
      isMounted = false;
      socketService.off('new_transaction', handleNewTransaction);
      socketService.off('connect');
      socketService.disconnect();
    };
  }, [fetchPrediction]);

  const renderSummaryCard = useCallback(({ item }: { item: SummaryItem }) => {
    const Icon = item.icon;
    return (
      <View style={styles.cardContainer}>
        <LinearGradient colors={item.colors} style={styles.summaryCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardLabel}>{item.label}</Text>
            <Icon color={COLORS.white} size={20} />
          </View>
          <Text style={styles.cardAmount}>{item.amount}</Text>
        </LinearGradient>
      </View>
    );
  }, []);

  const renderTransaction = useCallback(({ item }: { item: TransactionItem }) => (
    <TouchableOpacity style={styles.transactionItem} activeOpacity={0.7}>
      <View style={[styles.transactionIcon, { backgroundColor: item.type === 'credit' ? COLORS.incomeLight : COLORS.expenseLight }]}>
        {item.type === 'credit' ? <TrendingUp size={20} color={COLORS.income} /> : <TrendingDown size={20} color={COLORS.expense} />}
      </View>
      <View style={styles.transactionDetails}>
        <Text style={styles.merchantText}>{item.merchant}</Text>
        <Text style={styles.timeText}>{item.time}</Text>
      </View>
      <Text style={[styles.amountText, { color: item.type === 'credit' ? COLORS.income : COLORS.expense }]}>
        {item.amount}
      </Text>
    </TouchableOpacity>
  ), []);

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

        {/* Salary Prompt */}
        {showSalaryPrompt && (
          <TouchableOpacity
            style={styles.promptContainer}
            activeOpacity={0.9}
            onPress={() => navigation.navigate('Profile')}
          >
            <LinearGradient colors={['#FFF7ED', '#FFEDD5']} style={styles.promptContent}>
              <View style={styles.promptIcon}>
                <AlertTriangle size={24} color="#C2410C" />
              </View>
              <View style={styles.promptTextContainer}>
                <Text style={styles.promptTitle}>Finish Setup</Text>
                <Text style={styles.promptDescription}>Set your salary in the Profile section to get AI insights.</Text>
              </View>
              <ChevronRight size={20} color="#C2410C" />
            </LinearGradient>
          </TouchableOpacity>
        )}

        {isEstimated && (
          <TouchableOpacity
            style={styles.promptContainer}
            activeOpacity={0.9}
            onPress={() => navigation.navigate('Profile')}
          >
            <LinearGradient colors={['#FEF3C7', '#FDE68A']} style={styles.promptContent}>
              <View style={styles.promptIcon}>
                <AlertTriangle size={24} color="#92400E" />
              </View>
              <View style={styles.promptTextContainer}>
                <Text style={styles.promptTitle}>Estimated Balance</Text>
                <Text style={styles.promptDescription}>
                  Add your current balance for better AI suggestions.
                </Text>
              </View>
              <ChevronRight size={20} color="#92400E" />
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good Morning, {userName}</Text>
            <Text style={styles.monthLabel}>March 2026</Text>
          </View>
          <TouchableOpacity style={styles.bellButton}>
            <Bell size={24} color={COLORS.textDark} />
            <View style={styles.bellBadge} />
          </TouchableOpacity>
        </View>

        {/* Summary Cards */}
        <FlatList
          data={summary}
          renderItem={renderSummaryCard}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.summaryList}
          keyExtractor={item => item.id}
          snapToInterval={width * 0.7 + SPACING.md}
          decelerationRate="fast"
        />

        {/* AI Insight Card */}
        <TouchableOpacity
          style={styles.insightCard}
          activeOpacity={0.9}
          onPress={() => navigation.navigate('Insights')}
        >
          <LinearGradient colors={[COLORS.white, '#EEF2FF']} style={styles.insightGradient}>
            <View style={styles.insightIconContainer}>
              <Zap size={24} color={COLORS.primary} fill={COLORS.primary} />
            </View>
            <View style={styles.insightTextContainer}>
              <Text style={styles.insightTitle}>AI Spending Insights</Text>
              <Text style={styles.insightDescription}>
                {insightData?.message || "Analyzing your spending trends..."}
              </Text>
            </View>
            <ChevronRight size={20} color={COLORS.primary} />
          </LinearGradient>
        </TouchableOpacity>

        {/* Recent Transactions */}
        <SectionHeader title="Recent Transactions" actionText="See all" onPressAction={() => navigation.navigate('Transactions')} />
        <ElevatedCard style={styles.transactionsContainer}>
          {transactions.map(item => (
            <React.Fragment key={item.id}>
              {renderTransaction({ item })}
            </React.Fragment>
          ))}
        </ElevatedCard>

        {/* Alerts Section */}
        <SectionHeader title="Alerts" />
        <View style={styles.alertCard}>
          <View style={styles.alertIndicator} />
          <Text style={styles.alertText}>Low balance warning: Bank account ending in 4231 is below ₹5,000</Text>
        </View>

      </ScrollView>
    </Screen>
  );
};

const width = Dimensions.get('window').width;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: SPACING.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  monthLabel: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  bellButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOW,
    elevation: 3,
  },
  bellBadge: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.expense,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  summaryList: {
    paddingLeft: SPACING.lg,
    paddingRight: SPACING.sm,
    paddingBottom: SPACING.md,
  },
  cardContainer: {
    width: width * 0.7,
    marginRight: SPACING.md,
    ...SHADOW,
  },
  summaryCard: {
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    height: 140,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    fontWeight: '600',
  },
  cardAmount: {
    color: COLORS.white,
    fontSize: 28,
    fontWeight: '700',
  },
  insightCard: {
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOW,
    elevation: 4,
  },
  insightGradient: {
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  insightIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  insightTextContainer: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  insightDescription: {
    fontSize: 12,
    color: COLORS.textMedium,
  },
  transactionsContainer: {
    marginHorizontal: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  transactionDetails: {
    flex: 1,
  },
  merchantText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  timeText: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  amountText: {
    fontSize: 15,
    fontWeight: '700',
  },
  alertCard: {
    backgroundColor: COLORS.warningLight,
    padding: SPACING.md,
    marginHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertIndicator: {
    width: 6,
    height: '100%',
    backgroundColor: COLORS.warning,
    borderRadius: 3,
    marginRight: SPACING.md,
    minHeight: 30,
  },
  alertText: {
    flex: 1,
    fontSize: 13,
    color: '#92400E',
    lineHeight: 18,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  promptContainer: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    ...SHADOW,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  promptContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  promptIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFEDD5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  promptTextContainer: {
    flex: 1,
  },
  promptTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#9A3412',
  },
  promptDescription: {
    fontSize: 12,
    color: '#C2410C',
    marginTop: 2,
  },
});

export default HomeScreen;
