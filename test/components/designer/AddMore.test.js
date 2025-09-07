import React from 'react';
import { render } from '@testing-library/react';
import { AddMoreDesigner } from 'src/components/designer/AddMore.jsx';

describe('AddMore', () => {
  it('should render AddMore designer component', () => {
    const { container } = render(<AddMoreDesigner />);

    const buttons = container.querySelectorAll('button');
    expect(buttons).toHaveLength(2);
    expect(buttons[0].querySelector('.fa-plus')).toBeInTheDocument();
    expect(buttons[1].querySelector('.fa-remove')).toBeInTheDocument();
  });
});
