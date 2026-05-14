import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '@/ux/components/ErrorBoundary/ErrorBoundary';

// Suppress console.error from ErrorBoundary's componentDidCatch
beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

const ThrowingComponent = ({ message }: { message: string }) => {
  throw new Error(message);
};

const SafeComponent = () => <div>Безопасный контент</div>;

describe('ErrorBoundary', () => {
  it('рендерит children при нормальной работе', () => {
    render(
      <ErrorBoundary>
        <SafeComponent />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Безопасный контент')).toBeInTheDocument();
  });

  it('показывает дефолтный UI при ошибке если fallback не передан', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent message="Тестовая ошибка" />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Что-то пошло не так')).toBeInTheDocument();
    expect(screen.getByText('Попробуйте обновить страницу')).toBeInTheDocument();
  });

  it('показывает ReactNode fallback при ошибке', () => {
    render(
      <ErrorBoundary fallback={<div>Произошла ошибка</div>}>
        <ThrowingComponent message="Тестовая ошибка" />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Произошла ошибка')).toBeInTheDocument();
  });

  it('вызывает функцию fallback с error при ошибке', () => {
    render(
      <ErrorBoundary fallback={(error) => <div>Ошибка: {error.message}</div>}>
        <ThrowingComponent message="Тестовая ошибка" />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Ошибка: Тестовая ошибка')).toBeInTheDocument();
  });

  it('логирует ошибку в console.error', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent message="Логируемая ошибка" />
      </ErrorBoundary>,
    );

    expect(console.error).toHaveBeenCalled();
  });
});
