"use client";

import { useEffect } from "react";

export default function LandingScrollbarStyle() {
  useEffect(() => {
    document.documentElement.classList.add("landing-scroll");
    document.body.classList.add("landing-scroll");

    return () => {
      document.documentElement.classList.remove("landing-scroll");
      document.body.classList.remove("landing-scroll");
    };
  }, []);

  return null;
}
