'use client';

import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import {
  Camera,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  FileText,
  MapPin,
  Plus,
  Shield,
  Sparkles,
  Tag,
  Truck,
  X,
} from 'lucide-react';
import styles from './CreateListing.module.scss';

/* ─── Types ─── */
type Condition = 'new' | 'like_new' | 'good' | 'used';

type ImagePreview = {
  id: string;
  url: string;
};

type FormData = {
  title: string;
  category: string;
  condition: Condition;
  description: string;
  images: ImagePreview[];
  pricePerDay: string;
  pricePerHour: string;
  depositAmount: string;
  noDeposit: boolean;
  deliveryAvailable: boolean;
  deliveryPrice: string;
  city: string;
  address: string;
  pickupWindow: string;
  minRentalDays: string;
};

/* ─── Constants ─── */
const CATEGORIES = [
  'Электроника',
  'Фото и видео',
  'Инструменты',
  'Для дома',
  'Спорт и отдых',
  'Детские товары',
  'Мероприятия',
];

const CONDITIONS: { value: Condition; label: string; desc: string }[] = [
  { value: 'new', label: 'Новый', desc: 'В оригинальной упаковке' },
  { value: 'like_new', label: 'Как новый', desc: 'Без следов износа' },
  { value: 'good', label: 'Хорошее', desc: 'Незначительные следы' },
  { value: 'used', label: 'Б/у', desc: 'Видимые следы использования' },
];

const CITIES_DB = [
  'Москва', 'Санкт-Петербург', 'Новосибирск', 'Екатеринбург', 'Казань',
  'Нижний Новгород', 'Челябинск', 'Самара', 'Омск', 'Ростов-на-Дону',
  'Уфа', 'Красноярск', 'Воронеж', 'Пермь', 'Волгоград', 'Краснодар',
  'Саратов', 'Тюмень', 'Тольятти', 'Ижевск', 'Барнаул', 'Ульяновск',
  'Иркутск', 'Хабаровск', 'Ярославль', 'Владивосток', 'Махачкала',
  'Томск', 'Оренбург', 'Кемерово', 'Новокузнецк', 'Рязань', 'Астрахань',
  'Набережные Челны', 'Пенза', 'Липецк', 'Тула', 'Киров', 'Чебоксары',
  'Калининград', 'Брянск', 'Курск', 'Иваново', 'Магнитогорск', 'Тверь',
  'Ставрополь', 'Белгород', 'Архангельск', 'Владимир', 'Сочи',
];

const PICKUP_OPTIONS = [
  'Круглосуточно',
  'С 8:00 до 20:00',
  'С 9:00 до 21:00',
  'С 10:00 до 22:00',
  'С 11:00 до 23:00',
  'С 8:00 до 18:00 (будни)',
  'Только по выходным',
  'По договорённости',
];

const STEPS = [
  { id: 'photos', label: 'Фотографии', Icon: Camera },
  { id: 'info', label: 'Описание', Icon: FileText },
  { id: 'pricing', label: 'Стоимость', Icon: Tag },
  { id: 'review', label: 'Публикация', Icon: Eye },
] as const;

const INITIAL: FormData = {
  title: '',
  category: '',
  condition: 'good',
  description: '',
  images: [],
  pricePerDay: '',
  pricePerHour: '',
  depositAmount: '',
  noDeposit: false,
  deliveryAvailable: false,
  deliveryPrice: '',
  city: 'Новосибирск',
  address: '',
  pickupWindow: '',
  minRentalDays: '1',
};

const MAX_IMAGES = 10;

/* ═══════════════════════════════════════════════════════════════════════════════
   CreateListing — 4-step wizard
   ═══════════════════════════════════════════════════════════════════════════════ */
