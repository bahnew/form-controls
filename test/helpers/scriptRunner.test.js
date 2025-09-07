import ScriptRunner from 'src/helpers/scriptRunner';
import FormContext from 'src/helpers/FormContext';
import { httpInterceptor } from 'src/helpers/httpInterceptor';

jest.mock('src/helpers/FormContext');
jest.mock('src/helpers/httpInterceptor');

describe('ScriptRunner', () => {
  let mockRootRecord;
  let mockPatient;
  let mockParentRecord;
  let mockFormContext;
  let scriptRunner;

  beforeEach(() => {
    mockRootRecord = { id: 'root' };
    mockPatient = { id: 'patient1' };
    mockParentRecord = { id: 'parent' };
    
    mockFormContext = {
      getRecords: jest.fn()
    };
    
    FormContext.mockImplementation(() => mockFormContext);
    
    scriptRunner = new ScriptRunner(mockRootRecord, mockPatient, mockParentRecord);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize FormContext with provided parameters', () => {
      expect(FormContext).toHaveBeenCalledWith(mockRootRecord, mockPatient, mockParentRecord);
      expect(scriptRunner.formContext).toBe(mockFormContext);
    });

    it('should assign httpInterceptor to interceptor property', () => {
      expect(scriptRunner.interceptor).toBe(httpInterceptor);
    });
  });

  describe('execute', () => {
    beforeEach(() => {
      mockFormContext.getRecords.mockReturnValue(['record1', 'record2']);
      global.eval = jest.fn();
    });

    afterEach(() => {
      delete global.eval;
    });

    it('should return formContext.getRecords() when eventJs is provided', () => {
      const eventJs = 'function(formContext, interceptor) { return true; }';
      
      const result = scriptRunner.execute(eventJs);
      
      expect(result).toEqual(['record1', 'record2']);
      expect(mockFormContext.getRecords).toHaveBeenCalled();
    });

    it('should execute eventJs using eval when eventJs and interceptor are present', () => {
      const eventJs = 'function(formContext, interceptor) { return true; }';
      const expectedExecutiveJs = `(${eventJs})(formContext,interceptor)`;
      
      scriptRunner.execute(eventJs);
      
      expect(global.eval).toHaveBeenCalledWith(expectedExecutiveJs);
    });

    it('should not execute eval when eventJs is null', () => {
      scriptRunner.execute(null);
      
      expect(global.eval).not.toHaveBeenCalled();
      expect(mockFormContext.getRecords).toHaveBeenCalled();
    });

    it('should not execute eval when eventJs is undefined', () => {
      scriptRunner.execute(undefined);
      
      expect(global.eval).not.toHaveBeenCalled();
      expect(mockFormContext.getRecords).toHaveBeenCalled();
    });

    it('should not execute eval when eventJs is empty string', () => {
      scriptRunner.execute('');
      
      expect(global.eval).not.toHaveBeenCalled();
      expect(mockFormContext.getRecords).toHaveBeenCalled();
    });

    it('should not execute eval when interceptor is null', () => {
      scriptRunner.interceptor = null;
      const eventJs = 'function(formContext, interceptor) { return true; }';
      
      scriptRunner.execute(eventJs);
      
      expect(global.eval).not.toHaveBeenCalled();
      expect(mockFormContext.getRecords).toHaveBeenCalled();
    });

    it('should not execute eval when interceptor is undefined', () => {
      scriptRunner.interceptor = undefined;
      const eventJs = 'function(formContext, interceptor) { return true; }';
      
      scriptRunner.execute(eventJs);
      
      expect(global.eval).not.toHaveBeenCalled();
      expect(mockFormContext.getRecords).toHaveBeenCalled();
    });

    it('should handle complex eventJs functions', () => {
      const eventJs = `function(formContext, interceptor) {
        const records = formContext.getRecords();
        return records.length > 0;
      }`;
      const expectedExecutiveJs = `(${eventJs})(formContext,interceptor)`;
      
      scriptRunner.execute(eventJs);
      
      expect(global.eval).toHaveBeenCalledWith(expectedExecutiveJs);
      expect(mockFormContext.getRecords).toHaveBeenCalled();
    });

    it('should always return result from formContext.getRecords regardless of eventJs execution', () => {
      const mockRecords = [{ id: 'test' }];
      mockFormContext.getRecords.mockReturnValue(mockRecords);
      
      const result1 = scriptRunner.execute('function() { return true; }');
      const result2 = scriptRunner.execute(null);
      const result3 = scriptRunner.execute(undefined);
      
      expect(result1).toBe(mockRecords);
      expect(result2).toBe(mockRecords);
      expect(result3).toBe(mockRecords);
    });

    it('should create local references to formContext and interceptor before eval', () => {
      const eventJs = 'function(formContext, interceptor) { return true; }';
      
      scriptRunner.execute(eventJs);
      
      expect(global.eval).toHaveBeenCalledWith(
        expect.stringContaining('(formContext,interceptor)')
      );
    });
  });

  describe('integration scenarios', () => {
    beforeEach(() => {
      global.eval = jest.fn().mockImplementation((code) => {
        if (code.includes('formContext,interceptor')) {
          return true;
        }
      });
    });

    afterEach(() => {
      delete global.eval;
    });

    it('should handle eventJs that modifies formContext', () => {
      const eventJs = `function(formContext, interceptor) {
        formContext.modifyRecord = true;
      }`;
      const mockModifiedRecords = [{ id: 'modified' }];
      mockFormContext.getRecords.mockReturnValue(mockModifiedRecords);
      
      const result = scriptRunner.execute(eventJs);
      
      expect(global.eval).toHaveBeenCalled();
      expect(result).toEqual(mockModifiedRecords);
    });

    it('should handle eventJs that uses interceptor', () => {
      const eventJs = `function(formContext, interceptor) {
        interceptor.get('/api/data');
      }`;
      
      scriptRunner.execute(eventJs);
      
      expect(global.eval).toHaveBeenCalledWith(
        expect.stringContaining('interceptor.get')
      );
    });

    it('should work with arrow function eventJs', () => {
      const eventJs = '(formContext, interceptor) => formContext.getRecords()';
      
      scriptRunner.execute(eventJs);
      
      expect(global.eval).toHaveBeenCalledWith(`(${eventJs})(formContext,interceptor)`);
    });
  });
});
