import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { CodedControlDesigner } from 'components/designer/CodedControl.jsx';
import ComponentStore from 'src/helpers/componentStore';
import { Util } from 'src/helpers/Util';
import TranslationKeyGenerator from 'src/services/TranslationKeyService';

jest.mock('src/helpers/Util');
jest.mock('src/services/TranslationKeyService');

describe('Coded Control Designer', () => {
  const DummyControl = ({ options, labelKey, asynchronous }) => (
    <div data-testid="dummy-control">
      <div data-testid="options-count">{options.length}</div>
      <div data-testid="label-key">{labelKey}</div>
      <div data-testid="asynchronous">{asynchronous.toString()}</div>
      {options.map((option, index) => (
        <div key={index} data-testid={`option-${index}`}>
          {option.name} - {option.value}
        </div>
      ))}
    </div>
  );

  let metadata;

  beforeEach(() => {
    jest.clearAllMocks();
    ComponentStore.registerDesignerComponent('button', {
      control: DummyControl,
    });
  });

  afterEach(() => {
    ComponentStore.deRegisterDesignerComponent('button');
    ComponentStore.deRegisterDesignerComponent('autoComplete');
    ComponentStore.deRegisterDesignerComponent('dropDown');
  });

  describe('when FHIR Value set url is provided', () => {
    beforeEach(() => {
      metadata = {
        id: '100',
        type: 'obsControl',
        concept: {
          uuid: '70645842-be6a-4974-8d5f-45b52990e132',
          name: 'Pulse',
          datatype: 'Coded',
          answers: [],
        },
        properties: {
          url: 'someUrl',
        },
      };
    });

    it('should call setError when url is invalid', async () => {
      const setErrorSpy = jest.fn();
      const mockError = new Error('Invalid URL');
      Util.getAnswers.mockRejectedValue(mockError);

      render(<CodedControlDesigner metadata={metadata} setError={setErrorSpy} />);

      await waitFor(() => {
        expect(setErrorSpy).toHaveBeenCalledWith({ message: 'Something unexpected happened.' });
      });
    });

    it('should fetch data from FHIR Value set API', async () => {
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
      Util.getAnswers.mockResolvedValue(codedData);

      render(<CodedControlDesigner metadata={metadata} />);

      await waitFor(() => {
        expect(Util.getAnswers).toHaveBeenCalledWith(metadata.properties.url);
      });

      await waitFor(() => {
        expect(screen.getByTestId('dummy-control')).toBeInTheDocument();
        expect(screen.getByTestId('options-count')).toHaveTextContent('2');
      });
    });
  });

  describe('when FHIR Value set url is not provided', () => {
    beforeEach(() => {
      metadata = {
        id: '100',
        type: 'obsControl',
        concept: {
          uuid: '70645842-be6a-4974-8d5f-45b52990e132',
          name: 'Pulse',
          datatype: 'Coded',
          answers: [
            {
              name: {
                display: 'answer1',
              },
              uuid: 'uuid',
            },
          ],
        },
        properties: {},
      };
    });

    it('should render control with concept answers', async () => {
      render(<CodedControlDesigner metadata={metadata} />);

      await waitFor(() => {
        expect(screen.getByTestId('dummy-control')).toBeInTheDocument();
        expect(screen.getByTestId('options-count')).toHaveTextContent('1');
        expect(screen.getByTestId('option-0')).toHaveTextContent('answer1 - uuid');
        expect(screen.getByTestId('label-key')).toHaveTextContent('name');
        expect(screen.getByTestId('asynchronous')).toHaveTextContent('false');
      });
    });

    it('should render control with button displayType by default', async () => {
      render(<CodedControlDesigner metadata={metadata} />);

      await waitFor(() => {
        expect(screen.getByTestId('dummy-control')).toBeInTheDocument();
      });
    });

    it('should not render when registered component not found', () => {
      ComponentStore.deRegisterDesignerComponent('button');

      render(<CodedControlDesigner metadata={metadata} />);

      expect(screen.queryByTestId('dummy-control')).not.toBeInTheDocument();
    });

    it('should render autoComplete component when autoComplete property is true', async () => {
      const autoCompleteMetadata = {
        ...metadata,
        properties: { autoComplete: true },
      };
      ComponentStore.registerDesignerComponent('autoComplete', {
        control: DummyControl,
      });

      render(<CodedControlDesigner metadata={autoCompleteMetadata} />);

      await waitFor(() => {
        expect(screen.getByTestId('dummy-control')).toBeInTheDocument();
      });
    });

    it('should render dropDown component when dropDown property is true', async () => {
      const dropDownMetadata = {
        ...metadata,
        properties: { dropDown: true },
      };
      ComponentStore.registerDesignerComponent('dropDown', {
        control: DummyControl,
      });

      render(<CodedControlDesigner metadata={dropDownMetadata} />);

      await waitFor(() => {
        expect(screen.getByTestId('dummy-control')).toBeInTheDocument();
      });
    });
  });

  describe('getJsonDefinition method', () => {
    beforeEach(() => {
      TranslationKeyGenerator.mockImplementation(() => ({
        build: () => 'ANSWER1_100',
      }));
    });

    it('should generate translation keys for answers without translationKey', () => {
      const testMetadata = {
        id: '100',
        type: 'obsControl',
        concept: {
          uuid: '70645842-be6a-4974-8d5f-45b52990e132',
          name: 'Pulse',
          datatype: 'Coded',
          answers: [
            {
              name: { display: 'answer1' },
              uuid: 'uuid',
            },
          ],
        },
        properties: {},
      };

      const component = new CodedControlDesigner({ metadata: testMetadata });
      component.setState({ success: true });

      const result = component.getJsonDefinition();

      expect(result.concept.answers[0].translationKey).toBe('ANSWER1_100');
      expect(TranslationKeyGenerator).toHaveBeenCalledWith('answer1', '100');
    });

    it('should preserve existing translation keys', () => {
      const testMetadata = {
        id: '100',
        type: 'obsControl',
        concept: {
          uuid: '70645842-be6a-4974-8d5f-45b52990e132',
          name: 'Pulse',
          datatype: 'Coded',
          answers: [
            {
              name: { display: 'answer1' },
              uuid: 'uuid',
              translationKey: 'EXISTING_KEY',
            },
          ],
        },
        properties: {},
      };

      const component = new CodedControlDesigner({ metadata: testMetadata });
      const result = component.getJsonDefinition();

      expect(result.concept.answers[0].translationKey).toBe('EXISTING_KEY');
      expect(TranslationKeyGenerator).not.toHaveBeenCalled();
    });
  });

  describe('_getDisplayType method', () => {
    let component;

    beforeEach(() => {
      component = new CodedControlDesigner({ metadata });
    });

    it('should return autoComplete when autoComplete property is true', () => {
      const result = component._getDisplayType({ autoComplete: true });
      expect(result).toBe('autoComplete');
    });

    it('should return dropDown when dropDown property is true and autoComplete is false', () => {
      const result = component._getDisplayType({ autoComplete: false, dropDown: true });
      expect(result).toBe('dropDown');
    });

    it('should return button by default', () => {
      const result = component._getDisplayType({});
      expect(result).toBe('button');
    });
  });
});
