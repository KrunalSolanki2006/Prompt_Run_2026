import React, { Suspense, lazy } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router'
import { Landing } from '@/pages/Landing'
import { NotFound } from '@/pages/NotFound'
import { AuthGate } from './AuthGate'
import {
  TodaySkeleton,
  LabSkeleton,
  PlanSkeleton,
  ActivitySkeleton,
  GenericPageSkeleton,
} from '@/components/SkeletonLayouts'

// Lazy loaded auth pages
const SignIn = lazy(() => import('@/pages/SignIn'))
const SignUp = lazy(() => import('@/pages/SignUp'))

// Lazy loaded app cockpit pages
const AppShell = lazy(() => import('@/pages/app/AppShell'))
const Today = lazy(() => import('@/pages/app/Today'))
const Setup = lazy(() => import('@/pages/app/Setup'))
const Lab = lazy(() => import('@/pages/app/Lab'))
const Plan = lazy(() => import('@/pages/app/Plan'))
const Activity = lazy(() => import('@/pages/app/Activity'))
const Insights = lazy(() => import('@/pages/app/Insights'))
const Settings = lazy(() => import('@/pages/app/Settings'))

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Landing />,
  },
  {
    path: '/sign-in',
    element: (
      <Suspense fallback={<GenericPageSkeleton />}>
        <SignIn />
      </Suspense>
    ),
  },
  {
    path: '/sign-up',
    element: (
      <Suspense fallback={<GenericPageSkeleton />}>
        <SignUp />
      </Suspense>
    ),
  },
  {
    path: '/app',
    element: (
      <AuthGate>
        <Suspense fallback={<GenericPageSkeleton />}>
          <AppShell />
        </Suspense>
      </AuthGate>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<TodaySkeleton />}>
            <Today />
          </Suspense>
        ),
      },
      {
        path: 'setup',
        element: (
          <Suspense fallback={<GenericPageSkeleton />}>
            <Setup />
          </Suspense>
        ),
      },
      {
        path: 'lab',
        element: (
          <Suspense fallback={<LabSkeleton />}>
            <Lab />
          </Suspense>
        ),
      },
      {
        path: 'plan',
        element: (
          <Suspense fallback={<PlanSkeleton />}>
            <Plan />
          </Suspense>
        ),
      },
      {
        path: 'activity',
        element: (
          <Suspense fallback={<ActivitySkeleton />}>
            <Activity />
          </Suspense>
        ),
      },
      {
        path: 'insights',
        element: (
          <Suspense fallback={<GenericPageSkeleton />}>
            <Insights />
          </Suspense>
        ),
      },
      {
        path: 'settings',
        element: (
          <Suspense fallback={<GenericPageSkeleton />}>
            <Settings />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
])

export const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />
}
