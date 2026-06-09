import { useRef } from "react";
import { Pressable, PressableProps, Animated } from "react-native";

const AnimatedPressableBase = Animated.createAnimatedComponent(Pressable);

interface Props extends PressableProps {
  scaleDown?: number;
}

export function AnimatedPressable({ scaleDown = 0.96, style, onPressIn, onPressOut, ...props }: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const spring = (toValue: number) =>
    Animated.spring(scale, { toValue, useNativeDriver: true, speed: 28, bounciness: 5 }).start();

  return (
    <AnimatedPressableBase
      {...props}
      style={[{ transform: [{ scale }] }, style as any]}
      onPressIn={(e) => { spring(scaleDown); onPressIn?.(e); }}
      onPressOut={(e) => { spring(1); onPressOut?.(e); }}
    />
  );
}
