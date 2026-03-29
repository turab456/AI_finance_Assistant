import * as React from 'react';
import { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  Dimensions, 
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Lightbulb, AlertTriangle, ArrowUpRight, TrendingUp } from 'lucide-react-native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOW } from '../../utils/theme';
import { transactionsApi } from '../../services/api';

const { width } = Dimensions.get('window');

const InsightsScreen = () => {
  const [loading, setLoading] = useState(true);
  const [insightData, setInsightData] = useState<any>(null);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setLoading(true);
        const data = await transactionsApi.getInsights();
        setInsightData(data);
      } catch (error) {
        console.error('Failed to fetch insights', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const breakdownData = insightData?.breakdown || [];
  const totalSpend = insightData?.total_spend || 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.headerTitle}>Financial Insights</Text>

        {/* Monthly Summary */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Spend</Text>
            <Text style={[styles.summaryValue, { color: COLORS.expense }]}>
                ₹{totalSpend.toLocaleString()}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Top Category</Text>
            <Text style={[styles.summaryValue, { color: COLORS.primary, textTransform: 'capitalize' }]}>
                {insightData?.top_category || 'N/A'}
            </Text>
          </View>
        </View>

        {/* AI Message Card */}
        {insightData?.message && (
          <View style={styles.messageCard}>
             <LinearGradient colors={['#EEF2FF', '#E0E7FF']} style={styles.messageGradient}>
                <Lightbulb size={20} color={COLORS.primary} fill={COLORS.primary} />
                <Text style={styles.messageText}>{insightData.message}</Text>
             </LinearGradient>
          </View>
        )}

        {/* Category Breakdown */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Category Breakdown</Text>
          <View style={styles.categoryCard}>
            {breakdownData.map((item: any, index: number) => {
              const percentage = totalSpend > 0 ? (item.amount / totalSpend) * 100 : 0;
              const barColor = index % 2 === 0 ? COLORS.primary : '#818CF8';
              
              return (
                <View key={item.category} style={styles.categoryRow}>
                  <View style={styles.categoryInfo}>
                      <View style={[styles.colorDot, { backgroundColor: barColor }]} />
                      <Text style={styles.categoryLabel}>{item.category.charAt(0).toUpperCase() + item.category.slice(1)}</Text>
                  </View>
                  <View style={styles.categoryBarContainer}>
                      <View 
                          style={[
                              styles.categoryBar, 
                              { 
                                  width: `${percentage}%`, 
                                  backgroundColor: barColor
                              }
                          ]} 
                      />
                  </View>
                  <Text style={styles.categoryPercent}>{percentage.toFixed(1)}%</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* AI Analysis Cards */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>AI Analysis</Text>
          
          <View style={styles.insightCard}>
            <View style={[styles.insightHeader, { backgroundColor: '#E0F2FE' }]}>
                <TrendingUp size={20} color="#0369A1" />
                <Text style={[styles.insightTitle, { color: '#0369A1' }]}>Spending Trend</Text>
            </View>
            <Text style={styles.insightBody}>
                {insightData?.message || "Analyzing your spending trends..."}
            </Text>
          </View>

          <View style={styles.insightCard}>
            <View style={[styles.insightHeader, { backgroundColor: '#FEF2F2' }]}>
                <AlertTriangle size={20} color={COLORS.expense} />
                <Text style={[styles.insightTitle, { color: COLORS.expense }]}>Alert</Text>
            </View>
            <Text style={styles.insightBody}>
                High spending in {insightData?.top_category}. Try to keep it within 20% of your total budget.
            </Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textDark,
    marginVertical: SPACING.lg,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOW,
    elevation: 3,
    marginBottom: SPACING.xl,
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  messageCard: {
    marginBottom: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOW,
    elevation: 4,
  },
  messageGradient: {
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  messageText: {
    flex: 1,
    marginLeft: SPACING.md,
    fontSize: 14,
    color: COLORS.primaryDark,
    fontWeight: '600',
    lineHeight: 20,
  },
  sectionContainer: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: SPACING.md,
  },
  categoryCard: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOW,
    elevation: 2,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 80,
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.sm,
  },
  categoryLabel: {
    fontSize: 13,
    color: COLORS.textDark,
    fontWeight: '500',
  },
  categoryBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    marginHorizontal: SPACING.md,
    overflow: 'hidden',
  },
  categoryBar: {
    height: '100%',
    borderRadius: 4,
  },
  categoryPercent: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: '600',
    width: 30,
    textAlign: 'right',
  },
  insightCard: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    ...SHADOW,
    elevation: 2,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: SPACING.sm,
  },
  insightBody: {
    padding: SPACING.md,
    fontSize: 14,
    color: COLORS.textMedium,
    lineHeight: 20,
  },
});

export default InsightsScreen;
