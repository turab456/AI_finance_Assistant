import React from 'react';
import { ActivityIndicator, StyleProp, Text, TouchableOpacity, ViewStyle, View } from 'react-native';
import { BORDER_RADIUS, COLORS, SHADOW } from '../../utils/theme';

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

const PrimaryButton = ({ label, onPress, loading = false, disabled = false, style }: PrimaryButtonProps) => {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={isDisabled}
      style={[
        {
          borderRadius: BORDER_RADIUS.md,
          overflow: 'hidden',
          ...SHADOW,
          opacity: isDisabled ? 0.7 : 1,
        },
        style,
      ]}
    >
      <View
        style={{
          backgroundColor: '#09356B',
          minHeight: 56,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 20,
        }}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <Text style={{ color: COLORS.white, fontSize: 16, fontWeight: '700' }}>{label}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default PrimaryButton;
