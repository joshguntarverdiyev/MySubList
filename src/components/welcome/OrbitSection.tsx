import { Image } from 'expo-image';
import { useWindowDimensions, View } from 'react-native';

const shadow = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.18,
  shadowRadius: 13,
  elevation: 8,
} as const;

// Icons at 120px — centre-anchored to preserve ring positions
const ICONS = [
  { src: require('../../../assets/welcome-screen/spotify-3d.png'),  l: 138, t: 170, sz: 120, r: '1.19deg'  },
  { src: require('../../../assets/welcome-screen/calendar-3d.png'), l: 244, t: 210, sz: 120, r: '16.13deg' },
  { src: require('../../../assets/welcome-screen/netflix-3d.png'),  l: 264, t: 403, sz: 120, r: '0deg'     },
  { src: require('../../../assets/welcome-screen/ring.png'),        l: 229, t: 485, sz: 120, r: '16.52deg' },
  { src: require('../../../assets/welcome-screen/youtube-3d.png'),  l: 4,   t: 326, sz: 120, r: '0deg'     },
  { src: require('../../../assets/welcome-screen/card-3d.png'),     l: 0,   t: 443, sz: 120, r: '13.34deg' },
];

const CARDS = [
  { src: require('../../../assets/welcome-screen/all-subcription-container-3d.png'), l: 19,  t: 213, w: 194, h: 111, r: '-11.74deg' },
  { src: require('../../../assets/welcome-screen/montly-spend-container-3d.png'),    l: 238, t: 328, w: 144, h: 92,  r: '7.5deg'   },
  { src: require('../../../assets/welcome-screen/upcoming-payments-3d.png'),         l: 66,  t: 527, w: 218, h: 93,  r: '4.66deg'  },
];

// Outer ring centre: cx=194, cy=411 (top=231, R=180). Dots on circumference.
const DOTS = [[252, 238], [364, 360], [159, 584], [13, 441], [77, 267]];

export function OrbitSection() {
  // Art is authored on a 390×844 reference canvas. Scale by width as before, but
  // on short screens (SE ~667pt) also compress by height so the constellation
  // shrinks to fit between the title and the CTA instead of overlapping them.
  // hf = 1 and dx = 0 on any device ≥700pt tall, so this is a no-op there.
  const { width: W, height: H } = useWindowDimensions();
  const hf = H < 700 ? H / 844 : 1;
  const s = (W / 390) * hf;
  const dx = (W - 390 * s) / 2; // recenter horizontally after shrinking
  const sc = (v: number) => Math.round(v * s); // sizes + vertical (top)
  const sx = (v: number) => Math.round(v * s + dx); // horizontal (left)

  return (
    <>
      {/* Orbit rings — outer centre (194, 411) */}
      <View style={{ position: 'absolute', left: sx(14), top: sc(231), width: sc(360), height: sc(360), borderRadius: sc(180), borderWidth: 1,   borderColor: 'rgba(124,77,255,0.15)' }} />
      <View style={{ position: 'absolute', left: sx(64), top: sc(281), width: sc(260), height: sc(260), borderRadius: sc(130), borderWidth: 1.5, borderColor: 'rgba(124,77,255,0.28)' }} />

      {/* Center icon — 100px, centred on (194, 411) */}
      <Image
        source={require('../../../assets/welcome-screen/center-calendar-3d.png')}
        style={{ position: 'absolute', left: sx(144), top: sc(361), width: sc(100), height: sc(100) }}
        contentFit="contain"
      />

      {/* 6 orbit service icons at 2× size */}
      {ICONS.map(({ src, l, t, sz, r }, i) => (
        <View key={i} style={[shadow, { position: 'absolute', left: sx(l), top: sc(t), width: sc(sz), height: sc(sz), transform: [{ rotate: r }] }]}>
          <Image source={src} style={{ width: sc(sz), height: sc(sz) }} contentFit="contain" />
        </View>
      ))}

      {/* 3 floating info cards */}
      {CARDS.map(({ src, l, t, w, h, r }, i) => (
        <Image key={i} source={src} style={{ position: 'absolute', left: sx(l), top: sc(t), width: sc(w), height: sc(h), transform: [{ rotate: r }] }} contentFit="contain" />
      ))}

      {/* Decorative dots on outer ring circumference */}
      {DOTS.map(([l, t], i) => (
        <View key={i} style={{ position: 'absolute', left: sx(l), top: sc(t), width: 8, height: 8, borderRadius: 4, backgroundColor: '#7C4DFF', opacity: 0.45 }} />
      ))}
    </>
  );
}
