import { Text, View } from 'react-native';

// Placeholder screen with a styled test element to confirm NativeWind works.
// Real routing (splash → onboarding/auth/tabs) comes in a later step.
export default function Index() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <View className="rounded-2xl bg-primary px-6 py-4">
        <Text className="text-base font-semibold text-white">
          MySubList — NativeWind OK
        </Text>
      </View>
    </View>
  );
}
