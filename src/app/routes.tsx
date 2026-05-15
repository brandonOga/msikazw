import { createBrowserRouter, Navigate } from "react-router";
import { RootLayout } from "./RootLayout";
import { LandingPage } from "./pages/LandingPage";
import { AuthPage } from "./pages/AuthPage";
import { ShopPage } from "./pages/ShopPage";
import { ProductPage } from "./pages/ProductPage";
import { CartPage } from "./pages/CartPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { Orders } from "./pages/Orders";
import { Profile } from "./pages/Profile";
import { Categories } from "./pages/Categories";
import { SellerStore } from "./pages/SellerStore";
import { SellerDashboard } from "./pages/SellerDashboard";
import { TrustCenterPage } from "./pages/TrustCenterPage";
import { AllCategoriesPage } from "./pages/AllCategoriesPage";
import { SellerOnboarding } from "./pages/SellerOnboarding";
import { ShopsPage } from "./pages/ShopsPage";
import { WishlistPage } from "./pages/WishlistPage";
import { AdminDashboard } from "./pages/AdminDashboard";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: LandingPage },
      { path: "login", Component: AuthPage },
      { path: "signup", Component: AuthPage },
      { path: "shop", Component: ShopPage },
      { path: "product/:id", Component: ProductPage },
      { path: "cart", Component: CartPage },
      { path: "checkout", Component: CheckoutPage },
      { path: "orders", Component: Orders },
      { path: "profile", Component: Profile },
      { path: "categories", Component: Categories },
      { path: "store/:id", Component: SellerStore },
      { path: "seller-dashboard", Component: SellerDashboard },
      { path: "seller-onboarding", Component: SellerOnboarding },
      { path: "admin-dashboard", Component: AdminDashboard },
      { path: "trust-center", Component: TrustCenterPage },
      { path: "all-categories", Component: AllCategoriesPage },
      { path: "shops", Component: ShopsPage },
      { path: "wishlist", Component: WishlistPage },
      { path: "*", Component: () => <Navigate to="/" replace /> },
    ],
  },
]);