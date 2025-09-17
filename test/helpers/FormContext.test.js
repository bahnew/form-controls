import { List } from 'immutable';
import { ControlRecord } from 'src/helpers/ControlRecordTreeBuilder';
import FormContext from 'src/helpers/FormContext';

describe('FormContext', () => {
  const booleanConceptName = 'Smoking History';
  const formFieldPathInPosition0 = '3129_Complex.1/1-0';
  const formFieldPathInPosition1 = '3129_Complex.1/2-0';

  const booleanConcept = {
    answers: [],
    datatype: 'Boolean',
    name: booleanConceptName,
    properties: {
      allowDecimal: null,
    },
    uuid: 'c2a43174-c9db-4e54-8516-17372c83537f',
  };
  const textBoxConcept = {
    answers: [],
    datatype: 'Text',
    description: [],
    name: 'Disposition Note',
    properties: {
      allowDecimal: null,
    },
    uuid: '81d4a9dc-3f10-11e4-adec-0800271c1b75',
  };

  const booleanObsTree = new ControlRecord({
    control: {
      concept: booleanConcept,
      hiAbsolute: null,
      hiNormal: null,
      id: '1',
      label: {
        type: 'label',
        value: booleanConceptName,
      },
      lowAbsolute: null,
      lowNormal: null,
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
      properties: {
        addMore: false,
        hideLabel: false,
        location: {
          column: 0,
          row: 0,
        },
        mandatory: false,
        notes: false,
      },
      type: 'obsControl',
      units: null,
    },
    formFieldPath: formFieldPathInPosition0,
    dataSource: {
      concept: booleanConcept,
      formFieldPath: formFieldPathInPosition0,
      formNamespace: 'Bahmni',
      inactive: false,
      voided: true,
    },
  });
  const booleanObsTree2 = new ControlRecord({
    control: {
      concept: booleanConcept,
      hiAbsolute: null,
      hiNormal: null,
      id: '2',
      label: {
        type: 'label',
        value: booleanConceptName,
      },
      lowAbsolute: null,
      lowNormal: null,
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
      properties: {
        addMore: false,
        hideLabel: false,
        location: {
          column: 0,
          row: 0,
        },
        mandatory: false,
        notes: false,
      },
      type: 'obsControl',
      units: null,
    },
    formFieldPath: formFieldPathInPosition1,
    dataSource: {
      concept: booleanConcept,
      formFieldPath: formFieldPathInPosition1,
      formNamespace: 'Bahmni',
      inactive: false,
      voided: true,
    },
  });
  const textBoxObsTree = new ControlRecord({
    control: {
      concept: textBoxConcept,
      hiAbsolute: null,
      hiNormal: null,
      id: '3',
      label: {
        type: 'label',
        value: 'Disposition Note',
      },
      lowAbsolute: null,
      lowNormal: null,
      properties: {
        addMore: false,
        hideLabel: false,
        location: {
          column: 0,
          row: 2,
        },
        mandatory: false,
        notes: false,
      },
      type: 'obsControl',
      units: null,
    },
    formFieldPath: '3129_Complex.1/3-0',
    dataSource: {
      concept: textBoxConcept,
      formFieldPath: '3129_Complex.1/3-0',
      formNamespace: 'Bahmni',
      inactive: false,
      voided: true,
    },
  });

  const recordTree = new ControlRecord({
    children: List.of(booleanObsTree, booleanObsTree2, textBoxObsTree),
  });

  it('should get first suitable record when given concept name without position', () => {
    const formContext = new FormContext(recordTree);

    const targetRecordWrapper = formContext.get(booleanConceptName);

    expect(targetRecordWrapper.currentRecord.formFieldPath).toBe(formFieldPathInPosition0);
  });

  it('should get assign suitable record when given concept name with position', () => {
    const formContext = new FormContext(recordTree);

    const targetRecordWrapper = formContext.get(booleanConceptName, 1);

    expect(targetRecordWrapper.currentRecord.formFieldPath).toBe(formFieldPathInPosition1);
  });

  it('should set record disabled when given set api triggered', () => {
    const formContext = new FormContext(recordTree);

    const originalRootTree = formContext.getRecords();
    const originalRecord = originalRootTree.children.get(0);
    expect(originalRecord.formFieldPath).toBe(formFieldPathInPosition0);
    expect(originalRecord.enabled).toBe(true);

    formContext.get(booleanConceptName, 0).setEnabled(false);

    const updatedRootTree = formContext.getRecords();
    const targetRecord = updatedRootTree.children.get(0);
    expect(targetRecord.formFieldPath).toBe(formFieldPathInPosition0);
    expect(targetRecord.enabled).toBe(false);
  });

  it('should set record hidden when given set api triggered', () => {
    const formContext = new FormContext(recordTree);

    const originalRootTree = formContext.getRecords();
    const originalRecord = originalRootTree.children.get(0);
    expect(originalRecord.formFieldPath).toBe(formFieldPathInPosition0);
    expect(originalRecord.hidden).toBe(false);

    formContext.get(booleanConceptName, 0).setHidden(true);

    const updatedRootTree = formContext.getRecords();
    const targetRecord = updatedRootTree.children.get(0);
    expect(targetRecord.formFieldPath).toBe(formFieldPathInPosition0);
    expect(targetRecord.hidden).toBe(true);
  });

  it('should get label name of the record does not have the concept name and has value as label name', () => {
    const labelName = 'something';
    const obsRecordTree = new ControlRecord({
      control: {
        value: labelName,
      },
    });
    const formContext = new FormContext(obsRecordTree);
    expect(formContext.getName(obsRecordTree)).toBe(labelName);
  });

  it('should not given warning message when control with name and position is existed', () => {
    const warningSpy = jest.spyOn(console, 'warn').mockImplementation();
    const formContext = new FormContext(recordTree);

    formContext.get(booleanConceptName);
    warningSpy.mockRestore();

    expect(warningSpy).not.toHaveBeenCalled();
  });

  it('should given warning message when control with name and position is not exist', () => {
    const warningStub = jest.spyOn(console, 'warn').mockImplementation();
    const formContext = new FormContext(recordTree);

    formContext.get('Inexistent control');

    expect(warningStub).toHaveBeenCalledTimes(1);
    warningStub.mockRestore();
  });

  it('should get suitable record when control ID is given', () => {
    const formContext = new FormContext(recordTree);

    const targetRecordWrapper = formContext.getById(1);

    expect(targetRecordWrapper.currentRecord.formFieldPath).toBe(formFieldPathInPosition0);
  });

  it('should not give warning message when control with given ID exists', () => {
    const warningSpy = jest.spyOn(console, 'warn').mockImplementation();
    const formContext = new FormContext(recordTree);

    formContext.getById(1);
    expect(warningSpy).not.toHaveBeenCalled();
    warningSpy.mockRestore();
  });

  it('should give warning message when control with given ID does not exist', () => {
    const warningSpy = jest.spyOn(console, 'warn').mockImplementation();
    const formContext = new FormContext(recordTree);
    const expectedMsg = '[FormEventHandler] Control with id - 0 does not exist';

    formContext.getById(0);

    expect(warningSpy).toHaveBeenCalledWith(expectedMsg);
    warningSpy.mockRestore();
  });

  it('should return patient as undefined if patient is not passed', () => {
    const formContext = new FormContext(recordTree);
    expect(formContext.getPatient()).toBeUndefined();
  });

  it('should return patient object', () => {
    const patient = { age: 10, gender: 'M', id: 'GAN1234' };
    const formContext = new FormContext(recordTree, patient);
    expect(formContext.getPatient()).toEqual(patient);
  });

  describe('getFromParent And getFromParentById', () => {
    const firstObsRecord = new ControlRecord({
      control: {
        type: 'obsControl',
        label: {
          translationKey: 'MTC,_DRUG_PRESCRIBED_DAYS_2',
          id: '2',
        },
        properties: {
          addMore: true,
        },
        id: '2',
        concept: {
          name: 'MTC, Drug prescribed days',
        },
      },
      formFieldPath: 'Vitals.2/2-0',
      dataSource: {
        concept: {
          name: 'MTC, Drug prescribed days',
        },
        formFieldPath: 'Vitals.2/2-0',
      },
    });
    const secondObsRecord = new ControlRecord({
      control: {
        type: 'obsControl',
        label: {
          translationKey: 'MTC,_DRUG_PRESCRIBED_DAYS_2',
          id: '2',
        },
        properties: {
          addMore: true,
        },
        id: '2',
        concept: {
          name: 'MTC, Drug prescribed days',
        },
      },
      formFieldPath: 'Vitals.2/2-1',
      dataSource: {
        concept: {
          name: 'MTC, Drug prescribed days',
        },
        formFieldPath: 'Vitals.2/2-1',
      },
    });

    const firstSectionRecord = new ControlRecord({
      control: {
        type: 'section',
        label: {
          value: 'Section',
          id: '1',
        },
        properties: {
          addMore: true,
        },
        id: '1',
      },
      formFieldPath: 'Vitals.2/1-0',
    });

    const secondSectionRecord = new ControlRecord({
      control: {
        type: 'section',
        label: {
          value: 'Section',
          id: '1',
        },
        properties: {
          addMore: true,
        },
        id: '1',
      },
      formFieldPath: 'Vitals.2/1-1',
    });

    const obsRecordTree = new ControlRecord({
      children: List.of(firstObsRecord, secondObsRecord),
    });

    const rootSectionRecord = new ControlRecord({
      control: {
        type: 'section',
        label: {
          value: 'Section',
          id: '0',
        },
        properties: {
          addMore: true,
        },
        id: '0',
      },
      formFieldPath: 'Vitals.2/0-0',
      children: List.of(obsRecordTree),
    });

    const obsGroupRecord = new ControlRecord({
      control: {
        type: 'obsGroupControl',
        label: {
          value: 'BMI',
          id: '3',
        },
        properties: {
          addMore: true,
        },
        id: '3',
        concept: {
          name: 'BMI Data',
        },
      },
      formFieldPath: 'Vitals.2/1-0/3-0',
      children: List.of(firstObsRecord),
    });

    it('should get first obs record out of two add-more records with the given concept name', () => {
      const formContext = new FormContext(obsRecordTree);
      const targetRecordWrapper = formContext.getFromParent('MTC, Drug prescribed days');
      expect(targetRecordWrapper.currentRecord.formFieldPath).toBe('Vitals.2/2-0');
    });

    it('should get first section record out of two add-more records with the given label name', () => {
      const sectionRecordTree = new ControlRecord({
        children: List.of(firstSectionRecord, secondSectionRecord),
      });

      const formContext = new FormContext(undefined, undefined, sectionRecordTree);
      const targetRecordWrapper = formContext.getFromParent('Section');
      expect(targetRecordWrapper.currentRecord.formFieldPath).toBe('Vitals.2/1-0');
    });

    it('should get obs group record with the given concept name where obs group lies under a section', () => {
      const rootRecord = new ControlRecord({
        children: List.of(obsGroupRecord),
      });

      const formContext = new FormContext(rootRecord, undefined, obsGroupRecord);
      const targetRecordWrapper = formContext.getFromParent('BMI Data');
      expect(targetRecordWrapper.currentRecord.formFieldPath).toBe('Vitals.2/1-0/3-0');
    });

    it('should log warning message if no record available for given concept name', () => {
      const warningSpy = jest.spyOn(console, 'warn').mockImplementation();
      const formContext = new FormContext(new ControlRecord());
      formContext.getFromParent('BMI Data');
      const expectedMessage = '[FormEventHandler] Control with name[BMI Data] does not exist';
      expect(warningSpy).toHaveBeenCalledWith(expectedMessage);
      warningSpy.mockRestore();
    });

    it('should get first obs record out of two add-more records with the given id', () => {
      const formContext = new FormContext(obsRecordTree);
      const targetRecordWrapper = formContext.getFromParentById(2);
      expect(targetRecordWrapper.currentRecord.formFieldPath).toBe('Vitals.2/2-0');
    });

    it('should get first section record out of two add-more records with the given id', () => {
      const sectionRecordTree = new ControlRecord({
        children: List.of(firstSectionRecord, secondSectionRecord),
      });

      const formContext = new FormContext(undefined, undefined, sectionRecordTree);
      const targetRecordWrapper = formContext.getFromParentById(1);
      expect(targetRecordWrapper.currentRecord.formFieldPath).toBe('Vitals.2/1-0');
    });

    it('should get first obs record out of two add-more records with the given id where obs ' +
       'lies under a section', () => {
      const rootRecord = new ControlRecord({
        children: List.of(rootSectionRecord),
      });

      const formContext = new FormContext(rootRecord, undefined, rootSectionRecord);
      const targetRecordWrapper = formContext.getFromParentById(2);
      expect(targetRecordWrapper.currentRecord.formFieldPath).toBe('Vitals.2/2-0');
    });

    it('should get obs group record with the given id where obs group lies under a section', () => {
      const rootRecord = new ControlRecord({
        children: List.of(obsGroupRecord),
      });

      const formContext = new FormContext(rootRecord, undefined, obsGroupRecord);
      const targetRecordWrapper = formContext.getFromParentById(3);
      expect(targetRecordWrapper.currentRecord.formFieldPath).toBe('Vitals.2/1-0/3-0');
    });

    it('should log warning message if no record available for given id', () => {
      const warningSpy = jest.spyOn(console, 'warn').mockImplementation();
      const formContext = new FormContext(new ControlRecord());
      formContext.getFromParentById(10);
      const expectedMessage = '[FormEventHandler] Control with id - 10 does not exist';
      expect(warningSpy).toHaveBeenCalledWith(expectedMessage);
      warningSpy.mockRestore();
    });
  });
});
