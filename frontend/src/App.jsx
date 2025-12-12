import { Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import Dashboard from "./pages/Dashboard";
import Rooms from "./pages/Rooms";
import Bookings from "./pages/Bookings";
import Guests from "./pages/Guests";
import Invoices from "./pages/Invoices";
import Maintenance from "./pages/Maintenance";

function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/rooms" element={<Rooms />} />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/guests" element={<Guests />} />
        <Route path="/invoices" element={<Invoices />} />
        <Route path="/maintenance" element={<Maintenance />} />
      </Routes>
    </AppLayout>
  );
}

export default App;

