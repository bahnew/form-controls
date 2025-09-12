import { Concept } from 'src/helpers/Concept';

describe('Concept', () => {
  const abnormalConcept = {
    uuid: 'c36af094-3f10-11e4-adec-0800271c1b75',
    display: 'Pulse Data',
    allowDecimal: null,
    name: {
      uuid: 'c36af707-3f10-11e4-adec-0800271c1b75',
      name: 'Pulse Data',
    },
    conceptClass: {
      uuid: '82516ba3-3f10-11e4-adec-0800271c1b75',
      name: 'Concept Details',
    },
    datatype: {
      uuid: '8d4a4c94-c2cc-11de-8d13-0010c6dffd0f',
      name: 'N/A',
    },
    set: true,
    setMembers: [
      {
        uuid: 'c36bc411-3f10-11e4-adec-0800271c1b75',
        display: 'Pulse',
        allowDecimal: true,
        name: {
          uuid: 'c36bcba8-3f10-11e4-adec-0800271c1b75',
          name: 'Pulse',
        },
        conceptClass: {
          uuid: '8d492774-c2cc-11de-8d13-0010c6dffd0f',
          name: 'Misc',
        },
        datatype: {
          uuid: '8d4a4488-c2cc-11de-8d13-0010c6dffd0f',
          name: 'Numeric',
        },
        units: '/min',
      },
      {
        uuid: 'c36c7c98-3f10-11e4-adec-0800271c1b75',
        display: 'Pulse Abnormal',
        allowDecimal: null,
        name: {
          uuid: 'c36c82d6-3f10-11e4-adec-0800271c1b75',
          name: 'Pulse Abnormal',
        },
        conceptClass: {
          uuid: '824a6818-3f10-11e4-adec-0800271c1b75',
          name: 'Abnormal',
        },
        datatype: {
          uuid: '8d4a5cca-c2cc-11de-8d13-0010c6dffd0f',
          name: 'Boolean',
        },
      },
    ],
  };

  it('should retrieve abnormal set member', () => {
    const concept = new Concept(abnormalConcept);
    const abnormalSetMember = concept.getAbnormalSetMember();
    expect(abnormalSetMember).toEqual({
      uuid: 'c36c7c98-3f10-11e4-adec-0800271c1b75',
      name: 'Pulse Abnormal',
      description: undefined,
      datatype: 'Boolean',
      conceptClass: 'Abnormal',
      conceptHandler: undefined,
      units: undefined,
      hiNormal: undefined,
      lowNormal: undefined,
      hiAbsolute: undefined,
      lowAbsolute: undefined,
      answers: undefined,
      properties: {
        allowDecimal: null,
      },
    });
  });

  it('should return undefined if abnormal set member is not present', () => {
    const concept = new Concept({
      uuid: 'someUuid',
      name: { name: 'someName' },
    });
    const abnormalSetMember = concept.getAbnormalSetMember();
    expect(abnormalSetMember).toBeUndefined();
  });

  it('should retrieve first numeric set member', () => {
    const concept = new Concept(abnormalConcept);
    const numericSetMember = concept.findFirstNumericSetMember();
    expect(numericSetMember).toEqual({
      name: 'Pulse',
      uuid: 'c36bc411-3f10-11e4-adec-0800271c1b75',
      description: undefined,
      datatype: 'Numeric',
      conceptClass: 'Misc',
      conceptHandler: undefined,
      units: '/min',
      hiNormal: undefined,
      lowNormal: undefined,
      hiAbsolute: undefined,
      lowAbsolute: undefined,
      answers: undefined,
      properties: {
        allowDecimal: true,
      },
    });
  });

  it('should return undefined if numeric set member is not present', () => {
    const concept = new Concept({
      uuid: 'someUuid',
      name: { name: 'someName' },
    });
    const numericSetMember = concept.findFirstNumericSetMember();
    expect(numericSetMember).toBeUndefined();
  });

  it('should retrieve the setMembers of a concept', () => {
    const concept = new Concept(abnormalConcept);
    const _concept = concept.getConcept();
    expect(_concept.setMembers).toHaveLength(2);
    expect(_concept.setMembers[0]).toEqual({
      name: 'Pulse',
      uuid: 'c36bc411-3f10-11e4-adec-0800271c1b75',
      description: undefined,
      datatype: 'Numeric',
      conceptClass: 'Misc',
      conceptHandler: undefined,
      units: '/min',
      hiNormal: undefined,
      lowNormal: undefined,
      hiAbsolute: undefined,
      lowAbsolute: undefined,
      answers: undefined,
      properties: {
        allowDecimal: true,
      },
    });

    expect(_concept.setMembers[1]).toEqual({
      uuid: 'c36c7c98-3f10-11e4-adec-0800271c1b75',
      name: 'Pulse Abnormal',
      description: undefined,
      datatype: 'Boolean',
      conceptClass: 'Abnormal',
      conceptHandler: undefined,
      units: undefined,
      hiNormal: undefined,
      lowNormal: undefined,
      hiAbsolute: undefined,
      lowAbsolute: undefined,
      answers: undefined,
      properties: {
        allowDecimal: null,
      },
    });
  });
});
