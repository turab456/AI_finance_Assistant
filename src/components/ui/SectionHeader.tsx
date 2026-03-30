import React from 'react';
import { StyleProp, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { COLORS, SPACING } from '../../utils/theme';

type SectionHeaderProps = {
  title: string;
  actionText?: string;
  onPressAction?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
};

const SectionHeader = ({ title, actionText, onPressAction, containerStyle }: SectionHeaderProps) => {
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: SPACING.lg,
          marginTop: SPACING.lg,
          marginBottom: SPACING.md,
        },
        containerStyle,
      ]}
    >
      <Text style={{ fontSize: 18, fontWeight: '700', color: COLORS.textDark }}>{title}</Text>
      {actionText && onPressAction ? (
        <TouchableOpacity onPress={onPressAction}>
          <Text style={{ color: COLORS.primary, fontWeight: '600' }}>{actionText}</Text>
        </TouchableOpacity>
      ) : (
        <View />
      )}
    </View>
  );
};

export default SectionHeader;
