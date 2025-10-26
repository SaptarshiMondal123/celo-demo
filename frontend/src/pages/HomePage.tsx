import HeroSection from '../components/HeroSection';
import AboutEchoDAO from '../components/AboutEchoDAO';
import Features from '../components/Features';
import Funding from '../components/Funding';
import Showcase from '../components/Showcase';
import CursorSplash from '../components/CursorSplash';

const HomePage = () => {
  return (
    <div className="cursor-none">
      <CursorSplash />
      <HeroSection />
      <AboutEchoDAO />
      <Features />
      <Funding />
      <Showcase />
    </div>
  );
};

export default HomePage;
