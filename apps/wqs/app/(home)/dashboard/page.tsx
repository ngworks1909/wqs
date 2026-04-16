'use client'
import { useRef, useState, useEffect } from 'react'
import Dashboard from '@/components/dashboard/Dashboard'

export default function Page() {

  const scrollRef = useRef<HTMLDivElement>(null)
  const [showShadow, setShowShadow] = useState(true)

  const handleScroll = () => {
    const el = scrollRef.current
    if (!el) return

    const isAtBottom =
      el.scrollTop + el.clientHeight >= el.scrollHeight - 8

    setShowShadow(!isAtBottom)
  }

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    el.addEventListener('scroll', handleScroll)
    handleScroll()

    return () => el.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="relative h-[calc(100vh-5rem)] overflow-hidden">

      {/* Scrollable Content */}
      <div
        ref={scrollRef}
        className="h-full overflow-y-scroll scrollbar-custom"
      >
        <Dashboard />
      </div>

      {/* Bottom Fade Shadow */}
      <div
        className={`pointer-events-none absolute bottom-0 left-0 right-0 h-10
                    bg-linear-to-t 
                    from-neutral-900
                    via-neutral-900/80 
                    to-transparent
                    transition-opacity duration-300 ease-in-out
                    ${showShadow ? 'opacity-100' : 'opacity-0'}`}
      />

    </div>
  )
}