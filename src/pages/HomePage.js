import React from "react";
import {ProductConsumer} from "../context/context";
import Hero from "../components/Hero";
import {Link} from "react-router-dom";
import Services from "../components/homepage/Services";
import Featured from "../components/homepage/Featured";

export default function HomePage() {
  return (
    <>
          <Hero title="awesome gadgets" max='true'>
                <Link to='/products' className='main-link' style={{margin:"2rem"}}>
                    our product
                </Link>
          </Hero>
        <Services/>
        <Featured/>
    </>
  );
}
