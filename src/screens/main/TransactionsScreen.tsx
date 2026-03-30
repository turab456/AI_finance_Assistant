import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TextInput, 
  TouchableOpacity,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { Search, TrendingDown, TrendingUp } from 'lucide-react-native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOW } from '../../utils/theme';
import { transactionsApi } from '../../services/api';
import Screen from '../../components/ui/Screen';
import ElevatedCard from '../../components/ui/ElevatedCard';

const FILTERS = ['All', 'Credit', 'Debit', 'Food', 'Travel', 'Shopping', 'Bills'];

const TransactionsScreen = ({ navigation }: any) => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const insightData = await transactionsApi.getInsights();
        if (insightData && insightData.breakdown) {
          const transformed = insightData.breakdown.map((item: any, idx: number) => ({
            id: `bk-${idx}`,
            merchant: item.category.charAt(0).toUpperCase() + item.category.slice(1),
            amount: `-₹${item.amount.toLocaleString()}`,
            time: 'Monthly Total',
            type: 'debit',
            category: item.category
          }));
          setTransactions(transformed);
        } else {
          setTransactions([]);
        }
      } catch (error) {
        console.error('Failed to fetch transactions', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.merchant.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeFilter === 'All' || 
                            activeFilter === tx.category || 
                            (activeFilter === 'Credit' && tx.type === 'credit') || 
                            (activeFilter === 'Debit' && tx.type === 'debit');
    return matchesSearch && matchesCategory;
  });

  const renderTransaction = ({ item }: any) => (
    <TouchableOpacity 
        style={styles.transactionItem} 
        activeOpacity={0.7}
        onPress={() => navigation.navigate('TransactionDetail', { transaction: item })}
    >
      <View style={[styles.transactionIcon, { backgroundColor: item.type === 'credit' ? COLORS.incomeLight : COLORS.expenseLight }]}>
        {item.type === 'credit' ? <TrendingUp size={20} color={COLORS.income} /> : <TrendingDown size={20} color={COLORS.expense} />}
      </View>
      <View style={styles.transactionDetails}>
        <Text style={styles.merchantText}>{item.merchant}</Text>
        <Text style={styles.categoryText}>{item.category} • {item.time}</Text>
      </View>
      <Text style={[styles.amountText, { color: item.type === 'credit' ? COLORS.income : COLORS.expense }]}>
        {item.amount}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Screen safeAreaStyle={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.headerTitle}>Transactions</Text>

        {/* Search Bar */}
        <ElevatedCard style={styles.searchBar}>
          <Search size={20} color={COLORS.textLight} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Search merchant, category..."
            placeholderTextColor={COLORS.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </ElevatedCard>

        {/* Filters */}
        <View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContainer}>
            {FILTERS.map((filter) => (
              <TouchableOpacity 
                key={filter}
                style={[
                  styles.filterButton,
                  activeFilter === filter && styles.activeFilterButton
                ]}
                onPress={() => setActiveFilter(filter)}
              >
                <Text style={[
                  styles.filterText, 
                  activeFilter === filter && styles.activeFilterText
                ]}>
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Transaction List */}
        {loading ? (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        ) : (
            <FlatList
                data={filteredTransactions}
                renderItem={renderTransaction}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No transactions found</Text>
                    </View>
                )}
            />
        )}
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textDark,
    marginVertical: SPACING.lg,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    height: 50,
    ...SHADOW,
    elevation: 2,
    marginBottom: SPACING.md,
  },
  searchInput: {
    flex: 1,
    marginLeft: SPACING.sm,
    fontSize: 16,
    color: COLORS.textDark,
  },
  filterContainer: {
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.md,
  },
  filterButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: COLORS.card,
    marginRight: SPACING.sm,
    ...SHADOW,
    elevation: 2,
  },
  activeFilterButton: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMedium,
  },
  activeFilterText: {
    color: COLORS.white,
  },
  listContent: {
    paddingBottom: SPACING.xl,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: COLORS.card,
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOW,
    elevation: 1,
  },
  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  transactionDetails: {
    flex: 1,
  },
  merchantText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  categoryText: {
    fontSize: 13,
    color: COLORS.textMedium,
  },
  amountText: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textLight,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TransactionsScreen;
