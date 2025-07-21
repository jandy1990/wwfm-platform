import type { Meta, StoryObj } from '@storybook/react';
import { NewDistributionField } from './NewDistributionField';

const meta = {
  title: 'Molecules/NewDistributionField',
  component: NewDistributionField,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    viewMode: {
      control: 'select',
      options: ['simple', 'detailed'],
    },
    isMobile: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof NewDistributionField>;

export default meta;
type Story = StoryObj<typeof meta>;

// Edge case: Single option (100% of users)
export const SingleOption: Story = {
  args: {
    label: 'Time to Results',
    viewMode: 'simple',
    distribution: {
      mode: '2-4 weeks',
      values: [
        { value: '2-4 weeks', count: 10, percentage: 100 }
      ],
      totalReports: 10
    }
  },
};

// Multiple options with high percentages
export const MultipleOptionsSimple: Story = {
  args: {
    label: 'Dosage',
    viewMode: 'simple',
    distribution: {
      mode: '200mg',
      values: [
        { value: '200mg', count: 45, percentage: 45 },
        { value: '100mg', count: 30, percentage: 30 },
        { value: '300mg', count: 15, percentage: 15 },
        { value: '50mg', count: 10, percentage: 10 }
      ],
      totalReports: 100
    }
  },
};

// Detailed view with color-coded bars
export const DetailedViewWithBars: Story = {
  args: {
    label: 'Frequency',
    viewMode: 'detailed',
    distribution: {
      mode: 'Daily',
      values: [
        { value: 'Daily', count: 60, percentage: 60 },          // Green bar (>40%)
        { value: '2-3x/week', count: 25, percentage: 25 },      // Blue bar (20-39%)
        { value: 'Weekly', count: 10, percentage: 10 },         // Gray bar (<20%)
        { value: 'As needed', count: 3, percentage: 3 },
        { value: 'Monthly', count: 2, percentage: 2 }
      ],
      totalReports: 100
    }
  },
};

// Smart grouping for low percentage options
export const SmartGrouping: Story = {
  args: {
    label: 'Side Effects',
    viewMode: 'detailed',
    distribution: {
      mode: 'Headache',
      values: [
        { value: 'Headache', count: 40, percentage: 40 },
        { value: 'Fatigue', count: 25, percentage: 25 },
        { value: 'Nausea', count: 20, percentage: 20 },
        { value: 'Dizziness', count: 5, percentage: 5 },
        { value: 'Dry mouth', count: 3, percentage: 3 },
        { value: 'Insomnia', count: 2, percentage: 2 },
        { value: 'Rash', count: 2, percentage: 2 },
        { value: 'Anxiety', count: 2, percentage: 2 },
        { value: 'Constipation', count: 1, percentage: 1 }
      ],
      totalReports: 100
    }
  },
};

// Mobile view
export const MobileView: Story = {
  args: {
    label: 'Cost',
    viewMode: 'simple',
    isMobile: true,
    distribution: {
      mode: '$10-25',
      values: [
        { value: '$10-25', count: 40, percentage: 40 },
        { value: '$25-50', count: 30, percentage: 30 },
        { value: 'Under $10', count: 20, percentage: 20 },
        { value: '$50-100', count: 10, percentage: 10 }
      ],
      totalReports: 100
    }
  },
};

// Edge case: Empty data
export const EmptyData: Story = {
  args: {
    label: 'Benefits',
    viewMode: 'simple',
    distribution: {
      mode: '',
      values: [],
      totalReports: 0
    }
  },
};