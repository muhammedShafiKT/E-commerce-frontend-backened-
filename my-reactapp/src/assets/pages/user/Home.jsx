import React, { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Navbar } from './Navbar'
import Luxurybackground from './Luxurybackground'
import Maincomponent from './Maincomponent'
import Footer from './Footer';
import Maincomponent2 from './Maincomponent2'

const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
  const role = searchParams.get("role");
  const id = searchParams.get("id");
  const accessToken = searchParams.get("accessToken");
  if (role && id) {
    localStorage.setItem("role", role);
    localStorage.setItem("userId", id);
    if (accessToken) localStorage.setItem("accessToken", accessToken);
    window.dispatchEvent(new Event("userLoggedIn"));
    setSearchParams({});
  }
}, []);

  return (
    <div className="relative h-screen text-white bg-black overflow-y-auto">
      <Luxurybackground />

      <div className="relative z-10">
        <Navbar />
        <Maincomponent />
        <Maincomponent2/>
        <Footer/>
      </div>
    </div>
  );
};

export default Home;