import React, { useEffect, useState, useRef } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { globalStyles, colors, screenDimensions } from '../styles/globalStyles';
import { animalList } from '../../assets/animalList';
import { StackScreenProps } from '@react-navigation/stack';
import AnimalCard from '../helpers/AnimalCard';
import { ResultsModal } from '../modals/ResultsModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CopilotStep, useCopilot } from 'react-native-copilot';
import { Animal, RootStackParamList, WalkthroughableTouchableOpacity } from '../types';

// Define props for the ZooScreen component
type Props = StackScreenProps<RootStackParamList, 'Zoo'>;

// ZooScreen component displays a grid of AnimalCards
const ZooScreen: React.FC<Props> = ({ navigation }) => {
    // State for controlling ResultsModal visibility
    const [isResultModalVisible, setResultModalVisible] = useState(false);
    // State for the selected animal to show in ResultsModal
    const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
    const { start, copilotEvents } = useCopilot(); // Access copilot start function
    const [isFirstOpen, setIsFirstOpen] = useState(false); // Track first open
    const flatListRef = useRef<FlatList>(null);

    // Scroll to top when copilot starts
    useEffect(() => {
        const onStart = () => {
            flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
        };

        copilotEvents.on('start', onStart);

        return () => {
            copilotEvents.off('start', onStart);
        };
    }, [copilotEvents]);

    // Check if first app open and trigger walkthrough // Handle first open
    useEffect(() => {
        const checkFirstOpen = async () => {
            try {
                const hasOpened = await AsyncStorage.getItem('hasOpenedZoo');
                if (!hasOpened) {
                    setIsFirstOpen(true);
                    await AsyncStorage.setItem('hasOpenedZoo', 'true');
                    setTimeout(() => start("onFirstZoo"), 300); // Start at step 1
                }
            } catch (error) {
                console.error('Error checking first open of ZooScreen:', error);
            }
        };
        checkFirstOpen();
    }, [start]);

    // Handle card press: navigate to Play or show ResultsModal based on correctGuess
    const handleCardPress = async (animal: Animal) => {
        const correctGuess = await AsyncStorage.getItem(`${animal.name}_correctGuess`);
        if (correctGuess === 'true') {
            setSelectedAnimal(animal);
            setResultModalVisible(true);
        } else {
            navigation.navigate('Play', { animal, extraStepTracker: 0 });
        }
    };

    // Render item for FlatList with centered container
    const renderItem = ({ item, index }: { item: Animal, index: number }) => (
        <View style={styles.cardWrapper}>
            {index === 0 ? (
                <CopilotStep
                    text="Click on a tile with a '?' to search for that animal. Clicking on an animal image will reveal facts about that animal."
                    order={31}
                    name="ZooCardTip"
                >
                    <WalkthroughableTouchableOpacity onPress={() => handleCardPress(item)}>
                        <AnimalCard animal={item} onPress={() => handleCardPress(item)} />
                    </WalkthroughableTouchableOpacity>
                </CopilotStep>
            ) : (
                <AnimalCard animal={item} onPress={() => handleCardPress(item)} />
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                ref={flatListRef}
                data={animalList}
                renderItem={renderItem}
                keyExtractor={(item) => item.name}
                numColumns={2}
                contentContainerStyle={styles.flatListContent}
                initialNumToRender={20}
                indicatorStyle="white"
            />
            {selectedAnimal && (
                <ResultsModal
                    visible={isResultModalVisible}
                    toggleModal={() => setResultModalVisible(false)}
                    animal={selectedAnimal}
                    screen={'Zoo'}
                    {...({} as any)} // Type assertion to ignore missing props
                />
            )}
        </View>
    );
};

// Styles for the ZooScreen component
const styles = StyleSheet.create({
    container: {
        ...globalStyles.container,
        backgroundColor: 'transparent',
    },
    flatListContent: {
        padding: 10,
    },
    cardWrapper: {
        width: screenDimensions.screenWidth * 0.5 - 20, // Half screen width minus padding
        height: screenDimensions.screenWidth * 0.37, // Max card height plus margins
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default ZooScreen;