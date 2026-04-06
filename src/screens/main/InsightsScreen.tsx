import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { AlertTriangle, Lightbulb, TrendingUp } from 'lucide-react-native';
import Screen from '../../components/ui/Screen';
import ElevatedCard from '../../components/ui/ElevatedCard';
import PageHeader from '../../components/ui/PageHeader';
import SectionHeader from '../../components/ui/SectionHeader';
import { COLORS, SPACING } from '../../utils/theme';
import { transactionsApi } from '../../services/api';
import { capitalize, formatCurrency } from '../../utils/format';

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

  const totalSpend = Number(insightData?.total_spend || 0);
  const breakdownData = Array.isArray(insightData?.breakdown) ? insightData.breakdown : [];
  const sortedBreakdown = breakdownData
    .map((item: any) => {
      const amount = Number(item?.amount || 0);
      const share = totalSpend > 0 ? (amount / totalSpend) * 100 : 0;

      return {
        ...item,
        amount,
        share,
      };
    })
    .sort((first: any, second: any) => second.amount - first.amount);

  const topCategory = sortedBreakdown[0];

  return (
    <Screen safeAreaStyle={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <PageHeader
          eyebrow="Analytics"
          title="Financial insights"
          subtitle="A cleaner read on where your money is moving this month."
        />

        <LinearGradient colors={[COLORS.white, COLORS.primarySurface]} style={styles.heroCard}>
          <Text style={styles.heroLabel}>Total spend</Text>
          <Text style={styles.heroAmount}>{formatCurrency(totalSpend)}</Text>

          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatLabel}>Top category</Text>
              <Text style={styles.heroStatValue}>{capitalize(topCategory?.category) || 'N/A'}</Text>
            </View>
            <View style={styles.heroDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatLabel}>Tracked groups</Text>
              <Text style={styles.heroStatValue}>{sortedBreakdown.length}</Text>
            </View>
          </View>
        </LinearGradient>

        {insightData?.message ? (
          <ElevatedCard style={styles.messageCard}>
            <View style={styles.messageHeader}>
              <View style={styles.messageIcon}>
                <Lightbulb size={18} color={COLORS.primary} />
              </View>
              <Text style={styles.messageTitle}>AI summary</Text>
            </View>
            <Text style={styles.messageBody}>{insightData.message}</Text>
          </ElevatedCard>
        ) : null}

        <SectionHeader
          title="Trend radar"
          subtitle="Categories with the biggest share this month"
          containerStyle={styles.sectionHeader}
        />

        <ElevatedCard style={styles.breakdownCard}>
          {sortedBreakdown.length > 0 ? (
            sortedBreakdown.map((item: any, index: number) => (
              <View key={`${item.category}-${index}`} style={[styles.breakdownRow, index === sortedBreakdown.length - 1 && styles.breakdownRowLast]}>
                <View style={styles.breakdownTop}>
                  <View>
                    <Text style={styles.breakdownLabel}>{capitalize(item.category)}</Text>
                    <Text style={styles.breakdownMeta}>{formatCurrency(item.amount)}</Text>
                  </View>
                  <Text style={styles.breakdownPercent}>{item.share.toFixed(1)}%</Text>
                </View>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${Math.min(item.share, 100)}%` }]} />
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No category data yet</Text>
              <Text style={styles.emptyBody}>The radar will populate automatically once transactions are tracked.</Text>
            </View>
          )}
        </ElevatedCard>

        <SectionHeader title="AI analysis" subtitle="Focused next steps based on current trends" containerStyle={styles.sectionHeader} />

        <ElevatedCard style={styles.analysisCard}>
          <View style={styles.analysisBlock}>
            <View style={[styles.analysisBadge, { backgroundColor: '#E0F2FE' }]}>
              <TrendingUp size={18} color="#0369A1" />
            </View>
            <View style={styles.analysisCopy}>
              <Text style={styles.analysisTitle}>Growth signal</Text>
              <Text style={styles.analysisBody}>
                {topCategory
                  ? `${capitalize(topCategory.category)} is the strongest spending trend right now, so reviewing that category first should have the biggest impact.`
                  : 'As new spend appears, this section will highlight the strongest movement first.'}
              </Text>
            </View>
          </View>

          <View style={styles.analysisDivider} />

          <View style={styles.analysisBlock}>
            <View style={[styles.analysisBadge, { backgroundColor: '#FEF2F2' }]}>
              <AlertTriangle size={18} color={COLORS.expense} />
            </View>
            <View style={styles.analysisCopy}>
              <Text style={styles.analysisTitle}>Watch-out</Text>
              <Text style={styles.analysisBody}>
                {topCategory
                  ? `Try keeping ${capitalize(topCategory.category)} within a tighter limit next month if you want cleaner balance improvement.`
                  : 'Once enough activity is captured, the app will start flagging the categories that need attention.'}
              </Text>
            </View>
          </View>
        </ElevatedCard>
      </ScrollView>
    </Screen>
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
  },
  heroCard: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
    borderRadius: 28,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  heroLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  heroAmount: {
    marginTop: SPACING.sm,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  heroStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xl,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  heroStat: {
    flex: 1,
  },
  heroDivider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.lg,
  },
  heroStatLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  heroStatValue: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  messageCard: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    padding: SPACING.lg,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  messageIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primarySurface,
    marginRight: SPACING.md,
  },
  messageTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  messageBody: {
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.textMedium,
  },
  sectionHeader: {
    paddingHorizontal: SPACING.lg,
  },
  breakdownCard: {
    marginHorizontal: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  breakdownRow: {
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  breakdownRowLast: {
    borderBottomWidth: 0,
  },
  breakdownTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  breakdownLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  breakdownMeta: {
    marginTop: 4,
    fontSize: 13,
    color: COLORS.textMedium,
  },
  breakdownPercent: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: COLORS.surface,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: COLORS.primary,
  },
  analysisCard: {
    marginHorizontal: SPACING.lg,
    padding: SPACING.lg,
  },
  analysisBlock: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  analysisBadge: {
    width: 42,
    height: 42,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  analysisCopy: {
    flex: 1,
  },
  analysisTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  analysisBody: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 21,
    color: COLORS.textMedium,
  },
  analysisDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.lg,
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
});

export default InsightsScreen;
