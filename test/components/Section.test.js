import React, { act } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { SectionWithIntl, Section } from 'components/Section.jsx';
import ComponentStore from 'src/helpers/componentStore';
import { ObsControlWithIntl as ObsControl } from 'components/ObsControl.jsx';
import { NumericBox } from 'components/NumericBox.jsx';
import { List } from 'immutable';
import { Label } from 'components/Label.jsx';
import { ControlRecord } from 'src/helpers/ControlRecordTreeBuilder';

jest.mock('src/helpers/componentStore', () => ({
  registerComponent: jest.fn(),
  deRegisterComponent: jest.fn(),
  registerDesignerComponent: jest.fn(),
}));

jest.mock('components/Row.jsx', () => ({
  Row: jest.fn(({ onEventTrigger }) => (
    <div data-testid="mock-row" data-has-event-trigger={!!onEventTrigger}>
      Row Mock
    </div>
  )),
}));

jest.mock('src/helpers/controlsParser', () => ({
  getGroupedControls: jest.fn(() => [[]]),
  displayRowControls: jest.fn((...args) => {
    const Row = require('components/Row.jsx').Row;
    const props = args[2] || {};
    return <Row {...props} />;
  }),
}));

const messages = { TEST_KEY: 'test value', HTML_DESC_KEY: 'test value <h1>Heading goes here</h1>' };

const renderWithIntl = (component, options = {}) => {
  const Wrapper = ({ children }) => (
    <IntlProvider locale="en" defaultLocale="en" messages={messages}>
      {children}
    </IntlProvider>
  );

  return render(component, { wrapper: Wrapper, ...options });
};

