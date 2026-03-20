import { StyleSheet, View, ViewProps } from 'react-native';

type CardProps = ViewProps & {
  children?: React.ReactNode;
};

export function Card({ children, style, ...props }: CardProps) {
  return (
    <View style={[styles.card, style]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 375,
    minHeight: 840,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#CED4DA',
  },
});
