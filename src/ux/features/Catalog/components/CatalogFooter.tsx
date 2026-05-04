import Link from 'next/link';
import { Mail, MapPin, Phone } from 'lucide-react';
import { ROUTES } from '@/ux/utils';
import styles from '../Catalog.module.scss';

const FOOTER_NAV = {
  platform: {
    title: 'Платформа',
    links: [
      { label: 'Каталог', href: ROUTES.catalog },
      { label: 'Как это работает', href: ROUTES.howItWorks },
      { label: 'Цены и тарифы', href: ROUTES.pricing },
      { label: 'Для бизнеса', href: ROUTES.business },
    ],
  },
  support: {
    title: 'Поддержка',
    links: [
      { label: 'Центр помощи', href: ROUTES.help },
      { label: 'Безопасность', href: ROUTES.safety },
      { label: 'Условия сервиса', href: ROUTES.terms },
      { label: 'Политика конфиденциальности', href: ROUTES.privacy },
    ],
  },
  company: {
    title: 'Компания',
    links: [
      { label: 'О нас', href: ROUTES.about },
      { label: 'Блог', href: ROUTES.blog },
      { label: 'Карьера', href: ROUTES.careers },
      { label: 'Контакты', href: ROUTES.contacts },
    ],
  },
};

export function CatalogFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        {/* Top row: Brand + Nav columns */}
        <div className={styles.footerTop}>
          <div className={styles.footerBrandCol}>
            <div className={styles.footerBrand}>
              <div className={styles.footerLogo}>
                <span>А</span>
              </div>
              <div>
                <strong>Арендай</strong>
                <span>Шеринг-платформа</span>
              </div>
            </div>
            <p className={styles.footerAbout}>
              Аренда вещей от проверенных владельцев рядом с вами. 
              Инструменты, техника, спорт и всё для жизни — дешевле покупки, 
              безопаснее досок объявлений.
            </p>
            <div className={styles.footerContacts}>
              <a href="mailto:support@arendai.ru">
                <Mail size={14} />
                <span>support@arendai.ru</span>
              </a>
              <a href="tel:+78001234567">
                <Phone size={14} />
                <span>8 (800) 123-45-67</span>
              </a>
              <span className={styles.footerLocation}>
                <MapPin size={14} />
                <span>Новосибирск, Россия</span>
              </span>
            </div>
          </div>

          {Object.values(FOOTER_NAV).map((section) => (
            <nav key={section.title} className={styles.footerNavCol}>
              <h4>{section.title}</h4>
              <ul>
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Bottom row: Copyright + Legal */}
        <div className={styles.footerBottom}>
          <span className={styles.footerCopy}>
            &copy; {new Date().getFullYear()} Арендай. Все права защищены.
          </span>
          <div className={styles.footerLegal}>
            <Link href={ROUTES.terms}>Условия</Link>
            <Link href={ROUTES.privacy}>Конфиденциальность</Link>
            <Link href={ROUTES.cookies}>Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
