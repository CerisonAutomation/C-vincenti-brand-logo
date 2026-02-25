import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PricingBlock } from '../components/blocks/PricingBlock';

const mockPlans = [
  {
    name: 'Basic',
    price: '$10/month',
    description: 'Basic plan for small teams',
    features: ['Feature 1', 'Feature 2'],
    popular: false,
    buttonText: 'Choose Basic',
    buttonOnClick: vi.fn(),
  },
  {
    name: 'Pro',
    price: '$20/month',
    description: 'Pro plan for growing teams',
    features: ['Feature 1', 'Feature 2', 'Feature 3'],
    popular: true,
    buttonText: 'Choose Pro',
    buttonOnClick: vi.fn(),
  },
];

describe('PricingBlock', () => {
  it('renders pricing plans correctly', () => {
    render(<PricingBlock plans={mockPlans} />);

    expect(screen.getByText('Pricing Plans')).toBeInTheDocument();
    expect(screen.getByText('Basic')).toBeInTheDocument();
    expect(screen.getByText('Pro')).toBeInTheDocument();
    expect(screen.getByText('$10/month')).toBeInTheDocument();
    expect(screen.getByText('$20/month')).toBeInTheDocument();
    expect(screen.getByText('Most Popular')).toBeInTheDocument();
  });

  it('calls button onClick when button is clicked', () => {
    render(<PricingBlock plans={mockPlans} />);

    const basicButton = screen.getByRole('button', { name: /select basic plan/i });
    fireEvent.click(basicButton);
    expect(mockPlans[0].buttonOnClick).toHaveBeenCalled();

    const proButton = screen.getByRole('button', { name: /select pro plan/i });
    fireEvent.click(proButton);
    expect(mockPlans[1].buttonOnClick).toHaveBeenCalled();
  });

  it('renders features list', () => {
    render(<PricingBlock plans={mockPlans} />);

    expect(screen.getAllByText('Feature 1')).toHaveLength(2);
    expect(screen.getAllByText('Feature 2')).toHaveLength(2);
    expect(screen.getAllByText('Feature 3')).toHaveLength(1);
  });

  it('has correct accessibility attributes', () => {
    render(<PricingBlock plans={mockPlans} />);

    const section = screen.getByRole('region', { name: /pricing plans/i });
    expect(section).toBeInTheDocument();

    const lists = screen.getAllByRole('list', { name: /plan features/i });
    expect(lists).toHaveLength(2);

    const listitems = screen.getAllByRole('listitem');
    expect(listitems).toHaveLength(7); // 2 plans + 2 basic features + 3 pro features

    expect(screen.getByLabelText('Most popular plan')).toBeInTheDocument();
  });

  it('renders custom title', () => {
    render(<PricingBlock plans={mockPlans} title="Custom Pricing" />);

    expect(screen.getByText('Custom Pricing')).toBeInTheDocument();
  });
});
