import { TouchableOpacity, View, Text } from "react-native";
import { walkthroughable } from "react-native-copilot";

// Define the Animal interface
export interface Animal {
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

// Define navigation param list for TypeScript
export type RootStackParamList = {
    Landing: undefined;
    Zoo: undefined;
    Play: { animal: Animal; extraStepTracker: number };
};

// Define walkthroughable components for copilot
export const WalkthroughableText = walkthroughable(Text);
export const WalkthroughableTouchableOpacity = walkthroughable(TouchableOpacity);
export const WalkthroughableView = walkthroughable(View);