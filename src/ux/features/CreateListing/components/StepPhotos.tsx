'use client';

import { Camera, GripVertical, Plus, X } from 'lucide-react';
import type { ImagePreview } from '../types';
import styles from '../CreateListing.module.scss';

type StepPhotosProps = {
  images: ImagePreview[];
  dragging: boolean;
  dragOverId: string | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  dragSourceId: React.RefObject<string | null>;
  maxImages: number;
  onAddImages: (files: FileList | null) => void;
  onRemoveImage: (id: string) => void;
  onReorderImages: (fromId: string, toId: string) => void;
  onSetDragging: (v: boolean) => void;
  onSetDragOverId: (id: string | null) => void;
  onDrop: (e: React.DragEvent) => void;
};

export function StepPhotos({
  images,
  dragging,
  dragOverId,
  fileInputRef,
  dragSourceId,
  maxImages,
  onAddImages,
  onRemoveImage,
  onReorderImages,
  onSetDragging,
  onSetDragOverId,
  onDrop,
}: StepPhotosProps) {
  return (
    <>
      <h2 className={styles.sectionTitle}>Фотографии</h2>
      <p className={styles.sectionSubtitle}>
        Добавьте до {maxImages} фотографий. Первая станет обложкой объявления.
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          onAddImages(e.target.files);
          e.target.value = '';
        }}
      />

      {images.length === 0 ? (
        <div
          className={`${styles.uploadZone} ${dragging ? styles.uploadZoneDragging : ''}`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            onSetDragging(true);
          }}
          onDragLeave={() => onSetDragging(false)}
          onDrop={onDrop}
        >
          <div className={styles.uploadIcon}>
            <Camera size={24} />
          </div>
          <p className={styles.uploadText}>Нажмите или перетащите фото сюда</p>
          <p className={styles.uploadHint}>JPG, PNG или WEBP · до 10 МБ</p>
        </div>
      ) : (
        <div className={styles.imageGrid}>
          {images.map((img, i) => (
            <div
              key={img.id}
              className={`${styles.imageThumb} ${dragOverId === img.id ? styles.imageThumbDragOver : ''}`}
              draggable
              onDragStart={() => { dragSourceId.current = img.id; }}
              onDragOver={(e) => { e.preventDefault(); onSetDragOverId(img.id); }}
              onDragLeave={() => onSetDragOverId(null)}
              onDrop={(e) => {
                e.preventDefault();
                if (dragSourceId.current) onReorderImages(dragSourceId.current, img.id);
                dragSourceId.current = null;
                onSetDragOverId(null);
              }}
              onDragEnd={() => { dragSourceId.current = null; onSetDragOverId(null); }}
            >
              <img src={img.url} alt={`Фото ${i + 1}`} />
              <span className={styles.imageDragHandle}>
                <GripVertical size={14} />
              </span>
              {i === 0 && <span className={styles.imageMainBadge}>Обложка</span>}
              <button
                type="button"
                className={styles.imageRemove}
                onClick={() => onRemoveImage(img.id)}
              >
                <X size={12} />
              </button>
            </div>
          ))}
          {images.length < maxImages && (
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
