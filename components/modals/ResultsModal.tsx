import React, { useState, useEffect } from 'react';
import { Modal, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { ScrollView } from 'react-native-gesture-handler';
import { colors, screenDimensions } from '../styles/globalStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { Animal, RootStackParamList } from '../types';

interface ResultsModalProps {
    visible: boolean;
    toggleModal: () => void;
    animal: Animal;
    screen: string;
    navigation: StackNavigationProp<RootStackParamList, 'Play'>;
    dailyHintType: string | null;
    onNextAnimal: () => void; // Add prop for next animal handler
}

export const ResultsModal: React.FC<ResultsModalProps> = ({ visible, toggleModal, animal, screen, dailyHintType, onNextAnimal }) => {
    const [animalImageUrl, setAnimalImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const getStorageKey = (key: string) => `${animal.name}_${key}`;

    const extractPageTitle = (wikiUrl: string) => {
        if (!wikiUrl) return '';
        const parts = wikiUrl.split('/');
        return parts[parts.length - 1];
    };

    const loadImage = async () => {
        try {
            setIsLoading(true);
            const savedImageUrl = await AsyncStorage.getItem(getStorageKey('imageUrl'));
            if (savedImageUrl) {
                setAnimalImageUrl(savedImageUrl);
                setIsLoading(false);
                return;
            }

            const pageTitle = extractPageTitle(animal.wiki_page);
            const apiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${pageTitle}`;
            const response = await fetch(apiUrl, {
                headers: {
                    'User-Agent': 'CCKids/1.0 (contact@example.com)',
                },
            });
            const data = await response.json();

            if (data.thumbnail && data.thumbnail.source) {
                const largerUrl = data.thumbnail.source.replace(/\/\d+px-/, '/500px-');
                setAnimalImageUrl(largerUrl);
                await AsyncStorage.setItem(getStorageKey('imageUrl'), largerUrl);
            } else {
                console.log("No thumbnail found for", pageTitle);
            }
        } catch (error) {
            console.error("Error fetching Wikipedia image:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (visible && animal.wiki_page) {
            loadImage();
        }
    }, [visible, animal.wiki_page]);

    const makeReadable = (array: string[]) => {
        if (array.length === 1) return array.toString().toLowerCase();
        if (array.length === 2) return array.join(" and ").toLowerCase();
        return `${array.slice(0, -1).join(", ")}, and ${array[array.length - 1]}`;
    };

    const renderCharacteristics = () => {
        const characteristics = [
            { label: 'Group:', value: animal.group },
            { label: 'Size:', value: animal.size },
            { label: 'Colors:', value: makeReadable(animal.colors) },
            { label: 'Food:', value: makeReadable(animal.food) },
            { label: 'Movement:', value: animal.movement },
            { label: 'Habitat:', value: makeReadable(animal.habitat) },
            { label: 'Fun Fact:', value: animal.fun_fact },
        ];

        return characteristics.map((char, index) => (
            <View key={index} style={styles.characteristicRow}>
                <Text style={styles.labelText}>
                    {char.label} <Text style={styles.valueText}>{char.value}</Text>
                </Text>
            </View>
        ));
    };

    return (
        <Modal
            animationType="fade"
            visible={visible}
            onRequestClose={toggleModal}
            transparent={true}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalBox}>
                    <Text style={[styles.modalText, { fontSize: screen === 'Play' ? 28 : 32 }]}>
                        {screen === 'Play' ? `Congratulations! You discovered the ${animal.name}!` : animal.name}
                    </Text>
                    <View style={[styles.line, { borderTopWidth: 1.5, paddingTop: 10 }]} />
                    <View style={styles.imageContainer}>
                        {isLoading ? (
                            <Text style={styles.placeholderText}>Loading image...</Text>
                        ) : animalImageUrl ? (
                            <Image
                                source={{ uri: animalImageUrl }}
                                style={styles.animalImage}
                                contentFit="contain"
                                cachePolicy="disk"
                                onError={(e) => console.log('Image load error:', e.error)}
                            />
                        ) : (
                            <Text style={styles.placeholderText}>No image available</Text>
                        )}
                    </View>
                    <View style={[styles.line, { borderBottomWidth: 1.5, paddingTop: 10 }]} />
                    <ScrollView style={styles.characteristicsContainer} >
                        {renderCharacteristics()}
                    </ScrollView>
                    <View style={[styles.line, { borderTopWidth: 1.5, paddingTop: 2 }]} />
                    {dailyHintType === null ?  (
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity style={styles.closeButton} onPress={toggleModal}>
                                <Text style={styles.closeButtonText}>Close</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.nextButton} onPress={onNextAnimal}>
                                <Text style={styles.nextButtonText}>Next</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity style={styles.soloButton} onPress={toggleModal}>
                                <Text style={styles.closeButtonText}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
    },
    modalBox: {
        backgroundColor: colors.tan,
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 10,
        width: screenDimensions.screenWidth * 0.9,
        alignItems: 'center',
        borderColor: colors.green1,
        borderWidth: 5,
        maxHeight: screenDimensions.screenHeight * 0.82,
    },
    modalText: {
        fontFamily: 'WalterTurncoat_400Regular',
        color: colors.green1,
        textAlign: 'center',
        marginBottom: 10,
    },
    characteristicsContainer: {
        width: '100%',
        paddingTop: 12,
    },
    characteristicRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginVertical: 3,
        width: '100%',
    },
    labelText: {
        fontFamily: 'WalterTurncoat_400Regular',
        fontSize: 25,
        color: colors.green1,
        textAlign: 'left',
        marginRight: 5,
    },
    valueText: {
        fontFamily: 'WalterTurncoat_400Regular',
        fontSize: 21,
        color: colors.green1,
        textAlign: 'left',
    },
    imageContainer: {
        width: screenDimensions.screenWidth * 0.8,
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
        overflow: 'hidden',
    },
    animalImage: {
        width: '100%',
        height: '100%',
        elevation: 1,
        shadowRadius: 2,
        shadowOpacity: 1,
        shadowOffset: { width: -1, height: -1 },
    },
    placeholderText: {
        color: colors.green1,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 8,
    },
    soloButton: {
        backgroundColor: colors.green2,
        borderRadius: 10,
        padding: 8,
        width: 130,
        alignItems: 'center',
        borderColor: '#2e430eff',
        borderWidth: 1,
    },
    closeButton: {
        backgroundColor: colors.green2,
        borderTopLeftRadius: 10,
        borderBottomLeftRadius: 10,
        padding: 8,
        width: 130,
        alignItems: 'center',
        borderColor: '#2e430eff',
        borderWidth: 1,
    },
    closeButtonText: {
        fontFamily: 'WalterTurncoat_400Regular',
        fontSize: 24,
        color: colors.tan,
    },
    nextButton: {
        backgroundColor: colors.green2,
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10,
        padding: 8,
        width: 130,
        alignItems: 'center',
        borderColor: '#2e430eff',
        borderWidth: 1,
    },
    nextButtonText: {
        fontFamily: 'WalterTurncoat_400Regular',
        fontSize: 24,
        color: colors.tan,
    },
    line: {
        borderColor: colors.green1,
        width: '100%',
    },
});

export default ResultsModal;