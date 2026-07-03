import { useEffect } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'

/** Number that springs to its new value instead of snapping. */
export function AnimatedNumber({
  value,
  decimals = 2,
  className,
}: {
  value: number
  decimals?: number
  className?: string
}) {
  const spring = useSpring(value, { stiffness: 140, damping: 24 })
  useEffect(() => {
    spring.set(value)
  }, [value, spring])
  const text = useTransform(spring, (v) =>
    v.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }),
  )
  return <motion.span className={className}>{text}</motion.span>
}
