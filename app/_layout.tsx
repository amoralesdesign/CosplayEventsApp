import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { Animated } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { JsStack } from '@/components/JsStack';
import { Easing } from "react-native-reanimated";

const ANIMATION_DURATION = 220;


// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const moveBottomToTop = ({ current, next, inverted, layouts: { screen } }) => {
  const progress = Animated.add(
    current.progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    }),
    next
      ? next.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 1],
          extrapolate: 'clamp',
        })
      : 0,
  );

  return {
    cardStyle: {
      transform: [
        {
          translateY: Animated.multiply(
            progress.interpolate({
              inputRange: [0, 1, 2],
              outputRange: [
                screen.width, // Focused, but offscreen in the beginning
                0, // Fully focused
                screen.width * -0.3, // Fully unfocused
              ],
              extrapolate: 'clamp',
            }),
            inverted,
          ),
        },
      ],
    },
  };
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <JsStack
      screenOptions={{

        cardOverlayEnabled: true, 
        gestureEnabled: true,
        cardStyleInterpolator: moveBottomToTop,
        transitionSpec: {
          open: {
            animation: "timing",
            config: {
              duration: ANIMATION_DURATION,
              easing: Easing.out(Easing.ease),
            },
          },
          close: {
            animation: "timing",
            config: {
              duration: ANIMATION_DURATION,
              easing: Easing.in(Easing.ease),
            },
          },
        },
      }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="(event)/[id]"
          options={{ headerShown: false }}
        />
        <Stack.Screen name="+not-found" />
      </JsStack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
