import { createBrowserRouter, Navigate } from "react-router";
import { RootLayout }      from "./RootLayout";
import { AuthLayout }      from "./AuthLayout";
import { AdminLayout }     from "./AdminLayout";
import { DashboardLayout } from "./DashboardLayout";

import { LandingPage }      from "./pages/LandingPage";
import { AuthPage }         from "./pages/AuthPage";
import { ShopPage }         from "./pages/ShopPage";
import { ProductPage }      from "./pages/ProductPage";
import { CartPage }         from "./pages/CartPage";
import { CheckoutPage }     from "./pages/CheckoutPage";
import { Orders }           from "./pages/Orders";
import { Profile }          from "./pages/Profile";
import { Categories }       from "./pages/Categories";
import { SellerStore }      from "./pages/SellerStore";
import { SellerDashboard }  from "./pages/SellerDashboard";
import { SellerProductEdit } from "./pages/SellerProductEdit";
import { SellerOnboarding } from "./pages/SellerOnboarding";
import { TrustCenterPage }  from "./pages/TrustCenterPage";
import { AllCategoriesPage} from "./pages/AllCategoriesPage";
import { ShopsPage }        from "./pages/ShopsPage";
import { WishlistPage }     from "./pages/WishlistPage";
import { AdminDashboard }   from "./pages/AdminDashboard";
import { AdminLogin }       from "./pages/AdminLogin";
import { AuthConfirm }      from "./pages/AuthConfirm";
import { ForgotPassword }   from "./pages/ForgotPassword";
import { ResetPassword }    from "./pages/ResetPassword";
import { SearchPage }       from "./pages/SearchPage";
import { TermsPage }        from "./pages/TermsPage";
import { PrivacyPage }      from "./pages/PrivacyPage";

export const router = createBrowserRouter([

  // ── Storefront — navbar + footer ──────────────────────────────────────────
  {
    path: '/',
    Component: RootLayout,
    children: [
      { index: true,            Component: LandingPage       },
      { path: 'shop',           Component: ShopPage          },
      { path: 'product/:id',    Component: ProductPage       },
      { path: 'cart',           Component: CartPage          },
      { path: 'checkout',       Component: CheckoutPage      },
      { path: 'orders',         Component: Orders            },
      { path: 'profile',        Component: Profile           },
      { path: 'categories',     Component: Categories        },
      { path: 'store/:id',      Component: SellerStore       },
      { path: 'trust-center',   Component: TrustCenterPage   },
      { path: 'all-categories', Component: AllCategoriesPage },
      { path: 'shops',          Component: ShopsPage         },
      { path: 'wishlist',       Component: WishlistPage      },
      { path: 'search',         Component: SearchPage        },
      { path: 'terms',          Component: TermsPage         },
      { path: 'privacy',        Component: PrivacyPage       },
      { path: '*',              Component: () => <Navigate to="/" replace /> },
    ],
  },

  // ── Seller pages — no storefront navbar (seller dashboard has its own) ────
  {
    path: '/',
    Component: DashboardLayout,
    children: [
      { path: 'seller-dashboard',            Component: SellerDashboard   },
      { path: 'seller/products/new',         Component: SellerProductEdit },
      { path: 'seller/products/:id/edit',    Component: SellerProductEdit },
      { path: 'seller-onboarding',           Component: SellerOnboarding  },
    ],
  },

  // ── Auth — no header, no footer ───────────────────────────────────────────
  {
    path: '/',
    Component: AuthLayout,
    children: [
      { path: 'login',           Component: AuthPage       },
      { path: 'signup',          Component: AuthPage       },
      { path: 'auth/confirm',    Component: AuthConfirm    },
      { path: 'admin/login',     Component: AdminLogin     },
      { path: 'forgot-password', Component: ForgotPassword },
      { path: 'reset-password',  Component: ResetPassword  },
    ],
  },

  // ── Admin — shared dashboard header ───────────────────────────────────────
  {
    path: '/',
    Component: AdminLayout,
    children: [
      { path: 'admin-dashboard', Component: AdminDashboard },
    ],
  },
]);
