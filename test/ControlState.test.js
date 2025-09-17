import { ControlState, ControlRecord, controlStateFactory, getErrors } from 'src/ControlState';
import MapperStore from 'src/helpers/MapperStore';
import { setupAddRemoveButtonsForAddMore } from 'src/helpers/controlsParser';
import constants from 'src/constants';

jest.mock('src/helpers/MapperStore');
jest.mock('src/helpers/controlsParser');

describe('ControlRecord', () => {
  const mockMapper = {
    getObject: jest.fn(),
  };

  const mockObs = { value: 'test' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create record with default values', () => {
    const record = new ControlRecord();

    expect(record.control).toBeUndefined();
    expect(record.formFieldPath).toBe('');
    expect(record.obs).toBeUndefined();
    expect(record.enabled).toBe(true);
    expect(record.showAddMore).toBe(false);
    expect(record.showRemove).toBe(false);
    expect(record.errors).toEqual([]);
    expect(record.data).toBeUndefined();
    expect(record.mapper).toBeUndefined();
    expect(record.active).toBe(true);
  });

  it('should create record with provided values', () => {
    const props = {
      control: { id: '1' },
      formFieldPath: 'test/path',
      obs: mockObs,
      enabled: false,
      showAddMore: true,
      showRemove: true,
      errors: ['error1'],
      data: { test: 'data' },
      mapper: mockMapper,
      active: false,
    };

    const record = new ControlRecord(props);

    expect(record.control).toEqual({ id: '1' });
    expect(record.formFieldPath).toBe('test/path');
    expect(record.obs).toBe(mockObs);
    expect(record.enabled).toBe(false);
    expect(record.showAddMore).toBe(true);
    expect(record.showRemove).toBe(true);
    expect(record.errors).toEqual(['error1']);
    expect(record.data).toEqual({ test: 'data' });
    expect(record.mapper).toBe(mockMapper);
    expect(record.active).toBe(false);
  });

  it('should call mapper.getObject when getObject is called', () => {
    const expectedResult = { mapped: 'object' };
    mockMapper.getObject.mockReturnValue(expectedResult);

    const record = new ControlRecord({ obs: mockObs, mapper: mockMapper });
    const result = record.getObject();

    expect(mockMapper.getObject).toHaveBeenCalledWith(mockObs);
    expect(result).toBe(expectedResult);
  });
});

