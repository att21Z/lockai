import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { ReactNode } from 'react';
import { colors, fonts } from '../../constants/theme';

interface OptionCardProps {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  selected?: boolean;
  onPress: () => void;
}

export default function OptionCard({ icon, title, subtitle, selected, onPress }: OptionCardProps) {
  return (
    <TouchableOpacity
      style={[styles.card, selected && styles.cardSelected]}
      onPress={onPress}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {selected && <View style={styles.checkmark} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.gray,
    borderWidth: 2,
    borderColor: colors.lightGray,
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardSelected: {
    borderColor: colors.white,
    backgroundColor: colors.lightGray,
  },
  iconContainer: {
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontFamily: fonts.interMedium,
    color: colors.white,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: fonts.interRegular,
    color: colors.text,
    opacity: 0.7,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.white,
    marginLeft: 12,
  },
});
