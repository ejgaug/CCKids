import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { appFont, colors, globalStyles, screenDimensions } from "../styles/globalStyles"
import { FlatList, ScrollView } from "react-native-gesture-handler";
import { animalList } from "../../assets/animalList";
import { useEffect, useRef, useState } from "react";
import { StackScreenProps } from "@react-navigation/stack";
import { RootStackParamList } from "../../App";
import Pagination from "./Pagination";

interface Animal {
  name: string;
  wiki_page: string;
  fun_fact: string;
  home: string[];
  food: string[];
  alt_name: string;
  group: string;
  colors: string[];
  size: string;
  movement: string;
  sound: string;
}

type DailyDiscoveryProps = StackScreenProps<RootStackParamList, 'Landing'>;

const DailyDiscovery: React.FC<DailyDiscoveryProps> = ({ navigation }) => {
    const [animalIndexes, setAnimalIndexes] = useState<number[]>([0, 0, 0]);
    const [dailyHints, setDailyHints] = useState<any[]>(['', '', '']);
    const [currentPage, setCurrentPage] = useState(0);
    const scrollViewRef = useRef<ScrollView>(null);

    useEffect(() => {
        const unsub = navigation.addListener('focus', () => {
            setCurrentPage(0);
            scrollViewRef.current?.scrollTo({
                x: 0,
                animated: false,
            });
        });
        return unsub;
    }, [navigation]);

    useEffect(() => {
        const interval = setInterval(() => {
            const nextPage = (currentPage + 1) % dailyHints.length;
            scrollViewRef.current?.scrollTo({
                x: nextPage * (screenDimensions.screenWidth * 0.8 - 20),
                animated: true,
            });
            setCurrentPage(nextPage);
        }, 3000);

        return() => clearInterval(interval);
    }, [currentPage, dailyHints.length])

    useEffect(() => {
        const indexArray = Array.from({ length: 3 }, () => 
            Math.floor(Math.random() * animalList.length)
        );
        setAnimalIndexes(indexArray);
        const newHints = indexArray.map((index) => getCharacteristic(index));
        setDailyHints(newHints);
    }, []);

    const handleExplorePress = () => {
        const selectedAnimal = animalList[animalIndexes[currentPage]];
        navigation.navigate('Play', { animal: selectedAnimal });
    };

    const aOrAn = (group: string) => {
        return (group === 'Amphibian' || group === 'Invertebrate') ? 'an' : 'a'
    }

    const makeReadable = (array : string[]) => {
        if (array.length === 1) {
            return array.toString().toLowerCase();
        } else if (array.length === 2) {
            return array.join(" and ").toLocaleLowerCase();
        } else {
            return `${array.slice(0, -1).join(", ")}, and ${array[array.length - 1]}`
        }
    }

    const handleSize = (size: string) => {
        if (size === 'Medium') {
            return 'medium sized';
        } else {
            return size.toLocaleLowerCase();
        }
    }

    const getCharacteristic = (index: number) => {
        const hintTypes = [
            "fun fact", // 1 entry (1/25 = 4% chance)
            ...Array(4).fill("group"), // 4 entries (4/25 = 16% chance)
            ...Array(4).fill("size"), // 4 entries
            ...Array(4).fill("colors"), // 4 entries
            ...Array(4).fill("food"), // 4 entries
            ...Array(4).fill("movement"), // 4 entries
            ...Array(4).fill("home"), // 4 entries
        ];
        const char = hintTypes[Math.floor(Math.random() * hintTypes.length)]; // 0 to 24

        switch (char) {
            case 'fun fact': return `Animal Fun Fact:\n${animalList[index].fun_fact}`;
            case 'group': return `This animal is ${aOrAn(animalList[index].group)} ${animalList[index].group.toLocaleLowerCase()}`;
            case 'size': return `This animal is ${handleSize(animalList[index].size)}`;
            case 'colors': return `This animal is ${makeReadable(animalList[index].colors)}`;
            case 'food': return `This animal eats ${makeReadable(animalList[index].food)}`;
            case 'movement': return `This animal has ${animalList[index].movement.toLocaleLowerCase()}`; 
            case 'home': return `This animal lives ${makeReadable(animalList[index].home)}`;
        }
    };

    const handleScroll = (event: any) => {
        const contextOffsetX = event.nativeEvent.contentOffset.x;
        const pageWidth = screenDimensions.screenWidth * 0.8 - 20;
        const pageIndex = Math.round(contextOffsetX / pageWidth);
        setCurrentPage(pageIndex);
    }

    return (
        <View 
            style={{
                borderWidth: 3,
                borderColor: colors.green1,
                borderRadius: 16,
                width: screenDimensions.screenWidth * 0.8,
                height: screenDimensions.screenHeight * 0.42,
                backgroundColor: colors.tan,
                position: 'absolute',
                top: screenDimensions.screenHeight * 0.03,
                opacity: 0.85
            }}
        >  
            <Text 
                style={{
                    fontFamily: appFont,
                    fontSize: 28,
                    color: colors.green1,
                    textAlign: 'center',
                    textDecorationLine: 'underline',
                    paddingVertical: 10,
                }}
            >
                Daily Discovery
            </Text>
            <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                style={styles.scrollView}
                contentContainerStyle={styles.contentContainer}
                onMomentumScrollEnd={handleScroll}
                ref={scrollViewRef}
            >
                {dailyHints.map((hint, index) => (
                    <View key={index} style={styles.page}>
                        <Text
                            style={{
                                fontFamily: appFont,
                                fontSize: 26,
                                color: colors.green1,
                                textAlign: 'center'
                            }}
                        >
                            {hint}
                        </Text>
                    </View>
                ))}
            </ScrollView>
            <Pagination totalPages={dailyHints.length} currentPage={currentPage} />
            <TouchableOpacity style={styles.startButton} onPress={handleExplorePress}>
                <Text style={{fontFamily: appFont, color: colors.tan, fontSize: 28}}>
                    Start Exploring!
                </Text>
            </TouchableOpacity>
        </View>
    )
};

export default DailyDiscovery

const styles = StyleSheet.create({
    scrollView: {
        flex: 1, // Take up remaining space in the container
        margin: 4,
    },
    contentContainer: {
        alignItems: "center",
    },
    page: {
        width: screenDimensions.screenWidth * 0.8 - 20, // Account for padding (10 on each side)
        height: screenDimensions.screenHeight * 0.5 - 60, // Adjust for title height and padding
        paddingHorizontal: 10,
        justifyContent: "center", // Center text vertically
        alignItems: "center", // Center text horizontally
        backgroundColor: colors.tan, // Match parent background
    },
    startButton: {
        marginBottom: 30,
        backgroundColor: colors.green2,
        height: screenDimensions.screenHeight * 0.06,
        width: screenDimensions.screenWidth * 0.64,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        borderRadius: 16,
        borderColor: colors.green1,
        borderWidth: 2
    }
});