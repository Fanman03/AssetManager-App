import React from 'react';
import {
    ActivityIndicator,
    Pressable,
    StyleProp,
    StyleSheet,
    Text,
    TextStyle,
    useColorScheme,
    View,
    ViewStyle,
} from 'react-native';

type Variant =
    | 'primary'
    | 'secondary'
    | 'success'
    | 'danger'
    | 'warning'
    | 'info'
    | 'light'
    | 'dark';

type Size = 'sm' | 'md' | 'lg';

export interface BootstrapButtonProps {
    children: React.ReactNode;
    variant?: Variant;
    outline?: boolean;
    size?: Size;
    block?: boolean;
    disabled?: boolean;
    loading?: boolean;
    onPress?: () => void;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
    accessibilityLabel?: string;
}

const PALETTE: Record<Variant, string> = {
    primary: '#0d6efd',
    secondary: '#6c757d',
    success: '#198754',
    danger: '#dc3545',
    warning: '#ffc107',
    info: '#0dcaf0',
    light: '#f8f9fa',
    dark: '#212529',
};

const SIZES: Record<Size, { paddingV: number; paddingH: number; fontSize: number; borderRadius: number }> = {
    sm: { paddingV: 6, paddingH: 14, fontSize: 14, borderRadius: 4 },
    md: { paddingV: 10, paddingH: 20, fontSize: 16, borderRadius: 4 },
    lg: { paddingV: 14, paddingH: 26, fontSize: 18, borderRadius: 4 },
};

export const BootstrapButton: React.FC<BootstrapButtonProps> = ({
    children,
    variant = 'primary',
    outline = false,
    size = 'md',
    block = false,
    disabled = false,
    loading = false,
    onPress,
    leftIcon,
    rightIcon,
    style,
    textStyle,
    accessibilityLabel,
}) => {
    const scheme = useColorScheme();
    const isDark = scheme === 'dark';

    const baseColor = PALETTE[variant];
    const { paddingV, paddingH, fontSize, borderRadius } = SIZES[size];

    const backgroundColor = outline
        ? 'transparent'
        : variant === 'light'
            ? '#f8f9fa'
            : baseColor;

    const borderColor = baseColor;

    const textColor = outline
        ? baseColor
        : variant === 'light'
            ? '#212529'
            : '#fff';

    const disabledOpacity = 0.65;

    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel}
            onPress={disabled || loading ? undefined : onPress}
            style={({ pressed }) => [
                styles.base,
                {
                    alignSelf: block ? 'stretch' : 'flex-start',
                    paddingVertical: paddingV,
                    paddingHorizontal: paddingH,
                    borderRadius,
                    backgroundColor,
                    borderColor,
                    opacity: disabled || loading ? disabledOpacity : 1,
                    borderWidth: 1,
                    shadowColor: '#000',
                    shadowOpacity: 0.1,
                    shadowRadius: 2,
                    shadowOffset: { width: 0, height: 1 },
                    elevation: 2,
                },
                pressed && !disabled && !loading && styles.pressed,
                style,
            ]}
        >
            <View style={styles.content}>
                {leftIcon ? <View style={styles.iconLeft}>{leftIcon}</View> : null}
                {loading ? (
                    <ActivityIndicator size="small" color={textColor} />
                ) : (
                    <Text
                        numberOfLines={1}
                        style={[
                            {
                                color: textColor,
                                fontWeight: '600',
                                fontSize,
                            },
                            textStyle,
                        ]}
                    >
                        {children}
                    </Text>
                )}
                {rightIcon ? <View style={styles.iconRight}>{rightIcon}</View> : null}
            </View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    base: {
        marginVertical: 8,
    },
    pressed: {
        opacity: 0.9,
        transform: [{ scale: 0.98 }],
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconLeft: {
        marginRight: 6,
    },
    iconRight: {
        marginLeft: 6,
    },
});

export default BootstrapButton;
