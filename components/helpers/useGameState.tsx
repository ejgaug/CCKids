import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Custom hook to manage game state with persistence
export const useGameState = (animalName: string) => {
    const [guesses, setGuesses] = useState<string[]>(['']); // Array of guesses, starts with one empty slot
    const [correctGuess, setCorrectGuess] = useState(false); // Tracks if game is won

    // Helper to generate unique storage keys based on animal name
    const getStorageKey = (key: string) => `${animalName}_${key}`;

    // Load saved state on mount
    useEffect(() => {
        loadSavedState();
    }, [animalName]);

    // Load game state from AsyncStorage
    const loadSavedState = async () => {
        try {
            const savedGuesses = await AsyncStorage.getItem(getStorageKey('guesses'));
            const savedCorrectGuess = await AsyncStorage.getItem(getStorageKey('correctGuess'));

            // Set guesses or reset to initial state
            setGuesses(savedGuesses ? JSON.parse(savedGuesses) : ['']);

            // Set correctGuess state
            setCorrectGuess(savedCorrectGuess ? JSON.parse(savedCorrectGuess) : false);
        } catch (error) {
            console.error('Error loading saved state:', error);
        }
    };

    // Updates guesses state and persists it
    const updateGuesses = (newGuesses: string[] | ((prev: string[]) => string[])) => {
        setGuesses((prev) => {
            const resolvedGuesses = typeof newGuesses === 'function' ? newGuesses(prev) : newGuesses;
            AsyncStorage.setItem(getStorageKey('guesses'), JSON.stringify(resolvedGuesses)).catch((error) =>
                console.error('Error saving guesses:', error)
            );
            return resolvedGuesses;
        });
    };

    // Updates correctGuess state and persists it
    const updateCorrectGuess = (newValue: boolean) => {
        setCorrectGuess(newValue);
        AsyncStorage.setItem(getStorageKey('correctGuess'), JSON.stringify(newValue)).catch((error) =>
            console.error('Error saving correctGuess:', error)
        );
    };

    return {
        guesses,
        setGuesses: updateGuesses,
        correctGuess,
        setCorrectGuess: updateCorrectGuess,
    };
};