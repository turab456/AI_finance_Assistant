import React from 'react';
import { StyleProp, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { COLORS, SPACING } from '../../utils/theme';

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightSlot?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
};

const PageHeader = ({ eyebrow, title, subtitle, onBack, rightSlot, containerStyle }: PageHeaderProps) => {
  return (
    <View style={[{ paddingHorizontal: SPACING.lg, paddingTop: SPACING.md }, containerStyle]}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-start' }}>
          {onBack ? (
            <TouchableOpacity
              onPress={onBack}
              activeOpacity={0.8}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: COLORS.card,
                borderWidth: 1,
                borderColor: COLORS.border,
                marginRight: SPACING.md,
              }}
            >
              <ChevronLeft size={20} color={COLORS.textDark} />
            </TouchableOpacity>
          ) : null}

          <View style={{ flex: 1 }}>
            {eyebrow ? (
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '700',
                  color: COLORS.primary,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  marginBottom: 6,
                }}
              >
                {eyebrow}
              </Text>
            ) : null}
            <Text style={{ fontSize: 28, fontWeight: '800', color: COLORS.textDark }}>{title}</Text>
            {subtitle ? (
              <Text style={{ marginTop: 6, fontSize: 14, lineHeight: 21, color: COLORS.textMedium }}>{subtitle}</Text>
            ) : null}
          </View>
        </View>

        {rightSlot ? <View style={{ marginLeft: SPACING.md }}>{rightSlot}</View> : null}
      </View>
    </View>
  );
};

export default PageHeader;
