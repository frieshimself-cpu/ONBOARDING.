import { Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { LandingPage } from '@/pages/LandingPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { DirectoryPage } from '@/features/directory/pages/DirectoryPage'
import { CreateProfilePage } from '@/features/profiles/pages/CreateProfilePage'
import { ProfilePage } from '@/features/profiles/pages/ProfilePage'
import { GuidesPage } from '@/features/guides/GuidesPage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/developers" element={<DirectoryPage userType="developer" />} />
        <Route path="/onboardees" element={<DirectoryPage userType="onboardee" />} />
        <Route path="/create" element={<CreateProfilePage />} />
        <Route path="/create/:type" element={<CreateProfilePage />} />
        <Route path="/p/:handle" element={<ProfilePage />} />
        <Route path="/guides" element={<GuidesPage />} />
        <Route path="/guides/:slug" element={<GuidesPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
