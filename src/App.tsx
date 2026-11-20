import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { Services } from './components/Services';
import { Domains } from './components/Domains';
import { Process } from './components/Process';
import { Why } from './components/Why';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import { useRevealOnScroll } from './hooks';

export default function App() {
  useRevealOnScroll();
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header />
      <main id="main">
        <Hero />
        <About />
        <Services />
        <Domains />
        <Process />
        <Why />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
