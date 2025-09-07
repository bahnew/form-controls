import { CodedValueMapper } from 'src/mapper/CodedValueMapper';

describe('CodedValueMapper', () => {
  const codedObsControl = {
    concept: {
      answers: [
        {
          displayString: 'Cephalic',
          uuid: 'c4526510-3f10-11e4-adec-0800271c1b75',
        },
        {
          displayString: 'Breech',
          uuid: 'c45329de-3f10-11e4-adec-0800271c1b75',
        },
        {
          displayString: 'Transverse',
          uuid: 'c453caa3-3f10-11e4-adec-0800271c1b75',
        },
      ],
      datatype: 'Coded',
      name: 'P/A Presenting Part',
      uuid: 'c4517f49-3f10-11e4-adec-0800271c1b75',
    },
    type: 'obsControl',
  };

  const mapper = new CodedValueMapper();

  it('should get value when given option value', () => {
    const name = 'Breech';
    const originalValue = { displayString: name };

    const value = mapper.getValue(codedObsControl, originalValue);

    expect(value).toBe(name);
  });

  it('should set value when given option name', () => {
    const originalValue = 'Breech';

    const value = mapper.setValue(codedObsControl, originalValue);

    expect(value).toBeInstanceOf(Object);
    expect(value.displayString).toBe(originalValue);
  });
});
