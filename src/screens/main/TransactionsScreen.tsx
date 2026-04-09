import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Search, TrendingDown, TrendingUp } from 'lucide-react-native';
import Screen from '../../components/ui/Screen';
import ElevatedCard from '../../components/ui/ElevatedCard';
import PageHeader from '../../components/ui/PageHeader';
import { COLORS, SPACING } from '../../utils/theme';
import { transactionsApi } from '../../services/api';
import { capitalize, formatCurrency } from '../../utils/format';

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
        const breakdown = Array.isArray(insightData?.breakdown) ? insightData.breakdown : [];
        const totalSpend = Number(insightData?.total_spend || 0);

        const transformed = breakdown
          .map((item: any, idx: number) => {
            const amount = Number(item?.amount || 0);
            const share = totalSpend > 0 ? (amount / totalSpend) * 100 : 0;

            return {
              id: `bk-${idx}`,
              merchant: capitalize(item?.category),
              amountValue: amount,
              amount: formatCurrency(-amount),
              time: 'Monthly total',
              type: 'debit',
              category: capitalize(item?.category),
              share,
            };
          })
          .sort((first: any, second: any) => second.amountValue - first.amountValue);

        setTransactions(transformed);
      } catch (error) {
        console.error('Failed to fetch transactions', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const filterOptions = ['All', ...Array.from(new Set(transactions.map(item => item.category))).slice(0, 5)];

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.merchant.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeFilter === 'All' || activeFilter === tx.category;
    return matchesSearch && matchesCategory;
  });

  const renderTransaction = ({ item }: any) => (
    <TouchableOpacity activeOpacity={0.82} onPress={() => navigation.navigate('TransactionDetail', { transaction: item })}>
      <ElevatedCard style={styles.transactionCard}>
        <View style={[styles.transactionIcon, { backgroundColor: item.type === 'credit' ? COLORS.incomeLight : COLORS.expenseLight }]}>
          {item.type === 'credit' ? <TrendingUp size={20} color={COLORS.income} /> : <TrendingDown size={20} color={COLORS.expense} />}
        </View>

        <View style={styles.transactionCopy}>
          <Text style={styles.transactionTitle}>{item.merchant}</Text>
          <View style={styles.transactionMetaRow}>
            <Text style={styles.transactionMeta}>{item.time}</Text>
            <View style={styles.sharePill}>
              <Text style={styles.sharePillText}>{item.share.toFixed(0)}%</Text>
            </View>
          </View>
        </View>

        <Text style={[styles.transactionAmount, { color: item.type === 'credit' ? COLORS.income : COLORS.expense }]}>{item.amount}</Text>
      </ElevatedCard>
    </TouchableOpacity>
  );

  return (
    <Screen safeAreaStyle={styles.safeArea}>
      <View style={styles.container}>
        <FlatList
          data={filteredTransactions}
          renderItem={renderTransaction}
          keyExtractor={item => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <>
              <PageHeader
                eyebrow="Activity"
                title="Transactions"
                subtitle="A cleaner category view with quick trend context."
                containerStyle={styles.header}
              />

              <View style={styles.summaryRow}>
                <ElevatedCard style={styles.summaryCard}>
                  <Text style={styles.summaryLabel}>Tracked groups</Text>
                  <Text style={styles.summaryValue}>{transactions.length}</Text>
                </ElevatedCard>
                <ElevatedCard style={styles.summaryCard}>
                  <Text style={styles.summaryLabel}>Active filter</Text>
                  <Text style={styles.summaryValue}>{activeFilter}</Text>
                </ElevatedCard>
              </View>

              <ElevatedCard style={styles.searchBar}>
                <Search size={18} color={COLORS.textLight} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search category"
                  placeholderTextColor={COLORS.textLight}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </ElevatedCard>

              {transactions.length > 0 ? (
                <View style={styles.trendingRow}>
                  {transactions.slice(0, 3).map(item => (
                    <View key={`trend-${item.id}`} style={styles.trendingChip}>
                      <TrendingDown size={14} color={COLORS.primary} />
                      <Text style={styles.trendingChipText}>{item.category}</Text>
                    </View>
                  ))}
                </View>
              ) : null}

              <View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContainer}>
                  {filterOptions.map(filter => (
                    <TouchableOpacity
                      key={filter}
                      style={[styles.filterButton, activeFilter === filter && styles.activeFilterButton]}
                      onPress={() => setActiveFilter(filter)}
                      activeOpacity={0.82}
                    >
                      <Text style={[styles.filterText, activeFilter === filter && styles.activeFilterText]}>{filter}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </>
          }
          ListEmptyComponent={
            loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>No transactions found</Text>
                <Text style={styles.emptyText}>Try a different filter or wait for more transaction data to sync.</Text>
              </View>
            )
          }
        />
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
  },
  header: {
    paddingHorizontal: 0,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.xl,
  },
  summaryCard: {
    width: '48.5%',
    padding: SPACING.lg,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  summaryValue: {
    marginTop: SPACING.sm,
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.md,
    height: 52,
  },
  searchInput: {
    flex: 1,
    marginLeft: SPACING.sm,
    fontSize: 15,
    color: COLORS.textDark,
  },
  trendingRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SPACING.lg,
  },
  trendingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 999,
    backgroundColor: COLORS.primarySurface,
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  trendingChipText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  filterContainer: {
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.md,
  },
  filterButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: SPACING.sm,
  },
  activeFilterButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMedium,
  },
  activeFilterText: {
    color: COLORS.white,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  transactionIcon: {
    width: 46,
    height: 46,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  transactionCopy: {
    flex: 1,
    marginRight: SPACING.md,
  },
  transactionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  transactionMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  transactionMeta: {
    fontSize: 13,
    color: COLORS.textMedium,
  },
  sharePill: {
    marginLeft: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: COLORS.surface,
  },
  sharePillText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMedium,
  },
  transactionAmount: {
    fontSize: 15,
    fontWeight: '800',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: SPACING.xxl,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  emptyText: {
    marginTop: SPACING.sm,
    fontSize: 13,
    lineHeight: 20,
    color: COLORS.textMedium,
    textAlign: 'center',
  },
  loadingContainer: {
    paddingTop: SPACING.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default TransactionsScreen;
