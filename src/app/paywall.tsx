import { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import Purchases, { type PurchasesOffering } from 'react-native-purchases'
import { useProfileStore } from '@/store/profileStore'
import HeroSection from '@/components/paywall/HeroSection'
import FeatureRow from '@/components/paywall/FeatureRow'
import PlanCard from '@/components/paywall/PlanCard'

const ENTITLEMENT = 'MySubList Pro'
const FEATURES = [
  { title: 'Unlimited Subscriptions', subtitle: 'Free plan is limited to 5' },
  { title: 'Unlimited AI Advisor Messages', subtitle: 'Free plan is limited to 5 messages per day' },
  { title: 'Multi-Currency Support', subtitle: 'Track and convert spending in any currency' },
]

export default function PaywallScreen() {
  const insets = useSafeAreaInsets()
  const setPremium = useProfileStore((s) => s.setPremium)

  const [offering, setOffering] = useState<PurchasesOffering | null>(null)
  const [loadingOffer, setLoadingOffer] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly')
  const [purchasing, setPurchasing] = useState(false)

  useEffect(() => {
    const loadOffering = async () => {
      try {
        const offerings = await Purchases.getOfferings()
        if (offerings.current) setOffering(offerings.current)
      } catch (e) {
        console.log('Offerings error:', e)
      } finally {
        setLoadingOffer(false)
      }
    }
    loadOffering()
  }, [])

  const monthlyPrice = offering?.monthly?.product.priceString ?? '€3.99'
  const yearlyPrice = offering?.annual?.product.priceString ?? '€29.99'

  const handleSubscribe = async () => {
    if (!offering) return
    setPurchasing(true)
    try {
      const pkg = selectedPlan === 'yearly' ? offering.annual : offering.monthly
      if (!pkg) throw new Error('Package not available')
      const { customerInfo } = await Purchases.purchasePackage(pkg)
      if (customerInfo.entitlements.active[ENTITLEMENT] !== undefined) {
        await setPremium(true)
        router.back()
      }
    } catch (e: any) {
      if (!e.userCancelled) Alert.alert('Purchase failed', e.message || 'Please try again.')
    } finally {
      setPurchasing(false)
    }
  }

  const handleRestore = async () => {
    setPurchasing(true)
    try {
      const customerInfo = await Purchases.restorePurchases()
      if (customerInfo.entitlements.active[ENTITLEMENT] !== undefined) {
        await setPremium(true)
        Alert.alert('Restored!', 'Your premium access has been restored.')
        router.back()
      } else {
        Alert.alert('No purchases found', 'No active subscription found for this Apple ID.')
      }
    } catch (e: any) {
      Alert.alert('Restore failed', e.message || 'Please try again.')
    } finally {
      setPurchasing(false)
    }
  }

  return (
    <View className="flex-1 bg-white">
      <Pressable
        onPress={() => router.back()}
        hitSlop={8}
        style={{ position: 'absolute', top: insets.top + 8, left: 16, zIndex: 10 }}
      >
        <Ionicons name="close-outline" size={24} color="#6B7280" />
      </Pressable>

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 24 }} showsVerticalScrollIndicator={false}>
        <HeroSection topInset={insets.top} />

        <View className="mx-5 -mt-4 gap-y-4 rounded-2xl bg-white p-5" style={{ elevation: 3, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } }}>
          {FEATURES.map((f) => (
            <FeatureRow key={f.title} title={f.title} subtitle={f.subtitle} />
          ))}
        </View>

        <View className="mx-5 mt-5 flex-row gap-x-3">
          <PlanCard
            label="Monthly" priceString={monthlyPrice} period="per month"
            selected={selectedPlan === 'monthly'} onPress={() => setSelectedPlan('monthly')}
            loading={loadingOffer}
          />
          <PlanCard
            label="Yearly" priceString={yearlyPrice} period="per year" savings="Save 37%"
            selected={selectedPlan === 'yearly'} onPress={() => setSelectedPlan('yearly')}
            bestValue loading={loadingOffer}
          />
        </View>

        <View className="mt-4 items-center">
          <View className="flex-row items-center gap-x-1.5">
            <Ionicons name="gift-outline" size={16} color="#6C47D9" />
            <Text className="text-[14px] font-bold text-[#6C47D9]">Start your 7-day free trial</Text>
          </View>
          <Text className="mt-0.5 text-[12px] text-[#6B7280]">Cancel anytime</Text>
        </View>

        <TouchableOpacity
          onPress={handleSubscribe}
          disabled={purchasing}
          activeOpacity={0.85}
          className="mx-5 mt-5 h-14 items-center justify-center rounded-xl bg-[#6C47D9]"
          style={{ opacity: purchasing ? 0.6 : 1 }}
        >
          {purchasing ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-[16px] font-bold text-white">Start Free Trial</Text>
          )}
        </TouchableOpacity>

        <Text onPress={handleRestore} className="mt-4 text-center text-[14px] text-[#6B7280]">
          Restore Purchases
        </Text>
        <Text className="mx-8 mt-3 text-center text-[11px] text-[#9CA3AF]">
          Recurring billing. Cancel anytime in App Store settings. Payment charged to your Apple ID.
        </Text>
      </ScrollView>
    </View>
  )
}
