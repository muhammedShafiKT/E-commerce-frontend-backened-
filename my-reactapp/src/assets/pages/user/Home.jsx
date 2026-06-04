import React from 'react'
import { Navbar } from './Navbar'
import Luxurybackground from './Luxurybackground'
import Maincomponent from './Maincomponent'
import Footer from './Footer';
import Maincomponent2 from './Maincomponent2'

const Home = () => {
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
