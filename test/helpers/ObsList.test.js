import { ObsList } from 'src/helpers/ObsList';
import { List } from 'immutable';
import { Obs } from 'src/helpers/Obs';

describe('ObsList', () => {
  const concept = {
    uuid: '70645842-be6a-4974-8d5f-45b52990e132',
    name: 'Pulse',
    dataType: 'Text',
  };

  const formFieldPath = 'formName.1/1-0';

  it('should create a default obsList', () => {
    const obsList = new ObsList();
    expect(obsList).toHaveProperty('obsList');
    expect(obsList.obsList.size).toBe(0);
    expect(obsList).toHaveProperty('formFieldPath', undefined);
    expect(obsList).toHaveProperty('obs', undefined);
  });

  it('should create the obs with default values', () => {
    const obs = { concept, formFieldPath };
    const observationList = List.of(obs);
    const obsList = new ObsList({ formFieldPath, obs, obsList: observationList });

    expect(obsList).toHaveProperty('obsList');
    expect(obsList).toHaveProperty('formFieldPath', formFieldPath);
    expect(obsList).toHaveProperty('obs', obs);
    expect(obsList.obsList.size).toBe(1);
  });

  it('should test all getters of obs', () => {
    const obs = { concept, formFieldPath };
    const observationList = List.of(obs);
    const obsList = new ObsList({ formFieldPath, obs, obsList: observationList });

    expect(obsList.getObs()).toEqual(obs);
    expect(obsList.getObsList()).toEqual(observationList);
  });

  it('should set obsList', () => {
    const obs = { concept, formFieldPath };
    const observationList = List.of(obs);
    const obsList = new ObsList({ formFieldPath, obs });

    const updatedObsList = obsList.setObsList(observationList);
    expect(updatedObsList.getObsList()).toEqual(observationList);
  });

  it('should clone for add more', () => {
    const obs = new Obs({ concept, formFieldPath });
    const nextFormFieldPath = 'nextFormFieldPath';
    const formNameSpace = 'Bahmni';

    const observationList = List.of(obs);
    const obsList = new ObsList({ formFieldPath, obs, obsList: observationList, formNameSpace });

    const updatedObsList = obsList.cloneForAddMore(nextFormFieldPath);

    const expectedObsList = new ObsList({
      formFieldPath: nextFormFieldPath,
      formNameSpace,
      obs: new Obs({ concept, formFieldPath: nextFormFieldPath }),
      obsList: new List(),
    });

    expect(updatedObsList.toJS()).toEqual(expectedObsList.toJS());
  });

  it('should void obsList', () => {
    const obs = new Obs({ concept, formFieldPath });
    const obs1 = new Obs({ concept, formFieldPath, value: 2 });
    const obs2 = new Obs({ concept, formFieldPath });
    const observationList = List.of(obs1, obs2);
    const formNameSpace = 'Bahmni';
    const obsList = new ObsList({ formFieldPath, obs, obsList: observationList, formNameSpace });

    const voidedObsList = obsList.void();

    expect(voidedObsList.obsList.get(0).voided).toBe(true);
    expect(voidedObsList.obsList.get(0).value).toBeUndefined();
    expect(voidedObsList.obsList.get(1).voided).toBe(true);
    expect(voidedObsList.obsList.get(1).value).toBeUndefined();
  });

  it('should return true if all obs are voided', () => {
    const obs = new Obs({ concept, formFieldPath });
    const obs1 = new Obs({ concept, formFieldPath, value: 2, voided: true });
    const obs2 = new Obs({ concept, formFieldPath, voided: true });
    const observationList = List.of(obs1, obs2);
    const formNameSpace = 'Bahmni';
    const obsList = new ObsList({ formFieldPath, obs, obsList: observationList, formNameSpace });

    expect(obsList.isVoided()).toBe(true);
  });

  it('should return false if all obs are not voided', () => {
    const obs = new Obs({ concept, formFieldPath });
    const obs1 = new Obs({ concept, formFieldPath, value: 2, voided: true });
    const obs2 = new Obs({ concept, formFieldPath });
    const observationList = List.of(obs1, obs2);
    const formNameSpace = 'Bahmni';
    const obsList = new ObsList({ formFieldPath, obs, obsList: observationList, formNameSpace });

    expect(obsList.isVoided()).toBe(false);
  });

  it('should clone for add more', () => {
    const obs = new Obs({ concept, formFieldPath });
    const nextFormFieldPath = 'nextFormFieldPath';
    const formNameSpace = 'Bahmni';
    const observationList = List.of(obs);
    const obsList = new ObsList({ formFieldPath, obs, obsList: observationList, formNameSpace });
    const updatedObsList = obsList.cloneForAddMore(nextFormFieldPath);
    const expectedObsList = new ObsList({
      formFieldPath: nextFormFieldPath,
      formNameSpace,
      obs: new Obs({ concept, formFieldPath: nextFormFieldPath }),
      obsList: new List(),
    });
    expect(updatedObsList.toJS()).toEqual(expectedObsList.toJS());
  });

  it('should void obsList', () => {
    const obs = new Obs({ concept, formFieldPath });
    const obs1 = new Obs({ concept, formFieldPath, value: 2 });
    const obs2 = new Obs({ concept, formFieldPath });
    const observationList = List.of(obs1, obs2);
    const obsList = new ObsList({ formFieldPath, obs, obsList: observationList });
    const voidedObsList = obsList.void();
    expect(voidedObsList.obsList.get(0).voided).toBe(true);
    expect(voidedObsList.obsList.get(0).value).toBeUndefined();
    expect(voidedObsList.obsList.get(1).voided).toBe(true);
    expect(voidedObsList.obsList.get(1).value).toBeUndefined();
  });

  it('should return flattened observation list', () => {
    const obs = new Obs({ concept, formFieldPath });
    const observationList = List.of(obs);
    const obsList = new ObsList({ formFieldPath, obs, obsList: observationList });
    const flattenedList = obsList.getObject(obsList);
    expect(flattenedList).toEqual([obs.toObject()]);
  });
});