describe('ControlState', () => {
  let controlState;
  let record1,
    record2,
    record3;

  beforeEach(() => {
    controlState = new ControlState();
    record1 = new ControlRecord({ formFieldPath: 'form/1', active: true });
    record2 = new ControlRecord({ formFieldPath: 'form/2', active: true });
    record3 = new ControlRecord({ formFieldPath: 'form/3', active: false });
  });

  describe('setRecords', () => {
    it('should set multiple records', () => {
      const records = [record1, record2];
      const result = controlState.setRecords(records);

      expect(result.getRecords()).toEqual(records);
    });

    it('should handle empty records array', () => {
      const result = controlState.setRecords([]);

      expect(result.getRecords()).toEqual([]);
    });
  });

  describe('setRecord', () => {
    it('should add new record', () => {
      const result = controlState.setRecord(record1);

      expect(result.getRecord('form/1')).toBe(record1);
    });

    it('should update existing record', () => {
      const initialState = controlState.setRecord(record1);
      const updatedRecord = record1.set('enabled', false);
      const result = initialState.setRecord(updatedRecord);

      expect(result.getRecord('form/1').enabled).toBe(false);
    });
  });

  describe('deleteRecord', () => {
    it('should void record and set as inactive', () => {
      const mockObs = {
        formFieldPath: 'form/1',
        void: jest.fn().mockReturnValue({ voided: true }),
      };
      const record = new ControlRecord({ formFieldPath: 'form/1', obs: mockObs, active: true });
      const state = controlState.setRecord(record);

      const result = state.deleteRecord(mockObs);
      const deletedRecord = result.getRecord('form/1');

      expect(mockObs.void).toHaveBeenCalled();
      expect(deletedRecord.active).toBe(false);
      expect(deletedRecord.obs).toEqual({ voided: true });
    });
  });

  describe('getRecord', () => {
    it('should return record by formFieldPath', () => {
      const state = controlState.setRecord(record1);

      const result = state.getRecord('form/1');

      expect(result).toBe(record1);
    });

    it('should return undefined for non-existent path', () => {
      const result = controlState.getRecord('non/existent');

      expect(result).toBeUndefined();
    });
  });

  describe('generateFormFieldPath', () => {
    it('should generate next formFieldPath in sequence', () => {
      const records = [
        new ControlRecord({ formFieldPath: 'form-1' }),
        new ControlRecord({ formFieldPath: 'form-2' }),
        new ControlRecord({ formFieldPath: 'form-3' }),
      ];
      const state = controlState.setRecords(records);

      const result = state.generateFormFieldPath('form-1');

      expect(result).toBe('form-4');
    });

    it('should handle single record', () => {
      const records = [new ControlRecord({ formFieldPath: 'form-1' })];
      const state = controlState.setRecords(records);

      const result = state.generateFormFieldPath('form-1');

      expect(result).toBe('form-2');
    });

    it('should handle unsorted records', () => {
      const records = [
        new ControlRecord({ formFieldPath: 'form-3' }),
        new ControlRecord({ formFieldPath: 'form-1' }),
        new ControlRecord({ formFieldPath: 'form-5' }),
      ];
      const state = controlState.setRecords(records);

      const result = state.generateFormFieldPath('form-1');

      expect(result).toBe('form-6');
    });
  });

  describe('prepareRecordsForAddMore', () => {
    beforeEach(() => {
      setupAddRemoveButtonsForAddMore.mockImplementation(records =>
        records.map(record => record.set('showAddMore', false))
      );
    });

    it('should prepare records for AddMore functionality', () => {
      const records = [
        new ControlRecord({ formFieldPath: 'form-1', active: true }),
        new ControlRecord({ formFieldPath: 'form-2', active: true }),
        new ControlRecord({ formFieldPath: 'other-1', active: true }),
      ];
      const state = controlState.setRecords(records);

      const result = state.prepareRecordsForAddMore('form-1');

      expect(setupAddRemoveButtonsForAddMore).toHaveBeenCalledWith([
        records[0], records[1],
      ]);
    });

    it('should only process active records with matching prefix', () => {
      const records = [
        new ControlRecord({ formFieldPath: 'form-1', active: true }),
        new ControlRecord({ formFieldPath: 'form-2', active: false }),
        new ControlRecord({ formFieldPath: 'other-1', active: true }),
      ];
      const state = controlState.setRecords(records);

      const result = state.prepareRecordsForAddMore('form-1');

      expect(setupAddRemoveButtonsForAddMore).toHaveBeenCalledWith([records[0]]);
    });
  });

  describe('getRecords', () => {
    it('should return all records as array', () => {
      const records = [record1, record2, record3];
      const state = controlState.setRecords(records);

      const result = state.getRecords();

      expect(result).toEqual(records);
    });

    it('should return empty array when no records', () => {
      const result = controlState.getRecords();

      expect(result).toEqual([]);
    });
  });

  describe('getActiveRecords', () => {
    it('should return only active records', () => {
      const records = [record1, record2, record3];
      const state = controlState.setRecords(records);

      const result = state.getActiveRecords();

      expect(result).toEqual([record1, record2]);
    });

    it('should return empty array when no active records', () => {
      const inactiveRecord = new ControlRecord({ formFieldPath: 'form/1', active: false });
      const state = controlState.setRecord(inactiveRecord);

      const result = state.getActiveRecords();

      expect(result).toEqual([]);
    });
  });
});

