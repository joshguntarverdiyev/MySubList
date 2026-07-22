import { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import Purchases, { type PurchasesOffering } from 'react-native-purchases'
import { useProfileStore } from '@/store/profileStore'
import HeroSection from '@/components/paywall/HeroSection'
import FeatureRow from '@/components/paywall/FeatureRow'
import PlanCard from '@/components/paywall/PlanCard'
import PaywallActions from '@/components/paywall/PaywallActions'

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

  // Only show the trial badge if the selected plan actually has a free intro
  // offer in the store — the monthly product has a 7-day trial, the yearly may
  // not. Reading it from RevenueCat keeps the UI honest whatever the store config.
  const UNIT_DAYS: Record<string, number> = { DAY: 1, WEEK: 7, MONTH: 30, YEAR: 365 }
  const selectedPkg = selectedPlan === 'yearly' ? offering?.annual : offering?.monthly
  const intro = selectedPkg?.product.introPrice
  const hasTrial = !!intro && intro.price === 0
  const trialDays = intro ? intro.periodNumberOfUnits * (UNIT_DAYS[intro.periodUnit] ?? 1) : 0

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
      <TouchableOpacity
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel="Close"
        className="absolute h-11 w-11 items-center justify-center rounded-[18px] border border-[#EFE9FF] bg-white"
        style={{
          top: insets.top + 8,
          right: 16,
          zIndex: 10,
          shadowColor: '#7C4DFF',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.1,
          shadowRadius: 20,
          elevation: 3,
        }}
      >
        <Ionicons name="close" size={22} color="#7C4DFF" />
      </TouchableOpacity>

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

        <PaywallActions
          hasTrial={hasTrial}
          trialDays={trialDays}
          purchasing={purchasing}
          onSubscribe={handleSubscribe}
          onRestore={handleRestore}
        />
      </ScrollView>
    </View>
  )
}