describe('Section', () => {
  beforeAll(() => {
    ComponentStore.registerComponent('section', Section);
    ComponentStore.registerComponent('obsControl', ObsControl);
    ComponentStore.registerComponent('numeric', NumericBox);
    ComponentStore.registerComponent('label', Label);
  });

  afterAll(() => {
    ComponentStore.deRegisterComponent('section');
    ComponentStore.deRegisterComponent('obsControl');
    ComponentStore.deRegisterComponent('numeric');
    ComponentStore.deRegisterComponent('label');
  });

  const obsConcept = {
    answers: [],
    datatype: 'Numeric',
    description: [],
    name: 'Pulse',
    properties: {
      allowDecimal: true,
    },
    uuid: 'c36bc411-3f10-11e4-adec-0800271c1b75',
  };

  const metadata = {
    controls: [
      {
        concept: obsConcept,
        hiAbsolute: null,
        hiNormal: 72,
        id: '2',
        label: {
          type: 'label',
          value: 'Pulse(/min)',
        },
        lowAbsolute: null,
        lowNormal: 72,
        properties: {
          addMore: true,
          hideLabel: false,
          location: {
            column: 0,
            row: 0,
          },
          mandatory: true,
          notes: false,
        },
        type: 'obsControl',
        units: '/min',
      },
    ],
    id: '1',
    label: {
      type: 'label',
      value: 'Section',
    },
    properties: {
      location: {
        column: 0,
        row: 0,
      },
    },
    type: 'section',
  };

  const formName = 'Section_Test';
  const formVersion = '1';
  const sectionFormFieldPath = 'Section_Test.1/1-0';
  const obsFormFieldPath = 'Section_Test.1/2-0';

  const children = List.of(new ControlRecord({
    control: {
      concept: obsConcept,
      hiAbsolute: null,
      hiNormal: 72,
      id: '2',
      label: {
        type: 'label',
        value: 'Pulse(/min)',
      },
      lowAbsolute: null,
      lowNormal: 72,
      properties: {
        addMore: true,
        hideLabel: false,
        location: {
          column: 0,
          row: 0,
        },
        mandatory: true,
        notes: false,
      },
      type: 'obsControl',
      units: '/min',
    },
    formFieldPath: obsFormFieldPath,
    dataSource: {
      concept: obsConcept,
      formFieldPath: obsFormFieldPath,
      formNamespace: 'Bahmni',
      voided: true,
    },
  }));

  const defaultProps = {
    children,
    collapse: true,
    formFieldPath: sectionFormFieldPath,
    formName,
    formVersion,
    metadata,
    onValueChanged: jest.fn(),
    showNotification: jest.fn(),
    validate: false,
    validateForm: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render section control with basic elements', () => {
      renderWithIntl(<SectionWithIntl {...defaultProps} />);

      expect(screen.getByRole('group')).toBeInTheDocument();
      expect(screen.getByText('Section')).toBeInTheDocument();
      expect(screen.getAllByTestId('mock-row')).toHaveLength(1);
    });

    it('should handle enabled and disabled states', () => {
      const Row = require('components/Row.jsx').Row;

      renderWithIntl(<SectionWithIntl {...defaultProps} enabled={false} />);

      const legend = screen.getByText('Section').closest('legend');
      expect(legend).toHaveClass('form-builder-toggle');
      expect(legend).toHaveClass('disabled');

      const controlsDiv = screen.getByRole('group').querySelector('.obsGroup-controls');
      expect(controlsDiv).toHaveClass('obsGroup-controls');
      expect(controlsDiv).toHaveClass('disabled');

      expect(Row).toHaveBeenCalledWith(
        expect.objectContaining({ enabled: false }),
        {}
      );
    });

    it('should be enabled by default', () => {
      renderWithIntl(<SectionWithIntl {...defaultProps} />);

      const legend = screen.getByText('Section').closest('legend');
      expect(legend).not.toHaveClass('disabled');
    });
  });

  describe('collapse functionality', () => {
    it('should toggle collapse state when legend is clicked', () => {
      renderWithIntl(<SectionWithIntl {...defaultProps} collapse={false} />);

      const legend = screen.getByText('Section').closest('legend');
      const controlsDiv = screen.getByRole('group').querySelector('.obsGroup-controls');

      expect(legend).toHaveClass('form-builder-toggle active');
      expect(controlsDiv).toHaveClass('obsGroup-controls active-group-controls');

      fireEvent.click(legend);

      expect(legend).toHaveClass('form-builder-toggle');
      expect(legend).not.toHaveClass('active');
      expect(controlsDiv).toHaveClass('obsGroup-controls closing-group-controls');
    });

    it('should update collapse state when collapse prop changes', () => {
      const { rerender } = renderWithIntl(<SectionWithIntl {...defaultProps} collapse={false} />);

      let legend = screen.getByText('Section').closest('legend');
      let controlsDiv = screen.getByRole('group').querySelector('.obsGroup-controls');

      expect(legend).toHaveClass('form-builder-toggle active');
      expect(controlsDiv).toHaveClass('obsGroup-controls active-group-controls');

      rerender(<SectionWithIntl {...defaultProps} collapse />);

      legend = screen.getByText('Section').closest('legend');
      controlsDiv = screen.getByRole('group').querySelector('.obsGroup-controls');

      expect(legend).toHaveClass('form-builder-toggle');
      expect(legend).not.toHaveClass('active');
      expect(controlsDiv).toHaveClass('obsGroup-controls closing-group-controls');
    });

    it('should not update state when collapse conditions do not warrant change', () => {
      const { rerender } = renderWithIntl(<SectionWithIntl {...defaultProps} collapse />);

      let legend = screen.getByText('Section').closest('legend');
      expect(legend).not.toHaveClass('active');

      rerender(<SectionWithIntl {...defaultProps} collapse={undefined} />);
      legend = screen.getByText('Section').closest('legend');
      expect(legend).not.toHaveClass('active');
    });

    it('should not update state when collapse prop equals both current prop and state', () => {
      const { rerender } = renderWithIntl(<SectionWithIntl {...defaultProps} collapse />);

      let legend = screen.getByText('Section').closest('legend');
      expect(legend).not.toHaveClass('active');

      rerender(<SectionWithIntl {...defaultProps} collapse />);
      legend = screen.getByText('Section').closest('legend');
      expect(legend).not.toHaveClass('active');
    });

    it('should update state when collapse prop differs', () => {
      const { rerender } = renderWithIntl(<SectionWithIntl {...defaultProps} collapse />);

      let legend = screen.getByText('Section').closest('legend');
      expect(legend).not.toHaveClass('active');

      rerender(<SectionWithIntl {...defaultProps} collapse={false} />);
      legend = screen.getByText('Section').closest('legend');
      expect(legend).toHaveClass('active');
    });

    it('should update state when collapse prop differs from current state', () => {
      const sectionRef = React.createRef();
      const { rerender } = renderWithIntl(
        <Section
          ref={sectionRef}
          {...defaultProps}
          collapse={false}
          intl={{ formatMessage: ({ defaultMessage }) => defaultMessage }}
        />
      );

      let legend = screen.getByText('Section').closest('legend');
      expect(legend).toHaveClass('active');

      act(() => {
        sectionRef.current.setState({ collapse: true });
      });

      rerender(
        <Section
          ref={sectionRef}
          {...defaultProps}
          collapse={false}
          intl={{ formatMessage: ({ defaultMessage }) => defaultMessage }}
        />
      );

      legend = screen.getByText('Section').closest('legend');
      expect(legend).toHaveClass('active');
    });

    it('should handle collapse state transitions correctly', () => {
      const { rerender } = renderWithIntl(<SectionWithIntl {...defaultProps} collapse={false} />);

      let legend = screen.getByText('Section').closest('legend');
      expect(legend).toHaveClass('active');

      rerender(<SectionWithIntl {...defaultProps} collapse />);
      legend = screen.getByText('Section').closest('legend');
      expect(legend).not.toHaveClass('active');

      rerender(<SectionWithIntl {...defaultProps} collapse={false} />);
      legend = screen.getByText('Section').closest('legend');
      expect(legend).toHaveClass('active');

      rerender(<SectionWithIntl {...defaultProps} collapse={undefined} />);
      legend = screen.getByText('Section').closest('legend');
      expect(legend).toHaveClass('active');
    });
  });

  describe('event handling', () => {
    it('should call onValueChanged when onChange is triggered', () => {
      const onValueChangedMock = jest.fn();
      const sectionRef = React.createRef();

      renderWithIntl(
        <Section
          ref={sectionRef}
          {...defaultProps}
          onValueChanged={onValueChangedMock}
          intl={{ formatMessage: ({ defaultMessage }) => defaultMessage }}
        />
      );

      const updatedValue = { value: 1, comment: undefined };
      sectionRef.current.onChange(obsFormFieldPath, updatedValue, undefined, undefined);

      expect(onValueChangedMock).toHaveBeenCalledWith(
        obsFormFieldPath,
        updatedValue,
        undefined,
        undefined
      );
    });

    it('should pass onEventTrigger property to Row components', () => {
      const onEventTriggerMock = jest.fn();
      const Row = require('components/Row.jsx').Row;

      renderWithIntl(
        <SectionWithIntl
          {...defaultProps}
          onEventTrigger={onEventTriggerMock}
        />
      );

      expect(Row).toHaveBeenCalledWith(
        expect.objectContaining({ onEventTrigger: onEventTriggerMock }),
        {}
      );

      const rowElement = screen.getByTestId('mock-row');
      expect(rowElement).toHaveAttribute('data-has-event-trigger', 'true');
    });

    it('should handle onControlAdd and onControlRemove callbacks', () => {
      const onControlAddMock = jest.fn();
      const onControlRemoveMock = jest.fn();
      const sectionRef = React.createRef();

      renderWithIntl(
        <Section
          ref={sectionRef}
          {...defaultProps}
          onControlAdd={onControlAddMock}
          onControlRemove={onControlRemoveMock}
          intl={{ formatMessage: ({ defaultMessage }) => defaultMessage }}
        />
      );

      sectionRef.current.onControlAdd(obsFormFieldPath, true);
      expect(onControlAddMock).toHaveBeenCalledWith(obsFormFieldPath, true);

      sectionRef.current.onControlRemove(obsFormFieldPath);
      expect(onControlRemoveMock).toHaveBeenCalledWith(obsFormFieldPath);
    });
  });

  describe('with i18n', () => {
    it('should render label from translations', () => {
      const translatedMetadata = {
        ...metadata,
        label: {
          translationKey: 'TEST_KEY',
          type: 'label',
          value: 'label',
        },
      };

      renderWithIntl(
        <SectionWithIntl
          {...defaultProps}
          metadata={translatedMetadata}
        />
      );

      expect(screen.getByText('test value')).toBeInTheDocument();
    });
  });
});
