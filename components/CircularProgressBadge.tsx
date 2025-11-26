import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { Flame } from 'lucide-react-native';
import { colors, fonts } from '../constants/theme';

interface CircularProgressBadgeProps {
  streakDays: number;
  completedHabits: number;
  totalHabits: number;
  challengeDay: number;
}

function StarIcon({ size = 80, color = '#FFFFFF' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
        fill={color}
        stroke={color}
        strokeWidth={1}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ShieldIcon({ size = 80, color = '#FFFFFF', stars = 1 }: { size?: number; color?: string; stars?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2L4 5V11.5C4 16.5 7.5 21.5 12 22C16.5 21.5 20 16.5 20 11.5V5L12 2Z"
        fill={color}
        stroke={color}
        strokeWidth={1}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {stars >= 1 && (
        <Path
          d="M12 8L12.9 10.5H15.5L13.3 12L14.2 14.5L12 12.9L9.8 14.5L10.7 12L8.5 10.5H11.1L12 8Z"
          fill="#000000"
          opacity={0.3}
        />
      )}
      {stars >= 2 && (
        <Path
          d="M8 9L8.5 10.5H10L8.9 11.3L9.4 12.8L8 11.8L6.6 12.8L7.1 11.3L6 10.5H7.5L8 9Z"
          fill="#000000"
          opacity={0.3}
        />
      )}
      {stars >= 3 && (
        <Path
          d="M16 9L16.5 10.5H18L16.9 11.3L17.4 12.8L16 11.8L14.6 12.8L15.1 11.3L14 10.5H15.5L16 9Z"
          fill="#000000"
          opacity={0.3}
        />
      )}
    </Svg>
  );
}

function getRankForDay(day: number) {
  if (day >= 66) {
    return {
      component: <ShieldIcon size={100} color="#FFD700" stars={3} />,
      name: 'BLASON DIAMANT',
      emoji: '💎'
    };
  } else if (day >= 56) {
    return {
      component: <ShieldIcon size={100} color="#FFD700" stars={3} />,
      name: 'BLASON D\'OR',
      emoji: '👑'
    };
  } else if (day >= 45) {
    return {
      component: <ShieldIcon size={100} color="#E5E4E2" stars={2} />,
      name: 'BLASON PLATINE',
      emoji: '🛡️'
    };
  } else if (day >= 34) {
    return {
      component: <ShieldIcon size={100} color="#C0C0C0" stars={2} />,
      name: 'BLASON D\'ARGENT',
      emoji: '⚔️'
    };
  } else if (day >= 23) {
    return {
      component: <ShieldIcon size={100} color="#CD7F32" stars={1} />,
      name: 'BLASON DE BRONZE',
      emoji: '🏆'
    };
  } else if (day >= 18) {
    return {
      component: <StarIcon size={100} color="#FFD700" />,
      name: 'ÉTOILE D\'OR',
      emoji: '⭐'
    };
  } else if (day >= 13) {
    return {
      component: <StarIcon size={100} color="#C0C0C0" />,
      name: 'ÉTOILE D\'ARGENT',
      emoji: '✨'
    };
  } else if (day >= 7) {
    return {
      component: <StarIcon size={100} color="#CD7F32" />,
      name: 'ÉTOILE DE BRONZE',
      emoji: '🌟'
    };
  } else {
    return {
      component: <StarIcon size={100} color="#FFFFFF" />,
      name: 'RECRUE',
      emoji: '🔰'
    };
  }
}

export default function CircularProgressBadge({
  streakDays,
  completedHabits,
  totalHabits,
  challengeDay,
}: CircularProgressBadgeProps) {
  const progress = totalHabits > 0 ? completedHabits / totalHabits : 0;
  const isComplete = progress === 1;
  const rank = getRankForDay(challengeDay);

  const circleRadius = 90;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circleCircumference * (1 - progress);

  const progressColor = colors.blue;

  return (
    <View style={styles.container}>
      <View style={styles.circleContainer}>
        <Svg width={240} height={240} style={styles.svg}>
          <Circle
            cx={120}
            cy={120}
            r={circleRadius}
            stroke="#FFFFFF"
            strokeWidth={8}
            fill="none"
            opacity={0.2}
          />
          <Circle
            cx={120}
            cy={120}
            r={circleRadius}
            stroke={progressColor}
            strokeWidth={8}
            fill="none"
            strokeDasharray={circleCircumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 120 120)`}
          />
        </Svg>

        <View style={styles.badgeContainer}>
          <View style={styles.badgeInnerCircle}>
            {rank.component}
          </View>
        </View>
      </View>

      <View style={styles.rankInfo}>
        <Text style={styles.rankEmoji}>{rank.emoji}</Text>
        <Text style={styles.rankName}>{rank.name}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 24,
    marginHorizontal: 24,
  },
  circleContainer: {
    width: 240,
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  svg: {
    position: 'absolute',
  },
  badgeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeInnerCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  rankInfo: {
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.gray,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.blue,
  },
  rankEmoji: {
    fontSize: 32,
  },
  rankName: {
    fontSize: 14,
    fontFamily: fonts.spaceGroteskBold,
    color: colors.blue,
    letterSpacing: 1.5,
  },
});
