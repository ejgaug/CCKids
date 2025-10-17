import { Text, TouchableOpacity, StyleSheet, Image as RNImage } from 'react-native';
import { Image } from 'expo-image';
import { appFont, colors, screenDimensions } from '../styles/globalStyles';
import { Animal } from './SearchComp';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect, memo } from 'react';

// Define props for the AnimalCard component
interface AnimalCardProps {
    animal: Animal;
    onPress: () => void;
}

// AnimalCard component displays an animal image or placeholder
const AnimalCard: React.FC<AnimalCardProps> = ({ animal, onPress }) => {
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
                    contentFit="cover"
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
        width: screenDimensions.screenWidth * 0.35,
        height: 100,
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
        width: 100,
        height: screenDimensions.screenWidth * 0.35,
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