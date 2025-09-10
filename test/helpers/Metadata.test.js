import { Concept } from "src/helpers/Concept";
import { Metadata } from "src/helpers/Metadata";
import { IDGenerator } from 'src/helpers/idGenerator';

jest.mock('src/helpers/componentStore', () => ({
  getDesignerComponent: jest.fn()
}));

import ComponentStore from 'src/helpers/componentStore';

describe('Metadata', () => {
  beforeEach(() => {
    ComponentStore.getDesignerComponent.mockImplementation((type) => {
      if (type === 'obsGroupControl') {
        return {
          metadata: {
            attributes: [
              {
                name: 'type',
                dataType: 'text',
                defaultValue: 'obsGroupControl',
              },
              {
                name: 'label',
                dataType: 'complex',
                attributes: [
                  {
                    name: 'type',
                    dataType: 'text',
                    defaultValue: 'label',
                  },
                  {
                    name: 'value',
                    dataType: 'text',
                    defaultValue: 'Label',
                  },
                ],
              },
              {
                name: 'properties',
                dataType: 'complex',
                attributes: [
                  {
                    name: 'location',
                    dataType: 'complex',
                    attributes: [
                      {
                        name: 'row',
                        dataType: 'number',
                        defaultValue: 0,
                      },
                      {
                        name: 'column',
                        dataType: 'number',
                        defaultValue: 0,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        };
      }
      if (type === 'obsControl') {
        return {
          metadata: {
            attributes: [
              {
                name: 'type',
                dataType: 'text',
                defaultValue: 'obsControl',
              },
              {
                name: 'label',
                dataType: 'complex',
                attributes: [
                  {
                    name: 'type',
                    dataType: 'text',
                    defaultValue: 'label',
                  },
                  {
                    name: 'value',
                    dataType: 'text',
                    defaultValue: 'Label',
                  },
                ],
              },
              {
                name: 'properties',
                dataType: 'complex',
                attributes: [
                  {
                    name: 'location',
                    dataType: 'complex',
                    attributes: [
                      {
                        name: 'row',
                        dataType: 'number',
                        defaultValue: 0,
                      },
                      {
                        name: 'column',
                        dataType: 'number',
                        defaultValue: 0,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        };
      }
      return undefined;
    });
  });

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

  it('should retrieve metadata for concept set', () => {
    const idGenerator = new IDGenerator();
    const concept = new Concept(abnormalConcept);
    const metadata = new Metadata().getMetadataForConcept(concept.getConcept(), idGenerator, 'obsGroupControl', 'obsControl');

    expect(metadata.id).toEqual('3');
    expect(metadata.type).toEqual('obsGroupControl');
    expect(metadata.label).toEqual({ type: 'label', value: 'Pulse Data' });
    expect(metadata.concept).toEqual(concept.getConcept());
    expect(metadata.controls.length).toEqual(2);

    expect(metadata.controls[0].id).toEqual('1');
    expect(metadata.controls[0].type).toEqual('obsControl');
    expect(metadata.controls[0].label).toEqual({ type: 'label', value: 'Pulse' });
    expect(metadata.controls[0].concept).toEqual(concept.getConcept().setMembers[0]);

    expect(metadata.controls[1].id).toEqual('2');
    expect(metadata.controls[1].type).toEqual('obsControl');
    expect(metadata.controls[1].label).toEqual({ type: 'label', value: 'Pulse Abnormal' });
    expect(metadata.controls[1].concept).toEqual(concept.getConcept().setMembers[1]);
  });

  it('should retrieve metadata for a concept', () => {
    const idGenerator = new IDGenerator();
    const concept = new Concept(abnormalConcept.setMembers[0]);
    const metadata = new Metadata().getMetadataForConcept(concept.getConcept(), idGenerator, 'obsControl', undefined);

    expect(metadata.type).toEqual('obsControl');
    expect(metadata.label).toEqual({ type: 'label', value: 'Pulse' });
    expect(metadata.concept).toEqual(concept.getConcept());
  });

  it('should add the required fields for the metadata', () => {
    const idGenerator = new IDGenerator([{id:19}]);
    const concept = new Concept(abnormalConcept.setMembers[0]);

    const metadata = new Metadata().getMetadataForConcept(concept.getConcept(), idGenerator, 'obsControl', undefined, { row: 2, column: 4});
    expect(metadata.id).toEqual('20');
    expect(metadata.properties.location).toEqual({ row: 2, column: 4 });
  });

  it('should handle nested concept sets', () => {
    const nestedSetConcept = {
      uuid: 'nested-uuid',
      display: 'Nested Set',
      name: { 
        uuid: 'nested-name-uuid',
        name: 'Nested Set' 
      },
      conceptClass: {
        uuid: 'nested-class-uuid',
        name: 'Nested Class',
      },
      datatype: {
        uuid: 'nested-datatype-uuid',
        name: 'N/A',
      },
      set: true,
      setMembers: [
        {
          uuid: 'nested-child-set-uuid',
          display: 'Nested Child Set',
          name: { 
            uuid: 'nested-child-name-uuid',
            name: 'Nested Child Set' 
          },
          conceptClass: {
            uuid: 'nested-child-class-uuid',
            name: 'Child Class',
          },
          datatype: {
            uuid: 'nested-child-datatype-uuid',
            name: 'N/A',
          },
          set: true,
          setMembers: [
            {
              uuid: 'nested-leaf-uuid',
              display: 'Nested Leaf',
              name: { 
                uuid: 'nested-leaf-name-uuid',
                name: 'Nested Leaf' 
              },
              conceptClass: {
                uuid: 'nested-leaf-class-uuid',
                name: 'Leaf Class',
              },
              datatype: {
                uuid: 'nested-leaf-datatype-uuid',
                name: 'Text',
              },
              set: false
            }
          ]
        },
        {
          uuid: 'regular-child-uuid',
          display: 'Regular Child',
          name: { 
            uuid: 'regular-child-name-uuid',
            name: 'Regular Child' 
          },
          conceptClass: {
            uuid: 'regular-child-class-uuid',
            name: 'Regular Class',
          },
          datatype: {
            uuid: 'regular-child-datatype-uuid',
            name: 'Text',
          },
          set: false
        }
      ]
    };

    const idGenerator = new IDGenerator();
    const concept = new Concept(nestedSetConcept);
    const metadata = new Metadata().getMetadataForConcept(concept.getConcept(), idGenerator, 'obsGroupControl', 'obsControl');

    expect(metadata.controls).toHaveLength(2);
    expect(metadata.controls[0].type).toEqual('obsGroupControl');
    expect(metadata.controls[1].type).toEqual('obsControl');
  });

  it('should use default type parameter when not provided', () => {
    const idGenerator = new IDGenerator();
    const concept = new Concept(abnormalConcept);
    const metadata = new Metadata().getMetadataForConcept(concept.getConcept(), idGenerator);

    expect(metadata.type).toEqual('obsGroupControl');
    expect(metadata.label).toEqual({ type: 'label', value: 'Pulse Data' });
  });
});
