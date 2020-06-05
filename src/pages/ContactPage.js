import React from "react";
import Hero from "../components/Hero";
import contactImg from "../images/contactBcg.jpeg";
import Contact from "../components/contact/contact"

export default function ContactPage() {
    return (
        <>
            <Hero img={contactImg} />
            <Contact />
        </>
    );
}
