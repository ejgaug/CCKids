import React, { useState, useEffect } from 'react';
import { View, Text, TouchableWithoutFeedback } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { colors, screenDimensions, appFont } from '../styles/globalStyles';
import { animalList } from '../../assets/animalList';
import CompareLogic from './CompareLogic';
import { Animal } from '../types';
import Tooltip from 'react-native-walkthrough-tooltip';
import CharBoxTips from '../modals/CharBoxTips';

interface CharBoxesProps {
    characteristic: string;
    animal: Animal;
    charIndex: number;
    guesses: string[];
    currPage: number;
    dailyHintType: string | null;
}

export type MatchType = 'full' | 'partial' | 'none' | null;

interface CompareIconProps {
    override: boolean;
}

const CharBoxes: React.FC<CharBoxesProps> = ({ characteristic, animal, charIndex, guesses, currPage, dailyHintType }) => {
    const [compType, setCompType] = useState<MatchType>(null);
    const [showTip, setShowTip] = useState(false);

    const findGuessedAnimal = (guess: string): Animal | undefined => {
        return animalList.find(
            (a: Animal) => a.name.toLowerCase() === guess.toLowerCase() || 
                           (a.alt_name && a.alt_name.toLowerCase() === guess.toLowerCase())
        );
    };

    const getCharInfoValue = (trait: string) => {
        const guess = guesses[currPage];
        if (!guess) return 'N/A';
        const guessedAnimal = findGuessedAnimal(guess);
        if (!guessedAnimal) return 'N/A';
        const key = trait.toLowerCase();
        const value = (guessedAnimal as any)[key];
        return Array.isArray(value) ? value.join(', ') : value || 'N/A';
    };

    useEffect(() => {
        const guess = guesses[currPage];
        if (!guess) {
            setCompType('none');
            return;
        }
        const guessedAnimal = findGuessedAnimal(guess);
        const matchType = CompareLogic(characteristic, guessedAnimal, animal);
        setCompType(matchType);
    }, [guesses, currPage, characteristic, animal]);

    const showCorrectChar = (characteristic: string): string[] | string => {
        if (!guesses[currPage] && dailyHintType && dailyHintType.toLowerCase() === characteristic.toLowerCase()) {
            const key = characteristic.toLowerCase();
            const value = (animal as any)[key];
            return Array.isArray(value) ? value.join(', ') : value || characteristic;
        }
        for (const guess of guesses) {
            if (!guess) continue;
            const guessedAnimal = findGuessedAnimal(guess);
            if (guessedAnimal && CompareLogic(characteristic, guessedAnimal, animal) === 'full') {
                const key = characteristic.toLowerCase();
                const value = (guessedAnimal as any)[key];
                return Array.isArray(value) ? value.join(', ') : value || characteristic;
            }
        }
        return characteristic;
    };

    const CompareIcon: React.FC<CompareIconProps> = ({ override }) => {
        const compTypeCheck = override ? 'full' : compType;
        return (
            <View
                style={{
                    backgroundColor: compTypeCheck === 'full' ? colors.green5 : compTypeCheck === 'partial' ? 'yellow' : 'red',
                    borderColor: 'black',
                    borderWidth: 0.8,
                    borderRadius: 10,
                    width: 18,
                    height: 18,
                    position: 'absolute',
                    top: 6,
                    left: 6,
                    zIndex: 1,
                }}
            />
        );
    };

    return (
        <Tooltip
            isVisible={showTip}
            content={
                <CharBoxTips
                    characteristic={characteristic}
                    animal={animal}
                    charIndex={charIndex}
                    hasGuess={!!guesses[currPage]}
                    displayValue={guesses[currPage] ? getCharInfoValue(characteristic) : showCorrectChar(characteristic)}
                />
            }
            placement={charIndex < 3 ? 'bottom' : 'top'}
            onClose={() => setShowTip(false)}
            contentStyle={{
                backgroundColor: colors.tan,
                borderRadius: 10,
                borderWidth: 2,
                borderColor: colors.green1,
                padding: 10,
                maxWidth: screenDimensions.screenWidth * 0.8,
                zIndex: 1000,
            }}
            arrowSize={{ width: 20, height: 10 }}
            showChildInTooltip={false}
            childContentSpacing={0}
            accessible={false}
        >
            <TouchableWithoutFeedback onPress={() => setShowTip(true)}>
                <View
                    style={{
                        width: screenDimensions.screenWidth * 0.78,
                        height: screenDimensions.screenHeight * 0.11,
                        backgroundColor: colors.tan,
                        borderRadius: 20,
                        padding: 8,
                        marginBottom: characteristic === 'Habitat' ? 25 : 10,
                        borderWidth: 3,
                        borderColor: colors.green1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 10,
                    }}
                >
                    {((guesses[currPage] && compType) || 
                        showCorrectChar(characteristic) !== characteristic) &&  
                        <CompareIcon override={currPage === guesses.length - 1}/>
                    }
                    {guesses[currPage] ? (
                        <Text
                            style={{
                                fontFamily: appFont,
                                fontSize: 26,
                                color: colors.green1,
                                textAlign: 'center',
                                paddingHorizontal: 15,
                            }}
                            numberOfLines={2}
                        >
                            {getCharInfoValue(characteristic)}
                        </Text>
                    ) : (
                        <Text
                            style={{
                                fontFamily: appFont,
                                fontSize: 26,
                                color: colors.green1,
                                textAlign: 'center',
                                paddingHorizontal: 15,
                            }}
                            numberOfLines={2}
                        >
                            {showCorrectChar(characteristic)}
                        </Text>
                    )}
                </View>
            </TouchableWithoutFeedback>
        </Tooltip>
    );
};

export default CharBoxes;