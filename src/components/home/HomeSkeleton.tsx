import { View } from 'react-native'

function Block({ className }: { className: string }) {
  return <View className={`bg-[#E4DCFA] rounded-xl ${className}`} />
}

export default function HomeSkeleton() {
  return (
    <View className="px-6">
      {/* Spend card */}
      <View className="bg-white rounded-[24px] p-6 mb-4">
        <Block className="w-32 h-4 mb-3" />
        <Block className="w-40 h-8 mb-5" />
        <View className="flex-row justify-between">
          <Block className="w-24 h-10" />
          <Block className="w-24 h-10" />
        </View>
      </View>

      {/* Savings card */}
      <Block className="w-full h-24 mb-6" />

      {/* Upcoming */}
      <Block className="w-40 h-5 mb-4" />
      <View className="flex-row mb-6">
        <Block className="w-36 h-24 mr-3" />
        <Block className="w-36 h-24" />
      </View>

      {/* List */}
      <Block className="w-40 h-5 mb-4" />
      <View className="bg-white rounded-[22px] p-4">
        {[0, 1, 2].map((i) => (
          <View key={i} className="flex-row items-center py-2">
            <Block className="w-[42px] h-[42px] mr-4" />
            <View className="flex-1">
              <Block className="w-32 h-4 mb-2" />
              <Block className="w-20 h-3" />
            </View>
            <Block className="w-14 h-4" />
          </View>
        ))}
      </View>
    </View>
  )
}
