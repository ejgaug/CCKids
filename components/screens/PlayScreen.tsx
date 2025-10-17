import React, { useRef, useState, useEffect } from 'react';
import { View, Text, ImageBackground, TextInput, TouchableWithoutFeedback, Keyboard, StyleSheet } from 'react-native';
import { globalStyles, colors, screenDimensions } from '../styles/globalStyles';
import { StackScreenProps } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import CharBoxes from '../helpers/CharBoxes';
import SearchComp from '../helpers/SearchComp';
import FilterModal from '../modals/FilterModal';
import { ScrollView, Pressable } from 'react-native-gesture-handler';
import DotIndicator from '../helpers/DotIndicator';
import { MaterialIcons } from '@expo/vector-icons';
import { useGameState } from '../helpers/useGameState';
import { ResultsModal } from '../modals/ResultsModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { animalList } from '../../assets/animalList';
import { CopilotStep, useCopilot } from 'react-native-copilot';
import { RootStackParamList, WalkthroughableView } from '../types';

// Define props for PlayScreen
type PlayScreenProps = StackScreenProps<RootStackParamList, 'Play'>;

// PlayScreen component manages the game interface
const PlayScreen: React.FC<PlayScreenProps> = ({ route, navigation }) => {
    const { animal, extraStepTracker } = route.params; // Add extraStepTracker from navigation params
    const { guesses, setGuesses, correctGuess, setCorrectGuess } = useGameState(animal.name); // Game state
    const characteristics = ['Group', 'Size', 'Colors', 'Food', 'Movement', 'Habitat']; // Characteristics to display
    const [filterModalVisible, setFilterModalVisible] = useState(false); // Filter modal visibility
    const [filters, setFilters] = useState<{ [key: string]: string[] | string | null }>(
        characteristics.reduce((acc, char) => ({
            ...acc,
            [char]: char === 'Colors' || char === 'Food' || char === 'Habitat' ? [] : null
        }), {})
    ); // Filter state
    const [currInput, setCurrInput] = useState(''); // Current input for guesses
    const [currPage, setCurrPage] = useState(0); // Current page of guesses
    const [isResultModalVisible, setResultModalVisible] = useState(false); // Results modal visibility
    const [dailyHintType, setDailyHintType] = useState<string | null>(null); // DailyDiscovery hint type
    const scrollViewRef = useRef<ScrollView>(null); // Reference to ScrollView
    const { start, copilotEvents, currentStep } = useCopilot(); // Access copilot start function
    const [isFirstOpen, setIsFirstOpen] = useState(false); // Track first open

    // Check if first app open and trigger walkthrough // Handle first open
    useEffect(() => {
        const checkFirstOpen = async () => {
            try {
                const hasOpened = await AsyncStorage.getItem('hasOpenedPlay');
                if (!hasOpened) {
                    setIsFirstOpen(true);
                    await AsyncStorage.setItem('hasOpenedPlay', 'true');
                    setTimeout(() => start("onFirstPlay"), 300); 
                }
            } catch (error) {
                console.error('Error checking first open of PlayScreen:', error);
            }
        };
        checkFirstOpen();
    }, [start]);

    // Load DailyDiscovery hint data on mount
    useEffect(() => {
        const loadDailyHint = async () => {
            try {
                const hintData = await AsyncStorage.getItem("dailyHintData");
                if (hintData) {
                    const { animalName, hintType } = JSON.parse(hintData);
                    if (animalName === animal.name) {
                        setDailyHintType(hintType); // Set hint type if animal matches
                    }
                }
            } catch (error) {
                console.error("Error loading dailyHintData:", error);
            }
        };
        loadDailyHint();
    }, [animal]);

    // Handle page change with scroll animation
    const handlePageChange = (newPage: number) => {
        setCurrPage(newPage);
        scrollViewRef.current?.scrollTo({
            x: newPage * screenDimensions.screenWidth,
            animated: true,
        });
    };

    // Handle scroll end to update current page
    const onScrollEnd = (event: any) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const newPage = Math.round(offsetX / screenDimensions.screenWidth);
        setCurrPage(newPage);
    };

    // Show ResultsModal when correctGuess is true and on the last page
    useEffect(() => {
        const timer = setTimeout(() => {
            if (correctGuess && currPage === guesses.length - 1) {
                setResultModalVisible(true);
            } else {
                setResultModalVisible(false);
            }
        }, 300); // Debounce to stabilize page updates
        return () => clearTimeout(timer);
    }, [correctGuess, currPage, guesses]);

    // Get the first unguessed animal from animalList // Select next unguessed animal
    const getNextAnimal = async () => {
        for (const animal of animalList) {
            const correctGuess = await AsyncStorage.getItem(`${animal.name}_correctGuess`);
            if (correctGuess !== 'true') {
                return animal;
            }
        }
        return animalList[0]; // Fallback to first animal if all guessed
    };

    // Handle "Next Animal" button press // Navigate to next animal with state reset
    const handleNextAnimal = async () => {
        const nextAnimal = await getNextAnimal();
        setResultModalVisible(false); // Close modal
        await AsyncStorage.removeItem("dailyHintData"); // Clear DailyDiscovery hint data
        setDailyHintType(null); // Reset hint type
        scrollViewRef.current?.scrollTo({ x: 0, animated: false }); // Reset scroll
        navigation.navigate('Play', { animal: nextAnimal, extraStepTracker }); // Pass extraStepTracker
    };
    
    // gets the correct explanation text for given characteristic
    const getBoxTipText = (characteristic: string, index: number) => {
        switch (characteristic) {
            case 'Group':
                return 'This tells us what kind of animal it is. The options are mammal, reptile, bird, invertebrate, fish, or amphibian.';
            case 'Size':
                return 'This shows how big the animal is, from very tiny (like an ant) to giant (like a blue whale).';
            case 'Colors':
                return 'This is the color of the animal, like red, blue, green, or many colors mixed together.';
            case 'Food':
                return 'This tells us what the animal eats. The options are meat, plants, plankton, or nectar. Some eat both meat and plants!';
            case 'Movement':
                return 'This shows how the animal moves, like walking with 2 legs, 5-6 legs, flying with wings, swimming with fins, or even no legs at all!';
            case 'Habitat':
                return 'This is where the animal lives, like jungles, wetlands (lakes and rivers), deserts, cities (near people), etc.';
            default:
                return characteristic; // Fallback
        }
    }

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView
                ref={scrollViewRef}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                pagingEnabled={true}
                onMomentumScrollEnd={onScrollEnd}
                scrollEnabled={guesses.length > 1}
                keyboardShouldPersistTaps="always"
                nestedScrollEnabled={true}
                keyboardDismissMode='on-drag'
            >
                {guesses.map((_, index) => (
                    <SafeAreaView
                        key={index}
                        style={[globalStyles.container, styles.pageContainer]}
                    >
                        <SearchComp
                            setModalVisible={setFilterModalVisible}
                            filters={filters}
                            modalVisible={filterModalVisible}
                            setGuesses={setGuesses}
                            currInput={currInput}
                            setCurrInput={setCurrInput}
                            currPage={currPage}
                            scrollViewRef={scrollViewRef}
                            guesses={guesses}
                            correctGuess={correctGuess}
                            setCorrectGuess={setCorrectGuess}
                            animal={animal}
                            isCurrentPage={index === currPage}
                        />
                        {index === currPage ? (
                            <CopilotStep
                                // Use static text; dynamic text handled in CustomTooltip
                                text="After a guess, the boxes show characteristics of the animal you guessed."
                                order={13}
                                name="CompLogicTip"
                            >
                                <WalkthroughableView style={styles.characteristicsContainer}>
                                    {characteristics.map((characteristic, idx) => (
                                        index === currPage ? (
                                            <CopilotStep
                                                text={getBoxTipText(characteristic, idx)}
                                                order={idx + 15}
                                                name={`${characteristic}BoxTip`}
                                                key={idx}
                                            >
                                                <WalkthroughableView>
                                                    <CharBoxes
                                                        key={idx}
                                                        characteristic={characteristic}
                                                        animal={animal}
                                                        charIndex={idx}
                                                        guesses={guesses}
                                                        currPage={currPage}
                                                        dailyHintType={dailyHintType} // Pass daily hint type
                                                    />
                                                </WalkthroughableView>
                                            </CopilotStep>
                                        ) : (
                                            <CharBoxes
                                                key={idx}
                                                characteristic={characteristic}
                                                animal={animal}
                                                charIndex={idx}
                                                guesses={guesses}
                                                currPage={currPage}
                                                dailyHintType={dailyHintType} // Pass daily hint type
                                            />
                                        )
                                    ))}
                                </WalkthroughableView>
                            </CopilotStep>                            
                        ) : (
                            <View style={styles.characteristicsContainer}>
                                {characteristics.map((characteristic, idx) => (
                                    index === currPage ? (
                                        <CopilotStep
                                            text={getBoxTipText(characteristic, idx)}
                                            order={idx + 15}
                                            name={`${characteristic}BoxTip`}
                                            key={idx}
                                        >
                                            <WalkthroughableView>
                                                <CharBoxes
                                                    key={idx}
                                                    characteristic={characteristic}
                                                    animal={animal}
                                                    charIndex={idx}
                                                    guesses={guesses}
                                                    currPage={currPage}
                                                    dailyHintType={dailyHintType} // Pass daily hint type
                                                />
                                            </WalkthroughableView>
                                        </CopilotStep>
                                    ) : (
                                        <CharBoxes
                                            key={idx}
                                            characteristic={characteristic}
                                            animal={animal}
                                            charIndex={idx}
                                            guesses={guesses}
                                            currPage={currPage}
                                            dailyHintType={dailyHintType} // Pass daily hint type
                                        />
                                    )
                                ))}
                            </View>
                        )}
                        <DotIndicator
                            maxGuesses={20}
                            guesses={guesses}
                            currPage={currPage}
                            onPageChange={handlePageChange}
                            scrollViewRef={scrollViewRef}
                        />
                        {guesses[currPage - 1] && (
                            <Pressable
                                style={[styles.pageArrowButton, styles.leftArrow]}
                                onPress={() => handlePageChange(currPage - 1)}
                            >
                                <MaterialIcons
                                    name='arrow-back'
                                    size={35}
                                    color={colors.green1}
                                />
                            </Pressable>
                        )}
                        {guesses[currPage] && currPage !== guesses.length - 1 && (
                            <Pressable
                                style={[styles.pageArrowButton, styles.rightArrow]}
                                onPress={() => handlePageChange(currPage + 1)}
                            >
                                <MaterialIcons
                                    name='arrow-forward'
                                    size={35}
                                    color={colors.green1}
                                />
                            </Pressable>
                        )}
                    </SafeAreaView>
                ))}
                <FilterModal
                    setModalVisible={setFilterModalVisible}
                    modalVisible={filterModalVisible}
                    onApplyFilters={setFilters}
                    correctAnimal={animal}
                    currentFilters={filters}
                />
                <ResultsModal
                    visible={isResultModalVisible}
                    toggleModal={() => setResultModalVisible(false)}
                    animal={animal}
                    screen='Play'
                    navigation={navigation}
                    dailyHintType={dailyHintType}
                    onNextAnimal={handleNextAnimal} // Pass handleNextAnimal as prop
                />
            </ScrollView>
        </TouchableWithoutFeedback>
    );
};

// Styles for PlayScreen
const styles = StyleSheet.create({
    pageContainer: {
        backgroundColor: 'transparent',
        width: screenDimensions.screenWidth,
    },
    characteristicsContainer: {
        marginTop: 5,
        paddingHorizontal: 18,
        zIndex: 1,
    },
    pageArrowButton: {
        position: 'absolute',
        bottom: 22,
        backgroundColor: colors.tan,
        padding: 4,
        borderRadius: 30,
        opacity: 0.75,
        zIndex: 1,
        shadowColor: colors.green1,
        shadowRadius: 1,
        shadowOpacity: 1,
        shadowOffset: { width: -1, height: -1 },
    },
    leftArrow: {
        left: 22,
    },
    rightArrow: {
        right: 22,
    },
});

export default PlayScreen;