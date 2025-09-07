import React from 'react';
import { render, screen } from '@testing-library/react';
import Spinner from 'src/helpers/Spinner';

describe('Spinner Component', () => {
  it('should render spinner', () => {
    const { container } = render(<Spinner show />);
    expect(container.querySelector('.overlay')).toBeInTheDocument();
  });

  it('should not render spinner', () => {
    const { container } = render(<Spinner show={false} />);
    expect(container.firstChild).toBeNull();
  });
});
