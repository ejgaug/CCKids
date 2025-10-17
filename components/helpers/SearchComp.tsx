import { TextInput, TouchableOpacity, View, Text, FlatList, Keyboard } from "react-native";
import { colors, screenDimensions } from "../styles/globalStyles";
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState, useMemo, useEffect } from "react";
import Fuse from 'fuse.js';
import { animalList } from "../../assets/animalList";
import { ScrollView } from "react-native-gesture-handler";
import { CopilotStep } from "react-native-copilot";
import { Animal, WalkthroughableTouchableOpacity } from "../types";

interface SearchCompProps {
    setModalVisible: (newValue: boolean) => void;
    filters: { [key: string]: string[] | string | null };
    modalVisible: boolean;
    setGuesses: React.Dispatch<React.SetStateAction<string[]>>;
    currInput: string;
    setCurrInput: (newValue: string) => void;
    currPage: number;
    scrollViewRef: React.RefObject<ScrollView | null>;
    guesses: string[]
    correctGuess: boolean;
    setCorrectGuess: (newValue: boolean) => void;
    animal: Animal
    isCurrentPage: boolean   
}

const SearchComp: React.FC<SearchCompProps> = ({ setModalVisible, filters, modalVisible, setGuesses, currInput, setCurrInput, currPage, scrollViewRef, guesses, correctGuess, setCorrectGuess, animal, isCurrentPage }) => {
    const [searchResults, setSearchResults] = useState<string[]>([]);
    const [submitDisabled, setSubmitDisabled] = useState(true);

    const searchableItems = useMemo(() => {
        const items: { display: string; animal: Animal }[] = [];
        animalList.forEach((animal: Animal) => {
            const isGuessed = guesses.some(guess => 
                guess.toLowerCase() === animal.name.toLowerCase() || 
                (animal.alt_name && guess.toLowerCase() === animal.alt_name.toLowerCase())
            );
            if (isGuessed) return;

            const matchesFilters = Object.entries(filters).every(([key, value]) => {
                if (!value) return true;
                const lowerKey = key.toLowerCase() as keyof Animal;
                if (lowerKey === 'colors' || lowerKey === 'food' || lowerKey === 'habitat') {
                    return Array.isArray(value) && value.every(val => 
                        Array.isArray(animal[lowerKey]) && (animal[lowerKey] as string[]).includes(val)
                    );
                }
                return animal[lowerKey] === value;
            });

            if (matchesFilters) {
                items.push({ display: animal.name, animal });
                if (animal.alt_name && animal.alt_name !== animal.name) {
                    items.push({ display: animal.alt_name, animal });
                }
            }
        });
        return items;
    }, [filters, guesses]);

    const fuse = useMemo(() => new Fuse(searchableItems, {
        keys: ['display'],
        threshold: 0.4,
        includeScore: true,
    }), [searchableItems]);

    const validAnimalNames = useMemo(() => new Set(searchableItems.map(i => i.display)), [searchableItems]);

    const dynamicSearch = (text: string) => {
        setCurrInput(text);
        if (!text || !text.trim()) {
            setSearchResults([]);
            setSubmitDisabled(true);
            return;
        }
        const result = fuse.search(text);
        setSearchResults(result.map(r => r.item.display));
        setSubmitDisabled(!validAnimalNames.has(text));
    };

    useEffect(() => {
        dynamicSearch(currInput);
    }, [searchableItems, currInput]);

    useEffect(() => {
        setSearchResults([]);
    }, [currPage]);

    const handleResultPress = (item: string) => {
        setCurrInput(item);
        setSubmitDisabled(false);
        setSearchResults([]);
        Keyboard.dismiss();
    };

    const handleGuess = () => {
        if (submitDisabled) return;
        console.log(`Guessed/Correct: `, currInput, animal.name, currInput === animal.name || currInput === animal.alt_name);

        setGuesses((prev) => {
            const newGuesses = [...prev];
            newGuesses[prev.length - 1] = currInput;
            if (currInput === animal.name || currInput === animal.alt_name) {
                setCorrectGuess(true);
            } else {
                newGuesses.push('');
            }
            setCurrInput('');
            setSearchResults([]);
            setSubmitDisabled(true);
            Keyboard.dismiss();
            return newGuesses;
        });
    };

    const handleDelete = () => {
        setCurrInput('');
        setSearchResults([]);
        setSubmitDisabled(true);
    };

    const getGuessText = () => {
        if (currPage === guesses.length - 1 && !correctGuess) {
            return currInput;
        } else {
            return guesses[currPage];
        }
    }

    return (
        <View
            style={{
                alignItems: 'center',
                justifyContent: 'center',
                position: 'absolute',
                top: 10,
                width: screenDimensions.screenWidth,
            }}
        >
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                }}
            >
                {isCurrentPage ? (
                    <CopilotStep
                        text="Use this search bar to enter your guess, and pick from the animals shown."
                        order={11}
                        name="InputTip"
                    >
                        <WalkthroughableTouchableOpacity 
                            style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.tan, borderRadius: 16 }}
                            disabled={submitDisabled}
                        >
                            <TextInput
                                style={{
                                    width: screenDimensions.screenWidth * 0.8,
                                    height: 46,
                                    paddingLeft: 14,
                                    paddingRight: 35,
                                    fontSize: 26,
                                    color: colors.green1,
                                    fontFamily: 'WalterTurncoat_400Regular',
                                    borderWidth: 2,
                                    borderColor: colors.green1,
                                    borderRadius: 16,
                                }}
                                autoCorrect={false}
                                placeholder="Guess Here..."
                                placeholderTextColor={colors.green1}
                                returnKeyLabel='go'
                                value={getGuessText()}
                                onChangeText={dynamicSearch}
                                onSubmitEditing={handleGuess}
                                autoCapitalize="words"
                                spellCheck={false}
                                autoComplete="off"
                                editable={currPage === guesses.length - 1 && !correctGuess}
                            />
                            <TouchableOpacity
                                style={{
                                    position: 'absolute',
                                    right: 8,
                                }}
                                onPress={submitDisabled ? currInput ? handleDelete : undefined : handleGuess}
                                disabled={submitDisabled && !currInput}
                            >
                                <Ionicons
                                    name={submitDisabled ? currInput ? "close" : "search-sharp" : "arrow-forward"}
                                    color={colors.green1}
                                    size={35}
                                    style={{
                                        opacity: submitDisabled && !currInput ? 0.5 : 1,
                                    }}
                                />
                            </TouchableOpacity>
                        </WalkthroughableTouchableOpacity>
                    </CopilotStep>
                ) : (
                    <WalkthroughableTouchableOpacity 
                        style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.tan, borderRadius: 16 }}
                        disabled={submitDisabled}
                    >
                        <TextInput
                            style={{
                                width: screenDimensions.screenWidth * 0.8,
                                height: 46,
                                paddingLeft: 14,
                                paddingRight: 35,
                                fontSize: 26,
                                color: colors.green1,
                                fontFamily: 'WalterTurncoat_400Regular',
                                borderWidth: 2,
                                borderColor: colors.green1,
                                borderRadius: 16,
                            }}
                            autoCorrect={false}
                            placeholder="Guess Here..."
                            placeholderTextColor={colors.green1}
                            returnKeyLabel='go'
                            value={getGuessText()}
                            onChangeText={dynamicSearch}
                            onSubmitEditing={handleGuess}
                            autoCapitalize="words"
                            spellCheck={false}
                            autoComplete="off"
                            editable={currPage === guesses.length - 1 && !correctGuess}
                        />
                        <TouchableOpacity
                            style={{
                                position: 'absolute',
                                right: 8,
                            }}
                            onPress={submitDisabled ? currInput ? handleDelete : undefined : handleGuess}
                            disabled={submitDisabled && !currInput}
                        >
                            <Ionicons
                                name={submitDisabled ? currInput ? "close" : "search-sharp" : "arrow-forward"}
                                color={colors.green1}
                                size={35}
                                style={{
                                    opacity: submitDisabled && !currInput ? 0.5 : 1,
                                }}
                            />
                        </TouchableOpacity>
                    </WalkthroughableTouchableOpacity>
                )}
                {isCurrentPage ? (
                    <CopilotStep
                        text="Tap here to use what you already know about the hidden animal to filter your searches."
                        order={12}
                        name="FilterTip"
                    >
                        <WalkthroughableTouchableOpacity
                            style={{
                                backgroundColor: colors.tan,
                                borderRadius: 16,
                                width: 46,
                                height: 46,
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderColor: colors.green1,
                                borderWidth: 2
                            }}
                            onPress={() => setModalVisible(true)}
                            disabled={currPage !== guesses.length - 1 || correctGuess}
                        >
                            <MaterialCommunityIcons 
                                name="filter-outline" 
                                color={colors.green1} 
                                size={35}     
                            />
                        </WalkthroughableTouchableOpacity>
                    </CopilotStep>
                ) : (
                    <WalkthroughableTouchableOpacity
                        style={{
                            backgroundColor: colors.tan,
                            borderRadius: 16,
                            width: 46,
                            height: 46,
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderColor: colors.green1,
                            borderWidth: 2
                        }}
                        onPress={() => setModalVisible(true)}
                        disabled={currPage !== guesses.length - 1 || correctGuess}
                    >
                        <MaterialCommunityIcons 
                            name="filter-outline" 
                            color={colors.green1} 
                            size={35}     
                        />
                    </WalkthroughableTouchableOpacity>
                )}
            </View>
            {searchResults.length > 0 && (
                <View
                    style={{
                        backgroundColor: colors.tan,
                        borderRadius: 16,
                        borderWidth: 2,
                        borderColor: colors.green1,
                        maxHeight: 220,
                        width: screenDimensions.screenWidth * 0.8,
                        marginTop: 2,
                        zIndex: 2,
                    }}
                >
                    <FlatList
                        data={searchResults}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity onPress={() => handleResultPress(item)}>
                                <Text
                                    style={{
                                        color: colors.green1,
                                        fontSize: 22,
                                        paddingHorizontal: 10,
                                        paddingVertical: 4, 
                                        fontFamily: 'WalterTurncoat_400Regular',
                                        borderBottomColor: colors.green1,
                                        borderBottomWidth: 0.3,
                                    }}
                                >
                                    {item}
                                </Text>
                            </TouchableOpacity>
                        )}
                        keyboardShouldPersistTaps="always"
                        nestedScrollEnabled={true}
                    />
                </View>
            )}
        </View>
    );
};

export default SearchComp;