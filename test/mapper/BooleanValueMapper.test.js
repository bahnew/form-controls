import { BooleanValueMapper } from 'src/mapper/BooleanValueMapper';

describe('BooleanValueMapper', () => {
  const booleanObsControl = {
    concept: {
      answers: [],
      datatype: 'Boolean',
      name: 'Smoking History',
      uuid: 'c2a43174-c9db-4e54-8516-17372c83537f',
    },
    label: {
      type: 'label',
      value: 'Smoking History',
    },
    options: [
      {
        name: 'Yes',
        value: true,
      },
      {
        name: 'No',
        value: false,
      },
    ],
    type: 'obsControl',
  };

  const mapper = new BooleanValueMapper();

  it('should get value when given option value', () => {
    const value = mapper.getValue(booleanObsControl, false);
    expect(value).toBe('No');
  });

  it('should set value when given option name', () => {
    const value = mapper.setValue(booleanObsControl, 'Yes');
    expect(value).toBe(true);
  });

  it('should handle invalid inputs gracefully', () => {
    expect(mapper.getValue(booleanObsControl, null)).toBeUndefined();
    expect(mapper.setValue(booleanObsControl, 'Invalid')).toBeUndefined();
  });
});
