import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { ChevronLeft, Info } from 'lucide-react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../../utils/theme';

const TransactionDetailScreen = ({ navigation, route }: any) => {
  const { transaction } = route.params || {};

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft size={28} color={COLORS.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Details</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.merchant}>{transaction?.merchant}</Text>
          <Text style={[styles.amount, { color: transaction?.type === 'credit' ? COLORS.income : COLORS.expense }]}>
             {transaction?.amount}
          </Text>
          <Text style={styles.time}>{transaction?.time}</Text>
          
          <View style={styles.divider} />
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Category</Text>
            <Text style={styles.infoValue}>{transaction?.category}</Text>
          </View>
        </View>

        <View style={styles.aiCard}>
          <View style={styles.aiHeader}>
            <Info size={20} color={COLORS.primary} />
            <Text style={styles.aiTitle}>AI Explanation</Text>
          </View>
          <Text style={styles.aiText}>
            This transaction was detected from a {transaction?.merchant} notification. 
            It has been categorized under {transaction?.category} based on historical spending patterns.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  container: {
    padding: SPACING.lg,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.xl,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  merchant: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: SPACING.sm,
  },
  amount: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: SPACING.md,
  },
  time: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: SPACING.xl,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    width: '100%',
    marginBottom: SPACING.lg,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  infoLabel: {
    color: COLORS.textLight,
    fontWeight: '600',
  },
  infoValue: {
    color: COLORS.textDark,
    fontWeight: '700',
  },
  aiCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  aiTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
    marginLeft: SPACING.sm,
  },
  aiText: {
    fontSize: 14,
    color: COLORS.textMedium,
    lineHeight: 22,
  },
});

export default TransactionDetailScreen;
