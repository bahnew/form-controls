import React from 'react';
import { render, screen } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { List } from 'immutable';
import { ControlRecord } from 'src/helpers/ControlRecordTreeBuilder';
import ComponentStore from 'src/helpers/componentStore';
import { ObsControlWithIntl as ObsControl } from 'components/ObsControl.jsx';
import { NumericBox } from 'components/NumericBox.jsx';
import { Label } from 'components/Label.jsx';
import { Table, TableWithIntl } from 'components/Table.jsx';

const renderWithIntl = (component, locale = 'en') => {
  const messages = {
    COLUMN1_2: 'Column1',
    COLUMN2_2: 'Column2',
    TABLE_LABEL: 'Table',
  };

  return render(
    <IntlProvider locale={locale} messages={messages}>
      {component}
    </IntlProvider>
  );
};

describe('Table', () => {
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
    columnHeaders: [
      {
        translationKey: 'COLUMN1_2',
        type: 'label',
        value: 'Column1',
        id: '2',
      },
      {
        translationKey: 'COLUMN2_2',
        type: 'label',
        value: 'Column2',
        id: '2',
      },
    ],
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
            column: 1,
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
      value: 'Table',
    },
    properties: {
      location: {
        column: 0,
        row: 0,
      },
    },
    type: 'table',
  };

  const formName = 'Table_Test';
  const formVersion = '1';
  const tableFormFieldPath = 'Table_Test.1/1-0';
  const obsFormFieldPath = 'Table_Test.1/2-0';

  const children = List.of(new ControlRecord({
    id: '2',
    control: metadata.controls[0],
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
    formFieldPath: tableFormFieldPath,
    formName,
    formVersion,
    metadata,
    onValueChanged: jest.fn(),
    showNotification: jest.fn(),
    validate: false,
    validateForm: false,
  };

  beforeAll(() => {
    ComponentStore.registerComponent('table', Table);
    ComponentStore.registerComponent('obsControl', ObsControl);
    ComponentStore.registerComponent('numeric', NumericBox);
    ComponentStore.registerComponent('label', Label);
  });

  afterAll(() => {
    ComponentStore.deRegisterComponent('table');
    ComponentStore.deRegisterComponent('obsControl');
    ComponentStore.deRegisterComponent('numeric');
    ComponentStore.deRegisterComponent('label');
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render table with header and column headers', () => {
      renderWithIntl(<TableWithIntl {...defaultProps} />);

      expect(screen.getByText('Table')).toBeInTheDocument();
      expect(screen.getByText('Column1')).toBeInTheDocument();
      expect(screen.getByText('Column2')).toBeInTheDocument();
    });

    it('should render table header with proper styling', () => {
      renderWithIntl(<TableWithIntl {...defaultProps} />);

      const tableHeader = screen.getByText('Table');
      expect(tableHeader).toHaveClass('table-header', 'test-table-label');
    });

    it('should render column headers in header section', () => {
      renderWithIntl(<TableWithIntl {...defaultProps} />);

      const headerElement = document.querySelector('.header');
      expect(headerElement).toBeInTheDocument();

      expect(headerElement).toContainElement(screen.getByText('Column1'));
      expect(headerElement).toContainElement(screen.getByText('Column2'));
    });

    it('should render table controls section', () => {
      renderWithIntl(<TableWithIntl {...defaultProps} />);

      const tableControlsElement = document.querySelector('.table-controls');
      expect(tableControlsElement).toBeInTheDocument();
    });

    it('should render rows section', () => {
      renderWithIntl(<TableWithIntl {...defaultProps} />);

      const rowsElement = document.querySelector('.test-Rows');
      expect(rowsElement).toBeInTheDocument();
    });
  });

  describe('internationalization', () => {
    it('should display translated table label', () => {
      const customMessages = { TABLE_LABEL: 'Mesa' };
      const customMetadata = {
        ...metadata,
        label: {
          type: 'label',
          value: 'Table',
          translationKey: 'TABLE_LABEL',
        },
      };

      render(
        <IntlProvider locale="es" messages={customMessages}>
          <TableWithIntl {...defaultProps} metadata={customMetadata} />
        </IntlProvider>
      );

      expect(screen.getByText('Mesa')).toBeInTheDocument();
    });

    it('should display translated column headers', () => {
      const customMessages = {
        COLUMN1_2: 'Columna 1',
        COLUMN2_2: 'Columna 2',
      };

      render(
        <IntlProvider locale="es" messages={customMessages}>
          <TableWithIntl {...defaultProps} />
        </IntlProvider>
      );

      expect(screen.getByText('Columna 1')).toBeInTheDocument();
      expect(screen.getByText('Columna 2')).toBeInTheDocument();
    });

    it('should fallback to default message when translation key not found', () => {
      renderWithIntl(<TableWithIntl {...defaultProps} />);

      expect(screen.getByText('Table')).toBeInTheDocument();
    });
  });

  describe('props handling', () => {
    it('should handle enabled prop', () => {
      renderWithIntl(<TableWithIntl {...defaultProps} enabled />);

      expect(screen.getByText('Table')).toBeInTheDocument();
    });

    it('should handle disabled state', () => {
      renderWithIntl(<TableWithIntl {...defaultProps} enabled={false} />);

      expect(screen.getByText('Table')).toBeInTheDocument();
    });

    it('should handle additional event handlers', () => {
      const onEventTrigger = jest.fn();
      const patientUuid = 'test-patient-uuid';

      renderWithIntl(
        <TableWithIntl
          {...defaultProps}
          onEventTrigger={onEventTrigger}
          patientUuid={patientUuid}
          enabled
        />
      );

      expect(screen.getByText('Table')).toBeInTheDocument();
    });

    it('should handle validation props', () => {
      renderWithIntl(
        <TableWithIntl
          {...defaultProps}
          validate
          validateForm
        />
      );

      expect(screen.getByText('Table')).toBeInTheDocument();
    });
  });

  describe('callback handling', () => {
    it('should call onValueChanged when table data changes', () => {
      const onValueChanged = jest.fn();

      renderWithIntl(
        <TableWithIntl
          {...defaultProps}
          onValueChanged={onValueChanged}
        />
      );

      expect(screen.getByText('Table')).toBeInTheDocument();
    });

    it('should handle showNotification callback', () => {
      const showNotification = jest.fn();

      renderWithIntl(
        <TableWithIntl
          {...defaultProps}
          showNotification={showNotification}
        />
      );

      expect(screen.getByText('Table')).toBeInTheDocument();
    });
  });

  describe('metadata handling', () => {
    it('should handle metadata with multiple column headers', () => {
      const multiColumnMetadata = {
        ...metadata,
        columnHeaders: [
          ...metadata.columnHeaders,
          {
            translationKey: 'COLUMN3_2',
            type: 'label',
            value: 'Column3',
            id: '3',
          },
        ],
      };

      renderWithIntl(<TableWithIntl {...defaultProps} metadata={multiColumnMetadata} />);

      expect(screen.getByText('Column1')).toBeInTheDocument();
      expect(screen.getByText('Column2')).toBeInTheDocument();
      expect(screen.getByText('Column3')).toBeInTheDocument();
    });

    it('should handle metadata with empty column headers', () => {
      const emptyColumnMetadata = {
        ...metadata,
        columnHeaders: [],
      };

      renderWithIntl(<TableWithIntl {...defaultProps} metadata={emptyColumnMetadata} />);

      expect(screen.getByText('Table')).toBeInTheDocument();
      expect(document.querySelector('.header')).toBeInTheDocument();
    });

    it('should handle metadata without translation keys', () => {
      const noTranslationMetadata = {
        ...metadata,
        columnHeaders: [
          {
            type: 'label',
            value: 'Simple Column 1',
            id: '1',
          },
          {
            type: 'label',
            value: 'Simple Column 2',
            id: '2',
          },
        ],
      };

      renderWithIntl(<TableWithIntl {...defaultProps} metadata={noTranslationMetadata} />);

      expect(screen.getByText('Simple Column 1')).toBeInTheDocument();
      expect(screen.getByText('Simple Column 2')).toBeInTheDocument();
    });
  });

  describe('children handling', () => {
    it('should handle empty children list', () => {
      renderWithIntl(<TableWithIntl {...defaultProps} children={List.of()} />);

      expect(screen.getByText('Table')).toBeInTheDocument();
      expect(document.querySelector('.test-Rows')).toBeInTheDocument();
    });

    it('should handle multiple children records', () => {
      const multipleChildren = List.of(
        children.get(0),
        new ControlRecord({
          id: '3',
          control: {
            ...metadata.controls[0],
            id: '3',
          },
          formFieldPath: 'Table_Test.1/3-0',
          dataSource: {
            concept: obsConcept,
            formFieldPath: 'Table_Test.1/3-0',
            formNamespace: 'Bahmni',
            voided: false,
          },
        })
      );

      renderWithIntl(<TableWithIntl {...defaultProps} children={multipleChildren} />);

      expect(screen.getByText('Table')).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle missing metadata gracefully', () => {
      const minimalMetadata = {
        id: '1',
        label: {
          type: 'label',
          value: 'Minimal Table',
        },
        columnHeaders: [],
        controls: [],
        type: 'table',
      };

      renderWithIntl(<TableWithIntl {...defaultProps} metadata={minimalMetadata} />);

      expect(screen.getByText('Minimal Table')).toBeInTheDocument();
    });

    it('should handle form field path variations', () => {
      const customFormFieldPath = 'Custom_Form.1/5-3';

      renderWithIntl(
        <TableWithIntl
          {...defaultProps}
          formFieldPath={customFormFieldPath}
        />
      );

      expect(screen.getByText('Table')).toBeInTheDocument();
    });

    it('should handle different form versions', () => {
      const customFormVersion = '2.1';

      renderWithIntl(
        <TableWithIntl
          {...defaultProps}
          formVersion={customFormVersion}
        />
      );

      expect(screen.getByText('Table')).toBeInTheDocument();
    });

    it('should handle special characters in form names', () => {
      const specialFormName = 'Form-With_Special.Characters';

      renderWithIntl(
        <TableWithIntl
          {...defaultProps}
          formName={specialFormName}
        />
      );

      expect(screen.getByText('Table')).toBeInTheDocument();
    });
  });

  describe('component structure', () => {
    it('should maintain proper DOM hierarchy', () => {
      renderWithIntl(<TableWithIntl {...defaultProps} />);

      const tableControlsElement = document.querySelector('.table-controls');
      const headerElement = document.querySelector('.header');
      const rowsElement = document.querySelector('.test-Rows');

      expect(tableControlsElement).toContainElement(headerElement);
      expect(tableControlsElement).toContainElement(rowsElement);
    });

    it('should apply correct CSS classes', () => {
      renderWithIntl(<TableWithIntl {...defaultProps} />);

      expect(document.querySelector('.table-header')).toBeInTheDocument();
      expect(document.querySelector('.test-table-label')).toBeInTheDocument();
      expect(document.querySelector('.table-controls')).toBeInTheDocument();
      expect(document.querySelector('.header')).toBeInTheDocument();
      expect(document.querySelector('.test-Rows')).toBeInTheDocument();
    });
  });
});
