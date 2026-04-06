import React from 'react';
import { StyleProp, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { COLORS, SPACING } from '../../utils/theme';

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  actionText?: string;
  onPressAction?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
};

const SectionHeader = ({ title, subtitle, actionText, onPressAction, containerStyle }: SectionHeaderProps) => {
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginTop: SPACING.lg,
          marginBottom: SPACING.md,
        },
        containerStyle,
      ]}
    >
      <View style={{ flex: 1, paddingRight: SPACING.md }}>
        <Text style={{ fontSize: 18, fontWeight: '700', color: COLORS.textDark }}>{title}</Text>
        {subtitle ? (
          <Text style={{ marginTop: 4, fontSize: 13, color: COLORS.textMedium, lineHeight: 18 }}>{subtitle}</Text>
        ) : null}
      </View>
      {actionText && onPressAction ? (
        <TouchableOpacity
          onPress={onPressAction}
          style={{
            paddingHorizontal: SPACING.md,
            paddingVertical: SPACING.sm,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: COLORS.border,
            backgroundColor: COLORS.card,
          }}
        >
          <Text style={{ color: COLORS.primary, fontWeight: '700' }}>{actionText}</Text>
        </TouchableOpacity>
      ) : (
        <View />
      )}
    </View>
  );
};

export default SectionHeader;
