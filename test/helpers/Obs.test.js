import { Obs, createObsFromControl } from 'src/helpers/Obs';
import { List } from 'immutable';

describe('Obs', () => {
  const concept = {
    uuid: '70645842-be6a-4974-8d5f-45b52990e132',
    name: 'Pulse',
    dataType: 'Text',
  };

  const formNamespace = 'formUuid/1';
  const value = '345';
  const uuid = 'uuid';
  const comment = 'comment';
  const interpretation = 'ABNORMAL';

  it('should create a default obs', () => {
    const obs = new Obs();
    expect(obs).toHaveProperty('concept', undefined);
    expect(obs).toHaveProperty('formNamespace', undefined);
    expect(obs).toHaveProperty('uuid', undefined);
    expect(obs).toHaveProperty('value', undefined);
    expect(obs).toHaveProperty('observationDateTime', undefined);
    expect(obs).toHaveProperty('voided', false);
    expect(obs).toHaveProperty('comment', undefined);
    expect(obs).toHaveProperty('interpretation', undefined);
  });

  it('should create the obs with default values', () => {
    const obs = new Obs({ concept, formNamespace, interpretation, value });

    expect(obs).toHaveProperty('concept', concept);
    expect(obs).toHaveProperty('formNamespace', formNamespace);
    expect(obs).toHaveProperty('value', value);
    expect(obs).toHaveProperty('voided', false);
    expect(obs).toHaveProperty('interpretation', 'ABNORMAL');
  });

  it('should test all getters of obs', () => {
    const obs = new Obs({ comment, formNamespace, uuid, value });

    expect(obs.getValue()).toEqual(value);
    expect(obs.getUuid()).toEqual(uuid);
    expect(obs.getFormNamespace()).toEqual(formNamespace);
    expect(obs.getComment()).toEqual(comment);
    expect(obs.isVoided()).toBe(false);
    expect(obs.isDirty('abc')).toBe(true);
  });

  it('should return false if the obs value is same', () => {
    const valueObj = { uuid: 'someUuid', value: 'someValue' };
    const obs = new Obs({ uuid, value: valueObj });
    expect(obs.isDirty(valueObj)).toBe(false);
  });

  it('should void an obs', () => {
    const obs = new Obs({ comment, formNamespace, uuid, value });
    const voidedObs = obs.void();
    expect(obs.isVoided()).toBe(false);
    expect(voidedObs.isVoided()).toBe(true);
  });

  it('should set comment to obs', () => {
    const obs = new Obs({ formNamespace, uuid, value });
    const commentObs = obs.setComment('comment');

    expect(commentObs.getComment()).toBe('comment');
  });

  it('should set value', () => {
    const obs = new Obs({ formNamespace, uuid, value });
    const updatedObs = obs.setValue('9090');

    expect(updatedObs.getValue()).toBe('9090');
  });

  it('should not create new obs if value is not changed', () => {
    const obs = new Obs({ formNamespace, uuid, value });
    const updatedObs = obs.setValue(value);

    expect(updatedObs).toBe(obs);
  });

  it('should return true when the obs belongs to a numeric concept', () => {
    const obs = new Obs({
      concept: {
        name: 'Pulse',
        uuid: 'pulseUuid',
        datatype: 'Numeric',
      },
      formNamespace,
      value,
    });

    expect(obs.isNumeric()).toBe(true);
  });

  it('should add a new obs to the groupMembers when addGroupMembers method is invoked', () => {
    const obs = new Obs({
      concept: {
        name: 'Pulse',
        uuid: 'pulseUuid',
        datatype: 'Numeric',
      },
      formNamespace,
      uuid,
      value,
    });

    expect(obs.getGroupMembers()).toBeUndefined();

    const childObs = new Obs({ formNamespace: 'formUuid/5', uuid: 'test' });

    const obsUpdated = obs.addGroupMember(childObs);
    expect(obsUpdated.getGroupMembers()).not.toBeUndefined();
    expect(obsUpdated.getGroupMembers().size).toBe(1);
    expect(obsUpdated.getGroupMembers().includes(childObs)).toBe(true);
  });

  it('should ignore adding a childObs when it already exists', () => {
    const childObs = new Obs({ formNamespace: 'formUuid/5', uuid: 'test' });
    const obs = new Obs({
      concept: {
        name: 'Pulse',
        uuid: 'pulseUuid',
        datatype: 'Numeric',
      },
      groupMembers: List.of(childObs),
      formNamespace,
      uuid,
      value,
    });

    expect(obs.getGroupMembers().size).toBe(1);
    const obsUpdated = obs.addGroupMember(childObs);
    expect(obsUpdated).toBe(obs);
  });

  it('should replace child obs with the same concept in the groupMember', () => {
    const childObs = new Obs({
      concept: {
        name: 'Pulse',
        uuid: 'pulseUuid',
        datatype: 'Numeric',
      },
      formNamespace: 'formUuid/5',
      uuid: 'test',
    });

    const parentObs = new Obs({
      concept: {
        name: 'Pulse Data',
        uuid: 'pulseDataUuid',
        datatype: 'Misc',
      },
      groupMembers: List.of(childObs),
      formNamespace,
      uuid,
      value,
    });

    const childObsUpdated = childObs.setValue('72');
    const parentObsUpdated = parentObs.addGroupMember(childObsUpdated);

    expect(parentObsUpdated.getGroupMembers().size).toBe(1);
  });

  it('should return a child obs which has Abnormal class', () => {
    const pulseAbnormalObs = new Obs({
      concept: {
        name: 'PulseAbnormal',
        uuid: 'pulseAbnormalUuid',
        datatype: 'Boolean',
        conceptClass: 'Abnormal',
      },
      formNamespace: 'formUuid/5',
      uuid: 'childObs2Uuid',
    });

    const pulseNumericObs = new Obs({
      concept: {
        name: 'Pulse',
        uuid: 'pulseUuid',
        datatype: 'Numeric',
        conceptClass: 'Misc',
      },
      formNamespace: 'formUuid/6',
      uuid: 'childObs1Uuid',
    });

    const pulseDataObs = new Obs({
      concept: {
        name: 'Pulse Data',
        uuid: 'pulseDataUuid',
        datatype: 'Misc',
      },
      groupMembers: List.of(pulseNumericObs, pulseAbnormalObs),
      formNamespace,
      uuid,
      value,
    });

    const abnormalChildObs = pulseDataObs.getAbnormalChildObs();
    expect(pulseAbnormalObs).toBe(abnormalChildObs);
  });

  it('should clone obs for AddMore', () => {
    const formFieldPath = 'formName.1/5-0';
    const originalObs = new Obs({
      concept,
      formFieldPath,
      formNamespace: 'Bahmni',
      uuid: 'childObs2Uuid',
    });

    const clonedObs = originalObs.cloneForAddMore(formFieldPath);

    const expectedClonedObs = new Obs({
      formFieldPath,
      concept,
      formNamespace: 'Bahmni',
      voided: true,
    });

    expect(clonedObs.toJS()).toEqual(expectedClonedObs.toJS());
  });

  it('getObject should process groupMembers', () => {
    const booleanObs = new Obs({
      value: undefined,
      formNamespace: 'formUuid/5',
      uuid: 'booleanUuid',
    });
    const spy = jest.spyOn(booleanObs, 'getObject');
    const obs = new Obs({
      concept,
      formNamespace,
      value,
      groupMembers: List.of(booleanObs),
    });

    obs.getObject(obs);

    expect(spy).toHaveBeenCalledTimes(1);
  });

  describe('exact match id in form field path', () => {
    const formName = '3116_2';
    const formVersion = '1';

    it('should get obs given form path exist in observations', () => {
      const controlExistInObservations = { id: '1' };
      const bahmniObservations = [
        { formFieldPath: '3116_2.1/18-0' },
        { formFieldPath: '3116_2.1/1-0' },
      ];

      const result = createObsFromControl(
        formName,
        formVersion,
        controlExistInObservations,
        bahmniObservations,
      );

      expect(result).toHaveLength(1);
      const existingObs = result[0];
      expect(existingObs.formFieldPath).toBe('3116_2.1/1-0');
    });

    it('should create a obs given form path not exist in observations', () => {
      const controlNotExistInObservations = { id: '2' };
      const bahmniObservations = [
        { formFieldPath: '3116_2.1/28-0' },
        { formFieldPath: '3116_2.1/1-0' },
      ];

      const result = createObsFromControl(
        formName,
        formVersion,
        controlNotExistInObservations,
        bahmniObservations,
      );

      expect(result).toHaveLength(1);
      const newCreatedObs = result[0];
      expect(newCreatedObs.formFieldPath).toBe('3116_2.1/2-0');
    });

    it('should filter out obs from given observations whose form field path matches with ' +
       'parent form field path', () => {
      const controlExistInObservations = { id: '18' };
      const bahmniObservations = [
        { formFieldPath: 'FormName.1/1-0/2-0/18-0' },
        { formFieldPath: 'FormName.1/1-0/2-0/18-1' },
        { formFieldPath: 'FormName.1/1-1/2-0/18-0' },
      ];

      const parentFormFieldPath = 'FormName.1/1-0/2-0';

      const result = createObsFromControl(
        formName,
        formVersion,
        controlExistInObservations,
        bahmniObservations,
        parentFormFieldPath,
      );

      expect(result).toHaveLength(2);

      expect(result.indexOf(bahmniObservations[0])).not.toBe(-1);
      expect(result.indexOf(bahmniObservations[1])).not.toBe(-1);
      expect(result.indexOf(bahmniObservations[2])).toBe(-1);
    });

    it('should create an observation along with parent form field path, when given observations ' +
       'have form field path that does not matches with parent form field path', () => {
      const controlNotExistInObservations = { id: '2' };
      const bahmniObservations = [
        { formFieldPath: 'FormName.1/28-0' },
        { formFieldPath: 'FormName.1/1-0' },
      ];

      const parentFormFieldPath = 'FormName.1/1-0';
      const result = createObsFromControl(
        formName,
        formVersion,
        controlNotExistInObservations,
        bahmniObservations,
        parentFormFieldPath,
      );

      expect(result).toHaveLength(1);
      const newCreatedObs = result[0];
      expect(newCreatedObs.formFieldPath).toBe('FormName.1/1-0/2-0');
    });
  });
});
