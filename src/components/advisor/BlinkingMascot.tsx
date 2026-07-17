import { useEffect, useState } from 'react'
import { Image } from 'expo-image'

// Same 60x60 tight crops, aligned so only the eyes change between frames.
const eyesOpen = require('../../../assets/ai-screen/mascot-open-tight.png')
const eyesClosed = require('../../../assets/ai-screen/ai-mascot-tight.png')

interface Props {
  size: number
}

/**
 * Mascot that idles with eyes open and briefly closes them on a loop to
 * simulate a natural blink. Swap is instant (a blink is fast, not a fade).
 */
export default function BlinkingMascot({ size }: Props) {
  const [blinking, setBlinking] = useState(false)

  useEffect(() => {
    let blinkTimeout: ReturnType<typeof setTimeout>
    const interval = setInterval(() => {
      setBlinking(true)
      blinkTimeout = setTimeout(() => setBlinking(false), 140)
    }, 3200)
    return () => {
      clearInterval(interval)
      clearTimeout(blinkTimeout)
    }
  }, [])

  return (
    <Image
      source={blinking ? eyesClosed : eyesOpen}
      style={{ width: size, height: size }}
      contentFit="contain"
    />
  )
}
