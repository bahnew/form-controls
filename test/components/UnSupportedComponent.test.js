import React from 'react';
import { render, screen } from '@testing-library/react';
import { UnSupportedComponent } from 'src/components/UnSupportedComponent.jsx';

describe('UnSupportedComponent', () => {
  it('should render the value of label', () => {
    render(<UnSupportedComponent message={'Component is not supported'} />);
    expect(screen.getByText('Component is not supported')).toBeInTheDocument();
  });
});
