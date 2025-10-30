import { Text, TouchableOpacity, StyleSheet, Image as RNImage } from 'react-native';
import { Image } from 'expo-image';
import { appFont, colors, screenDimensions } from '../styles/globalStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect, memo } from 'react';
import { Animal } from '../types';
import { deviceType } from '../styles/globalStyles';

// Define props for the AnimalCard component
interface AnimalCardProps {
    animal: Animal;
    onPress: () => void;
    setFoundAll: (newVal: boolean) => void
}

// AnimalCard component displays an animal image or placeholder
const AnimalCard: React.FC<AnimalCardProps> = ({ animal, onPress, setFoundAll }) => {
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [isVertical, setIsVertical] = useState(false);

    useEffect(() => {
        const loadImage = async () => {
            try {
                const savedImageUrl = await AsyncStorage.getItem(`${animal.name}_imageUrl`);
                if (savedImageUrl) {
                    setImageUri(savedImageUrl);
                    RNImage.getSize(
                        savedImageUrl,
                        (width, height) => {
                            setIsVertical(height >= width - 10);
                        },
                        (error) => {
                            console.error('Error getting image size: ', error);
                        }
                    );
                } else {
                    setFoundAll(false);
                }
            } catch (error) {
                console.error('Error loading cached image:', error);
            }
        };
        loadImage();
    }, [animal.name]);

    return (
        <TouchableOpacity
            onPress={onPress}
            style={[styles.cardContainer, isVertical && styles.verticalCard]}
        >
            {imageUri ? (
                <Image
                    source={{ uri: imageUri }}
                    style={styles.cardImage}
                    contentFit="fill"
                    cachePolicy="disk"
                    onError={(e) => console.log('Image load error:', e.error)}
                />
            ) : (
                <Text style={styles.placeholderText}>?</Text>
            )}
        </TouchableOpacity>
    );
};

// Styles for the AnimalCard component
const styles = StyleSheet.create({
    cardContainer: {
        width: screenDimensions.screenWidth * 0.36,
        height: deviceType() === 'Tablet' ? 200 : 100,
        marginHorizontal: 12,
        marginVertical: 8,
        borderRadius: 18,
        borderWidth: 4,
        borderColor: colors.green1,
        backgroundColor: colors.green2,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    verticalCard: {
        width: deviceType() === 'Tablet' ? 210 : 110,
        height: screenDimensions.screenWidth * 0.36,
    },
    cardImage: {
        width: '100%',
        height: '100%',
    },
    placeholderText: {
        fontFamily: appFont,
        fontSize: 60,
        color: colors.green3,
    },
});

export default memo(AnimalCard); // Wrap with React.memo