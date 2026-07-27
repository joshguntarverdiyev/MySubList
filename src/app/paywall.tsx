import { useCallback, useEffect, useState } from 'react'
import { View, ScrollView, TouchableOpacity, Alert } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import Purchases, { type PurchasesOffering } from 'react-native-purchases'
import { useProfileStore } from '@/store/profileStore'
import HeroSection from '@/components/paywall/HeroSection'
import FeatureRow from '@/components/paywall/FeatureRow'
import PaywallPlans from '@/components/paywall/PaywallPlans'
import OffersUnavailable from '@/components/paywall/OffersUnavailable'

const ENTITLEMENT = 'MySubList Pro'
const FEATURES = [
  { title: 'Unlimited Subscriptions', subtitle: 'Free plan is limited to 5' },
  { title: '50 AI Advisor Messages / Day', subtitle: 'Free plan is limited to 5 messages per day' },
  { title: 'Multi-Currency Support', subtitle: 'Track and convert spending in any currency' },
]

export default function PaywallScreen() {
  const insets = useSafeAreaInsets()
  const setPremium = useProfileStore((s) => s.setPremium)

  const [offering, setOffering] = useState<PurchasesOffering | null>(null)
  const [loadingOffer, setLoadingOffer] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly')
  const [purchasing, setPurchasing] = useState(false)

  const loadOffering = useCallback(async () => {
    setLoadingOffer(true)
    try {
      const offerings = await Purchases.getOfferings()
      setOffering(offerings.current ?? null)
    } catch (e) {
      if (__DEV__) console.log('Offerings error:', e)
      setOffering(null)
    } finally {
      setLoadingOffer(false)
    }
  }, [])

  useEffect(() => {
    loadOffering()
  }, [loadOffering])

  // Prices come only from the real RevenueCat offering — never hardcoded, so a
  // non-EUR storefront never sees euro amounts. If offerings fail to load we
  // render a retry state (offersUnavailable) instead of fake prices.
  const monthlyPrice = offering?.monthly?.product.priceString ?? ''
  const yearlyPrice = offering?.annual?.product.priceString ?? ''
  const offersUnavailable = !loadingOffer && !offering

  // Both plans are marketed with a 7-day trial (also being added to the Yearly
  // product in App Store Connect), so the trial UI is shown on both. Use the
  // store's real trial length when available, otherwise fall back to 7 days.
  const UNIT_DAYS: Record<string, number> = { DAY: 1, WEEK: 7, MONTH: 30, YEAR: 365 }
  const selectedPkg = selectedPlan === 'yearly' ? offering?.annual : offering?.monthly
  const intro = selectedPkg?.product.introPrice
  const hasTrial = true
  const trialDays =
    intro && intro.price === 0 ? intro.periodNumberOfUnits * (UNIT_DAYS[intro.periodUnit] ?? 1) : 7

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

        {offersUnavailable ? (
          <OffersUnavailable onRetry={loadOffering} onRestore={handleRestore} />
        ) : (
          <PaywallPlans
            monthlyPrice={monthlyPrice}
            yearlyPrice={yearlyPrice}
            selectedPlan={selectedPlan}
            onSelectPlan={setSelectedPlan}
            loadingOffer={loadingOffer}
            hasTrial={hasTrial}
            trialDays={trialDays}
            purchasing={purchasing}
            onSubscribe={handleSubscribe}
            onRestore={handleRestore}
          />
        )}
      </ScrollView>
    </View>
  )
}
