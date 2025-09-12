import { Obs } from 'src/helpers/Obs';
import { List } from 'immutable';
import { ObsGroupMapper } from 'src/mapper/ObsGroupMapper';

jest.mock('src/helpers/ObservationMapper', () =>
  jest.fn().mockImplementation(() => ({
    from: jest.fn().mockReturnValue([]),
  })),
);

describe('ObsGroupMapper', () => {
  const booleanObs = new Obs({
    concept: {
      name: 'Smoking history',
      uuid: 'uuid',
      dataType: 'Boolean',
      conceptClass: 'Misc',
    },
    value: undefined,
    formNamespace: 'formUuid/5',
    uuid: 'booleanUuid',
    formFieldPath: 'OtherPath',
  });

  const numericObs = new Obs({
    concept: {
      name: 'Pulse',
      uuid: 'pulseUuid',
      datatype: 'Numeric',
      conceptClass: 'Misc',
    },
    value: 10,
    formNamespace: 'formUuid/6',
    uuid: 'childObs1Uuid',
  });

  const obsGroup = new Obs({
    concept: {
      name: 'Pulse Data',
      uuid: 'pulseDataUuid',
      datatype: 'Misc',
    },
    groupMembers: List.of(numericObs, booleanObs),
    formNamespace: 'formUuid/4',
    uuid: 'pulseDataObsUuid',
    formFieldPath: 'SomePath',
  });

  const mapper = new ObsGroupMapper();

  it('should set value for obs group member', () => {
    const booleanObsUpdated = booleanObs.setValue(true);
    const obsGroupUpdated = mapper.setValue(obsGroup, booleanObsUpdated);

    expect(obsGroupUpdated.getGroupMembers().get(1).getValue()).toBe(true);
  });

  it('should void obsGroup if child obs are not having any value', () => {
    const numericObsUpdated = numericObs.void();
    const booleanObsUpdated = booleanObs.void();
    const obsGroupWithOutValue = new Obs({
      concept: {
        name: 'Pulse Data',
        uuid: 'pulseDataUuid',
        datatype: 'Misc',
      },
      groupMembers: List.of(numericObsUpdated, booleanObsUpdated),
      formNamespace: 'formUuid/4',
      uuid: 'pulseDataObsUuid',
    });
    const obsGroupUpdated = mapper.setValue(
      obsGroupWithOutValue,
      booleanObsUpdated,
    );

    expect(obsGroupUpdated.isVoided()).toBe(true);
  });

  it('should void obsGroup if child obs are voided', () => {
    const numericObsUpdated = numericObs.void();
    const booleanObsUpdated = booleanObs.void();
    const obsGroupWithChildVoided = new Obs({
      concept: {
        name: 'Pulse Data',
        uuid: 'pulseDataUuid',
        datatype: 'Misc',
      },
      groupMembers: List.of(numericObsUpdated, booleanObsUpdated),
      formNamespace: 'formUuid/4',
      uuid: 'pulseDataObsUuid',
    });
    const obsGroupUpdated = mapper.setValue(
      obsGroupWithChildVoided,
      numericObsUpdated,
    );

    expect(obsGroupUpdated.isVoided()).toBe(true);
  });

  it('should not void obsGroup if any of child obs has value', () => {
    const numericObsUpdated = numericObs.setValue(20);
    const obsGroupUpdated = mapper.setValue(obsGroup, numericObsUpdated);

    expect(obsGroupUpdated.isVoided()).toBe(false);
    expect(obsGroupUpdated.getGroupMembers().get(0).getValue()).toBe(20);
    expect(obsGroupUpdated.getGroupMembers().get(1).getValue()).toBeUndefined();
  });

  it('should not void parent obs if the obs inside another child obs has a value', () => {
    const numericObsUpdated = new Obs({
      concept: {
        name: 'Numeric Obs',
        uuid: 'numericDataUuid',
        datatype: 'Misc',
      },
      groupMembers: List.of(numericObs),
      formNamespace: 'numericFormUuid/4',
      uuid: 'numericDataObsUuid',
    });
    const booleanObsUpdated = booleanObs.void();
    const obsGroupWithChildVoided = new Obs({
      concept: {
        name: 'Pulse Data',
        uuid: 'pulseDataUuid',
        datatype: 'Misc',
      },
      groupMembers: List.of(numericObsUpdated, booleanObsUpdated),
      formNamespace: 'formUuid/4',
      uuid: 'pulseDataObsUuid',
    });
    const obsGroupUpdated = mapper.setValue(
      obsGroupWithChildVoided,
      numericObsUpdated,
    );

    expect(obsGroupUpdated.isVoided()).toBe(false);
  });

  it('should return final object', () => {
    const getObjectSpy = jest.spyOn(numericObs, 'getObject');
    const obsGroupWithSpyMember = obsGroup.set(
      'groupMembers',
      List.of(numericObs, booleanObs),
    );
    const observationGroup = mapper.getObject(obsGroupWithSpyMember);

    expect(observationGroup.groupMembers).toHaveLength(2);
    expect(observationGroup.formNamespace).toBe('formUuid/4');
    expect(observationGroup.groupMembers[0].value).toBe(10);
    expect(observationGroup.groupMembers[1].value).toBeUndefined();
    expect(getObjectSpy).toHaveBeenCalledTimes(1);
  });

  it('should return empty object for getValue', () => {
    expect(mapper.getValue()).toEqual({});
  });

  it('should return children from obs group', () => {
    const obs = new Obs({
      groupMembers: List.of(numericObs, booleanObs),
    });

    expect(mapper.getChildren(obs)).toEqual(List.of(numericObs, booleanObs));
  });

  it('should handle areAllChildObsVoided with nested obs groups', () => {
    const nestedObsWithValue = new Obs({
      groupMembers: List.of(numericObs),
      voided: false,
    });
    const voidedObs = booleanObs.void();

    const observations = List.of(nestedObsWithValue, voidedObs);
    const result = mapper.areAllChildObsVoided(observations);

    expect(result.size).toBeGreaterThan(0);
  });

  it('should handle setValue with empty group members', () => {
    const emptyObsGroup = new Obs({
      concept: {
        name: 'Empty Group',
        uuid: 'emptyUuid',
        datatype: 'Misc',
      },
      groupMembers: List(),
      formNamespace: 'formUuid/5',
      uuid: 'emptyGroupUuid',
    });

    const result = mapper.setValue(emptyObsGroup, numericObs);
    expect(result.getGroupMembers().size).toBe(1);
  });

  it('should handle updateOldObsGroupFormFieldPathForBackwardCompatibility with empty observations', () => {
    const control = { id: '1', properties: { addMore: true } };
    const result =
      mapper.updateOldObsGroupFormFieldPathForBackwardCompatibility(
        control,
        [],
        'parentPath',
      );
    expect(result).toEqual([]);
  });

  it('should handle updateOldObsGroupFormFieldPathForBackwardCompatibility with observations that include control prefix', () => {
    const control = { id: '1', properties: { addMore: true } };
    const observations = [
      new Obs({ formFieldPath: 'Test1.1/1-0' }),
      new Obs({ formFieldPath: 'Test1.1/2-0' }),
    ];

    const result =
      mapper.updateOldObsGroupFormFieldPathForBackwardCompatibility(
        control,
        observations,
        'parentPath',
      );
    expect(result).toHaveLength(2);
    expect(result[0].formFieldPath).toBeDefined();
  });

  it('should handle updateOldObsGroupFormFieldPathForBackwardCompatibility with control without addMore', () => {
    const control = { id: '1', properties: { addMore: false } };
    const observations = [new Obs({ formFieldPath: 'Test1.1/1-0' })];

    const result =
      mapper.updateOldObsGroupFormFieldPathForBackwardCompatibility(
        control,
        observations,
        'parentPath',
      );
    expect(result).toBe(observations);
  });

  it('should handle areAllChildObsVoided with observations having no group members', () => {
    const obsWithoutGroupMembers = new Obs({ voided: false });
    const voidedObs = new Obs({ voided: true });

    const observations = List.of(obsWithoutGroupMembers, voidedObs);
    const result = mapper.areAllChildObsVoided(observations);

    expect(result.size).toBe(1);
  });

  it('should handle updateToLatestFormFieldPath for nested group members', () => {
    const nestedObs = new Obs({
      formFieldPath: 'Test1.1/1-0',
      groupMembers: List.of(new Obs({ formFieldPath: 'Test1.1/2-0' })),
    });

    const result = mapper.updateToLatestFormFieldPath(nestedObs, 'parentPath');
    expect(result.groupMembers.get(0).formFieldPath).toBeDefined();
  });

  it('should handle updateOldObsGroupFormFieldPathForBackwardCompatibility with observations not including control prefix', () => {
    const control = { id: '5', properties: { addMore: true } };
    const observations = [
      new Obs({ formFieldPath: 'Test1.1/1-0' }),
      new Obs({ formFieldPath: 'Test1.1/2-0' }),
    ];

    const result =
      mapper.updateOldObsGroupFormFieldPathForBackwardCompatibility(
        control,
        observations,
        'parentPath',
      );
    expect(result).toHaveLength(2);
    expect(result[0]).toBe(observations[0]);
    expect(result[1]).toBe(observations[1]);
  });

  it('should handle setValue with mixed voided and non-voided group members', () => {
    const voidedObs = numericObs.void();
    const nonVoidedObs = booleanObs.setValue(true);
    const mixedObsGroup = new Obs({
      concept: {
        name: 'Mixed Group',
        uuid: 'mixedUuid',
        datatype: 'Misc',
      },
      groupMembers: List.of(voidedObs, nonVoidedObs),
      formNamespace: 'formUuid/6',
      uuid: 'mixedGroupUuid',
    });

    const newObs = new Obs({ value: 'test', voided: false });
    const result = mapper.setValue(mixedObsGroup, newObs);
    expect(result.isVoided()).toBe(false);
  });

  it('should handle areAllChildObsVoided recursively', () => {
    const deeplyNestedObs = new Obs({
      groupMembers: List.of(
        new Obs({
          groupMembers: List.of(numericObs),
          voided: false,
        }),
      ),
      voided: false,
    });

    const observations = List.of(deeplyNestedObs);
    const result = mapper.areAllChildObsVoided(observations);
    expect(result.size).toBeGreaterThan(0);
  });

  it('should handle getData with matching formFieldPath and active record', () => {
    const mockRecord = {
      formFieldPath: 'SomePath',
      active: true,
      dataSource: obsGroup,
    };

    const result = mapper.getData(mockRecord);
    expect(result).toBeDefined();
    expect(result.formFieldPath).toBe('SomePath');
    expect(result.inactive).toBe(false);
    expect(result.voided).toBe(true);
  });

  it('should handle getData with inactive record', () => {
    const mockRecord = {
      formFieldPath: 'SomePath',
      active: false,
      dataSource: obsGroup,
    };

    const result = mapper.getData(mockRecord);
    expect(result.voided).toBe(true);
    expect(result.inactive).toBe(true);
  });

  it('should return null for getData when uuid is undefined and groupMembers is empty', () => {
    const emptyObsGroup = new Obs({
      uuid: undefined,
      groupMembers: List(),
      formFieldPath: 'EmptyPath',
    });

    const mockRecord = {
      formFieldPath: 'DifferentPath',
      active: true,
      dataSource: emptyObsGroup,
    };

    const result = mapper.getData(mockRecord);
    expect(result).toBeNull();
  });

  it('should return same amount obsGroups having add more property false and group members should not have obs group form field path', () => {
    const formName = 'Test1';
    const formVersion = '1';
    const control = {
      type: 'obsGroupControl',
      controls: [{ type: 'obsControl', id: 2 }],
      id: '1',
      properties: { addMore: false },
    };

    const firstObsGrpFormFieldPath = 'Test1.1/1-0';
    const firstObsFormFieldPath = 'Test1.1/2-0';
    const secondObsGrpFormFieldPath = 'Test1.1/1-1';
    const secondObsFormFieldPath = 'Test1.1/2-1';

    const observation = [
      new Obs({
        formFieldPath: firstObsGrpFormFieldPath,
        groupMembers: [new Obs({ formFieldPath: firstObsFormFieldPath })],
      }),
      new Obs({
        formFieldPath: secondObsGrpFormFieldPath,
        groupMembers: [new Obs({ formFieldPath: secondObsFormFieldPath })],
      }),
    ];

    const obsArray = new ObsGroupMapper().getInitialObject(
      formName,
      formVersion,
      control,
      observation,
      observation,
    );

    expect(obsArray).toHaveLength(observation.length);
    expect([obsArray[0].formFieldPath, obsArray[1].formFieldPath]).toEqual(
      expect.arrayContaining([
        firstObsGrpFormFieldPath,
        secondObsGrpFormFieldPath,
      ]),
    );

    let obsGrp = obsArray.find(
      (obj) => obj.formFieldPath === firstObsGrpFormFieldPath,
    );
    expect(obsGrp.groupMembers).toHaveLength(1);
    expect(obsGrp.groupMembers[0].formFieldPath).toBe(firstObsFormFieldPath);

    obsGrp = obsArray.find(
      (obj) => obj.formFieldPath === secondObsGrpFormFieldPath,
    );
    expect(obsGrp.groupMembers).toHaveLength(1);
    expect(obsGrp.groupMembers[0].formFieldPath).toBe(secondObsFormFieldPath);
  });

  it('should return same amount obsGroups having add more property true', () => {
    const formName = 'Test1';
    const formVersion = '1';
    const control = {
      type: 'obsGroupControl',
      controls: [{ type: 'obsControl', id: 2 }],
      id: '1',
      properties: { addMore: true },
    };

    const firstObsGrpFormFieldPath = 'Test1.1/1-0';
    const firstObsFormFieldPath = 'Test1.1/1-0/2-0';
    const secondObsGrpFormFieldPath = 'Test1.1/1-1';
    const secondObsFormFieldPath = 'Test1.1/1-1/2-0';

    const observation = [
      new Obs({
        formFieldPath: firstObsGrpFormFieldPath,
        groupMembers: [new Obs({ formFieldPath: firstObsFormFieldPath })],
      }),
      new Obs({
        formFieldPath: secondObsGrpFormFieldPath,
        groupMembers: [new Obs({ formFieldPath: secondObsFormFieldPath })],
      }),
    ];

    const obsArray = new ObsGroupMapper().getInitialObject(
      formName,
      formVersion,
      control,
      observation,
      observation,
    );

    expect(obsArray).toHaveLength(observation.length);
    expect([obsArray[0].formFieldPath, obsArray[1].formFieldPath]).toEqual(
      expect.arrayContaining([
        firstObsGrpFormFieldPath,
        secondObsGrpFormFieldPath,
      ]),
    );

    let obsGrp = obsArray.find(
      (obj) => obj.formFieldPath === firstObsGrpFormFieldPath,
    );
    expect(obsGrp.groupMembers).toHaveLength(1);
    expect(obsGrp.groupMembers[0].formFieldPath).toBe(firstObsFormFieldPath);

    obsGrp = obsArray.find(
      (obj) => obj.formFieldPath === secondObsGrpFormFieldPath,
    );
    expect(obsGrp.groupMembers).toHaveLength(1);
    expect(obsGrp.groupMembers[0].formFieldPath).toBe(secondObsFormFieldPath);
  });

  it('should return same amount obsGroups having add more property false with parent form field path', () => {
    const formName = 'Test1';
    const formVersion = '1';
    const control = {
      type: 'obsGroupControl',
      controls: [{ type: 'obsControl', id: 3 }],
      id: '2',
      properties: { addMore: false },
    };

    const firstObsGrpFormFieldPath = 'Test1.1/1-0/2-0';
    const firstObsFormFieldPath = 'Test1.1/1-0/2-0/3-0';
    const secondObsGrpFormFieldPath = 'Test1.1/1-0/2-1';
    const secondObsFormFieldPath = 'Test1.1/1-0/2-1/3-0';

    const observation = [
      new Obs({
        formFieldPath: firstObsGrpFormFieldPath,
        groupMembers: [new Obs({ formFieldPath: firstObsFormFieldPath })],
      }),
      new Obs({
        formFieldPath: secondObsGrpFormFieldPath,
        groupMembers: [new Obs({ formFieldPath: secondObsFormFieldPath })],
      }),
    ];

    const obsArray = new ObsGroupMapper().getInitialObject(
      formName,
      formVersion,
      control,
      observation,
      observation,
      'Test1.1/1-0',
    );

    expect(obsArray).toHaveLength(observation.length);
    expect([obsArray[0].formFieldPath, obsArray[1].formFieldPath]).toEqual(
      expect.arrayContaining([
        firstObsGrpFormFieldPath,
        secondObsGrpFormFieldPath,
      ]),
    );

    let obsGrp = obsArray.find(
      (obj) => obj.formFieldPath === firstObsGrpFormFieldPath,
    );
    expect(obsGrp.groupMembers).toHaveLength(1);
    expect(obsGrp.groupMembers[0].formFieldPath).toBe(firstObsFormFieldPath);

    obsGrp = obsArray.find(
      (obj) => obj.formFieldPath === secondObsGrpFormFieldPath,
    );
    expect(obsGrp.groupMembers).toHaveLength(1);
    expect(obsGrp.groupMembers[0].formFieldPath).toBe(secondObsFormFieldPath);
  });

  it('should return same amount obsGroups having add more property true with backward compatibility', () => {
    const formName = 'Test1';
    const formVersion = '1';
    const control = {
      concept: {
        datatype: 'N/A',
        name: 'Bacteriology Additional Attributes',
        setMembers: [
          {
            datatype: 'Text',
            name: 'Consultation Note',
            properties: { allowDecimal: null },
            uuid: '81d6e852-3f10-11e4-adec-0800271c1b75',
          },
        ],
        uuid: '695e99d6-12b2-11e6-8c00-080027d2adbd',
      },
      controls: [
        {
          concept: {
            datatype: 'Text',
            name: 'Consultation Note',
            properties: { allowDecimal: null },
            uuid: '81d6e852-3f10-11e4-adec-0800271c1b75',
          },
          id: '2',
          label: { type: 'label', value: 'Consultation Note' },
          properties: {
            addMore: false,
            hideLabel: false,
            location: { column: 0, row: 0 },
            mandatory: false,
            notes: false,
          },
          type: 'obsControl',
        },
      ],
      id: '1',
      label: { type: 'label', value: 'Bacteriology Additional Attributes' },
      properties: {
        abnormal: false,
        addMore: true,
        location: { column: 0, row: 0 },
      },
      type: 'obsGroupControl',
    };

    const firstObsGrpFormFieldPath = 'Test1.1/1-0';
    const firstObsFormFieldPath = 'Test1.1/2-0';
    const secondObsGrpFormFieldPath = 'Test1.1/1-1';
    const secondObsFormFieldPath = 'Test1.1/2-1';

    const observation = [
      new Obs({
        concept: {
          dataType: 'N/A',
          name: 'Bacteriology Additional Attributes',
          uuid: '695e99d6-12b2-11e6-8c00-080027d2adbd',
        },
        formFieldPath: firstObsGrpFormFieldPath,
        groupMembers: [
          new Obs({
            concept: {
              dataType: 'Text',
              name: 'Consultation Note',
              uuid: '81d6e852-3f10-11e4-adec-0800271c1b75',
            },
            formFieldPath: firstObsFormFieldPath,
            groupMembers: [],
            obsGroupUuid: '26a81979-d28c-4e7b-b490-d86dd53b23d7',
            uuid: '20f2e76a-63f2-4f05-9b3a-5cc80af1cdba',
            value: '1',
          }),
        ],
        uuid: '26a81979-d28c-4e7b-b490-d86dd53b23d7',
        value: '1',
        voided: false,
      }),
      new Obs({
        concept: {
          dataType: 'N/A',
          name: 'Bacteriology Additional Attributes',
          uuid: '695e99d6-12b2-11e6-8c00-080027d2adbd',
        },
        formFieldPath: secondObsGrpFormFieldPath,
        groupMembers: [
          new Obs({
            concept: {
              dataType: 'Text',
              name: 'Consultation Note',
              uuid: '81d6e852-3f10-11e4-adec-0800271c1b75',
            },
            formFieldPath: secondObsFormFieldPath,
            groupMembers: [],
            obsGroupUuid: '09f0ddbe-45a2-41d8-8a99-416059f61b21',
            type: 'Text',
            uuid: 'd16dee4e-ac4f-4ad7-ba35-89b73d39220d',
            value: '2',
            voided: false,
          }),
        ],
        uuid: '09f0ddbe-45a2-41d8-8a99-416059f61b21',
        value: '2',
        voided: false,
      }),
    ];

    const obsArray = new ObsGroupMapper().getInitialObject(
      formName,
      formVersion,
      control,
      observation,
      observation,
    );

    expect(obsArray).toHaveLength(observation.length);
    expect([obsArray[0].formFieldPath, obsArray[1].formFieldPath]).toEqual(
      expect.arrayContaining([
        firstObsGrpFormFieldPath,
        secondObsGrpFormFieldPath,
      ]),
    );

    let obsGrp = obsArray.find(
      (obj) => obj.formFieldPath === firstObsGrpFormFieldPath,
    );
    expect(obsGrp.groupMembers).toHaveLength(1);
    expect(obsGrp.groupMembers[0].formFieldPath).toBe('Test1.1/1-0/2-0');

    obsGrp = obsArray.find(
      (obj) => obj.formFieldPath === secondObsGrpFormFieldPath,
    );
    expect(obsGrp.groupMembers).toHaveLength(1);
    expect(obsGrp.groupMembers[0].formFieldPath).toBe('Test1.1/1-1/2-1');
  });
});
