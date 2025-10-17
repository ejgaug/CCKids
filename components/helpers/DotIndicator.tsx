import React, { useRef, useEffect } from 'react';
import { View, Animated, ScrollView, StyleSheet } from 'react-native';
import { colors, globalStyles, screenDimensions } from '../styles/globalStyles';

// Define props for DotIndicator
interface DotIndicatorProps {
    maxGuesses: number; // Maximum number of guess dots
    guesses: string[]; // Array of guesses
    currPage: number; // Current page index
    onPageChange: (page: number) => void; // Function to handle page change
    scrollViewRef: React.RefObject<ScrollView | null>; // Reference to parent ScrollView
}

// DotIndicator component displays navigation dots for guesses
const DotIndicator: React.FC<DotIndicatorProps> = ({ maxGuesses, guesses, currPage, onPageChange, scrollViewRef}) => {
    const scaleAnim = useRef(new Animated.Value(1)).current; // Animation for dot scaling
    const lastX = useRef(0); // Last touch X position
    const currentPageRef = useRef(currPage); // Current page reference
    const isDragging = useRef(false); // Tracks if user is dragging

    // Sync currentPageRef with currPage
    useEffect(() => {
        currentPageRef.current = currPage;
    }, [currPage]);

    // Update page and trigger scroll
    const updatePage = (newPage: number) => {
        newPage = Math.max(0, Math.min(newPage, guesses.length - 1));
        if (newPage !== currentPageRef.current) {
            currentPageRef.current = newPage;
            onPageChange(newPage);
            scrollViewRef.current?.scrollTo({
                x: newPage * screenDimensions.screenWidth,
                animated: true,
            });
        }
    };

    // Handle touch start for dot interaction
    const handleTouchStart = (event: any) => {
        const touch = event.nativeEvent.touches[0];
        lastX.current = touch.pageX;
        isDragging.current = false;

        if (scrollViewRef.current) {
            scrollViewRef.current.setNativeProps({ scrollEnabled: false });
        }

        Animated.timing(scaleAnim, {
            toValue: 1.2,
            duration: 150,
            useNativeDriver: true,
        }).start();
    };

    // Handle touch move for swipe navigation
    const handleTouchMove = (event: any) => {
        const touch = event.nativeEvent.touches[0];
        const currentX = touch.pageX;
        const dx = currentX - lastX.current;
        const pixelThreshold = 14;

        if (Math.abs(dx) >= pixelThreshold) {
            isDragging.current = true;
            const direction = dx < 0 ? -1 : 1;
            const pageChange = Math.floor(Math.abs(dx) / pixelThreshold);
            const newPage = currentPageRef.current + (direction * pageChange);
            updatePage(newPage);
            lastX.current = currentX;
        }
    };

    // Handle touch end for tap or swipe completion
    const handleTouchEnd = (event: any) => {
        const touch = event.nativeEvent;
        const dx = touch.pageX - lastX.current;
        const wasTap = Math.abs(dx) < 5 && !isDragging.current;

        if (wasTap) {
            const lastPage = guesses.findLastIndex(g => g !== '') + 1 || guesses.length - 1;
            updatePage(lastPage); // Navigate to last non-empty guess on tap
        }

        if (scrollViewRef.current) {
            scrollViewRef.current.setNativeProps({ scrollEnabled: guesses.length > 1 }); 
        }

        Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
        }).start();
    };

    return (
        <Animated.View
            style={{
                ...styles.dotContainer,
                borderColor: colors.tan,
                backgroundColor: colors.tan,
                transform: [{ scale: scaleAnim }],
                position: 'absolute',
                bottom: 12,
                alignItems: 'center',
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {[...Array(Math.min(maxGuesses, guesses.length))].map((_, index) => (
                <View
                    key={index}
                    style={[
                        { ...styles.dot, borderColor: colors.green1 },
                        index === currPage ? {
                            ...styles.activeDot,
                            backgroundColor: colors.green1,
                            shadowColor: colors.green1,
                        } : {},
                    ]}
                />
            ))}
        </Animated.View>
    );
};

export default DotIndicator;

const styles = StyleSheet.create({
    dotContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center', 
        flexWrap: 'wrap',
        opacity: 0.75,
        gap: 5,
        paddingHorizontal: 18,
        borderWidth: 2,
        borderRadius: 20,
        marginVertical: 10, 
        marginHorizontal: 10,
        position: 'absolute',
        zIndex: 1,
        bottom: screenDimensions.screenHeight * 0.073,
        elevation: 5,  // For Android shadow
        shadowColor: '#000',  // For iOS shadow
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.4,
        shadowRadius: 3,
    },
    dot: {
        width: 8, 
        height: 8, 
        borderRadius: 4, 
        borderWidth: 1.25,
        marginBottom: 20
    },
    activeDot: {
        shadowOffset: {
            width: -1,
            height: 2,
        },
        shadowOpacity: 1, 
        shadowRadius: 2, 
        elevation: 5
    },    
})