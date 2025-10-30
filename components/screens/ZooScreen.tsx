import React, { useEffect, useState, useRef } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Text, Platform, Linking } from 'react-native';
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
    const [nearingBottom, setnearingBottom] = useState(false);
    const [foundAll, setFoundAll] = useState(true);
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
                        <AnimalCard animal={item} onPress={() => handleCardPress(item)} setFoundAll={setFoundAll} />
                    </WalkthroughableTouchableOpacity>
                </CopilotStep>
            ) : (
                <AnimalCard animal={item} onPress={() => handleCardPress(item)} setFoundAll={setFoundAll} />
            )}
        </View>
    );

    const handleReset = () => {
        console.log('reset game');
        AsyncStorage.clear().then(() => {
            setFoundAll(false);
            flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
        }).catch(err => console.error('Error clearing AsyncStorage:', err));
    }

    const handleMore = () => {
        const url = Platform.OS === 'ios'
            ? 'https://apps.apple.com/gb/app/critter-clues/id6743952864?uo=2'
            : 'https://play.google.com/store/apps/details?id=com.egaug.CritterClues&hl=en_US';
        Linking.openURL(url).catch(err => console.error('Error opening URL:', err));
    };

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
                onEndReached={() => setnearingBottom(true)}
                onEndReachedThreshold={0.7}
                onStartReached={() => setnearingBottom(false)}
                onStartReachedThreshold={0.3}
                ListFooterComponent={
                    nearingBottom && foundAll ? (
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={[styles.button, { borderRightWidth: 1, borderTopLeftRadius: 15, borderBottomLeftRadius: 15 }]}
                                onPress={handleReset}
                            >
                                <Text style={styles.buttonText}>Reset</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, { borderLeftWidth: 1, borderTopRightRadius: 15, borderBottomRightRadius: 15 }]}
                                onPress={handleMore}
                            >
                                <Text style={styles.buttonText}>More</Text>
                            </TouchableOpacity>
                        </View>
                    ) : null
                }
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
        width: screenDimensions.screenWidth * 0.5 - 16, // Half screen width minus padding
        height: screenDimensions.screenWidth * 0.38, // Max card height plus margins
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
        marginBottom: 20,
    },
    button: {
        backgroundColor: colors.tan,
        borderWidth: 2,
        borderColor: colors.green1,
        padding: 5,
        width: screenDimensions.screenWidth * 0.4,
        alignItems: 'center',
    },
    buttonText: {
        fontFamily: 'WalterTurncoat_400Regular',
        fontSize: 26,
        color: colors.green1,
        textAlign: 'center',
    },
});

export default ZooScreen;