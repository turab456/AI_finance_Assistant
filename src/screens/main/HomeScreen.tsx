import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  FlatList, 
  Platform,
  StatusBar,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Bell, TrendingUp, TrendingDown, Wallet, Zap, ChevronRight } from 'lucide-react-native';
import { COLORS, GRADIENTS, SPACING, BORDER_RADIUS, SHADOW } from '../../utils/theme';
import socketService from '../../services/socket';
import storage from '../../services/storage';
import { transactionsApi } from '../../services/api';

const HomeScreen = ({ navigation }: any) => {
  const [userName, setUserName] = useState('User');
  const [summary, setSummary] = useState([
    { id: 'income', label: 'Total Income', amount: '₹1,24,000', colors: GRADIENTS.income, icon: TrendingUp },
    { id: 'expense', label: 'Total Expense', amount: '₹48,500', colors: GRADIENTS.expense, icon: TrendingDown },
    { id: 'balance', label: 'Net Balance', amount: '₹75,500', colors: GRADIENTS.indigo, icon: Wallet },
  ]);
  const [insightData, setInsightData] = useState<any>(null);

  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const profile = await storage.getUserProfile();
        if (profile) {
           setUserName(profile.name || 'User');
        }
        
        const insightDataResponse = await transactionsApi.getInsights();
        if (insightDataResponse) {
          setInsightData(insightDataResponse);
          const totalSpend = insightDataResponse.total_spend || 0;
          const income = insightDataResponse.total_income || 124000;
          
          setSummary([
            { id: 'income', label: 'Total Income', amount: `₹${income.toLocaleString()}`, colors: GRADIENTS.income, icon: TrendingUp },
            { id: 'expense', label: 'Total Expense', amount: `₹${totalSpend.toLocaleString()}`, colors: GRADIENTS.expense, icon: TrendingDown },
            { id: 'balance', label: 'Net Balance', amount: `₹${(income - totalSpend).toLocaleString()}`, colors: GRADIENTS.indigo, icon: Wallet },
          ]);

          // Transform breakdown to transactions list for visualization
          if (insightDataResponse.breakdown) {
            const transformed = insightDataResponse.breakdown.map((item: any, idx: number) => ({
                id: `bk-${idx}`,
                merchant: item.category.charAt(0).toUpperCase() + item.category.slice(1),
                amount: `-₹${item.amount.toLocaleString()}`,
                time: 'Total this month',
                type: 'debit',
                category: item.category
            }));
            setTransactions(transformed);
          } else {
            setTransactions([]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch home data', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();

    // Setup Socket connection
    socketService.connect();
    socketService.on('new_transaction', (newTx: any) => {
      setTransactions(prev => [newTx, ...prev.slice(0, 9)]);
    });

    return () => {
      socketService.disconnect();
    };
  }, []);

  const renderSummaryCard = ({ item }: any) => {
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
  };

  const renderTransaction = ( {item}: any ) => (
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
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
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
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Transactions')}>
            <Text style={styles.seeAllText}>See all</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.transactionsContainer}>
          {transactions.map(item => (
             <React.Fragment key={item.id}>
               {renderTransaction({item})}
             </React.Fragment>
          ))}
        </View>

        {/* Alerts Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Alerts</Text>
        </View>
        <View style={styles.alertCard}>
            <View style={styles.alertIndicator} />
            <Text style={styles.alertText}>Low balance warning: Bank account ending in 4231 is below ₹5,000</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  seeAllText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  transactionsContainer: {
    backgroundColor: COLORS.card,
    marginHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    ...SHADOW,
    elevation: 2,
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
});

export default HomeScreen;
