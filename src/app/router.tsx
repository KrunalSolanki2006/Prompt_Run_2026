import React, { Suspense, lazy } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router'
import { Landing } from '@/pages/Landing'
import { NotFound } from '@/pages/NotFound'
import { AuthGate } from './AuthGate'
import { ErrorBoundary } from '@/components/ErrorBoundary'
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
      <ErrorBoundary>
        <Suspense fallback={<GenericPageSkeleton />}>
          <SignIn />
        </Suspense>
      </ErrorBoundary>
    ),
  },
  {
    path: '/sign-up',
    element: (
      <ErrorBoundary>
        <Suspense fallback={<GenericPageSkeleton />}>
          <SignUp />
        </Suspense>
      </ErrorBoundary>
    ),
  },
  {
    path: '/app',
    element: (
      <ErrorBoundary>
        <AuthGate>
          <Suspense fallback={<GenericPageSkeleton />}>
            <AppShell />
          </Suspense>
        </AuthGate>
      </ErrorBoundary>
    ),
    children: [
      {
        index: true,
        element: (
          <ErrorBoundary>
            <Suspense fallback={<TodaySkeleton />}>
              <Today />
            </Suspense>
          </ErrorBoundary>
        ),
      },
      {
        path: 'setup',
        element: (
          <ErrorBoundary>
            <Suspense fallback={<GenericPageSkeleton />}>
              <Setup />
            </Suspense>
          </ErrorBoundary>
        ),
      },
      {
        path: 'lab',
        element: (
          <ErrorBoundary>
            <Suspense fallback={<LabSkeleton />}>
              <Lab />
            </Suspense>
          </ErrorBoundary>
        ),
      },
      {
        path: 'plan',
        element: (
          <ErrorBoundary>
            <Suspense fallback={<PlanSkeleton />}>
              <Plan />
            </Suspense>
          </ErrorBoundary>
        ),
      },
      {
        path: 'activity',
        element: (
          <ErrorBoundary>
            <Suspense fallback={<ActivitySkeleton />}>
              <Activity />
            </Suspense>
          </ErrorBoundary>
        ),
      },
      {
        path: 'insights',
        element: (
          <ErrorBoundary>
            <Suspense fallback={<GenericPageSkeleton />}>
              <Insights />
            </Suspense>
          </ErrorBoundary>
        ),
      },
      {
        path: 'settings',
        element: (
          <ErrorBoundary>
            <Suspense fallback={<GenericPageSkeleton />}>
              <Settings />
            </Suspense>
          </ErrorBoundary>
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
