'use client';

type ShimmerBlockProps = {
  w?: number | string;
  h?: number | string;
  r?: number | string;
  mt?: number;
  aspect?: string;
  className: string;
};

export function ShimmerBlock({ w, h, r, mt, aspect, className }: ShimmerBlockProps) {
  return (
    <div
      className={className}
      style={{
        width: w,
        height: h,
        borderRadius: r,
        marginTop: mt,
        aspectRatio: aspect,
      }}
    />
  );
}
