import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'

export const TodaySkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse" aria-label="Loading dashboard...">
      {/* Allowance Hero Skeleton */}
      <div className="h-44 bg-white border border-[#E6DFD2] rounded-[14px] p-6 flex flex-col justify-between">
        <div className="flex justify-between">
          <Skeleton className="h-6 w-32 bg-[#E6DFD2]/60" />
          <Skeleton className="h-6 w-20 bg-[#E6DFD2]/60" />
        </div>
        <Skeleton className="h-12 w-48 bg-[#E6DFD2]/70" />
        <Skeleton className="h-3 w-full bg-[#E6DFD2]/40 rounded-full" />
      </div>

      {/* 4 Stat Tiles Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-white border border-[#E6DFD2] rounded-[14px] p-4 flex flex-col justify-between">
            <Skeleton className="h-4 w-20 bg-[#E6DFD2]/60" />
            <Skeleton className="h-8 w-28 bg-[#E6DFD2]/70" />
            <Skeleton className="h-3 w-36 bg-[#E6DFD2]/40" />
          </div>
        ))}
      </div>

      {/* Runway Chart Skeleton */}
      <div className="h-64 bg-white border border-[#E6DFD2] rounded-[14px] p-6">
        <Skeleton className="h-6 w-44 mb-4 bg-[#E6DFD2]/60" />
        <Skeleton className="h-44 w-full bg-[#E6DFD2]/40 rounded-lg" />
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-56 bg-white border border-[#E6DFD2] rounded-[14px] p-5">
          <Skeleton className="h-5 w-32 mb-4 bg-[#E6DFD2]/60" />
          <div className="space-y-3">
            <Skeleton className="h-10 w-full bg-[#E6DFD2]/40" />
            <Skeleton className="h-10 w-full bg-[#E6DFD2]/40" />
          </div>
        </div>
        <div className="h-56 bg-white border border-[#E6DFD2] rounded-[14px] p-5">
          <Skeleton className="h-5 w-32 mb-4 bg-[#E6DFD2]/60" />
          <div className="space-y-3">
            <Skeleton className="h-10 w-full bg-[#E6DFD2]/40" />
            <Skeleton className="h-10 w-full bg-[#E6DFD2]/40" />
          </div>
        </div>
      </div>
    </div>
  )
}

export const LabSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" aria-label="Loading Decision Lab...">
      <div className="lg:col-span-7 space-y-5">
        <Skeleton className="h-10 w-64 bg-[#E6DFD2]/60" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} className="h-20 bg-white border border-[#E6DFD2] rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 bg-white border border-[#E6DFD2] rounded-[14px]" />
      </div>
      <div className="lg:col-span-5">
        <Skeleton className="h-96 bg-white border border-[#E6DFD2] rounded-[14px]" />
      </div>
    </div>
  )
}

export const PlanSkeleton: React.FC = () => {
  return (
    <div className="space-y-6" aria-label="Loading Plan...">
      <Skeleton className="h-10 w-48 bg-[#E6DFD2]/60" />
      <Skeleton className="h-10 w-96 bg-[#E6DFD2]/40 rounded-lg" />
      <div className="h-64 bg-white border border-[#E6DFD2] rounded-[14px] p-6">
        <Skeleton className="h-full w-full bg-[#E6DFD2]/30 rounded-lg" />
      </div>
    </div>
  )
}

export const ActivitySkeleton: React.FC = () => {
  return (
    <div className="space-y-6" aria-label="Loading Activity...">
      <Skeleton className="h-10 w-40 bg-[#E6DFD2]/60" />
      <Skeleton className="h-12 w-full bg-white border border-[#E6DFD2] rounded-[14px]" />
      <div className="h-80 bg-white border border-[#E6DFD2] rounded-[14px] p-4">
        <Skeleton className="h-full w-full bg-[#E6DFD2]/30 rounded-lg" />
      </div>
    </div>
  )
}

export const GenericPageSkeleton: React.FC = () => {
  return (
    <div className="space-y-6" aria-label="Loading page...">
      <Skeleton className="h-10 w-48 bg-[#E6DFD2]/60" />
      <div className="h-72 bg-white border border-[#E6DFD2] rounded-[14px] p-6">
        <Skeleton className="h-full w-full bg-[#E6DFD2]/30 rounded-lg" />
      </div>
    </div>
  )
}
