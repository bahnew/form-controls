import React from 'react';
import { render, screen } from '@testing-library/react';
import { VideoDesigner } from 'components/designer/Video.jsx';

describe('VideoDesigner', () => {
  let metadata;

  beforeEach(() => {
    metadata = {
      concept: {
        name: 'Video',
        uuid: 'someUuid',
        handler: 'VideoUrlHandler',
      },
      type: 'obsControl',
      id: 'someId',
      properties: {},
    };
  });

  it('should render the Video designer component', () => {
    const { container } = render(<VideoDesigner metadata={metadata} />);
    
    const fileInput = container.querySelector('input[type="file"]');
    expect(fileInput).toBeInTheDocument();
    expect(fileInput).toHaveAttribute('type', 'file');
  });

  it('should render a disabled file input', () => {
    const { container } = render(<VideoDesigner metadata={metadata} />);
    
    const fileInput = container.querySelector('input[type="file"]');
    expect(fileInput).toBeDisabled();
  });

  it('should render with correct CSS classes', () => {
    const { container } = render(<VideoDesigner metadata={metadata} />);
    
    const wrapper = container.querySelector('.fl.complex-component-designer');
    expect(wrapper).toBeInTheDocument();
  });

  it('should render without metadata', () => {
    const { container } = render(<VideoDesigner />);
    
    const fileInput = container.querySelector('input[type="file"]');
    expect(fileInput).toBeInTheDocument();
    expect(fileInput).toBeDisabled();
  });

  it('should accept file input type', () => {
    const { container } = render(<VideoDesigner metadata={metadata} />);
    
    const fileInput = container.querySelector('input[type="file"]');
    expect(fileInput).toHaveAttribute('type', 'file');
    expect(fileInput).toHaveAttribute('disabled');
  });
});
