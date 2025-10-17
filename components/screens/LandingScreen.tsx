import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ImageBackground } from 'react-native';
import { globalStyles, colors, screenDimensions } from '../styles/globalStyles';
import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { animalList } from '../../assets/animalList';
import DailyDiscovery from '../helpers/DailyDiscovery';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CopilotStep, useCopilot } from 'react-native-copilot';
import { RootStackParamList, WalkthroughableTouchableOpacity } from '../types';

type LandingScreenProps = StackScreenProps<RootStackParamList, 'Landing'>;

const LandingScreen: React.FC<LandingScreenProps> = ({ navigation, route }) => {
    const { start, copilotEvents } = useCopilot(); // Access copilot start function
    const [isFirstOpen, setIsFirstOpen] = useState(false); // Track first open

    // Check if first app open and trigger walkthrough // Handle first open
    useEffect(() => {
        const checkFirstOpen = async () => {
            try {
                const hasOpened = await AsyncStorage.getItem('hasOpenedLanding');
                if (!hasOpened) {
                    setIsFirstOpen(true);
                    await AsyncStorage.setItem('hasOpenedLanding', 'true');
                    setTimeout(() => start("onFirstLanding"), 300); // Start at step 1
                }
            } catch (error) {
                console.error('Error checking first open of LandingScreen:', error);
            }
        };
        checkFirstOpen();
    }, [start]);

    // Get the first unguessed animal from animalList
    const getNextAnimal = async () => {
        for (const animal of animalList) {
            const correctGuess = await AsyncStorage.getItem(`${animal.name}_correctGuess`);
            if (correctGuess !== 'true') {
                return animal;
            }
        }
        return animalList[0];
    };

    // Navigate to Play with the next unguessed animal // Handle play navigation
    const handlePlayPress = async () => {
        const animal = await getNextAnimal();
        const extraStepTracker = 0;
        navigation.navigate('Play', { animal, extraStepTracker });
    };

    return (
        <View style={globalStyles.container}>
            <DailyDiscovery navigation={navigation} route={route}/>
            <TouchableOpacity
                onPress={() => AsyncStorage.clear()}
                style={{ borderColor: 'white', borderRadius: 20, width: 30, height: 30, backgroundColor: 'white', position: 'absolute', bottom: screenDimensions.screenHeight * 0.35 }}
            />
            <View
                style={{
                    flexDirection: 'row',
                }}
            >
                <View
                    style={[globalStyles.buttonBackgrounds, {
                        top: screenDimensions.screenHeight * 0.205,
                        right: screenDimensions.screenWidth * 0.142,
                        transform: [{ rotate: '-12deg' }],
                    }]}
                />
                <CopilotStep
                    text="Tap here to explore your Zoo and see the animals you've discovered."
                    order={2}
                    name="zooButton"                        
                >
                    <WalkthroughableTouchableOpacity
                        style={[globalStyles.landingButtons, {
                            right: screenDimensions.screenWidth * 0.15,
                            top: screenDimensions.screenHeight * 0.2,
                        }]}
                        onPress={() => navigation.navigate('Zoo')}
                    >
                        <Ionicons name="paw-sharp" color={colors.green1} size={50} style={{ transform: [{ rotate: '-10deg' }] }} />
                        <Text style={globalStyles.buttonText}>ZOO</Text>
                    </WalkthroughableTouchableOpacity>
                </CopilotStep>
                <View
                    style={[globalStyles.buttonBackgrounds, {
                        left: screenDimensions.screenWidth * 0.09,
                        top: screenDimensions.screenHeight * 0.226,
                        transform: [{ rotate: '12deg' }],
                    }]}
                />
                <CopilotStep
                    text="Tap here to start searching for the next mystery animal."
                    order={3}
                    name="playButton"                        
                >
                    <WalkthroughableTouchableOpacity
                        style={[globalStyles.landingButtons, {
                            left: screenDimensions.screenWidth * 0.1,
                            top: screenDimensions.screenHeight * 0.22,
                        }]}
                        onPress={handlePlayPress}
                    >
                        <Ionicons name="play" color={colors.green1} size={50} />
                        <Text style={globalStyles.buttonText}>PLAY</Text>
                    </WalkthroughableTouchableOpacity>
                </CopilotStep>
            </View>
        </View>
    );
};

export default LandingScreen;