"use client"
import { gsap } from "gsap"
import { CustomEase } from "gsap/CustomEase"
import { useCallback, useEffect, useRef } from "react"
import {
  m3ExpressiveSpring,
  m3ExpressiveDuration,
  type M3SpringSpeed,
} from "@/components/ui/constants"

let registered = false

function registerM3GsapEases() {
  if (registered) return

  gsap.registerPlugin(CustomEase)

  CustomEase.create(
    "m3SpringSpatialFast",
    "M0,0 L0.042,0.144 L0.083,0.426 L0.125,0.734 L0.167,0.973 L0.208,1.101 L0.25,1.126 L0.292,1.086 L0.333,1.032 L0.375,0.994 L0.417,0.979 L0.458,0.982 L0.5,0.991 L1,1",
  )

  CustomEase.create(
    "m3SpringSpatialDefault",
    "M0,0 L0.042,0.068 L0.083,0.232 L0.125,0.438 L0.167,0.638 L0.208,0.802 L0.25,0.918 L0.292,0.988 L0.333,1.021 L0.375,1.028 L0.417,1.021 L0.458,1.011 L0.5,1.003 L0.583,0.999 L1,1",
  )

  CustomEase.create(
    "m3SpringSpatialSlow",
    "M0,0 L0.042,0.039 L0.083,0.143 L0.125,0.288 L0.167,0.451 L0.208,0.609 L0.25,0.746 L0.292,0.854 L0.333,0.932 L0.375,0.982 L0.417,1.009 L0.458,1.02 L0.5,1.021 L0.583,1.015 L0.667,1.007 L0.75,1.002 L1,1",
  )

  CustomEase.create(
    "m3SpringEffectFast",
    "M0,0 L0.042,0.284 L0.083,0.613 L0.125,0.817 L0.167,0.923 L0.208,0.971 L0.25,0.99 L0.292,0.997 L1,1",
  )

  CustomEase.create(
    "m3SpringEffectDefault",
    "M0,0 L0.042,0.159 L0.083,0.413 L0.125,0.638 L0.125,0.638 L0.167,0.797 L0.208,0.895 L0.25,0.95 L0.292,0.978 L0.333,0.991 L0.375,0.997 L1,1",
  )

  CustomEase.create(
    "m3SpringEffectSlow",
    "M0,0 L0.042,0.084 L0.083,0.244 L0.125,0.413 L0.167,0.565 L0.208,0.691 L0.25,0.789 L0.292,0.862 L0.333,0.913 L0.375,0.948 L0.417,0.97 L0.458,0.984 L0.5,0.992 L0.583,0.997 L1,1",
  )

  registered = true
}

type Target = gsap.TweenTarget

type SpatialVars = Omit<gsap.TweenVars, "ease" | "duration"> & {
  speed?: M3SpringSpeed
  duration?: number
  ease?: string
}

type EffectVars = Omit<gsap.TweenVars, "ease" | "duration"> & {
  speed?: M3SpringSpeed
  duration?: number
  ease?: string
}

export function useM3Motion() {
  const ctxRef = useRef<gsap.Context | null>(null)

  useEffect(() => {
    registerM3GsapEases()

    ctxRef.current = gsap.context(() => {})

    return () => {
      ctxRef.current?.revert()
      ctxRef.current = null
    }
  }, [])

  const spatial = useCallback((target: Target, vars: SpatialVars = {}) => {
    const { speed = "default", duration, ease, ...rest } = vars

    const springToken = m3ExpressiveSpring.spatial[speed]
    const durationToken = m3ExpressiveDuration.spatial[speed]

    return gsap.to(target, {
      ...rest,
      duration: duration ?? durationToken.seconds,
      ease: ease ?? springToken.gsap,
    })
  }, [])

  const effect = useCallback((target: Target, vars: EffectVars = {}) => {
    const { speed = "default", duration, ease, ...rest } = vars

    const springToken = m3ExpressiveSpring.effect[speed]
    const durationToken = m3ExpressiveDuration.effect[speed]

    return gsap.to(target, {
      ...rest,
      duration: duration ?? durationToken.seconds,
      ease: ease ?? springToken.gsap,
    })
  }, [])

  const set = useCallback((target: Target, vars: gsap.TweenVars) => {
    return gsap.set(target, vars)
  }, [])

  const timeline = useCallback((vars?: gsap.TimelineVars) => {
    return gsap.timeline(vars)
  }, [])

  return {
    spatial,
    effect,
    set,
    timeline,
  }
}
