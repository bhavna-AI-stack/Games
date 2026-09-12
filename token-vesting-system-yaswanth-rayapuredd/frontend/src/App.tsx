import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import CreateVesting from './pages/CreateVesting';
import MyVestings from './pages/MyVestings';
import VestingDetails from './pages/VestingDetails';
import AdminPanel from './pages/AdminPanel';
import NotFound from './pages/NotFound';

/**
 * Root application component.
 * Defines all client-side routes wrapped in the shared Layout.
 *
 * Routes:
 *  /             → Dashboard
 *  /create       → Create Vesting
 *  /my-vestings  → My Vestings (beneficiary view)
 *  /vesting/:id  → Vesting Details
 *  /admin        → Admin Panel (owner only)
 *  *             → 404 Not Found
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="create" element={<CreateVesting />} />
          <Route path="my-vestings" element={<MyVestings />} />
          <Route path="vesting/:id" element={<VestingDetails />} />
          <Route path="admin" element={<AdminPanel />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
