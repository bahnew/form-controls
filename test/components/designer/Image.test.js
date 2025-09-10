import React from 'react';
import { render, screen } from '@testing-library/react';
import { ImageDesigner } from 'components/designer/Image.jsx';

describe('ImageDesigner', () => {
  let metadata;

  beforeEach(() => {
    metadata = {
      concept: {
        name: 'Image',
        uuid: 'someUuid',
        handler: 'ImageUrlHandler',
      },
      type: 'obsControl',
      id: 'someId',
      properties: {},
    };
  });

  it('should render the Image designer component', () => {
    const { container } = render(<ImageDesigner metadata={metadata} />);
    
    const fileInput = container.querySelector('input[type="file"]');
    expect(fileInput).toBeInTheDocument();
    expect(fileInput).toBeDisabled();
  });
});
