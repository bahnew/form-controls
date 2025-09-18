import React from 'react';
import { render, screen } from '@testing-library/react';
import { NumericBoxDesigner } from 'components/designer/NumericBoxDesigner.jsx';

describe('NumericBoxDesigner', () => {
  let metadata;

  beforeEach(() => {
    metadata = {
      concept: {
        name: 'Pulse',
        uuid: 'someUuid',
      },
      displayType: 'numeric',
      type: 'obsControl',
      id: 'someId',
      properties: {},
    };
  });

  it('should render the input', () => {
    render(<NumericBoxDesigner metadata={metadata} />);

    const input = screen.getByRole('spinbutton');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'number');
  });

  it('should not render the input when concept class is computed', () => {
    metadata.concept.conceptClass = 'Computed';
    render(<NumericBoxDesigner metadata={metadata} />);

    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
  });

  it('should return json definition', () => {
    const component = new NumericBoxDesigner({ metadata });
    expect(component.getJsonDefinition()).toEqual(metadata);
  });

  it('should render the range information when available', () => {
    const lowNormal = 5;
    const hiNormal = 10;

    render(
      <NumericBoxDesigner
        hiNormal={hiNormal}
        lowNormal={lowNormal}
        metadata={metadata}
      />
    );

    expect(screen.getByText(`(${lowNormal} - ${hiNormal})`)).toBeInTheDocument();
  });

  describe('getRange', () => {
    it('should show range when both hiNormal and lowNormal are present', () => {
      const lowNormal = 5;
      const hiNormal = 10;

      const rangeStr = NumericBoxDesigner.getRange(lowNormal, hiNormal);
      expect(rangeStr).toBe(`(${lowNormal} - ${hiNormal})`);
    });

    it('should show range as greater than lowNormal when only it is present', () => {
      const lowNormal = 5;

      const rangeStr = NumericBoxDesigner.getRange(lowNormal);
      expect(rangeStr).toBe(`(> ${lowNormal})`);
    });

    it('should show range as lesser than hiNormal when only it is present', () => {
      const hiNormal = 5;

      const rangeStr = NumericBoxDesigner.getRange(undefined, hiNormal);
      expect(rangeStr).toBe(`(< ${hiNormal})`);
    });
  });
});
