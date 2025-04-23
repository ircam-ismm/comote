import { Pressable } from 'react-native';
import i18n from '../constants/i18n';
import { Text, View } from '../components/Themed';
import { useAppDispatch } from '../hooks';

import { timestampGet } from '../helpers/timestamp';

export default function ButtonsView({ styles }) {
    const dispatch = useAppDispatch();

    return (
        <View style={styles.buttonsContainer}>
            <Pressable
                style={({ pressed }) => [
                    styles.button,
                    styles.buttonA,
                    pressed ? { opacity: 0.5 } : {},
                ]}
                onPressIn={() => {
                    dispatch({
                        type: 'sensors/set',
                        payload: {
                            control: {
                                buttonA: 1,
                                timestamp: timestampGet(),
                            },
                        },
                    })
                }}
                onPressOut={() => {
                    dispatch({
                        type: 'sensors/set',
                        payload: {
                            control: {
                                buttonA: 0,
                                timestamp: timestampGet(),
                            },
                        },
                    })
                }}
            >
                <Text style={styles.buttonText} selectable={false}>
                    {i18n.t('home.a')}
                </Text>
            </Pressable>

            <Pressable
                style={({ pressed }) => [
                    styles.button,
                    styles.buttonB,
                    pressed ? { opacity: 0.5 } : {},
                ]}
                onPressIn={() => {
                    dispatch({
                        type: 'sensors/set',
                        payload: {
                            control: {
                                buttonB: 1,
                                timestamp: timestampGet(),
                            },
                        },
                    })
                }}
                onPressOut={() => {
                    dispatch({
                        type: 'sensors/set',
                        payload: {
                            control: {
                                buttonB: 0,
                                timestamp: timestampGet(),
                            },
                        },
                    })
                }}
            >
                <Text style={styles.buttonText} selectable={false}>
                    {i18n.t('home.b')}
                </Text>
            </Pressable>
        </View>
    );
}
