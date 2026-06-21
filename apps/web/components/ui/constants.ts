export const easeOvershootClassName =
  "ease-[linear(0,0.49_7.4%,0.864_15.3%,1.005_19.4%,1.12_23.7%,1.206_28.1%,1.267_32.8%,1.296_36.4%,1.311_40.2%,1.313_44.2%,1.301_48.6%,1.252_56.9%,1.105_74.4%,1.048_82.5%,1.011_91.1%,1)]"
export const easeOvershootGSAP =
  "M0,0 L0.074,0.49 L0.153,0.864 L0.194,1.005 L0.237,1.12 L0.281,1.206 L0.328,1.267 L0.364,1.296 L0.402,1.311 L0.442,1.313 L0.486,1.301 L0.569,1.252 L0.744,1.105 L0.825,1.048 L0.911,1.011 L1,1"

export const easeBezierClassName = "ease-[cubic-bezier(0.32,0,0.67,0)]"
export const easeBezierGSAP = "M0,0 C0.32,0 0.67,0 1,1"

export const m3ExpressiveSpring = {
  spatial: {
    fast: {
      className: "ease-spring-spatial-fast",
      gsap: "m3SpringSpatialFast",
    },
    default: {
      className: "ease-spring-spatial-default",
      gsap: "m3SpringSpatialDefault",
    },
    slow: {
      className: "ease-spring-spatial-slow",
      gsap: "m3SpringSpatialSlow",
    },
  },
  effect: {
    fast: {
      className: "ease-spring-effect-fast",
      gsap: "m3SpringEffectFast",
    },
    default: {
      className: "ease-spring-effect-default",
      gsap: "m3SpringEffectDefault",
    },
    slow: {
      className: "ease-spring-effect-slow",
      gsap: "m3SpringEffectSlow",
    },
  },
} as const

export const m3ExpressiveDuration = {
  spatial: {
    fast: {
      className: "duration-(--m3-duration-spatial-fast)",
      seconds: 0.28,
    },
    default: {
      className: "duration-(--m3-duration-spatial-default)",
      seconds: 0.45,
    },
    slow: {
      className: "duration-(--m3-duration-spatial-slow)",
      seconds: 0.65,
    },
  },
  effect: {
    fast: {
      className: "duration-(--m3-duration-effect-fast)",
      seconds: 0.12,
    },
    default: {
      className: "duration-(--m3-duration-effect-default)",
      seconds: 0.18,
    },
    slow: {
      className: "duration-(--m3-duration-effect-slow)",
      seconds: 0.26,
    },
  },
} as const

export type M3SpringKind = keyof typeof m3ExpressiveSpring
export type M3SpringSpeed = keyof typeof m3ExpressiveSpring.spatial
