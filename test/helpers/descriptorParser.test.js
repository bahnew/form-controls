import { DescriptorParser } from 'src/helpers/descriptorParser';

describe('DescriptorParser', () => {
  it('should create metadata json', () => {
    const descriptorMetadata = {
      metadata: {
        attributes: [
          { dataType: 'text', defaultValue: 'obsControl', name: 'type' },
          { dataType: 'text', defaultValue: 'numeric', name: 'displayType' },
          {
            dataType: 'complex',
            name: 'properties',
            attributes: [
              { dataType: 'boolean', name: 'mandatory' },
              { name: 'validations', dataType: 'complex', attributes: [] },
              {
                name: 'i18N',
                dataType: 'complex',
                attributes: [{ dataType: 'text', name: 'key' }],
              },
            ],
          },
        ],
      },
    };

    const expectedMetadata = {
      type: 'obsControl',
      displayType: 'numeric',
      properties: {
        mandatory: false,
        validations: {},
        i18N: {
          key: '',
        },
      },
    };

    const descriptorParser = new DescriptorParser(descriptorMetadata);
    const metadata = descriptorParser.metadata();

    expect(metadata).toEqual(expectedMetadata);
  });

  it('should return empty metadata json when attributes are empty', () => {
    const descriptorMetadata = { metadata: { attributes: [] } };
    const descriptorParser = new DescriptorParser(descriptorMetadata);
    const metadata = descriptorParser.metadata();
    expect(metadata).toEqual({});
  });

  it('should return control', () => {
    const descriptorMetadata = { control: 'someControl', metadata: { attributes: [] } };
    const descriptorParser = new DescriptorParser(descriptorMetadata);
    expect(descriptorParser.control()).toEqual('someControl');
  });

  it('should return designAttributes', () => {
    const descriptorMetadata = {
      designProperties: { isTopLevelComponent: true },
      metadata: { attributes: [] },
    };
    const descriptorParser = new DescriptorParser(descriptorMetadata);
    expect(descriptorParser.designProperties()).toEqual({ isTopLevelComponent: true });
  });

  it('should give default value based on type', () => {
    const descriptorParser = new DescriptorParser({ metadata: { attributes: [] } });
    expect(descriptorParser.getDefaultValueByType('text')).toBe('');
    expect(descriptorParser.getDefaultValueByType('numeric')).toBe(0);
    expect(descriptorParser.getDefaultValueByType('boolean')).toBe(false);
    expect(descriptorParser.getDefaultValueByType('complex')).toEqual({});
    expect(descriptorParser.getDefaultValueByType('aggregate')).toEqual([]);
    expect(descriptorParser.getDefaultValueByType('somethingRandom')).toBe(null);
  });

  it('should return complete data object', () => {
    const descriptorMetadata = {
      control: 'textControl',
      designProperties: { isVisible: true },
      metadata: {
        attributes: [
          { dataType: 'text', defaultValue: 'default', name: 'value' }
        ]
      }
    };

    const descriptorParser = new DescriptorParser(descriptorMetadata);
    const data = descriptorParser.data();

    expect(data).toEqual({
      designProperties: { isVisible: true },
      metadata: { value: 'default' },
      control: 'textControl'
    });
  });
});
