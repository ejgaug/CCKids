import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { globalStyles, colors } from '../styles/globalStyles';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { CopilotStep, useCopilot } from 'react-native-copilot';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList, WalkthroughableTouchableOpacity } from '../types';

interface HeaderProps {
	title: string;
	screenName: string;
	navigation: StackNavigationProp<RootStackParamList>;
}

const Header: React.FC<HeaderProps> = ({ title, screenName, navigation }) => {
	const { start } = useCopilot(); // Access copilot start function

	// Trigger walkthrough on info button press // Start tutorial
	const handleInfo = async () => {
		const hasOpened = await AsyncStorage.getItem(`hasOpened${screenName}`);

		let startStep: string;
		switch (screenName) {
			case 'Landing':
				startStep = hasOpened === 'true' ? 'DailyDiscoveryTip' : 'onFirstLanding';
				break;
			case 'Play':
				startStep = hasOpened === 'true' ? 'InputTip' : 'onFirstPlay';
				break;
			case 'Zoo':
				startStep = hasOpened === 'true' ? 'ZooCardTip' : 'onFirstZoo';
				break;
			default:
				startStep = 'playButton'; // Fallback
		}
		setTimeout(() => start(startStep), 200);
	};

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
				{screenName !== 'Landing' && (
					<TouchableOpacity
						style={{ position: 'absolute', left: 20, bottom: 9 }}
						onPress={() => navigation.goBack()}
					>
						<Ionicons name="leaf-sharp" color="white" size={28} style={{ transform: [{ rotate: '-38deg' }] }} />
					</TouchableOpacity>
				)}
				<Text
					style={[
						globalStyles.title,
						{ color: '#fcf7c7ff', textAlign: 'center', zIndex: 3 },
					]}
				>
					{title}
				</Text>
				<CopilotStep
					text={
						screenName === 'Landing' ? "Tap here to learn about Critter Clues Kids!" : 
						screenName === 'Play' ? "Tap here to learn how to discover animals!" :
						"Tap here to learn about the Critter Clues Zoo!"
					}
					order={
						screenName === 'Landing' ? 0 : 
						screenName === 'Play' ? 10 :
						30
					}
					name={
						screenName === 'Landing' ? "onFirstLanding" : 
						screenName === 'Play' ? "onFirstPlay" :
						"onFirstZoo"
					}
				>
					<WalkthroughableTouchableOpacity
						onPress={handleInfo}
						style={{ position: 'absolute', bottom: 8, right: 18, borderRadius: 30 }}
					>
						<Ionicons
							name="information-circle-outline"
							size={32}
							color={'#fcf7c7ff'}
						/>
					</WalkthroughableTouchableOpacity>
				</CopilotStep>
			</View>
		</SafeAreaView>
	);
};

export default Header;