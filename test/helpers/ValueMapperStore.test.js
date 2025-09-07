import ValueMapperStore from 'src/helpers/ValueMapperStore';
import { BooleanValueMapper } from 'src/mapper/BooleanValueMapper';
import { CodedValueMapper } from 'src/mapper/CodedValueMapper';
import { CodedMultiSelectValueMapper } from 'src/mapper/CodedMultiSelectValueMapper';

describe('ValueMapperStore', () => {
  it('should get undefined when given obs control\'s type is not boolean or coded', () => {
    const obsControls = [
      { concept: { datatype: 'Text' } },
      { concept: { datatype: 'Date' } },
      { concept: { datatype: 'Datetime' } },
      { concept: { datatype: 'Numeric' } },
    ];

    obsControls.forEach(obsControl => {
      const datatypeMapper = ValueMapperStore.getMapper(obsControl);

      expect(datatypeMapper).toBeUndefined();
    });
  });

  it('should get boolean control mapper when given boolean obs control', () => {
    const booleanObsControl = {
      concept: {
        datatype: 'Boolean',
      },
    };

    const datatypeMapper = ValueMapperStore.getMapper(booleanObsControl);

    expect(datatypeMapper instanceof BooleanValueMapper).toBe(true);
  });

  it('should get coded control mapper when given coded obs control', () => {
    const codedObsControl = {
      concept: {
        datatype: 'Coded',
      },
    };

    const datatypeMapper = ValueMapperStore.getMapper(codedObsControl);

    expect(datatypeMapper instanceof CodedValueMapper).toBe(true);
  });

  it('should get codedMultiSelect value mapper when given obs control is coded multiSelect', () => {
    const codedMultiSelectObsControl = {
      properties: { multiSelect: true },
      concept: {
        datatype: 'Coded',
      },
    };

    const datatypeMapper = ValueMapperStore.getMapper(codedMultiSelectObsControl);

    expect(datatypeMapper instanceof CodedMultiSelectValueMapper).toBe(true);
  });

  it('should return same instance when constructor is called multiple times (singleton)', () => {
    const store1 = new ValueMapperStore.constructor();
    const store2 = new ValueMapperStore.constructor();

    expect(store1).toBe(store2);
  });

  it('should return undefined when control has no concept property', () => {
    const controlWithoutConcept = { properties: { multiSelect: true } };

    expect(ValueMapperStore.getMapper(controlWithoutConcept)).toBeUndefined();
  });

  it('should return undefined when concept has no datatype property', () => {
    const controlWithoutDatatype = { concept: {} };

    expect(ValueMapperStore.getMapper(controlWithoutDatatype)).toBeUndefined();
  });

  it('should return coded mapper when coded control has no properties', () => {
    const codedControlWithoutProperties = {
      concept: { datatype: 'Coded' }
    };

    const datatypeMapper = ValueMapperStore.getMapper(codedControlWithoutProperties);

    expect(datatypeMapper instanceof CodedValueMapper).toBe(true);
  });

  it('should register and retrieve value mapper', () => {
    const mockMapper = { test: 'mapper' };
    
    ValueMapperStore.registerValueMapper('TestType', mockMapper);
    
    const testControl = {
      concept: { datatype: 'TestType' }
    };
    
    const retrievedMapper = ValueMapperStore.getMapper(testControl);
    
    expect(retrievedMapper).toBe(mockMapper);
  });

  it('should return undefined for registered type when mapper is not found', () => {
    const controlWithUnregisteredType = {
      concept: { datatype: 'UnregisteredType' }
    };

    const datatypeMapper = ValueMapperStore.getMapper(controlWithUnregisteredType);

    expect(datatypeMapper).toBeUndefined();
  });
});