describe('controlStateFactory', () => {
  const mockMapper = {
    getInitialObject: jest.fn(),
  };

  const metadata = {
    name: 'TestForm',
    version: '1',
    controls: [
      { id: '1', type: 'obsControl' },
      { id: '2', type: 'obsControl' },
    ],
  };

  beforeEach(() => {
    MapperStore.getMapper.mockReturnValue(mockMapper);
    mockMapper.getInitialObject.mockReturnValue([
      { formFieldPath: 'TestForm.1/1' },
      { formFieldPath: 'TestForm.1/2' },
    ]);
  });

  it('should create ControlState with metadata', () => {
    const bahmniObs = [];

    const result = controlStateFactory(metadata, bahmniObs);

    expect(result).toBeInstanceOf(ControlState);
    expect(MapperStore.getMapper).toHaveBeenCalledTimes(2);
    expect(mockMapper.getInitialObject).toHaveBeenCalledWith('TestForm', '1', metadata.controls[0], bahmniObs);
    expect(mockMapper.getInitialObject).toHaveBeenCalledWith('TestForm', '1', metadata.controls[1], bahmniObs);
  });

  it('should use provided formName and formVersion', () => {
    const bahmniObs = [];
    const customFormName = 'CustomForm';
    const customVersion = '2';

    const result = controlStateFactory(metadata, bahmniObs, customFormName, customVersion);

    expect(mockMapper.getInitialObject).toHaveBeenCalledWith(
      customFormName, customVersion, metadata.controls[0], bahmniObs
    );
    expect(mockMapper.getInitialObject).toHaveBeenCalledWith(
      customFormName, customVersion, metadata.controls[1], bahmniObs
    );
  });

  it('should handle multiple obs per control', () => {
    mockMapper.getInitialObject.mockReturnValueOnce([
      { formFieldPath: 'TestForm.1/1-0' },
      { formFieldPath: 'TestForm.1/1-1' },
    ]).mockReturnValueOnce([
      { formFieldPath: 'TestForm.1/2' },
    ]);

    const result = controlStateFactory(metadata, []);
    const records = result.getRecords();

    expect(records).toHaveLength(3);
    expect(records[0].formFieldPath).toBe('TestForm.1/1-0');
    expect(records[1].formFieldPath).toBe('TestForm.1/1-1');
    expect(records[2].formFieldPath).toBe('TestForm.1/2');
  });

  it('should set correct record properties', () => {
    const result = controlStateFactory(metadata, []);
    const records = result.getRecords();

    records.forEach(record => {
      expect(record.enabled).toBe(false);
      expect(record.showAddMore).toBe(true);
      expect(record.mapper).toBe(mockMapper);
      expect(record.control).toBeDefined();
    });
  });
});

describe('getErrors', () => {
  it('should return error-type errors from records', () => {
    const errorRecord1 = new ControlRecord({
      errors: [
        { type: constants.errorTypes.error, message: 'Error 1' },
        { type: constants.errorTypes.warning, message: 'Warning 1' },
      ],
    });
    const errorRecord2 = new ControlRecord({
      errors: [
        { type: constants.errorTypes.error, message: 'Error 2' },
      ],
    });
    const warningOnlyRecord = new ControlRecord({
      errors: [
        { type: constants.errorTypes.warning, message: 'Warning 2' },
      ],
    });

    const records = [errorRecord1, errorRecord2, warningOnlyRecord];

    const result = getErrors(records);

    expect(result).toHaveLength(3);
    expect(result).toEqual([
      { type: constants.errorTypes.error, message: 'Error 1' },
      { type: constants.errorTypes.warning, message: 'Warning 1' },
      { type: constants.errorTypes.error, message: 'Error 2' },
    ]);
  });

  it('should handle records with no errors', () => {
    const records = [
      new ControlRecord({ errors: [] }),
      new ControlRecord({ errors: undefined }),
    ];

    const result = getErrors(records);

    expect(result).toEqual([]);
  });

  it('should handle empty records array', () => {
    const result = getErrors([]);

    expect(result).toEqual([]);
  });

  it('should handle records with only warnings', () => {
    const records = [
      new ControlRecord({
        errors: [{ type: constants.errorTypes.warning, message: 'Warning' }],
      }),
    ];

    const result = getErrors(records);

    expect(result).toEqual([]);
  });

  it('should handle mixed error and warning records', () => {
    const records = [
      new ControlRecord({
        errors: [
          { type: constants.errorTypes.error, message: 'Error 1' },
          { type: constants.errorTypes.error, message: 'Error 2' },
        ],
      }),
      new ControlRecord({
        errors: [{ type: constants.errorTypes.warning, message: 'Warning' }],
      }),
      new ControlRecord({ errors: [] }),
      new ControlRecord({
        errors: [{ type: constants.errorTypes.error, message: 'Error 3' }],
      }),
    ];

    const result = getErrors(records);

    expect(result).toHaveLength(3);
    expect(result).toEqual([
      { type: constants.errorTypes.error, message: 'Error 1' },
      { type: constants.errorTypes.error, message: 'Error 2' },
      { type: constants.errorTypes.error, message: 'Error 3' },
    ]);
  });
});
