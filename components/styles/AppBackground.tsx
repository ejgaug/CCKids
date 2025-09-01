import React from "react";
import { globalStyles } from "./globalStyles";
import { ImageBackground, Text, View } from "react-native";

interface AppBackgroundProps {
    children: React.ReactNode;
}

const AppBackground: React.FC<AppBackgroundProps> = ({ children }) => {
    const backgroundImage = require('../../assets/CCKidsBackground.jpg');

    return (
        <ImageBackground source={backgroundImage} style={globalStyles.backgroundImage}>
            {children}
        </ImageBackground>
    );
}

export default AppBackground;