import type { PropsWithChildren } from 'react';
import { SkipToContent } from '@/ux/components/SkipToContent';
import './dev-ui-filters.css';

export default function DevUiLayout({ children }: PropsWithChildren) {
  return (
    <>
      <SkipToContent />
      <div id="main-content">{children}</div>
    </>
  );
}
