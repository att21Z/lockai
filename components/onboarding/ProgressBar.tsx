import { View, StyleSheet } from 'react-native';
import { colors } from '../../constants/theme';

interface ProgressBarProps {
  progress: number;
  total: number;
}

export default function ProgressBar({ progress, total }: ProgressBarProps) {
  const percentage = (progress / total) * 100;

  return (
    <View style={styles.container}>
      <View style={[styles.progress, { width: `${percentage}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 4,
    backgroundColor: colors.gray,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    backgroundColor: colors.white,
    borderRadius: 2,
  },
});
