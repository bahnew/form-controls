import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { render, screen } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { Row } from 'components/Row.jsx';
import ComponentStore from 'src/helpers/componentStore';
import { ObsMapper } from 'src/mapper/ObsMapper';
import { Obs } from 'src/helpers/Obs';

function getLocationAndSameLineProperties(row, column) {
  return { location: { row, column }, sameLine: true };
}

class DummyControl extends Component {
  getValue() {
    return this.props.formUuid;
  }

  render() {
    return (
      <div 
        data-testid="dummy-control"
        data-validate={this.props.validate}
        data-enabled={this.props.enabled}
      >
        {this.props.formUuid}
      </div>
    );
  }
}

DummyControl.propTypes = {
  formUuid: PropTypes.string,
};

const renderWithIntl = (component) => {
  return render(
    <IntlProvider locale="en" messages={{}}>
      {component}
    </IntlProvider>
  );
};

describe('Row', () => {
  const controls = [
    {
      id: '100',
      type: 'randomType',
      value: 'Pulse',
      properties: getLocationAndSameLineProperties(0, 1),
    },
    {
      id: '101',
      type: 'randomType',
      properties: getLocationAndSameLineProperties(0, 2),
    },
    {
      id: '102',
      type: 'randomType',
      properties: getLocationAndSameLineProperties(0, 3),
    },
  ];
  const formName = 'formName';
  const formVersion = '1';

  const records = controls.map((control) => ({
    control,
    obs: new Obs({ formFieldPath: `${formName}.${formVersion}/${control.id}` }),
    mapper: new ObsMapper(),
  }));

  beforeAll(() => {
    ComponentStore.componentList = {};
    ComponentStore.registerComponent('randomType', DummyControl);
  });

  afterAll(() => {
    ComponentStore.deRegisterComponent('randomType');
  });

  const onChangeSpy = jest.fn();

  describe('render', () => {
    it('should render rows', () => {
      renderWithIntl(
        <Row
          controls={controls}
          formName={formName}
          formVersion={formVersion}
          id={0}
          onValueChanged={onChangeSpy}
          records={records}
          validate={false}
          validateForm={false}
        />
      );
      
      const dummyControls = screen.getAllByTestId('dummy-control');
      expect(dummyControls).toHaveLength(3);
      expect(dummyControls[0]).toHaveAttribute('data-validate', 'false');
    });

    it('should pass enabled value of records when parent\'s enabled value is true', () => {
      const records1 = [{ id: 'someId', enabled: false, control: { id: '101' } }];
      renderWithIntl(
        <Row
          controls={controls}
          enabled
          formName={formName}
          formVersion={formVersion}
          id={0}
          onValueChanged={onChangeSpy}
          records={records1}
          validate={false}
          validateForm={false}
        />
      );

      expect(screen.getAllByTestId('dummy-control')).toHaveLength(1);
      expect(screen.getAllByTestId('dummy-control')[0]).toHaveAttribute('data-enabled', 'false');
    });

    it('should not render rows when controls is empty', () => {
      const { container } = render(
        <Row
          controls={[]}
          formName={formName}
          formVersion={formVersion}
          id={0}
          onValueChanged={onChangeSpy}
          records={records}
          validate={false}
          validateForm={false}
        />
      );

      const rowElement = container.querySelector('.form-builder-row');
      expect(rowElement).toBeEmptyDOMElement();
    });
  });

  describe('in table', () => {
    it('should render empty div on the left when first column has no obs and column 2 has obs', () => {
      const tableControls = [
        {
          id: '100',
          type: 'randomType',
          value: 'Pulse',
          properties: { location: { row: 0, column: 1 } },
        }
      ];
      const tableRecords = tableControls.map((control) => ({
        control,
        obs: new Obs({ formFieldPath: `${formName}.${formVersion}/${control.id}` }),
        mapper: new ObsMapper(),
      }));

      const { container } = render(
        <Row
          controls={tableControls}
          formName={formName}
          formVersion={formVersion}
          id={0}
          isInTable
          onValueChanged={onChangeSpy}
          records={tableRecords}
          validate={false}
          validateForm={false}
        />
      );
      
      const emptyLeft = container.querySelector('.form-builder-column-empty-left');
      expect(emptyLeft).toBeInTheDocument();
    });

    it('should render empty div on the right when first column has obs and column 2 has no obs', () => {
      const tableControls = [
        {
          id: '100',
          type: 'randomType',
          value: 'Pulse',
          properties: { location: { row: 0, column: 0 } },
        }
      ];
      const tableRecords = tableControls.map((control) => ({
        control,
        obs: new Obs({ formFieldPath: `${formName}.${formVersion}/${control.id}` }),
        mapper: new ObsMapper(),
      }));

      const { container } = render(
        <Row
          controls={tableControls}
          formName={formName}
          formVersion={formVersion}
          id={0}
          isInTable
          onValueChanged={onChangeSpy}
          records={tableRecords}
          validate={false}
          validateForm={false}
        />
      );
      
      const emptyRight = container.querySelector('.form-builder-column-empty-right');
      expect(emptyRight).toBeInTheDocument();
    });

    it('should show the cell skeleton and hide its content when one of the two cells is hidden and other is visible', () => {
      const tableControls = [
        {
          id: '100',
          type: 'randomType',
          value: 'Pulse',
          properties: { location: { row: 0, column: 0 } },
        }, 
        {
          id: '101',
          type: 'randomType',
          value: 'Node',
          properties: { location: { row: 0, column: 1 } },
        }
      ];
      const tableRecords = tableControls.map((control) => ({
        control,
        obs: new Obs({ formFieldPath: `${formName}.${formVersion}/${control.id}` }),
        mapper: new ObsMapper(),
        hidden: control.properties.location.column === 1,
      }));

      const { container } = render(
        <Row
          controls={tableControls}
          formName={formName}
          formVersion={formVersion}
          id={0}
          isInTable
          onValueChanged={onChangeSpy}
          records={tableRecords}
          validate={false}
          validateForm={false}
        />
      );
      
      const columnWrappers = container.querySelectorAll('.form-builder-row .form-builder-column-wrapper');
      const columns = container.querySelectorAll('.form-builder-row .form-builder-column');
      const hiddenColumns = container.querySelectorAll('.form-builder-row .form-builder-column.hidden');
      
      expect(columnWrappers).toHaveLength(2);
      expect(columns).toHaveLength(2);
      expect(hiddenColumns).toHaveLength(1);
    });

    it('should hide the entire row if the two cells are hidden', () => {
      const tableControls = [
        {
          id: '100',
          type: 'randomType',
          value: 'Pulse',
          properties: { location: { row: 0, column: 0 } },
        }, 
        {
          id: '101',
          type: 'randomType',
          value: 'Node',
          properties: { location: { row: 0, column: 1 } },
        }
      ];
      const tableRecords = tableControls.map((control) => ({
        control,
        obs: new Obs({ formFieldPath: `${formName}.${formVersion}/${control.id}` }),
        mapper: new ObsMapper(),
        hidden: true,
      }));

      const { container } = render(
        <Row
          controls={tableControls}
          formName={formName}
          formVersion={formVersion}
          id={0}
          isInTable
          onValueChanged={onChangeSpy}
          records={tableRecords}
          validate={false}
          validateForm={false}
        />
      );
      
      const columnWrappers = container.querySelectorAll('.form-builder-row .form-builder-column-wrapper');
      const columns = container.querySelectorAll('.form-builder-row .form-builder-column');
      
      expect(columnWrappers).toHaveLength(0);
      expect(columns).toHaveLength(0);
    });

    it('should hide the entire row if one column has no obs and second is hidden', () => {
      const tableControls = [
        {
          id: '100',
          type: 'randomType',
          value: 'Pulse',
          properties: { location: { row: 0, column: 0 } },
        }
      ];
      const tableRecords = tableControls.map((control) => ({
        control,
        obs: new Obs({ formFieldPath: `${formName}.${formVersion}/${control.id}` }),
        mapper: new ObsMapper(),
        hidden: true,
      }));

      const { container } = render(
        <Row
          controls={tableControls}
          formName={formName}
          formVersion={formVersion}
          id={0}
          isInTable
          onValueChanged={onChangeSpy}
          records={tableRecords}
          validate={false}
          validateForm={false}
        />
      );
      
      const rowElement = container.querySelector('.form-builder-row');
      expect(rowElement).toBeInTheDocument();
      expect(rowElement).toBeEmptyDOMElement();
    });
  });

  it('should hide the row when control is hidden', () => {
    records[0].hidden = true;
    const { container } = renderWithIntl(
      <Row
        controls={controls}
        formName={formName}
        formVersion={formVersion}
        id={0}
        onValueChanged={onChangeSpy}
        records={records}
        validate={false}
        validateForm={false}
      />
    );
    
    const hiddenColumn = container.querySelector('.form-builder-column.hidden');
    expect(hiddenColumn).toBeInTheDocument();
  });

  it('should set same line class to the row when control is set same line', () => {
    const { container } = renderWithIntl(
      <Row
        controls={controls}
        formName={formName}
        formVersion={formVersion}
        id={0}
        onValueChanged={onChangeSpy}
        records={records}
        validate={false}
        validateForm={false}
      />
    );
    
    const sameLineColumn = container.querySelector('.form-builder-column.same-line');
    expect(sameLineColumn).toBeInTheDocument();
  });
});
