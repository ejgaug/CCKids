import { Linking, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { appFont, colors, screenDimensions } from "../styles/globalStyles";
import { ScrollView, Pressable } from "react-native-gesture-handler";
import { animalList } from "../../assets/animalList";
import { useEffect, useRef, useState } from "react";
import { StackScreenProps } from "@react-navigation/stack";
import Pagination from "./Pagination";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { CopilotStep } from "react-native-copilot";
import { RootStackParamList, WalkthroughableView } from "../types";

interface Animal {
  name: string;
  wiki_page: string;
  fun_fact: string;
  habitat: string[];
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
    const [ddTracker, setDdTracker] = useState<number | null>(null);
    const [foundAll, setFoundAll] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);

    useEffect(() => {
        const unsub = navigation.addListener('focus', () => {
            if (ddTracker !== null) {
                setCurrentPage(ddTracker);
                scrollViewRef.current?.scrollTo({
                    x: ddTracker * (screenDimensions.screenWidth * 0.8 - 20),
                    animated: false,
                });
            } else {
                setCurrentPage(0);
                scrollViewRef.current?.scrollTo({ x: 0, animated: false });
            }
        });
        return unsub;
    }, [navigation, ddTracker]);

    useEffect(() => {
        if (ddTracker !== null) return;
        const interval = setInterval(() => {
            const nextPage = (currentPage + 1) % dailyHints.length;
            scrollViewRef.current?.scrollTo({
                x: nextPage * (screenDimensions.screenWidth * 0.8 - 20),
                animated: true,
            });
            setCurrentPage(nextPage);
        }, 3000);
        return () => clearInterval(interval);
    }, [currentPage, dailyHints.length, ddTracker]);

    useEffect(() => {
        const checkAndUpdateHints = async () => {
            const today = new Date().toLocaleDateString();
            const storedDate = await AsyncStorage.getItem("hintDate");
            const storedHints = await AsyncStorage.getItem("dailyHints");
            const storedIndexes = await AsyncStorage.getItem("animalIndexes");
            const storedTracker = await AsyncStorage.getItem("ddTracker");

            // Load ddTracker on mount to set initial page // Initialize ddTracker
            if (storedTracker) {
                const trackerValue = JSON.parse(storedTracker);
                setDdTracker(trackerValue);
                if (trackerValue !== null) {
                    setCurrentPage(trackerValue);
                    scrollViewRef.current?.scrollTo({
                        x: trackerValue * (screenDimensions.screenWidth * 0.8 - 20),
                        animated: false,
                    });
                }
            }

            // Filter unguessed animals -- check if all animals have been found
            let allFound = true;
            const unguessedIndexes: number[] = [];
            for (let i = 0; i < animalList.length; i++) {
                const correctGuess = await AsyncStorage.getItem(`${animalList[i].name}_correctGuess`);
                if (correctGuess !== 'true') {
                    allFound = false;
                    unguessedIndexes.push(i);
                }
            }
            setFoundAll(allFound);
            if (allFound) return;

            if (storedDate === today && storedHints && storedIndexes) {
                setDailyHints(JSON.parse(storedHints));
                setAnimalIndexes(JSON.parse(storedIndexes));
                return;
            } 

            // Generate 3 hints
            const indexArray: number[] = [];
            for (let i = 0; i < 3; i++) {
                if (unguessedIndexes.length === 0) break;
                const rand = Math.floor(Math.random() * unguessedIndexes.length);
                indexArray.push(unguessedIndexes[rand]);
            }
            // Fill missing slots with random from available unguessed
            while (indexArray.length < 3 && unguessedIndexes.length > 0) {
                const rand = Math.floor(Math.random() * unguessedIndexes.length);
                indexArray.push(unguessedIndexes[rand]);
            }

            const newHints = indexArray.map((index) => getCharacteristic(index));
            setAnimalIndexes(indexArray);
            setDailyHints(newHints);
            setDdTracker(null);

            await AsyncStorage.setItem("hintDate", today);
            await AsyncStorage.setItem("dailyHints", JSON.stringify(newHints));
            await AsyncStorage.setItem("animalIndexes", JSON.stringify(indexArray));
            await AsyncStorage.setItem("ddTracker", JSON.stringify(null));
            // Clear DailyDiscovery hint data for new day // Clear hint data on new day
            await AsyncStorage.removeItem("dailyHintData");
        };
        checkAndUpdateHints();
    }, []);

    const handleExplorePress = (key: string) => {
        if (key === 'start') {
            setDdTracker(currentPage);
            AsyncStorage.setItem("ddTracker", JSON.stringify(currentPage)).catch((error) =>
                console.error("Error saving ddTracker:", error)
            );
            const selectedAnimal = animalList[animalIndexes[currentPage]];
            // Save DailyDiscovery hint data // Save hint and characteristic
            const hintType = getHintType(dailyHints[currentPage]);
            AsyncStorage.setItem("dailyHintData", JSON.stringify({
                animalName: selectedAnimal.name,
                hint: dailyHints[currentPage],
                hintType
            })).catch((error) => console.error("Error saving dailyHintData:", error));
            navigation.navigate('Play', { animal: selectedAnimal, extraStepTracker: 0 });
        } else if (key === 'keep') {
            const url = Platform.OS === 'ios'
                ? 'https://apps.apple.com/gb/app/critter-clues/id6743952864?uo=2'
                : 'https://play.google.com/store/apps/details?id=com.egaug.CritterClues&hl=en_US';
            Linking.openURL(url).catch(err => console.error('Error opening URL:', err));
        } else {
            console.error('Received a key other than keep or start in DailyDiscovery.')
        }
    };

    const aOrAn = (group: string) => {
        return group === 'Amphibian' || group === 'Invertebrate' ? 'an' : 'a';
    };

    const makeReadable = (array: string[]) => {
        if (array.length === 1) return array.toString().toLowerCase();
        if (array.length === 2) return array.join(" and ").toLowerCase();
        return `${array.slice(0, -1).join(", ")}, and ${array[array.length - 1]}`;
    };

    const handleSize = (size: string) => {
        if (size === 'Medium') return 'medium sized';
        return size.toLowerCase();
    };

    const getCharacteristic = (index: number) => {
        const hintTypes = [
            "fun fact",
            ...Array(4).fill("group"),
            ...Array(4).fill("size"),
            ...Array(4).fill("colors"),
            ...Array(4).fill("food"),
            ...Array(4).fill("movement"),
            ...Array(4).fill("habitat"),
        ];
        const char = hintTypes[Math.floor(Math.random() * hintTypes.length)];

        switch (char) {
            case 'fun fact': return `Animal Fun Fact:\n${animalList[index].fun_fact}`;
            case 'group': return `This animal is ${aOrAn(animalList[index].group)} ${animalList[index].group.toLowerCase()}`;
            case 'size': return `This animal is ${handleSize(animalList[index].size)}`;
            case 'colors': return `This animal is ${makeReadable(animalList[index].colors)}`;
            case 'food': return `This animal eats ${makeReadable(animalList[index].food)}`;
            case 'movement': return `This animal has ${animalList[index].movement.toLowerCase()}`;
            case 'habitat': return `This animal lives ${makeReadable(animalList[index].habitat)}`;
        }
    };

    // Determine the hint type from the hint text // Extract hint type
    const getHintType = (hint: string): string => {
        if (hint.startsWith("Animal Fun Fact:")) return "fun fact";
        if (hint.includes("This animal is a") || hint.includes("This animal is an")) return "group";
        if (hint.includes("tiny") || hint.includes("is small") || hint.includes("is medium") || hint.includes("is big") || hint.includes("is huge") || hint.includes("is giant")) return "size";
        if (hint.includes("This animal is")) return "colors";
        if (hint.includes("This animal eats")) return "food";
        if (hint.includes("This animal has")) return "movement";
        if (hint.includes("This animal lives")) return "habitat";
        return "";
    };

    const handleScroll = (event: any) => {
        const contextOffsetX = event.nativeEvent.contentOffset.x;
        const pageWidth = screenDimensions.screenWidth * 0.8 - 20;
        const pageIndex = Math.round(contextOffsetX / pageWidth);
        setCurrentPage(pageIndex);
    };

    const isButtonDisabled = ddTracker !== null && ddTracker !== currentPage;

    return (
        <CopilotStep
                text="Every day, Daily Discovery will give you hints from three random animals."
                order={1}
                name="DailyDiscoveryTip"                        
        >
            {foundAll ? (
                <WalkthroughableView
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
                            paddingTop: 10,
                        }}
                    >
                        Daily Discovery
                    </Text>
                    <View style={styles.foundAllContainer} >
                        <Text style={[styles.textStyle, {fontSize: 25}]}>
                            It looks like you found all the animals! Are you ready for a new challenge?
                        </Text>
                    </View>
                    {/* <TouchableOpacity
                        style={[styles.foundAllButton, {marginBottom: 10,}]}
                        onPress={() => handleExplorePress('keep')}
                        disabled={isButtonDisabled}
                    >
                        <Text style={{ fontFamily: appFont, color: colors.tan, fontSize: 26 }}>
                            Restart Journey!
                        </Text>
                    </TouchableOpacity> */}
                    <TouchableOpacity
                        style={styles.startButton}
                        onPress={() => handleExplorePress('keep')}
                        disabled={isButtonDisabled}
                    >
                        <Text style={{ fontFamily: appFont, color: colors.tan, fontSize: 28 }}>
                            New Challenge!
                        </Text>
                    </TouchableOpacity>
                </WalkthroughableView>
            ) : (
                <WalkthroughableView
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
                                <Text style={styles.textStyle} >
                                    {hint}
                                </Text>
                            </View>
                        ))}
                    </ScrollView>
                    <Pagination totalPages={dailyHints.length} currentPage={currentPage} />
                    <TouchableOpacity
                        style={[styles.startButton, isButtonDisabled && { opacity: 0.3 }]}
                        onPress={() => handleExplorePress('start')}
                        disabled={isButtonDisabled}
                    >
                        <Text style={{ fontFamily: appFont, color: colors.tan, fontSize: 28 }}>
                            Start Exploring!
                        </Text>
                    </TouchableOpacity>
                </WalkthroughableView>                
            )}
        </CopilotStep>
    );
};

export default DailyDiscovery;

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
        margin: 4,
    },
    contentContainer: {
        alignItems: "center",
    },
    foundAllContainer: {
        flex: 1,
        margin: 4,
        alignItems: "center",
        width: screenDimensions.screenWidth * 0.8 - 18,
        height: screenDimensions.screenHeight * 0.5 - 60,
        paddingHorizontal: 10,
        justifyContent: "center",
        backgroundColor: colors.tan,
    },
    textStyle: {
        fontFamily: appFont,
        fontSize: 26,
        color: colors.green1,
        textAlign: 'center',
    },
    page: {
        width: screenDimensions.screenWidth * 0.8 - 18,
        height: screenDimensions.screenHeight * 0.5 - 60,
        paddingHorizontal: 14,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.tan,
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
        borderWidth: 2,
    },
    foundAllButton: {
        backgroundColor: colors.green2,
        height: screenDimensions.screenHeight * 0.05,
        width: screenDimensions.screenWidth * 0.64,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        borderRadius: 16,
        borderColor: colors.green1,
        borderWidth: 2,
    },
    info:{
        position: 'absolute',
        top: 5,
        right: 5
    }
});