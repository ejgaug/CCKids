import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, StackHeaderProps, StackNavigationProp } from '@react-navigation/stack';
import * as React from 'react';
import LandingScreen from './components/screens/LandingScreen';
import ZooScreen from './components/screens/ZooScreen';
import PlayScreen from './components/screens/PlayScreen';
import Header from './components/styles/Header';
import { ImageBackground, StatusBar, View } from 'react-native';
import AppBackground from './components/styles/AppBackground';
import { useFonts, WalterTurncoat_400Regular } from '@expo-google-fonts/walter-turncoat';

export interface Animal {
  name: string;
  wiki_page: string;
  fun_fact: string;
  home: string[];
  food: string[];
  alt_name: string;
  group: string;
  colors: string[];
  size: string;
  movement: string;
  sound: string;
}

// Define navigation param list for TypeScript
export type RootStackParamList = {
  Landing: undefined;
  Zoo: undefined;
  Play: { animal: Animal };
};

const Stack = createStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  // Load font
  const [fontsLoaded] = useFonts({
    WalterTurncoat_400Regular,
  });

  if (!fontsLoaded) return null;

  return (
    <AppBackground>
        <StatusBar barStyle={'light-content'} backgroundColor={'white'}/>
      <NavigationContainer>
        <Stack.Navigator 
          initialRouteName="Landing"
          screenOptions={{
            header: (props: StackHeaderProps) => {
              const { route, navigation } = props as StackHeaderProps & {
                navigation: StackNavigationProp<RootStackParamList>;
              };
              const title = route.name === 'Landing' ? 'Critter Clues Kids' : route.name === 'Zoo' ? 'CCZoo' : 'CCKids';
              return (
                <Header 
                  title={title} 
                  isLandingScreen={route.name === 'Landing'} 
                  navigation={navigation}
                />
              );
            },
            gestureEnabled: false,
            cardStyle: { backgroundColor: 'transparent' },
            transitionSpec: {
              open: { animation: 'timing', config: { duration: 10 } },
              close: { animation: 'timing', config: { duration: 10 } },
            },
            cardStyleInterpolator: ({ current, layouts }) => ({
              cardStyle: {
                transform: [
                  {
                    translateX: current.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [layouts.screen.width, 0],
                    }),
                  },
                ],
              },
              containerStyle: {
                opacity: current.progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1],
                }),
              },
            }),
          }}
        >
          <Stack.Screen name="Landing" component={LandingScreen} />
          <Stack.Screen name="Zoo" component={ZooScreen} />
          <Stack.Screen name="Play" component={PlayScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </AppBackground>
  );
};

export default App;