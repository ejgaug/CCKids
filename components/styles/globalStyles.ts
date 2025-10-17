import { StyleSheet, ViewStyle, TextStyle, ImageStyle, Dimensions } from 'react-native';

// Define interface for StyleSheet styles
interface GlobalStyles {
  container: ViewStyle;
  title: TextStyle;
  buttonBackgrounds: ViewStyle;
  landingButtons: ViewStyle;
  buttonText: TextStyle;
  backgroundImage: ImageStyle;
}

// Colors as separate constants
export const colors = {
  primaryColor: '#007AFF',
  secondaryColor: '#FF2D55',
  green1: '#395115', // darkest green
  green2: '#445F26', 
  green3: '#87A309', 
  green4: '#AFBA0B', // lightest green 
  green5: '#018f01ff', // for green light
  tan: '#fedb7aff', // basicaly tan
// export const easyColor = {base: '#03549C', text: '#9BBBFD'} // blue
// export const midColor = {base: '#E6A400', text: '#FFEA7D' } // yellow
// export const hardColor = {base:'#D60606', text: '#FFC0B8'} // red
};

export const screenDimensions = {
    screenWidth: Dimensions.get('window').width,
    screenHeight: Dimensions.get('window').height
}

export const appFont = 'WalterTurncoat_400Regular'

// StyleSheet styles
export const globalStyles = StyleSheet.create<GlobalStyles>({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 28,
    color: colors.primaryColor, // Reference color constant
    fontFamily: appFont
  },
  buttonBackgrounds: {
    backgroundColor: 'white',
    borderRadius: 50,
    width: screenDimensions.screenWidth * 0.19,
    height: screenDimensions.screenHeight * 0.1,
    position: 'absolute',
    opacity: 0.3
  },
  landingButtons: {
    padding: 10,
    borderRadius: 5,
    position: 'absolute',
    alignItems: 'center',
    zIndex: 10, 
  },
  buttonText: {
    color: colors.green1,
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 700, 
    fontFamily: appFont
  },
    backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});