import { View } from 'react-native'
import PlanCard from '@/components/paywall/PlanCard'
import PaywallActions from '@/components/paywall/PaywallActions'

interface Props {
  monthlyPrice: string
  yearlyPrice: string
  selectedPlan: 'monthly' | 'yearly'
  onSelectPlan: (plan: 'monthly' | 'yearly') => void
  loadingOffer: boolean
  hasTrial: boolean
  trialDays: number
  purchasing: boolean
  onSubscribe: () => void
  onRestore: () => void
}

/** Monthly/Yearly selector + subscribe/restore actions (shown once offerings load). */
export default function PaywallPlans({
  monthlyPrice, yearlyPrice, selectedPlan, onSelectPlan, loadingOffer,
  hasTrial, trialDays, purchasing, onSubscribe, onRestore,
}: Props) {
  return (
    <>
      <View className="mx-5 mt-5 flex-row gap-x-3">
        <PlanCard
          label="Monthly" priceString={monthlyPrice} period="per month"
          selected={selectedPlan === 'monthly'} onPress={() => onSelectPlan('monthly')}
          loading={loadingOffer}
        />
        <PlanCard
          label="Yearly" priceString={yearlyPrice} period="per year" savings="Save 37%"
          selected={selectedPlan === 'yearly'} onPress={() => onSelectPlan('yearly')}
          bestValue loading={loadingOffer}
        />
      </View>

      <PaywallActions
        hasTrial={hasTrial}
        trialDays={trialDays}
        priceString={selectedPlan === 'yearly' ? yearlyPrice : monthlyPrice}
        periodLabel={selectedPlan === 'yearly' ? 'year' : 'month'}
        purchasing={purchasing}
        onSubscribe={onSubscribe}
        onRestore={onRestore}
      />
    </>
  )
}
