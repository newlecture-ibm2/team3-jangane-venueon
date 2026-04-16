'use client';

import { useHome } from './useHome';
import HeroSection from './_components/HeroSection';
import EventListSection from './_components/EventListSection';

export default function Home() {
  const homeState = useHome();

  return (
    <div className="container-full">
      <HeroSection />
      <EventListSection {...homeState} />
    </div>
  );
}
