// components/TabIcon.tsx
import { Image, Text, View } from 'react-native';

export default function TabIcon({
  focused,
  icon,
  title,
}: {
  focused: boolean;
  icon: any;
  title: string;
}) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Image
        source={icon}
        style={{ width: 20, height: 20, tintColor: focused ? '#151312' : '#A8B5DB' }}
      />
      {focused && (
        <Text style={{ fontSize: 12, marginTop: 2, color: '#151312', fontWeight: '600' }}>
          {title}
        </Text>
      )}
    </View>
  );
}
