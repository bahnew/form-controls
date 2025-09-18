import { List } from 'immutable';
import { AbnormalObsGroupMapper } from 'src/mapper/AbnormalObsGroupMapper';
import constants from 'src/constants';
import * as Obs from 'src/helpers/Obs';

describe('AbnormalObsGroupMapper', () => {
  const pulseAbnormalObs = new Obs.Obs({
    concept: {
      name: 'PulseAbnormal',
      uuid: 'pulseAbnormalUuid',
      datatype: 'Boolean',
      conceptClass: 'Abnormal',
    },
    value: false,
    formNamespace: 'formUuid/5',
    uuid: 'childObs2Uuid',
  });

  const pulseNumericObs = new Obs.Obs({
    concept: {
      name: 'Pulse',
      uuid: 'pulseUuid',
      datatype: 'Numeric',
      conceptClass: 'Misc',
    },
    value: 10,
    formNamespace: 'formUuid/6',
    uuid: 'childObs1Uuid',
    formFieldPath: 'SomePath_A',
  });

  const pulseDataObs = new Obs.Obs({
    concept: {
      name: 'Pulse Data',
      uuid: 'pulseDataUuid',
      datatype: 'Misc',
    },
    groupMembers: List.of(pulseNumericObs, pulseAbnormalObs),
    formNamespace: 'formUuid/4',
    uuid: 'pulseDataObsUuid',
    formFieldPath: 'SomePath',
  });

  const mapper = new AbnormalObsGroupMapper();

  it('should handle abnormal observations when the numeric observation is in invalid range', () => {
    const pulseDataObsUpdated = mapper.setValue(pulseDataObs,
      pulseNumericObs, [{ type: 'warning', message: constants.validations.allowRange }]);
    expect(pulseDataObsUpdated.getAbnormalChildObs().getValue()).toBe(true);
  });

  it('should update abnormal observation when numeric observation is in valid range', () => {
    const pulseDataObsUpdated = mapper.setValue(pulseDataObs, pulseNumericObs, []);
    expect(pulseDataObsUpdated.getAbnormalChildObs().getValue()).toBe(false);
  });

  it('should void abnormal observation and obsGroup if numeric observation is voided', () => {
    const pulseNumericUpdated = pulseNumericObs.void();
    const pulseDataObsUpdated = mapper.setValue(pulseDataObs, pulseNumericUpdated, []);

    expect(pulseDataObsUpdated.isVoided()).toBe(true);
    expect(pulseDataObsUpdated.getAbnormalChildObs().isVoided()).toBe(true);
  });

  it('should void obsGroup and numericObs if just abnormalObs has value', () => {
    const pulseAbnormalUpdated = pulseAbnormalObs.setValue(true);
    const pulseNumericUpdated = pulseNumericObs.setValue(undefined).void();
    const pulseDataObsUpdated = new Obs.Obs({
      concept: {
        name: 'Pulse Data',
        uuid: 'pulseDataUuid',
        datatype: 'Misc',
      },
      groupMembers: List.of(pulseNumericUpdated, pulseAbnormalUpdated),
      formNamespace: 'formUuid/4',
      uuid: 'pulseDataObsUuid',
    });
    const voidedObs = mapper.setValue(pulseDataObsUpdated, pulseAbnormalUpdated, []);
    const voidedNumericObs = voidedObs.getGroupMembers().filter((o) => o.isNumeric()).get(0);

    expect(voidedObs.isVoided()).toBe(true);
    expect(voidedObs.getAbnormalChildObs().isVoided()).toBe(true);
    expect(voidedNumericObs.isVoided()).toBe(true);
  });

  it('should explicitly update abnormal observation if numeric obs has value', () => {
    let pulseDataObsUpdated = mapper.setValue(pulseDataObs, pulseNumericObs, []);
    expect(pulseDataObsUpdated.getAbnormalChildObs().getValue()).toBe(false);

    const pulseAbnormalUpdated = pulseAbnormalObs.setValue(true);
    pulseDataObsUpdated = mapper.setValue(pulseDataObs, pulseAbnormalUpdated, []);

    expect(pulseDataObsUpdated.isVoided()).toBe(false);
    expect(pulseDataObsUpdated.getAbnormalChildObs().getValue()).toBe(true);
  });

  it('should void obsGroup if all of its groupMembers has no value', () => {
    const pulseNumericUpdated = pulseNumericObs.setValue(undefined);
    const pulseAbnormalUpdated = pulseAbnormalObs.setValue(undefined);
    let pulseDataObsGroup = mapper.setValue(pulseDataObs, pulseNumericUpdated, []);
    pulseDataObsGroup = mapper.setValue(pulseDataObsGroup, pulseAbnormalUpdated, []);

    expect(pulseDataObsGroup.isVoided()).toBe(true);
  });

  it('should return final object', () => {
    const observationGroup = mapper.getObject(pulseDataObs);
    expect(observationGroup.groupMembers).toHaveLength(2);
    expect(observationGroup.formNamespace).toBe('formUuid/4');
    expect(observationGroup.groupMembers[0].value).toBe(10);
    expect(observationGroup.groupMembers[1].value).toBe(false);
  });

  it('should return initial object', () => {
    const obs = { name: 'someName', uuid: 'someUuid', groupMembers: [] };
    jest.spyOn(Obs, 'createObsFromControl').mockReturnValue(obs);

    expect(mapper.getInitialObject('someUuid', { id: 1 }, [])).toEqual(obs);

    jest.restoreAllMocks();
  });
});
