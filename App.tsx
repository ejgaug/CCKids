import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, StackHeaderProps, StackNavigationProp } from '@react-navigation/stack';
import * as React from 'react';
import { useEffect, useState } from 'react';
import LandingScreen from './components/screens/LandingScreen';
import ZooScreen from './components/screens/ZooScreen';
import PlayScreen from './components/screens/PlayScreen';
import Header from './components/styles/Header';
import { ImageBackground, Platform, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import AppBackground from './components/styles/AppBackground';
import { useFonts, WalterTurncoat_400Regular } from '@expo-google-fonts/walter-turncoat';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CopilotProvider, walkthroughable } from 'react-native-copilot';
import { CustomStepNumber, CustomTooltip, CopilotEventHandler } from './components/styles/CopilotComps';
import { colors } from './components/styles/globalStyles';
import { RootStackParamList } from './components/types';

const Stack = createStackNavigator<RootStackParamList>();

const App: React.FC = () => {
    const [fontsLoaded] = useFonts({
        WalterTurncoat_400Regular,
    });
    // Manage extraStepTracker for CompLogicTip sub-steps
    const [extraStepTracker, setextraStepTracker] = useState(0);

    if (!fontsLoaded) return null;

    return (
        <CopilotProvider
            animated={true}
            overlay="svg"
            verticalOffset={Platform.OS === 'ios' ? 0 : 50} // Align with info icon
            tooltipComponent={(props) => <CustomTooltip {...props} extraStepTracker={extraStepTracker} setextraStepTracker={setextraStepTracker} />}
            stepNumberComponent={CustomStepNumber}
            tooltipStyle={{backgroundColor: 'transparent', padding: 0, width: '75%', alignItems: 'center', paddingTop: 0, paddingBottom: 0}}
            arrowColor='#fcf7c7ff'
        >
            <AppBackground>
                <StatusBar barStyle={'light-content'} backgroundColor={'white'} />
                {/* Add CopilotEventHandler to manage copilotEvents inside CopilotProvider */}
                <CopilotEventHandler extraStepTracker={extraStepTracker} setextraStepTracker={setextraStepTracker} />
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
                                        screenName={route.name}
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
                        <Stack.Screen 
                            name="Play" 
                            component={PlayScreen}
                            initialParams={{ extraStepTracker }}
                        />
                    </Stack.Navigator>
                </NavigationContainer>
            </AppBackground>
        </CopilotProvider>
    );
};

export default App;