import { View, Text, TouchableOpacity, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'

interface DetailHeaderProps {
  onDelete: () => Promise<boolean>
}

export default function DetailHeader({ onDelete }: DetailHeaderProps) {
  const confirmDelete = () => {
    Alert.alert(
      'Delete subscription',
      'Are you sure you want to delete this subscription? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const ok = await onDelete()
            if (ok) router.replace('/(tabs)' as any)
            else Alert.alert('Error', 'Could not delete. Please try again.')
          },
        },
      ]
    )
  }

  const openMenu = () => {
    Alert.alert('Options', undefined, [
      { text: 'Edit', onPress: () => Alert.alert('Coming soon', 'Editing is coming in a future update.') },
      { text: 'Delete', style: 'destructive', onPress: confirmDelete },
      { text: 'Cancel', style: 'cancel' },
    ])
  }

  const circle = 'w-11 h-11 rounded-[18px] bg-white border border-[#EFE9FF] items-center justify-center'
  const shadow = { shadowColor: '#7C4DFF', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 4 }

  return (
    <View className="flex-row items-center justify-between px-6 mb-5">
      <TouchableOpacity onPress={() => router.back()} className={circle} style={shadow}>
        <Ionicons name="arrow-back" size={22} color="#7C4DFF" />
      </TouchableOpacity>
      <Text className="text-[22px] font-bold text-[#111827]">Subscription Details</Text>
      <TouchableOpacity onPress={openMenu} className={circle} style={shadow}>
        <Ionicons name="ellipsis-vertical" size={20} color="#7C4DFF" />
      </TouchableOpacity>
    </View>
  )
}
