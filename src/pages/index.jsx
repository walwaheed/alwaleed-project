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
import PassportExpressLanding from "./PassportExpressLanding";
import ExecutiveHeadshotsLanding from "./ExecutiveHeadshotsLanding";

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

    // Standalone high-conversion B2C landing funnels (isolated from consumer layout)
    const isStandaloneB2CFunnel = 
        location.pathname.toLowerCase().startsWith('/express-passport') || 
        location.pathname.toLowerCase() === '/passport-express' ||
        location.pathname.toLowerCase().startsWith('/passport-express/') ||
        location.pathname.toLowerCase().startsWith('/executive-headshots') ||
        location.pathname.toLowerCase() === '/headshots' ||
        location.pathname.toLowerCase().startsWith('/headshots/');

    if (isStandaloneB2CFunnel) {
        return (
            <Routes>
                <Route path="/express-passport" element={<PassportExpressLanding />} />
                <Route path="/Express-Passport" element={<PassportExpressLanding />} />
                <Route path="/passport-express" element={<PassportExpressLanding />} />
                <Route path="/Passport-Express" element={<PassportExpressLanding />} />
                <Route path="/executive-headshots" element={<ExecutiveHeadshotsLanding />} />
                <Route path="/Executive-Headshots" element={<ExecutiveHeadshotsLanding />} />
                <Route path="/headshots" element={<ExecutiveHeadshotsLanding />} />
                <Route path="/Headshots" element={<ExecutiveHeadshotsLanding />} />
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

                {/* Direct routes inside layout fallback */}
                <Route path="/express-passport" element={<PassportExpressLanding />} />
                <Route path="/executive-headshots" element={<ExecutiveHeadshotsLanding />} />

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
