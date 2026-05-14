import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Tabs, type TabsItem } from '@/ux/components/Tabs/Tabs';

const items: TabsItem<'one' | 'two' | 'three'>[] = [
  { value: 'one', label: 'Первый' },
  { value: 'two', label: 'Второй', badge: '5' },
  { value: 'three', label: 'Третий' },
];

describe('Tabs', () => {
  it('рендерит все табы', () => {
    render(<Tabs items={items} value="one" onChange={() => {}} />);

    expect(screen.getByText('Первый')).toBeInTheDocument();
    expect(screen.getByText('Второй')).toBeInTheDocument();
    expect(screen.getByText('Третий')).toBeInTheDocument();
  });

  it('выделяет активный таб через aria-selected', () => {
    render(<Tabs items={items} value="two" onChange={() => {}} />);

    const tabs = screen.getAllByRole('tab');
    expect(tabs[0]).toHaveAttribute('aria-selected', 'false');
    expect(tabs[1]).toHaveAttribute('aria-selected', 'true');
    expect(tabs[2]).toHaveAttribute('aria-selected', 'false');
  });

  it('вызывает onChange при клике на таб', () => {
    const onChange = vi.fn();
    render(<Tabs items={items} value="one" onChange={onChange} />);

    fireEvent.click(screen.getByText('Третий'));
    expect(onChange).toHaveBeenCalledWith('three');
  });

  it('показывает badge если передан', () => {
    render(<Tabs items={items} value="one" onChange={() => {}} />);

    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('не показывает badge если не передан', () => {
    const noBadgeItems: TabsItem<'a'>[] = [{ value: 'a', label: 'Без бейджа' }];
    render(<Tabs items={noBadgeItems} value="a" onChange={() => {}} />);

    const tabs = screen.getAllByRole('tab');
    expect(tabs[0].querySelectorAll('span')).toHaveLength(1); // только label span
  });

  it('активный таб имеет tabIndex=0, остальные tabIndex=-1', () => {
    render(<Tabs items={items} value="two" onChange={() => {}} />);

    const tabs = screen.getAllByRole('tab');
    expect(tabs[0]).toHaveAttribute('tabindex', '-1');
    expect(tabs[1]).toHaveAttribute('tabindex', '0');
    expect(tabs[2]).toHaveAttribute('tabindex', '-1');
  });

  it('рендерит tablist с горизонтальной ориентацией', () => {
    render(<Tabs items={items} value="one" onChange={() => {}} />);

    const tablist = screen.getByRole('tablist');
    expect(tablist).toHaveAttribute('aria-orientation', 'horizontal');
  });
});
