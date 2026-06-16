import type { CSSProperties } from 'react';
import { useTranslations } from 'next-intl';
import './LogoSlider.css';

type LogoItem = {
  src: string;
  alt: string;
  lightLogo?: boolean;
};

const clientLogos: LogoItem[] = [
  { src: '/images/clients/chutzlaaretz.svg?v=2', alt: 'Chutzlaaretz', lightLogo: true },
  { src: '/images/clients/getmedia.png', alt: 'GetMedia' },
  { src: '/images/clients/target-board.png', alt: 'Target Board' },
  { src: '/images/clients/everywatch.svg', alt: 'Everywatch' },
  { src: '/images/clients/elbit-systems.png', alt: 'Elbit Systems' },
  { src: '/images/clients/worklik-logo.svg', alt: 'Worklik' },
  { src: '/images/clients/colors-ai.png', alt: 'Colors AI' },
  { src: '/images/clients/bgu.png', alt: 'Ben Gurion University' },
  { src: '/images/clients/rashut-sdot-teufa.svg', alt: 'Israel Airports Authority' },
  { src: '/images/clients/kueez.svg', alt: 'Kueez' },
  { src: '/images/clients/skyit.png', alt: 'Skyit Group' },
];

const LogoList = ({ hidden = false }: { hidden?: boolean }) => (
  <ul className="logo-slider__list" role="list" aria-hidden={hidden}>
    {clientLogos.map((item) => (
      <li className="logo-slider__item" key={`${hidden ? 'copy' : 'main'}-${item.alt}`} role="listitem">
        <img
          src={item.src}
          alt={item.alt}
          loading="lazy"
          decoding="async"
          data-light-logo={item.lightLogo ? 'true' : undefined}
        />
      </li>
    ))}
  </ul>
);

export const LogoSlider = () => {
  const t = useTranslations('clients');

  return (
    <section className="bg-background py-16 md:py-24">
      <div className="container mx-auto px-6 text-center">
        <p className="mb-12 font-mono text-sm uppercase tracking-widest text-muted-foreground">
          {t('subtitle')}
        </p>
        <div className="dir-ltr">
          <div
            className="logo-slider logo-slider--auto logo-slider--fade logo-slider--scale-hover"
            role="region"
            aria-label={t('title')}
            style={{
              '--logo-slider-gap': '64px',
              '--logo-slider-logo-height': '36px',
            } as CSSProperties}
          >
            <div className="logo-slider__track">
              <LogoList />
              <LogoList hidden />
              <LogoList hidden />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LogoSlider;
