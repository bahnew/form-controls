import React from 'react';
import { render, screen } from '@testing-library/react';
import { Label } from '../../src/components/Label.jsx';

const mockIntl = {
  formatMessage: ({ defaultMessage }) => defaultMessage
};

describe('Label', () => {
  it('should render the value of label by related translated key', () => {
    const metadata = { value: 'History Notes', type: 'label', translationKey: 'TEST_KEY' };
    render(<Label intl={mockIntl} metadata={metadata} />);
    
    expect(screen.getByText('History Notes')).toBeInTheDocument();
  });

  it('should render the value of label by default language', () => {
    const metadata = { value: 'History Notes', type: 'label' };
    render(<Label intl={mockIntl} metadata={metadata} />);
    
    expect(screen.getByText('History Notes')).toBeInTheDocument();
  });

  it('should set label to class disable when the props of enabled is false', () => {
    const metadata = { value: 'History Notes', type: 'label' };
    render(<Label intl={mockIntl} enabled={false} metadata={metadata} />);
    
    const label = screen.getByText('History Notes');
    expect(label).toHaveClass('disabled-label');
  });

  it('should not set label to class disable when the props of enabled is true', () => {
    const metadata = { value: 'History Notes', type: 'label' };
    render(<Label intl={mockIntl} enabled metadata={metadata} />);
    
    const label = screen.getByText('History Notes');
    expect(label).not.toHaveClass('disabled-label');
  });

  it('should render the value of label with units', () => {
    const metadata = { value: 'Pulse', type: 'label', units: '(/min)' };
    render(<Label intl={mockIntl} metadata={metadata} />);
    
    expect(screen.getByText('Pulse (/min)')).toBeInTheDocument();
  });
});
