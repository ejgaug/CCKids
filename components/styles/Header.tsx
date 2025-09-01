import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { globalStyles, colors } from '../styles/globalStyles';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';

interface HeaderProps {
  title: string;
  isLandingScreen: boolean;
  navigation: StackNavigationProp<RootStackParamList>;
}

const Header: React.FC<HeaderProps> = ({ title, isLandingScreen, navigation }) => {
  
  return (
    <SafeAreaView
      edges={['top']}
      style={{
        backgroundColor: colors.green1,
        opacity: 0.7,
        zIndex: 1,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          paddingBottom: 6,
          paddingHorizontal: 16,
          backgroundColor: 'transparent',
          zIndex: 2,
        }}
      >
        {!isLandingScreen && (
          <TouchableOpacity
            style={{ position: 'absolute', left: 20, bottom: 9 }}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="leaf-sharp" color="white" size={28} style={{ transform: [{ rotate: '-38deg' }]}}/>
          </TouchableOpacity>
        )}
        <Text
          style={[
            globalStyles.title,
            { color: '#fff', textAlign: 'center', zIndex: 3 },
          ]}
        >
          {title}
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default Header;