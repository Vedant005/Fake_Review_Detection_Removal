import { Routes, Route } from "react-router-dom";
import Home from "./pages/HomePage";
import ProductPage from "./pages/ProductPage";
import SingleProduct from "./pages/SingleProductPage";
import AdminDashboard from "./pages/AdminDashboard";
import AnalyzeReviews from "./pages/AnalyseReview";
import SeeReviews from "./pages/SeeReviews";
import Header from "./components/Header";
// import SingleProduct from "./pages/SingleProduct";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
// import Profile from "./pages/Profile";
// import AdminDashboard from "./pages/AdminDashboard";

export default function App(){
  return (
    <>
       <Header />
    <Routes>
      <Route path="/" element={<Home/>}/>
      <Route path="/products" element={<ProductPage/>}/>
       <Route path="/product/:productId" element={<SingleProduct/>}/>
       <Route path="/admin" element={<AdminDashboard />}>
          <Route path="reviews" element={<SeeReviews />} />
          <Route path="analyze" element={<AnalyzeReviews />} />
        </Route>
      <Route path="/signup" element={<Signup/>}/>
      <Route path="/login" element={<Login/>}/>
      {/* <Route path="/profile" element={<Profile/>}/> */}
      
    </Routes>
    </>
  );
}
