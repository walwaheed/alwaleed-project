import Layout from "./Layout.jsx";

import Home from "./Home";

import EditPhoto from "./EditPhoto";

import Gallery from "./Gallery";

import Cart from "./Cart";

import Profile from "./Profile";

import Privacy from "./Privacy";

import Returns from "./Returns";

import About from "./About";

import Pricing from "./Pricing";

import PrintProducts from "./PrintProducts";

import TestSetup from "./TestSetup";

import Login from "./Login";

import PaymentStatus from "./PaymentStatus";
import Admin from "./Admin";
import IndustrialGrowthLandingPage from "./IndustrialGrowthLandingPage";

import ProtectedRoute from "@/components/ProtectedRoute";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {

    Home: Home,

    EditPhoto: EditPhoto,

    Gallery: Gallery,

    Cart: Cart,

    Profile: Profile,

    Privacy: Privacy,

    Returns: Returns,

    About: About,

    Pricing: Pricing,

    PrintProducts: PrintProducts,

    TestSetup: TestSetup,

    Login: Login,

    PaymentStatus: PaymentStatus,

}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);

    // Standalone executive B2B landing pages (isolated from consumer layout)
    const isStandaloneExecutivePage = 
        location.pathname.toLowerCase().startsWith('/industrial-growth') || 
        location.pathname.toLowerCase() === '/audit' ||
        location.pathname.toLowerCase() === '/industrialgrowth';

    if (isStandaloneExecutivePage) {
        return (
            <Routes>
                <Route path="/industrial-growth" element={<IndustrialGrowthLandingPage />} />
                <Route path="/IndustrialGrowth" element={<IndustrialGrowthLandingPage />} />
                <Route path="/audit" element={<IndustrialGrowthLandingPage />} />
            </Routes>
        );
    }

    return (
        <Layout currentPageName={currentPage}>
            <Routes>

                <Route path="/" element={<Home />} />

                <Route path="/Home" element={<Home />} />

                <Route path="/Login" element={<Login />} />

                <Route path="/Privacy" element={<Privacy />} />

                <Route path="/Returns" element={<Returns />} />

                <Route path="/About" element={<About />} />

                <Route path="/Pricing" element={<Pricing />} />

                {/* Protected Routes */}
                <Route path="/EditPhoto" element={<ProtectedRoute><EditPhoto /></ProtectedRoute>} />
                <Route path="/passport-photo" element={<ProtectedRoute><EditPhoto initialTool="visa-photo" /></ProtectedRoute>} />

                <Route path="/Gallery" element={<ProtectedRoute><Gallery /></ProtectedRoute>} />

                <Route path="/Cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />

                <Route path="/Profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

                <Route path="/PrintProducts" element={<ProtectedRoute><PrintProducts /></ProtectedRoute>} />

                <Route path="/TestSetup" element={<ProtectedRoute><TestSetup /></ProtectedRoute>} />

                <Route path="/payment-status" element={<PaymentStatus />} />
                <Route path="/Admin" element={<Admin />} />
                <Route path="/industrial-growth" element={<IndustrialGrowthLandingPage />} />
                <Route path="/IndustrialGrowth" element={<IndustrialGrowthLandingPage />} />
                <Route path="/audit" element={<IndustrialGrowthLandingPage />} />

            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}
