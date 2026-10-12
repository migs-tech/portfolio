import { useEffect } from 'react';
import { Footer } from './components/layout/Footer';
import { Header } from './components/layout/Header';
import { ResumeViewer } from './components/resume/ResumeViewer';
import { Contact } from './components/sections/Contact';
import { Demos } from './components/sections/Demos';
import { Experience } from './components/sections/Experience';
import { Hero } from './components/sections/Hero';
import { JobFit } from './components/sections/JobFit';
import { Projects } from './components/sections/Projects';
import { Skills } from './components/sections/Skills';
import { CommandPalette } from './components/ui/CommandPalette';
import { CursorFollower } from './components/ui/CursorFollower';
import { ScrollTopButton } from './components/ui/ScrollTopButton';
import { usePointerEffects } from './hooks/usePointerEffects';
import { canTiltWithDevice, enableDeviceTilt, tiltNeedsPermission } from './lib/deviceTilt';

export default function App() {
  usePointerEffects();

  // Phone tilt starts by itself where no permission is needed (Android);
  // iPhones turn it on from the command palette.
  useEffect(() => {
    if (canTiltWithDevice() && !tiltNeedsPermission()) enableDeviceTilt();
  }, []);

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header />
      <main id="main" tabIndex={-1}>
        <Hero />
        <Projects />
        <Demos />
        <Experience />
        <Skills />
        <JobFit />
        <Contact />
      </main>
      <Footer />
      <ScrollTopButton />
      <ResumeViewer />
      <CommandPalette />
      <CursorFollower />
    </>
  );
}
