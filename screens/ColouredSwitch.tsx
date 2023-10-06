import * as React from 'react';
import {
    Platform,
    Switch,
} from 'react-native';

export default function ColouredSwitch({ styles, colors, value, onValueChange }) {
    return (
        <Switch
            style={[styles.item, styles.switch]}
            trackColor={Platform.OS !== "ios"
                ? {true: undefined, false: colors.mediumContrast}
                : undefined}
            thumbColor={Platform.OS !== "ios"
                ? (value ? colors.tint : colors.text)
                : undefined}
            ios_backgroundColor={value ? colors.tint : colors.highContrast}
            value={value}
            onValueChange={onValueChange}
        />
    );
}