export function CreateListing() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(INITIAL);
  const [published, setPublished] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const [cityOpen, setCityOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cityRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cityOpen) return;
    const handler = (e: MouseEvent) => {
      if (!cityRef.current?.contains(e.target as Node)) setCityOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [cityOpen]);

  /* ─── Helpers ─── */
  const patch = useCallback(
    (updates: Partial<FormData>) => setForm((prev) => ({ ...prev, ...updates })),
    [],
  );

  const addImages = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      const newImages: ImagePreview[] = Array.from(files)
        .filter((f) => f.type.startsWith('image/'))
        .slice(0, MAX_IMAGES - form.images.length)
        .map((f) => ({ id: crypto.randomUUID(), url: URL.createObjectURL(f) }));
      if (newImages.length) patch({ images: [...form.images, ...newImages] });
    },
    [form.images, patch],
  );

  const removeImage = useCallback(
    (id: string) => {
      const img = form.images.find((i) => i.id === id);
      if (img) URL.revokeObjectURL(img.url);
      patch({ images: form.images.filter((i) => i.id !== id) });
    },
    [form.images, patch],
  );

  const goNext = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      addImages(e.dataTransfer.files);
    },
    [addImages],
  );

  const handlePublish = () => setPublished(true);

  /* ─── Success screen ─── */
  if (published) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.card}>
            <div className={styles.successOverlay}>
              <div className={styles.successIcon}>
                <Check size={36} />
              </div>
              <h2 className={styles.successTitle}>Объявление создано!</h2>
              <p className={styles.successText}>
                Ваше объявление опубликовано и уже доступно в каталоге.
                Арендаторы смогут найти его по поиску.
              </p>
              <button
                type="button"
                className={styles.navNext}
                onClick={() => {
                  setPublished(false);
                  setStep(0);
                  setForm(INITIAL);
                }}
              >
                <Plus size={16} />
                Создать ещё
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ─── Main render ─── */
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.headerTitle}>Сдать в аренду</h1>
          <p className={styles.headerSubtitle}>
            Заполните информацию о вашей вещи — это займёт пару минут
          </p>
        </div>

        {/* Stepper */}
        <div className={styles.stepper}>
          {STEPS.map((s, i) => (
            <Fragment key={s.id}>
              {i > 0 && (
                <div
                  className={`${styles.stepConnector} ${i <= step ? styles.stepConnectorDone : ''}`}
                />
              )}
              <div
                className={`${styles.stepItem} ${
                  i === step
                    ? styles.stepItemActive
                    : i < step
                      ? styles.stepItemCompleted
                      : ''
                }`}
                onClick={() => i < step && setStep(i)}
              >
                {i < step ? <Check size={15} /> : <s.Icon size={15} />}
                <span>{s.label}</span>
              </div>
            </Fragment>
          ))}
        </div>

        {/* Step Content */}
        <div className={styles.card} key={step}>
          {step === 0 && StepPhotos()}
          {step === 1 && StepInfo()}
          {step === 2 && StepPricing()}
          {step === 3 && StepReview()}
        </div>

        {/* Navigation */}
        <div className={styles.nav}>
          {step > 0 ? (
            <button type="button" className={styles.navBack} onClick={goBack}>
              <ChevronLeft size={16} />
              Назад
            </button>
          ) : (
            <div className={styles.navSpacer} />
          )}

          {step < STEPS.length - 1 ? (
            <button type="button" className={styles.navNext} onClick={goNext}>
              Далее
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              className={`${styles.navNext} ${styles.publishBtn}`}
              onClick={handlePublish}
            >
              <Sparkles size={16} />
              Опубликовать
            </button>
          )}
        </div>
      </div>
    </div>
  );

  /* ═══ Step 0 — Фотографии ═══ */
  function StepPhotos() {
    return (
      <>
        <h2 className={styles.sectionTitle}>Фотографии</h2>
        <p className={styles.sectionSubtitle}>
          Добавьте до {MAX_IMAGES} фотографий. Первая станет обложкой объявления.
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            addImages(e.target.files);
            e.target.value = '';
          }}
        />

        {form.images.length === 0 ? (
          <div
            className={`${styles.uploadZone} ${dragging ? styles.uploadZoneDragging : ''}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
          >
            <div className={styles.uploadIcon}>
              <Camera size={24} />
            </div>
            <p className={styles.uploadText}>Нажмите или перетащите фото сюда</p>
            <p className={styles.uploadHint}>JPG, PNG или WEBP · до 10 МБ</p>
          </div>
        ) : (
          <div className={styles.imageGrid}>
            {form.images.map((img, i) => (
              <div key={img.id} className={styles.imageThumb}>
                <img src={img.url} alt={`Фото ${i + 1}`} />
                {i === 0 && <span className={styles.imageMainBadge}>Обложка</span>}
                <button
                  type="button"
                  className={styles.imageRemove}
                  onClick={() => removeImage(img.id)}
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            {form.images.length < MAX_IMAGES && (
              <button
                type="button"
                className={styles.addMoreBtn}
                onClick={() => fileInputRef.current?.click()}
              >
                <Plus size={20} />
                <span>Ещё</span>
              </button>
            )}
          </div>
        )}
      </>
    );
  }

  /* ═══ Step 1 — Описание ═══ */
  function StepInfo() {
    return (
      <>
        <h2 className={styles.sectionTitle}>Описание вещи</h2>
        <p className={styles.sectionSubtitle}>
          Подробное описание помогает арендаторам быстрее найти вашу вещь.
        </p>

        <div className={styles.fieldGroup}>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Название</label>
            <input
              className={styles.input}
              placeholder="Например: Canon EOS R5 с объективом 24-70mm"
              value={form.title}
              onChange={(e) => patch({ title: e.target.value })}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>Категория</label>
            <select
              className={styles.select}
              value={form.category}
              onChange={(e) => patch({ category: e.target.value })}
            >
              <option value="">Выберите категорию</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>Состояние</label>
            <div className={styles.conditionGrid}>
              {CONDITIONS.map((c) => (
                <div
                  key={c.value}
                  className={`${styles.conditionCard} ${
                    form.condition === c.value ? styles.conditionCardActive : ''
                  }`}
                  onClick={() => patch({ condition: c.value })}
                >
                  <span className={styles.conditionLabel}>{c.label}</span>
                  <span className={styles.conditionDesc}>{c.desc}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>Описание</label>
            <textarea
              className={styles.textarea}
              placeholder="Расскажите о вещи: что входит в комплект, особенности, правила использования..."
              value={form.description}
              onChange={(e) => patch({ description: e.target.value })}
              rows={5}
            />
          </div>

        </div>
      </>
    );
  }

  /* ═══ Step 2 — Стоимость и условия ═══ */
  function StepPricing() {
    return (
      <>
        <h2 className={styles.sectionTitle}>Стоимость и условия</h2>
        <p className={styles.sectionSubtitle}>
          Установите цены и условия аренды. Конкурентная цена повышает число заявок.
        </p>

        <div className={styles.fieldGroup}>
          {/* Prices */}
          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Цена за сутки</label>
              <div className={styles.inputWithPrefix}>
                <span className={styles.inputPrefix}>₽</span>
                <input
                  className={`${styles.input} ${styles.inputPrefixed}`}
                  type="number"
                  placeholder="500"
                  value={form.pricePerDay}
                  onChange={(e) => patch({ pricePerDay: e.target.value })}
                />
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Цена за час</label>
              <div className={styles.inputWithPrefix}>
                <span className={styles.inputPrefix}>₽</span>
                <input
                  className={`${styles.input} ${styles.inputPrefixed}`}
                  type="number"
                  placeholder="100"
                  value={form.pricePerHour}
                  onChange={(e) => patch({ pricePerHour: e.target.value })}
                />
              </div>
              <span className={styles.fieldHint}>Необязательно</span>
            </div>
          </div>

          {/* Deposit toggle */}
          <div
            className={`${styles.toggleRow} ${form.noDeposit ? styles.toggleRowActive : ''}`}
            onClick={() => patch({ noDeposit: !form.noDeposit, depositAmount: '' })}
          >
            <div className={styles.toggleInfo}>
              <span className={styles.toggleLabel}>
                <Shield size={14} />
                Без залога
              </span>
              <span className={styles.toggleHint}>Повышает привлекательность объявления</span>
            </div>
            <button
              type="button"
              className={`${styles.toggle} ${form.noDeposit ? styles.toggleOn : ''}`}
              onClick={(e) => { e.stopPropagation(); patch({ noDeposit: !form.noDeposit, depositAmount: '' }); }}
            />
          </div>

          {!form.noDeposit && (
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Сумма залога</label>
              <div className={styles.inputWithPrefix}>
                <span className={styles.inputPrefix}>₽</span>
                <input
                  className={`${styles.input} ${styles.inputPrefixed}`}
                  type="number"
                  placeholder="2000"
                  value={form.depositAmount}
                  onChange={(e) => patch({ depositAmount: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* Min rental */}
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Минимальный срок аренды</label>
            <select
              className={styles.select}
              value={form.minRentalDays}
              onChange={(e) => patch({ minRentalDays: e.target.value })}
            >
              <option value="1">1 день</option>
              <option value="2">2 дня</option>
              <option value="3">3 дня</option>
              <option value="7">1 неделя</option>
              <option value="30">1 месяц</option>
            </select>
          </div>

          {/* Delivery toggle */}
          <div
            className={`${styles.toggleRow} ${form.deliveryAvailable ? styles.toggleRowActive : ''}`}
            onClick={() => patch({ deliveryAvailable: !form.deliveryAvailable, deliveryPrice: '' })}
          >
            <div className={styles.toggleInfo}>
              <span className={styles.toggleLabel}>
                <Truck size={14} />
                Доставка
              </span>
              <span className={styles.toggleHint}>Предложите доставку арендаторам</span>
            </div>
            <button
              type="button"
              className={`${styles.toggle} ${form.deliveryAvailable ? styles.toggleOn : ''}`}
              onClick={(e) => { e.stopPropagation(); patch({ deliveryAvailable: !form.deliveryAvailable, deliveryPrice: '' }); }}
            />
          </div>

          {form.deliveryAvailable && (
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Стоимость доставки</label>
              <div className={styles.inputWithPrefix}>
                <span className={styles.inputPrefix}>₽</span>
                <input
                  className={`${styles.input} ${styles.inputPrefixed}`}
                  type="number"
                  placeholder="300"
                  value={form.deliveryPrice}
                  onChange={(e) => patch({ deliveryPrice: e.target.value })}
                />
              </div>
              <span className={styles.fieldHint}>Укажите 0 для бесплатной доставки</span>
            </div>
          )}

          {/* Location */}
          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Город</label>
              <div className={styles.cityPicker} ref={cityRef}>
                <button
                  type="button"
                  className={styles.cityTrigger}
                  onClick={() => { setCityOpen((o) => !o); setCitySearch(''); }}
                >
                  <MapPin size={14} />
                  <span>{form.city}</span>
                  <ChevronDown size={14} className={cityOpen ? styles.cityChevronOpen : styles.cityChevron} />
                </button>
                {cityOpen && (
                  <div className={styles.cityDropdown}>
                    <input
                      className={styles.citySearchInput}
                      placeholder="Поиск города..."
                      value={citySearch}
                      onChange={(e) => setCitySearch(e.target.value)}
                      autoFocus
                    />
                    <div className={styles.cityList}>
                      {CITIES_DB
                        .filter((c) => c.toLowerCase().includes(citySearch.toLowerCase()))
                        .map((c) => (
                          <button
                            key={c}
                            type="button"
                            className={`${styles.cityOption} ${form.city === c ? styles.cityOptionActive : ''}`}
                            onClick={() => { patch({ city: c }); setCityOpen(false); }}
                          >
                            {c}
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Район / адрес</label>
              <input
                className={styles.input}
                placeholder="Центральный район"
                value={form.address}
                onChange={(e) => patch({ address: e.target.value })}
              />
            </div>
          </div>

          {/* Pickup window */}
          <div className={styles.field}>
            <label className={styles.fieldLabel}>
              <Clock size={14} style={{ display: 'inline', verticalAlign: -2, marginRight: 4 }} />
              Время выдачи
            </label>
            <select
              className={styles.select}
              value={form.pickupWindow}
              onChange={(e) => patch({ pickupWindow: e.target.value })}
            >
              <option value="">Выберите время</option>
              {PICKUP_OPTIONS.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>
        </div>
      </>
    );
  }

  /* ═══ Step 3 — Обзор и публикация ═══ */
  function StepReview() {
    const conditionLabel =
      CONDITIONS.find((c) => c.value === form.condition)?.label ?? form.condition;

    const minDaysMap: Record<string, string> = {
      '1': '1 день',
      '2': '2 дня',
      '3': '3 дня',
      '7': '1 неделя',
      '30': '1 месяц',
    };
    const minDayLabel = minDaysMap[form.minRentalDays] ?? `${form.minRentalDays} дн.`;

    return (
      <>
        <h2 className={styles.sectionTitle}>Проверьте перед публикацией</h2>
        <p className={styles.sectionSubtitle}>
          Убедитесь, что всё заполнено верно. Вы сможете отредактировать объявление позже.
        </p>

        {/* Photos */}
        {form.images.length > 0 && (
          <div className={styles.reviewBlock}>
            <h3 className={styles.reviewBlockTitle}>Фотографии</h3>
            <div className={styles.reviewImages}>
              {form.images.map((img, i) => (
                <div key={img.id} className={styles.reviewImageThumb}>
                  <img src={img.url} alt={`Фото ${i + 1}`} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info */}
        <div className={styles.reviewBlock}>
          <h3 className={styles.reviewBlockTitle}>Описание</h3>
          <ReviewRow label="Название" value={form.title} />
          <ReviewRow label="Категория" value={form.category} />
          <ReviewRow label="Состояние" value={conditionLabel} />
        </div>

        {/* Pricing */}
        <div className={styles.reviewBlock}>
          <h3 className={styles.reviewBlockTitle}>Стоимость и условия</h3>
          <ReviewRow
            label="Цена за сутки"
            value={form.pricePerDay ? `${form.pricePerDay} ₽` : undefined}
          />
          {form.pricePerHour && (
            <ReviewRow label="Цена за час" value={`${form.pricePerHour} ₽`} />
          )}
          <ReviewRow
            label="Залог"
            value={
              form.noDeposit
                ? 'Без залога'
                : form.depositAmount
                  ? `${form.depositAmount} ₽`
                  : undefined
            }
          />
          <ReviewRow label="Мин. срок" value={minDayLabel} />
          <ReviewRow
            label="Доставка"
            value={
              form.deliveryAvailable
                ? form.deliveryPrice
                  ? `${form.deliveryPrice} ₽`
                  : 'Бесплатно'
                : 'Самовывоз'
            }
          />
        </div>

        {/* Location */}
        <div className={styles.reviewBlock}>
          <h3 className={styles.reviewBlockTitle}>Местоположение</h3>
          <ReviewRow label="Город" value={form.city} />
          {form.address && <ReviewRow label="Район" value={form.address} />}
          {form.pickupWindow && <ReviewRow label="Время выдачи" value={form.pickupWindow} />}
        </div>
      </>
    );
  }
}

/* ─── Tiny helper ─── */
function ReviewRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className={styles.reviewRow}>
      <span className={styles.reviewLabel}>{label}</span>
      <span className={styles.reviewValue}>{value || '—'}</span>
    </div>
  );
}
