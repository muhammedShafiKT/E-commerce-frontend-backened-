import { Toaster } from 'react-hot-toast'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import Login from './assets/pages/user/login'
import Home from './assets/pages/user/home'
import Products from './assets/pages/user/Products'
import ProductUI from './assets/pages/user/ProductUI'
import Cart from './assets/pages/user/Cart'
import Wishlist from './assets/pages/user/Wishlist'
import Register from './assets/pages/user/Register'
import Orders from './assets/pages/user/Orders'
import Detailsandpayment from './assets/pages/user/Detailsandpayment'
import AdminRoute from './assets/pages/admin/Adminroute'
import AdminLayout from './assets/pages/admin/Adminlayouut'
import AdminProducts from './assets/pages/admin/AdminProducts'
import AdminDashboard from './assets/pages/admin/AdminDashboard'
import AdminOrders from './assets/pages/admin/AdminOrders'
import AdminUsers from './assets/pages/admin/AdminUsers'
import { ProfileEditor } from './assets/pages/user/EditUser'
// import AdminRegister from './assets/pages/admin/Adminregister'
import AdminLogin from './assets/pages/admin/AdminLogin'
import SuperAdminProtectedRoute from './assets/pages/superadmin/SuperAdminRoute'
import SuperAdminDashboard from './assets/pages/superadmin/SuperAdminDashboard'
import { AdminProfileEditor } from './assets/pages/admin/AdminProfileEditor'
import AdminCoupons from './assets/pages/admin/AdminCoupon'
import AdminOffers from './assets/pages/admin/AdminOffers'



function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#1a140e",
            backdropBlur: "10px",
            color: "#e6c89c",
            borderRadius: "2px",
            border: "1px solid rgba(200, 169, 126, 0.2)",
            fontSize: "11px",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            padding: "16px 24px",
            fontFamily: "serif",
          },
        }}
      />

      <Routes>

{/* <Route path="/" element={<RegisterPage />} />  */}
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/products" element={<Products />} />
        <Route path="/productsUI/:id" element={<ProductUI />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/detailsandpayment" element={<Detailsandpayment />} />
        <Route path='profile' element={<ProfileEditor />} />


        
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
           <Route path="users" element={<AdminUsers />} />
           <Route path="coupons" element={<AdminCoupons />} />
           <Route path="offers" element={<AdminOffers />} />
           <Route
  path="/admin/settings"
  element={<AdminProfileEditor/>}
/>

          </Route>
        </Route>
       {/* <Route path='/admin/register' element={<AdminRegister />} /> */}
<Route path='/admin/login' element={<AdminLogin />} />
<Route
  path="/superadmin/dashboard"
  element={
    <SuperAdminProtectedRoute>
      <SuperAdminDashboard />
    </SuperAdminProtectedRoute>
  }
/>

      </Routes>
    </BrowserRouter>
  );
}

export default App;