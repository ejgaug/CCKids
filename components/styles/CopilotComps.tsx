import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useCopilot } from 'react-native-copilot';
import { colors, screenDimensions } from './globalStyles';

// Custom step number component to hide the step number bubble
export const CustomStepNumber: React.FC<{ currentStepNumber: number }> = ({ currentStepNumber }) => (
    <View style={{backgroundColor: 'white'}}>
        {/* <Text style={{ color: 'black', fontSize: 12 }}>{currentStepNumber}</Text> */}
    </View>
);

// Component to handle copilot events and update extraStepTracker
export const CopilotEventHandler: React.FC<{
    extraStepTracker: number;
    setextraStepTracker: React.Dispatch<React.SetStateAction<number>>;
}> = ({ setextraStepTracker }) => {
    const { copilotEvents } = useCopilot();

    // Reset extraStepTracker on walkthrough start/end or when not on step 3 or 13
    useEffect(() => {
        const onStepChange = (step: any) => {
            if (step?.order !== 3 && step?.order !== 13) {
                setextraStepTracker(0);
            }
        };
        const onStart = () => setextraStepTracker(0);
        const onEnd = () => setextraStepTracker(0);
        copilotEvents.on('stepChange', onStepChange);
        copilotEvents.on('start', onStart);
        copilotEvents.on('stop', onEnd);
        return () => {
            copilotEvents.off('stepChange', onStepChange);
            copilotEvents.off('start', onStart);
            copilotEvents.off('stop', onEnd);
        };
    }, [copilotEvents, setextraStepTracker]);

    return null; // No UI needed
};

// Custom tooltip component with specified styling
export const CustomTooltip: React.FC<{
    extraStepTracker: number;
    setextraStepTracker: React.Dispatch<React.SetStateAction<number>>;
}> = ({ extraStepTracker, setextraStepTracker }) => {
    const { isFirstStep, isLastStep, goToPrev, goToNext, currentStep, stop, totalStepsNumber } = useCopilot();

    // Log step info for debugging
    // useEffect(() => {
    //     console.log('Current Step:', currentStep?.order, 'Total Steps:', totalStepsNumber, 'Is Last Step:', isLastStep, 'extraStepTracker:', extraStepTracker);
    // }, [currentStep, totalStepsNumber, isLastStep, extraStepTracker]);

    // Instead of BACK
    const shouldClose = (currentStep?.order === 0 || currentStep?.order === 10 || currentStep?.order === 30);
    // Instead of NEXT
    const isDone = (currentStep?.order === 3 || currentStep?.order === 20 || currentStep?.order === 31);

    // Handle custom navigation for CompLogicTip
    const handleNext = () => {
        // For DailyDiscovery tips
        if (currentStep?.order === 0) {
            setextraStepTracker(1); // Move to 1.1
            goToNext();
        } else if (currentStep?.order === 1 && (extraStepTracker === 0 || extraStepTracker === 1)) {
            setextraStepTracker(2); // Move to 1.2
        } else if (currentStep?.order === 1 && extraStepTracker === 2) {
            setextraStepTracker(0); // reset tracker
            goToNext();
        }
        // For PlayScreen tips
        else if (currentStep?.order === 12) {
            setextraStepTracker(1); // Move to 13.1
            goToNext();
        } else if (currentStep?.order === 13 && extraStepTracker === 1) {
            setextraStepTracker(2); // Move to 13.2
        } else if (currentStep?.order === 13 && extraStepTracker === 2) {
            setextraStepTracker(3); // Move to 13.3
        } else if (currentStep?.order === 13 && extraStepTracker === 3) {
            setextraStepTracker(0); // Move to 14, reset tracker
            goToNext();
        } else {
            goToNext();
        }
        // console.log('next', currentStep?.order,  extraStepTracker)
    };

    // Handle back navigation for CompLogicTip
    const handlePrev = () => {
        // For DailyDiscovery tips
        if (currentStep?.order === 2) {
            setextraStepTracker(1); // Move back to 1.1
            goToPrev();
        } else if (currentStep?.order === 1 && extraStepTracker === 2) {
            setextraStepTracker(1); // Move back to 1.1
        } else if (currentStep?.order === 1 && extraStepTracker === 1) {
            setextraStepTracker(0); // Move back to 2, reset tracker
            goToPrev();
        }
        // for PlayScreen tips
        else if (currentStep?.order === 15) {
            setextraStepTracker(1); // Move to 13.1
            goToPrev();
        } else if (currentStep?.order === 13 && extraStepTracker === 3) {
            setextraStepTracker(2); // Move back to 13.2
        } else if (currentStep?.order === 13 && extraStepTracker === 2) {
            setextraStepTracker(1); // Move back to 13.1
        } else if (currentStep?.order === 13 && extraStepTracker === 1) {
            setextraStepTracker(0); // Move back to 12, reset tracker
            goToPrev();
        } else {
            goToPrev();
        }
        // console.log('prev', currentStep?.order, extraStepTracker)
    };

    // Set dynamic text for CompLogicTip and DailyDiscoveryTip based on extraStepTracker
    const displayText = currentStep?.order === 13 && currentStep?.name === 'CompLogicTip'
        ? extraStepTracker === 1
            ? "After a guess, the boxes show characteristics of the animal that you guessed."
            : extraStepTracker === 2
            ? "The colored dots show a comparison of your guess to the mystery animal."
            : "Green: Perfect Match\n Yellow: Partial/Close Match\n Red: No Match"
        : currentStep?.order === 1 && currentStep?.name === 'DailyDiscoveryTip'
        ? (extraStepTracker === 1 || extraStepTracker === 0)
            ? "Every day, Daily Discovery will give you hints from three random animals."
            : "You can only use one hint per day, so make sure to only select 'Start Exploring' on the hint you want to use."
        : currentStep?.text;

    return (
        <View
            style={{
                backgroundColor: '#fcf7c7ff',
                borderRadius: 10,
                padding: 10,
                alignItems: 'center',
                justifyContent: 'center',
                width: screenDimensions.screenWidth * 0.75,
                borderColor: colors.green1, 
                borderWidth: 1
            }}
        >
            <Text
                style={{
                    fontSize: 18,
                    color: colors.green2,
                    fontWeight: 600,
                    textAlign: 'center',
                    marginBottom: 6,
                }}
            >
                {displayText}
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>    
                <TouchableOpacity onPress={shouldClose ? stop : handlePrev}>
                    <Text style={{ fontSize: 17, fontWeight: 600, color: colors.green2 }}>
                        {shouldClose ? 'CLOSE' : 'BACK'}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={isDone ? stop : handleNext}>
                    <Text style={{ fontSize: 17, fontWeight: 600, color: colors.green2 }}>
                        {isDone ? 'DONE' : 'NEXT'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};