import React from 'react';
import { SafeAreaView, StyleProp, View, ViewStyle } from 'react-native';
import { COLORS } from '../../utils/theme';

type ScreenProps = {
  children: React.ReactNode;
  safeAreaStyle?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  withContentWrapper?: boolean;
};

const Screen = ({ children, safeAreaStyle, contentStyle, withContentWrapper = false }: ScreenProps) => {
  return (
    <SafeAreaView style={[{ flex: 1, backgroundColor: COLORS.background }, safeAreaStyle]}>
      {withContentWrapper ? <View style={contentStyle}>{children}</View> : children}
    </SafeAreaView>
  );
};

export default Screen;
