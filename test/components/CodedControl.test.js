import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { CodedControl } from 'components/CodedControl.jsx';
import constants from 'src/constants';
import ComponentStore from 'src/helpers/componentStore';
import { Util } from 'src/helpers/Util';

describe('CodedControl', () => {
  const SimpleComponent = ({ options, onValueChange, value, validate, validations, enabled }) => (
    <div data-testid="simple-control">
      <div data-testid="options-length">{options?.length || 0}</div>
      <div data-testid="validations-length">{validations?.length || 0}</div>
      <div data-testid="enabled-state">{enabled !== false ? 'enabled' : 'disabled'}</div>
      <div data-testid="validate-state">{validate ? 'validating' : 'not-validating'}</div>
      <button 
        data-testid="trigger-change"
        onClick={() => onValueChange({ value: 'test-value' }, [])}
      >
        Trigger Change
      </button>
      <button 
        data-testid="trigger-clear"
        onClick={() => onValueChange(undefined, [])}
      >
        Clear
      </button>
    </div>
  );

  const options = [
    {
      translationKey: 'ANSWER_1',
      name: { display: 'Answer1' },
      uuid: 'answer1uuid',
    },
    {
      translationKey: 'ANSWER_2',
      name: { display: 'Answer2' },
      uuid: 'answer2uuid',
    },
    {
      translationKey: 'ANSWER_3',
      name: { display: 'Answer3' },
      uuid: 'answer3uuid',
    },
    {
      translationKey: 'ANSWER_4',
      name: { display: 'Answer4' },
      uuid: 'answer4uuid',
    },
    {
      translationKey: 'ANSWER_5',
      name: { display: 'Answer5' },
      uuid: 'answer5uuid',
    },
  ];

  const codedData = [
    {
      conceptName: 'Yes',
      conceptUuid: '12345',
      matchedName: 'Yes',
      conceptSystem: 'http://systemurl.com',
    },
    {
      conceptName: 'No',
      conceptUuid: '67890',
      matchedName: 'No',
      conceptSystem: 'http://systemurl.com',
    },
  ];

  const config = {
    config: {
      terminologyService: { limit: 20 },
    },
  };

  const mockIntl = {
    formatMessage: jest.fn(({ defaultMessage }) => defaultMessage),
  };

  let onChangeSpy;
  let showNotificationSpy;

  beforeEach(() => {
    onChangeSpy = jest.fn();
    showNotificationSpy = jest.fn();
  });

  describe('FHIR Value set URL functionality', () => {
    let getAnswersStub;
    let getConfigStub;
    let formatConceptsStub;

    beforeEach(() => {
      jest.spyOn(ComponentStore, 'getRegisteredComponent').mockReturnValue(SimpleComponent);
      getAnswersStub = jest.spyOn(Util, 'getAnswers').mockResolvedValue(codedData);
      getConfigStub = jest.spyOn(Util, 'getConfig').mockResolvedValue(config);
      formatConceptsStub = jest.spyOn(Util, 'formatConcepts').mockReturnValue(options);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should fetch coded data from the url', async () => {
      const properties = { url: 'someUrl' };
      
      render(
        <CodedControl
          intl={mockIntl}
          enabled
          onChange={onChangeSpy}
          options={options}
          properties={properties}
          showNotification={showNotificationSpy}
          validate={false}
          validateForm={false}
          validations={[]}
        />
      );

      await waitFor(() => {
        expect(getAnswersStub).toHaveBeenCalledWith(properties.url, '', 20);
        expect(getConfigStub).toHaveBeenCalledWith(properties.url);
      });
    });

    it('should not fetch data from url if autocomplete is true', async () => {
      const properties = { url: 'someUrl', autoComplete: true };
      
      render(
        <CodedControl
          intl={mockIntl}
          enabled
          onChange={onChangeSpy}
          options={options}
          properties={properties}
          showNotification={showNotificationSpy}
          validate={false}
          validateForm={false}
          validations={[]}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('simple-control')).toBeInTheDocument();
      });
      
      expect(getAnswersStub).not.toHaveBeenCalled();
    });

    it('should show notification when fetch fails', async () => {
      const properties = { url: 'someUrl' };
      getAnswersStub.mockRejectedValue(new Error('Fetch failed'));
      
      render(
        <CodedControl
          intl={mockIntl}
          enabled
          onChange={onChangeSpy}
          options={options}
          properties={properties}
          showNotification={showNotificationSpy}
          validate={false}
          validateForm={false}
          validations={[]}
        />
      );

      await waitFor(() => {
        expect(showNotificationSpy).toHaveBeenCalledWith(
          'Something unexpected happened.',
          constants.messageType.error
        );
      });
    });
  });

  describe('Component rendering and behavior', () => {
    beforeEach(() => {
      jest.spyOn(ComponentStore, 'getRegisteredComponent').mockReturnValue(SimpleComponent);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should render component with correct props and handle interactions', () => {
      const validations = [constants.validations.allowDecimal, constants.validations.mandatory];
      
      render(
        <CodedControl
          intl={mockIntl}
          enabled={false}
          onChange={onChangeSpy}
          options={options}
          properties={{}}
          validate={true}
          validateForm={false}
          validations={validations}
        />
      );

      expect(screen.getByTestId('simple-control')).toBeInTheDocument();
      expect(screen.getByTestId('options-length')).toHaveTextContent('5');
      expect(screen.getByTestId('validations-length')).toHaveTextContent('2');
      expect(screen.getByTestId('enabled-state')).toHaveTextContent('disabled');
      expect(screen.getByTestId('validate-state')).toHaveTextContent('validating');

      const changeButton = screen.getByTestId('trigger-change');
      changeButton.click();

      expect(onChangeSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          errors: [],
          triggerControlEvent: undefined
        })
      );

      const clearButton = screen.getByTestId('trigger-clear');
      clearButton.click();

      expect(onChangeSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          value: undefined,
          errors: []
        })
      );
    });

    it('should return null when registered component not found', () => {
      jest.spyOn(ComponentStore, 'getRegisteredComponent').mockReturnValue(null);
      
      const { container } = render(
        <CodedControl
          intl={mockIntl}
          onChange={onChangeSpy}
          options={options}
          properties={{}}
          validate={false}
          validateForm={false}
          validations={[]}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it('should handle empty options', () => {
      render(
        <CodedControl
          intl={mockIntl}
          onChange={onChangeSpy}
          options={[]}
          properties={{}}
          validate={false}
          validateForm={false}
          validations={[]}
        />
      );

      expect(screen.getByTestId('options-length')).toHaveTextContent('0');
    });
  });

  describe('Translation and display types', () => {
    beforeEach(() => {
      jest.spyOn(ComponentStore, 'getRegisteredComponent').mockReturnValue(SimpleComponent);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should handle different name formats and translation keys', () => {
      const mixedOptions = [
        { name: { display: 'Object Name' }, uuid: 'uuid1' },
        { name: 'String Name', uuid: 'uuid2' },
        { translationKey: 'KEY_1', name: { display: 'With Key' }, uuid: 'uuid3' }
      ];

      render(
        <CodedControl
          intl={mockIntl}
          onChange={onChangeSpy}
          options={mixedOptions}
          properties={{}}
          validate={false}
          validateForm={false}
          validations={[]}
        />
      );

      expect(mockIntl.formatMessage).toHaveBeenCalledWith(
        expect.objectContaining({ defaultMessage: 'Object Name' })
      );
      expect(mockIntl.formatMessage).toHaveBeenCalledWith(
        expect.objectContaining({ defaultMessage: 'String Name' })
      );
      expect(mockIntl.formatMessage).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'KEY_1', defaultMessage: 'With Key' })
      );
    });

    it('should handle dropDown display type', () => {
      render(
        <CodedControl
          intl={mockIntl}
          onChange={onChangeSpy}
          options={options}
          properties={{ dropDown: true }}
          validate={false}
          validateForm={false}
          validations={[]}
        />
      );

      expect(ComponentStore.getRegisteredComponent).toHaveBeenCalledWith('dropDown');
      expect(screen.getByTestId('simple-control')).toBeInTheDocument();
    });

    it('should handle autoComplete display type', () => {
      render(
        <CodedControl
          intl={mockIntl}
          onChange={onChangeSpy}
          options={options}
          properties={{ autoComplete: true }}
          validate={false}
          validateForm={false}
          validations={[]}
        />
      );

      expect(ComponentStore.getRegisteredComponent).toHaveBeenCalledWith('autoComplete');
    });
  });

  describe('Value mapping and multi-select functionality', () => {
    const ExtendedComponent = ({ options, onValueChange, value, multiSelect, url }) => (
      <div data-testid="extended-control">
        <div data-testid="multi-select-state">{multiSelect ? 'multi' : 'single'}</div>
        <div data-testid="url-state">{url ? 'has-url' : 'no-url'}</div>
        <div data-testid="current-value">{JSON.stringify(value || null)}</div>
        <button 
          data-testid="set-single-value"
          onClick={() => onValueChange({ value: 'answer1uuid' }, [])}
        >
          Set Single
        </button>
        <button 
          data-testid="set-multi-value"
          onClick={() => onValueChange([
            { value: 'answer1uuid' },
            { value: 'answer2uuid' }
          ], [])}
        >
          Set Multi
        </button>
        <button 
          data-testid="set-url-value"
          onClick={() => onValueChange('url-value-test', [])}
        >
          Set URL Value
        </button>
      </div>
    );

    let getAnswersStub;
    let getConfigStub;

    beforeEach(() => {
      jest.spyOn(ComponentStore, 'getRegisteredComponent').mockReturnValue(ExtendedComponent);
      getAnswersStub = jest.spyOn(Util, 'getAnswers').mockResolvedValue([]);
      getConfigStub = jest.spyOn(Util, 'getConfig').mockResolvedValue({ config: {} });
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should handle single-select value processing', () => {
      render(
        <CodedControl
          intl={mockIntl}
          onChange={onChangeSpy}
          options={options}
          properties={{}}
          validate={false}
          validateForm={false}
          validations={[]}
        />
      );

      expect(screen.getByTestId('multi-select-state')).toHaveTextContent('single');
      
      const setButton = screen.getByTestId('set-single-value');
      setButton.click();

      expect(onChangeSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          value: expect.objectContaining({
            uuid: 'answer1uuid',
            translationKey: 'ANSWER_1'
          })
        })
      );
    });

    it('should handle multi-select value processing', () => {
      render(
        <CodedControl
          intl={mockIntl}
          onChange={onChangeSpy}
          options={options}
          properties={{ multiSelect: true }}
          validate={false}
          validateForm={false}
          validations={[]}
        />
      );

      expect(screen.getByTestId('multi-select-state')).toHaveTextContent('multi');
      
      const setButton = screen.getByTestId('set-multi-value');
      setButton.click();

      expect(onChangeSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          value: expect.arrayContaining([
            expect.objectContaining({ uuid: 'answer1uuid', translationKey: 'ANSWER_1' }),
            expect.objectContaining({ uuid: 'answer2uuid', translationKey: 'ANSWER_2' })
          ])
        })
      );
    });

    it('should handle URL-based options differently', async () => {
      render(
        <CodedControl
          intl={mockIntl}
          onChange={onChangeSpy}
          options={options}
          properties={{ url: 'http://test-url.com' }}
          validate={false}
          validateForm={false}
          validations={[]}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('url-state')).toHaveTextContent('has-url');
      });
      
      const setButton = screen.getByTestId('set-url-value');
      setButton.click();

      expect(onChangeSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          value: 'url-value-test'
        })
      );
    });

    it('should process values with existing value prop', () => {
      const existingValue = { uuid: 'answer1uuid', value: 'answer1uuid' };
      
      render(
        <CodedControl
          intl={mockIntl}
          onChange={onChangeSpy}
          options={options}
          properties={{}}
          value={existingValue}
          validate={false}
          validateForm={false}
          validations={[]}
        />
      );

      expect(screen.getByTestId('current-value')).toHaveTextContent(
        JSON.stringify({ name: 'Answer1', value: 'answer1uuid' })
      );
    });

    it('should handle multi-select with existing values', () => {
      const existingValues = [
        { uuid: 'answer1uuid', value: 'answer1uuid' },
        { uuid: 'answer2uuid', value: 'answer2uuid' }
      ];
      
      render(
        <CodedControl
          intl={mockIntl}
          onChange={onChangeSpy}
          options={options}
          properties={{ multiSelect: true }}
          value={existingValues}
          validate={false}
          validateForm={false}
          validations={[]}
        />
      );

      const currentValue = JSON.parse(screen.getByTestId('current-value').textContent);
      expect(currentValue).toHaveLength(2);
      expect(currentValue[0]).toMatchObject({ name: 'Answer1', value: 'answer1uuid' });
      expect(currentValue[1]).toMatchObject({ name: 'Answer2', value: 'answer2uuid' });
    });
  });

  describe('Complex value processing and edge cases', () => {
    const AdvancedComponent = ({ options, onValueChange, terminologyServiceConfig }) => (
      <div data-testid="advanced-control">
        <div data-testid="config-limit">{terminologyServiceConfig?.limit || 30}</div>
        <button 
          data-testid="trigger-mapping-scenario"
          onClick={() => onValueChange({ value: 'answer1uuid' }, [])}
        >
          Trigger Mapping
        </button>
        <button 
          data-testid="trigger-fallback-value"
          onClick={() => onValueChange({ 
            value: 'unknown-uuid',
            uuid: 'unknown-uuid',
            name: 'Fallback Name'
          }, [])}
        >
          Trigger Fallback
        </button>
      </div>
    );

    beforeEach(() => {
      jest.spyOn(ComponentStore, 'getRegisteredComponent').mockReturnValue(AdvancedComponent);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should handle terminology service configuration updates', async () => {
      const getConfigStub = jest.spyOn(Util, 'getConfig').mockResolvedValue({
        config: { terminologyService: { limit: 50, source: 'custom-source' } }
      });
      jest.spyOn(Util, 'getAnswers').mockResolvedValue([]);
      
      render(
        <CodedControl
          intl={mockIntl}
          onChange={onChangeSpy}
          options={options}
          properties={{ url: 'http://config-test.com' }}
          validate={false}
          validateForm={false}
          validations={[]}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('config-limit')).toHaveTextContent('50');
      });

      getConfigStub.mockRestore();
    });

    it('should handle values with mappings and create fallback values', () => {
      render(
        <CodedControl
          intl={mockIntl}
          onChange={onChangeSpy}
          options={options}
          properties={{}}
          validate={false}
          validateForm={false}
          validations={[]}
        />
      );

      const mappingButton = screen.getByTestId('trigger-mapping-scenario');
      mappingButton.click();

      expect(onChangeSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          value: expect.objectContaining({
            uuid: 'answer1uuid'
          })
        })
      );

      const fallbackButton = screen.getByTestId('trigger-fallback-value');
      fallbackButton.click();

      expect(onChangeSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          value: undefined
        })
      );
    });
  });
});
