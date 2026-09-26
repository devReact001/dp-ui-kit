import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Alert } from './Alert';

describe('Alert', () => {
  it('renders its children', () => {
    render(<Alert>Hello</Alert>);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
