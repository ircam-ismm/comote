import { Pressable } from 'react-native';
import i18n from '../constants/i18n';
import { Text, View } from '../components/Themed';
import { useAppDispatch } from '../hooks';

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
                    // console.log('button A: 1');

                    dispatch({
                        type: 'sensors/set',
                        payload: {
                            buttonA: 1,
                        },
                    })
                }}
                onPressOut={() => {
                    // console.log('button A: 0');

                    dispatch({
                        type: 'sensors/set',
                        payload: {
                            buttonA: 0,
                        },
                    })
                }}
            >
                <Text style={styles.buttonText} selectable={false}>
                    {i18n.t('play.a')}
                </Text>
            </Pressable>

            <Pressable
                style={({ pressed }) => [
                    styles.button,
                    styles.buttonB,
                    pressed ? { opacity: 0.5 } : {},
                ]}
                onPressIn={() => {
                    // console.log('button B: 1');

                    dispatch({
                        type: 'sensors/set',
                        payload: {
                            buttonB: 1,
                        },
                    })
                }}
                onPressOut={() => {
                    // console.log('button B: 0');

                    dispatch({
                        type: 'sensors/set',
                        payload: {
                            buttonB: 0,
                        },
                    })
                }}
            >
                <Text style={styles.buttonText} selectable={false}>
                    {i18n.t('play.b')}
                </Text>
            </Pressable>
        </View>
    );
}
