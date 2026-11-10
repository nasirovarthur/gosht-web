'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPause, faPlay } from '@fortawesome/free-solid-svg-icons';
import { useLanguage } from '@/context/LanguageContext';
import styles from './HomeMenuMarquee.module.css';

const titles = { ru: 'МЕНЮ РЕСТОРАНА', en: 'RESTAURANT MENU', uz: 'RESTORAN MENYUSI' };
const controls = {
  ru: { pause: 'Остановить бегущую строку', play: 'Продолжить бегущую строку' },
  en: { pause: 'Pause scrolling text', play: 'Resume scrolling text' },
  uz: { pause: "Yuguruvchi matnni to'xtatish", play: 'Yuguruvchi matnni davom ettirish' },
};

export default function HomeMenuMarquee() {
  const { lang } = useLanguage();
  const [paused, setPaused] = useState(false);
  const displayText = titles[lang];
  const label = paused ? controls[lang].play : controls[lang].pause;

  return <div className={styles.line} data-paused={paused}>
    <h2 id="home-menu-title" className="sr-only">{displayText}</h2>
    <div className={styles.viewport} aria-hidden="true">
      {[0, 1].map(lane => <div className={`animate-infinite-scroll ${styles.lane}`} key={lane}>
        {[0, 1, 2, 3].map(item => <div className={styles.item} key={item}>
          <span className={`text-marquee ${styles.text}`}>{displayText}</span>
          <svg className={styles.separator} viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
            <path d="M6 0L7.5 4.5L12 6L7.5 7.5L6 12L4.5 7.5L0 6L4.5 4.5L6 0Z" />
          </svg>
        </div>)}
      </div>)}
    </div>
    <button type="button" className={styles.pause} onClick={() => setPaused(value => !value)} aria-label={label} title={label}>
      <FontAwesomeIcon icon={paused ? faPlay : faPause} />
    </button>
  </div>;
}
