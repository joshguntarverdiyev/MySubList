import { View, Text, TouchableOpacity } from 'react-native'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'

/** Home screen header: app logo + wordmark on the left, add button on the right. */
export default function HomeHeader({ onAdd }: { onAdd: () => void }) {
  return (
    <View className="flex-row items-center justify-between px-6 mb-6">
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Image
          source={require('../../../assets/icon.png')}
          style={{ width: 40, height: 40, borderRadius: 10, marginRight: 8 }}
          contentFit="cover"
        />
        <Text style={{ fontSize: 22, fontWeight: '700', color: '#1A1A2E' }}>
          My<Text style={{ color: '#7C4DFF' }}>SubList</Text>
        </Text>
      </View>
      <TouchableOpacity
        onPress={onAdd}
        className="w-10 h-10 rounded-full bg-[#7C4DFF] items-center justify-center"
        style={{ shadowColor: '#7C4DFF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 }}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  )
}
