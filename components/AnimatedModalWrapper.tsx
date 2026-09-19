import React from 'react';
import Animated, { ZoomIn, FadeOut } from 'react-native-reanimated';
import { ViewStyle } from 'react-native';

interface AnimatedModalWrapperProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const AnimatedModalWrapper = ({ children, style }: AnimatedModalWrapperProps) => {
  return (
    <Animated.View 
      entering={ZoomIn.springify()}
      exiting={FadeOut}
      style={style}
    >
      {children}
    </Animated.View>
  );
};
