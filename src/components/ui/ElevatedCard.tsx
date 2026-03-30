import React from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { BORDER_RADIUS, COLORS, SHADOW } from '../../utils/theme';

type ElevatedCardProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

const ElevatedCard = ({ children, style }: ElevatedCardProps) => {
  return (
    <View
      style={[
        {
          backgroundColor: COLORS.card,
          borderRadius: BORDER_RADIUS.lg,
          ...SHADOW,
          elevation: 2,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

export default ElevatedCard;
