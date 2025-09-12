import 'src/helpers/formRenderer';
import React from 'react';
import ReactDOM from 'react-dom';
import ControlRecordTreeBuilder from 'src/helpers/ControlRecordTreeBuilder';
import ObservationMapper from 'src/helpers/ObservationMapper';
import ScriptRunner from 'src/helpers/scriptRunner';

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  createElement: jest.fn(),
}));

jest.mock('react-dom', () => ({
  render: jest.fn(),
  unmountComponentAtNode: jest.fn(),
}));

jest.mock('src/helpers/ControlRecordTreeBuilder');
jest.mock('src/helpers/ObservationMapper');
jest.mock('src/helpers/scriptRunner');

describe('FormRenderer', () => {
  const validFormDetails = {
    id: '100',
    name: 'Vitals',
    version: '1',
    controls: [
      {
        id: '100',
        type: 'label',
        value: 'Pulse',
        properties: {},
      },
      {
        id: '200',
        type: 'obsControl',
        displayType: 'text',
        properties: {},
        concept: {
          fullySpecifiedName: 'Pulse',
        },
      },
    ],
  };

  beforeEach(() => {
    document.body.innerHTML = '<div id="test-container"></div>';
    jest.clearAllMocks();

    React.createElement.mockReturnValue('mock-react-element');
    ReactDOM.render.mockReturnValue('mock-component-instance');
    ReactDOM.unmountComponentAtNode.mockReturnValue(true);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('renderWithControls', () => {
    it('should create container element and render to specified node', () => {
      const result = renderWithControls(validFormDetails, [], 'test-container', false);

      expect(React.createElement).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          metadata: validFormDetails,
          observations: [],
          validate: true,
          collapse: false,
        })
      );
      expect(ReactDOM.render).toHaveBeenCalledWith(
        'mock-react-element',
        document.getElementById('test-container')
      );
      expect(result).toBe('mock-component-instance');
    });

    it('should pass collapse parameter correctly', () => {
      renderWithControls(validFormDetails, [], 'test-container', true);

      expect(React.createElement).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          collapse: true,
        })
      );
    });

    it('should pass patient data when provided', () => {
      const patient = { uuid: '123', display: 'Test Patient' };

      renderWithControls(validFormDetails, [], 'test-container', false, patient);

      expect(React.createElement).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          patient,
        })
      );
    });

    it('should pass validation function when provided', () => {
      const validateForm = jest.fn();

      renderWithControls(validFormDetails, [], 'test-container', false, null, validateForm);

      expect(React.createElement).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          validateForm,
        })
      );
    });

    it('should pass locale and translations when provided', () => {
      const locale = 'en';
      const translations = { Pulse: 'Pulse Rate' };

      renderWithControls(validFormDetails, [], 'test-container', false, null, null, locale, translations);

      expect(React.createElement).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          locale,
          translations,
        })
      );
    });

    it('should handle observations when provided', () => {
      const observations = [{ concept: { name: 'Test' }, value: '123' }];

      renderWithControls(validFormDetails, observations, 'test-container', false);

      expect(React.createElement).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          observations,
        })
      );
    });
  });

  describe('unMountForm', () => {
    it('should unmount form and return true when container exists', () => {
      renderWithControls(validFormDetails, [], 'test-container', false);
      const container = document.getElementById('test-container');

      const result = unMountForm(container);

      expect(result).toBe(true);
    });

    it('should return false when no container provided', () => {
      const result = unMountForm();

      expect(result).toBe(false);
    });

    it('should return false when null container provided', () => {
      const result = unMountForm(null);

      expect(result).toBe(false);
    });

    it('should return false when undefined container provided', () => {
      const result = unMountForm(undefined);

      expect(result).toBe(false);
    });
  });

  describe('runEventScript', () => {
    beforeEach(() => {
      const mockScriptRunner = {
        execute: jest.fn().mockReturnValue(['result']),
      };
      ScriptRunner.mockImplementation(() => mockScriptRunner);
    });

    it('should create script runner with form data and patient', () => {
      const formData = { field1: 'value1' };
      const eventScript = 'function() { return true; }';
      const patient = { uuid: '123' };

      runEventScript(formData, eventScript, patient);

      expect(ScriptRunner).toHaveBeenCalledWith(formData, patient);
    });

    it('should execute provided script', () => {
      const formData = { field1: 'value1' };
      const eventScript = 'function() { return formData.field1; }';
      const patient = { uuid: '123' };

      const result = runEventScript(formData, eventScript, patient);

      expect(ScriptRunner().execute).toHaveBeenCalledWith(eventScript);
      expect(result).toEqual(['result']);
    });

    it('should handle empty form data', () => {
      const formData = {};
      const eventScript = 'function() { return true; }';
      const patient = { uuid: '123' };

      runEventScript(formData, eventScript, patient);

      expect(ScriptRunner).toHaveBeenCalledWith(formData, patient);
    });
  });

  describe('getObservations', () => {
    beforeEach(() => {
      const mockObservationMapper = {
        from: jest.fn().mockReturnValue([]),
      };
      ObservationMapper.mockImplementation(() => mockObservationMapper);
    });

    it('should create observation mapper and call from method', () => {
      const records = { children: [] };

      getObservations(records);

      expect(ObservationMapper().from).toHaveBeenCalledWith(records);
    });

    it('should return mapped observations', () => {
      const records = { children: [] };
      const expectedObservations = [{ concept: 'Test', value: '123' }];
      ObservationMapper().from.mockReturnValue(expectedObservations);

      const result = getObservations(records);

      expect(result).toEqual(expectedObservations);
    });
  });

  describe('getRecordTree', () => {
    beforeEach(() => {
      const mockTreeBuilder = {
        build: jest.fn().mockReturnValue({ children: [] }),
      };
      ControlRecordTreeBuilder.mockImplementation(() => mockTreeBuilder);
    });

    it('should create tree builder and call build method', () => {
      const formDef = { controls: [] };
      const observations = [];

      getRecordTree(formDef, observations);

      expect(ControlRecordTreeBuilder().build).toHaveBeenCalledWith(formDef, observations);
    });

    it('should return built tree', () => {
      const formDef = { controls: [] };
      const observations = [];
      const expectedTree = { children: [{ id: 'test' }] };
      ControlRecordTreeBuilder().build.mockReturnValue(expectedTree);

      const result = getRecordTree(formDef, observations);

      expect(result).toEqual(expectedTree);
    });
  });
});
