import { List } from 'immutable';
import { ControlRecord } from 'src/helpers/ControlRecordTreeBuilder';
import ControlRecordTreeMgr from 'src/helpers/ControlRecordTreeMgr';

describe('ControlRecordTreeMgr', () => {
  const concept = {
    answers: [],
    datatype: 'Numeric',
    description: [],
    name: 'Pulse',
    properties: {
      allowDecimal: true,
    },
    uuid: 'c36bc411-3f10-11e4-adec-0800271c1b75',
  };
  const obsControl = {
    concept,
    hiAbsolute: null,
    hiNormal: 72,
    id: '1',
    label: {
      type: 'label',
      value: 'Pulse(/min)',
    },
    lowAbsolute: null,
    lowNormal: 72,
    properties: {
      addMore: true,
      hideLabel: false,
      location: {
        column: 0,
        row: 0,
      },
      mandatory: true,
      notes: false,
    },
    type: 'obsControl',
    units: '/min',
  };
  let sectionControl;

  beforeAll(() => {
    sectionControl = {
      type: 'section',
      label: {
        translationKey: 'SECTION_2',
        type: 'label',
        value: 'Section',
        id: '2',
      },
      properties: {
        addMore: true,
        location: {
          column: 0,
          row: 1,
        },
      },
      id: '2',
      unsupportedProperties: [],
      controls: [obsControl],
    };
  });

  it('should get the record that is entirely same as given prefix', () => {
    const expectedFormFieldPath = 'SingleObs.1/1-0';
    const mixedFormFieldPath = 'SingleObs.11/0-1';
    const obsRecord = new ControlRecord({
      control: obsControl,
      value: {},
      dataSource: {
        concept,
        formFieldPath: expectedFormFieldPath,
        formNamespace: 'Bahmni',
        voided: true,
      },
      formFieldPath: expectedFormFieldPath,
    });
    const mixedChildRecord = new ControlRecord({
      control: {
        concept,
        hiAbsolute: null,
        hiNormal: 72,
        id: '1',
        label: {
          type: 'label',
          value: 'Pulse(/min)',
        },
        lowAbsolute: null,
        lowNormal: 72,
        properties: {
          addMore: true,
          hideLabel: false,
          location: {
            column: 0,
            row: 0,
          },
          mandatory: true,
          notes: false,
        },
        type: 'obsControl',
        units: '/min',
      },
      value: {},
      dataSource: {
        concept,
        formFieldPath: 'SingleObs.11/0-1',
        formNamespace: 'Bahmni',
        voided: true,
      },
      formFieldPath: mixedFormFieldPath,
    });
    const obsTree = new ControlRecord({
      children: List.of(obsRecord, mixedChildRecord),
    });

    const brotherTree = new ControlRecordTreeMgr().getLatestBrotherTree(
      obsTree,
      expectedFormFieldPath,
    );

    expect(brotherTree.formFieldPath).toBe(expectedFormFieldPath);
  });

  it('should return obsControl with path as an incremented value when obsControl is the root tree ' +
     'and parent is section without add more', () => {
    const obsRecord = new ControlRecord({
      control: obsControl,
      value: {},
      dataSource: {
        concept,
        formFieldPath: 'FormName.V/1-0',
        formNamespace: 'Bahmni',
        voided: true,
      },
      formFieldPath: 'FormName.V/1-0',
    });

    const recordsTree = new ControlRecord({ children: List.of(obsRecord) });
    const nextObsTree = new ControlRecordTreeMgr().generateNextTree(
      recordsTree,
      'FormName.V/1-0',
      undefined,
    );
    expect(nextObsTree.formFieldPath).toBe('FormName.V/1-1');
  });

  it('should return obsControl with path as an incremented value when obsControl is the root tree ' +
     'and parent is section with add more', () => {
    const obsFormFieldPath = 'FormName.V/2-0/1-0';
    const observationRecord = new ControlRecord({
      control: obsControl,
      value: {},
      dataSource: {
        concept,
        formFieldPath: obsFormFieldPath,
        formNamespace: 'Bahmni',
        voided: true,
      },
      formFieldPath: obsFormFieldPath,
    });
    const recordsTree = new ControlRecord({
      children: List.of(observationRecord),
    });

    const nextObsTree = new ControlRecordTreeMgr().generateNextTree(
      recordsTree,
      obsFormFieldPath,
      undefined,
    );
    expect(nextObsTree.formFieldPath).toBe('FormName.V/2-0/1-1');
  });

  it('should return section control tree with obsControl as a child and increment the path value ' +
     'for section control id, when section control is the root tree', () => {
    const sectionFormFieldPath = 'FormName.V/2-0';
    const obsFormFieldPath = 'FormName.V/2-0/1-0';
    const observationRecord = new ControlRecord({
      control: obsControl,
      value: {},
      dataSource: {
        concept,
        formFieldPath: obsFormFieldPath,
        formNamespace: 'Bahmni',
        voided: true,
      },
      formFieldPath: obsFormFieldPath,
    });
    const sectionRecord = new ControlRecord({
      control: sectionControl,
      value: {},
      dataSource: {
        concept,
        formFieldPath: sectionFormFieldPath,
        formNamespace: 'Bahmni',
        voided: true,
      },
      children: List.of(observationRecord),
      formFieldPath: sectionFormFieldPath,
    });
    const recordsTree = new ControlRecord({ children: List.of(sectionRecord) });

    const nextObsTree = new ControlRecordTreeMgr().generateNextTree(
      recordsTree,
      sectionFormFieldPath,
      undefined,
    );
    expect(nextObsTree.formFieldPath).toBe('FormName.V/2-1');
    expect(nextObsTree.children.get(0).formFieldPath).toBe(
      'FormName.V/2-1/1-0',
    );
  });

  it('should increment path for section 1 when section 1 has child as section 2 which is add more ' +
     'and has child obs control, where root is section 2', () => {
    const section2FormFieldPath = 'FormName.V/2-0';
    const obsFormFieldPath = 'FormName.V/2-0/3-0';
    const observationRecord = new ControlRecord({
      control: obsControl,
      value: {},
      dataSource: {
        concept,
        formFieldPath: obsFormFieldPath,
        formNamespace: 'Bahmni',
        voided: true,
      },
      formFieldPath: obsFormFieldPath,
    });
    const sectionControl2 = sectionControl;

    const sectionRecord2 = new ControlRecord({
      control: sectionControl2,
      value: {},
      dataSource: {
        concept,
        formFieldPath: section2FormFieldPath,
        formNamespace: 'Bahmni',
        voided: true,
      },
      children: List.of(observationRecord),
      formFieldPath: section2FormFieldPath,
    });

    const recordsTree = new ControlRecord({
      children: List.of(sectionRecord2),
    });

    const nextObsTree = new ControlRecordTreeMgr().generateNextTree(
      recordsTree,
      section2FormFieldPath,
      undefined,
    );
    expect(nextObsTree.formFieldPath).toBe('FormName.V/2-1');
    expect(nextObsTree.children.get(0).formFieldPath).toBe(
      'FormName.V/2-1/3-0',
    );
  });

  it('should increment path for section 1 with add more when section 1 has child as section 2 ' +
     'which is also add more and has child obs control, where root is section 1', () => {
    const section1FormFieldPath = 'FormName.V/1-0';
    const section2FormFieldPath = 'FormName.V/1-0/2-0';
    const obsFormFieldPath = 'FormName.V/1-0/2-0/3-0';
    const observationRecord = new ControlRecord({
      control: obsControl,
      value: {},
      dataSource: {
        concept,
        formFieldPath: obsFormFieldPath,
        formNamespace: 'Bahmni',
        voided: true,
      },
      formFieldPath: obsFormFieldPath,
    });
    const sectionControl2 = sectionControl;
    const sectionControl1 = (sectionControl = {
      type: 'section',
      label: {
        translationKey: 'SECTION_2',
        type: 'label',
        value: 'Section',
        id: '2',
      },
      properties: {
        addMore: true,
        location: {
          column: 0,
          row: 1,
        },
      },
      id: '2',
      unsupportedProperties: [],
      controls: [sectionControl2],
    });
    const sectionRecord2 = new ControlRecord({
      control: sectionControl2,
      value: {},
      dataSource: {
        concept,
        formFieldPath: section2FormFieldPath,
        formNamespace: 'Bahmni',
        voided: true,
      },
      children: List.of(observationRecord),
      formFieldPath: section2FormFieldPath,
    });

    const sectionRecord1 = new ControlRecord({
      control: sectionControl1,
      value: {},
      dataSource: {
        concept,
        formFieldPath: section1FormFieldPath,
        formNamespace: 'Bahmni',
        voided: true,
      },
      children: List.of(sectionRecord2),
      formFieldPath: section1FormFieldPath,
    });
    const recordsTree = new ControlRecord({
      children: List.of(sectionRecord1),
    });

    const nextObsTree = new ControlRecordTreeMgr().generateNextTree(
      recordsTree,
      section1FormFieldPath,
      undefined,
    );
    expect(nextObsTree.formFieldPath).toBe('FormName.V/1-1');
    expect(nextObsTree.children.get(0).formFieldPath).toBe(
      'FormName.V/1-1/2-0',
    );
    expect(nextObsTree.children.get(0).children.get(0).formFieldPath).toBe(
      'FormName.V/1-1/2-0/3-0',
    );
  });

  it('should increment path for section 2 with add more when section 1 has child as section 2 ' +
     'which is also add more and has child obs control, where root tree is section 2', () => {
    const section2FormFieldPath = 'FormName.V/1-0/2-0';
    const obsFormFieldPath = 'FormName.V/1-0/2-0/3-0';
    const observationRecord = new ControlRecord({
      control: obsControl,
      value: {},
      dataSource: {
        concept,
        formFieldPath: obsFormFieldPath,
        formNamespace: 'Bahmni',
        voided: true,
      },
      formFieldPath: obsFormFieldPath,
    });
    const sectionControl2 = sectionControl;

    const sectionRecord2 = new ControlRecord({
      control: sectionControl2,
      value: {},
      dataSource: {
        concept,
        formFieldPath: section2FormFieldPath,
        formNamespace: 'Bahmni',
        voided: true,
      },
      children: List.of(observationRecord),
      formFieldPath: section2FormFieldPath,
    });

    const recordsTree = new ControlRecord({
      children: List.of(sectionRecord2),
    });

    const nextObsTree = new ControlRecordTreeMgr().generateNextTree(
      recordsTree,
      section2FormFieldPath,
      undefined,
    );
    expect(nextObsTree.formFieldPath).toBe('FormName.V/1-0/2-1');
    expect(nextObsTree.children.get(0).formFieldPath).toBe(
      'FormName.V/1-0/2-1/3-0',
    );
  });

  it('should increment path for section with add more which has child as obsGroup which is ' +
     'also add more and has child obs control, where root tree is section', () => {
    const sectionFormFieldPath = 'FormName.V/1-0';
    const obsGroupFormFieldPath = 'FormName.V/1-0/2-0';
    const obsFormFieldPath = 'FormName.V/1-0/2-0/3-0';
    const observationRecord = new ControlRecord({
      control: obsControl,
      value: {},
      dataSource: {
        concept,
        formFieldPath: obsFormFieldPath,
        formNamespace: 'Bahmni',
        voided: true,
      },
      formFieldPath: obsFormFieldPath,
    });

    const obsGroupControl = {
      type: 'obsGroupControl',
      label: {
        translationKey: 'concept set',
        type: 'label',
        value: 'concept set',
        id: '2',
      },
      properties: {
        addMore: true,
        location: {
          column: 0,
          row: 1,
        },
      },
      id: '2',
      unsupportedProperties: [],
      controls: [obsControl],
    };

    const obGrpRecord = new ControlRecord({
      control: obsGroupControl,
      value: {},
      dataSource: {
        concept,
        formFieldPath: obsGroupFormFieldPath,
        formNamespace: 'Bahmni',
        voided: true,
      },
      children: List.of(observationRecord),
      formFieldPath: obsGroupFormFieldPath,
    });

    const sectionRecord = new ControlRecord({
      control: sectionControl,
      value: {},
      dataSource: {
        concept,
        formFieldPath: sectionFormFieldPath,
        formNamespace: 'Bahmni',
        voided: true,
      },
      children: List.of(obGrpRecord),
      formFieldPath: sectionFormFieldPath,
    });

    const recordsTree = new ControlRecord({ children: List.of(sectionRecord) });

    const nextObsTree = new ControlRecordTreeMgr().generateNextTree(
      recordsTree,
      sectionFormFieldPath,
      undefined,
    );
    expect(nextObsTree.formFieldPath).toBe('FormName.V/1-1');
    expect(nextObsTree.children.get(0).formFieldPath).toBe(
      'FormName.V/1-1/2-0',
    );
    expect(nextObsTree.children.get(0).children.get(0).formFieldPath).toBe(
      'FormName.V/1-1/2-0/3-0',
    );
  });

  it('should increment path for obs group with add more which has child as obs and parent as ' +
     'section, where root tree is obsgroup', () => {
    const obsGroupFormFieldPath = 'FormName.V/1-0/2-0';
    const obsFormFieldPath = 'FormName.V/1-0/2-0/3-0';
    const observationRecord = new ControlRecord({
      control: obsControl,
      value: {},
      dataSource: {
        concept,
        formFieldPath: obsFormFieldPath,
        formNamespace: 'Bahmni',
        voided: true,
      },
      formFieldPath: obsFormFieldPath,
    });

    const obsGroupControl = {
      type: 'obsGroupControl',
      label: {
        translationKey: 'concept set',
        type: 'label',
        value: 'concept set',
        id: '2',
      },
      properties: {
        addMore: true,
        location: {
          column: 0,
          row: 1,
        },
      },
      id: '2',
      unsupportedProperties: [],
      controls: [obsControl],
    };

    const obsGrpRecord = new ControlRecord({
      control: obsGroupControl,
      value: {},
      dataSource: {
        concept,
        formFieldPath: obsGroupFormFieldPath,
        formNamespace: 'Bahmni',
        voided: true,
      },
      children: List.of(observationRecord),
      formFieldPath: obsGroupFormFieldPath,
    });

    const recordsTree = new ControlRecord({ children: List.of(obsGrpRecord) });

    const nextObsTree = new ControlRecordTreeMgr().generateNextTree(
      recordsTree,
      obsGroupFormFieldPath,
      undefined,
    );
    expect(nextObsTree.formFieldPath).toBe('FormName.V/1-0/2-1');
    expect(nextObsTree.children.get(0).formFieldPath).toBe(
      'FormName.V/1-0/2-1/3-0',
    );
  });

  it('should increment obsgroup and obs control path when root tree is obsgroup', () => {
    const sectionFormFieldPath = 'FormName.V/1-0';
    const obsGroupFormFieldPath = 'FormName.V/1-0/2-0';
    const obsFormFieldPath = 'FormName.V/1-0/2-0/3-0';
    const observationRecord = new ControlRecord({
      control: obsControl,
      value: {},
      dataSource: {
        concept,
        formFieldPath: obsFormFieldPath,
        formNamespace: 'Bahmni',
        voided: true,
      },
      formFieldPath: obsFormFieldPath,
    });

    const obsGroupControl = {
      type: 'obsGroupControl',
      label: {
        translationKey: 'concept set',
        type: 'label',
        value: 'concept set',
        id: '2',
      },
      properties: {
        addMore: true,
        location: {
          column: 0,
          row: 1,
        },
      },
      id: '2',
      unsupportedProperties: [],
      controls: [obsControl],
    };

    const obGrpRecord = new ControlRecord({
      control: obsGroupControl,
      value: {},
      dataSource: {
        concept,
        formFieldPath: obsGroupFormFieldPath,
        formNamespace: 'Bahmni',
        voided: true,
      },
      children: List.of(observationRecord),
      formFieldPath: obsGroupFormFieldPath,
    });

    const sectionRecord = new ControlRecord({
      control: sectionControl,
      value: {},
      dataSource: {
        concept,
        formFieldPath: sectionFormFieldPath,
        formNamespace: 'Bahmni',
        voided: true,
      },
      children: List.of(obGrpRecord),
      formFieldPath: sectionFormFieldPath,
    });

    const recordsTree = new ControlRecord({ children: List.of(sectionRecord) });

    const nextObsTree = new ControlRecordTreeMgr().generateNextTree(
      recordsTree,
      sectionFormFieldPath,
      undefined,
    );
    expect(nextObsTree.formFieldPath).toBe('FormName.V/1-1');
    expect(nextObsTree.children.get(0).formFieldPath).toBe(
      'FormName.V/1-1/2-0',
    );
    expect(nextObsTree.children.get(0).children.get(0).formFieldPath).toBe(
      'FormName.V/1-1/2-0/3-0',
    );
  });

  describe('findParentTree', () => {
    it('should find parent tree when target exists at direct child level', () => {
      const childFormFieldPath = 'FormName.V/1-0';
      const childRecord = new ControlRecord({
        control: obsControl,
        value: {},
        dataSource: { concept, formFieldPath: childFormFieldPath },
        formFieldPath: childFormFieldPath,
      });
      const parentRecord = new ControlRecord({
        children: List.of(childRecord),
        formFieldPath: 'FormName.V',
      });

      const treeMgr = new ControlRecordTreeMgr();
      const foundParent = treeMgr.findParentTree(
        parentRecord,
        childFormFieldPath,
      );

      expect(foundParent.formFieldPath).toBe('FormName.V');
    });

    it('should find parent tree when target is nested deep in hierarchy', () => {
      const deepChildPath = 'FormName.V/1-0/2-0/3-0';
      const deepChild = new ControlRecord({
        control: obsControl,
        value: {},
        formFieldPath: deepChildPath,
      });
      const middleChild = new ControlRecord({
        children: List.of(deepChild),
        formFieldPath: 'FormName.V/1-0/2-0',
      });
      const parentChild = new ControlRecord({
        children: List.of(middleChild),
        formFieldPath: 'FormName.V/1-0',
      });
      const rootRecord = new ControlRecord({
        children: List.of(parentChild),
        formFieldPath: 'FormName.V',
      });

      const treeMgr = new ControlRecordTreeMgr();
      const foundParent = treeMgr.findParentTree(rootRecord, deepChildPath);

      expect(foundParent.formFieldPath).toBe('FormName.V/1-0/2-0');
    });

    it('should return undefined when target formFieldPath does not exist', () => {
      const childRecord = new ControlRecord({
        control: obsControl,
        formFieldPath: 'FormName.V/1-0',
      });
      const parentRecord = new ControlRecord({
        children: List.of(childRecord),
        formFieldPath: 'FormName.V',
      });

      const treeMgr = new ControlRecordTreeMgr();
      const foundParent = treeMgr.findParentTree(
        parentRecord,
        'NonExistent.Path/1-0',
      );

      expect(foundParent).toBeUndefined();
    });

    it('should handle trees without children gracefully', () => {
      const leafRecord = new ControlRecord({
        control: obsControl,
        formFieldPath: 'FormName.V/1-0',
        children: List.of(),
      });

      const treeMgr = new ControlRecordTreeMgr();
      const foundParent = treeMgr.findParentTree(leafRecord, 'FormName.V/2-0');

      expect(foundParent).toBeUndefined();
    });
  });

  describe('addToRootTree', () => {
    it('should add tree to root when parent is the root tree', () => {
      const existingChild = new ControlRecord({
        control: obsControl,
        formFieldPath: 'FormName.V/1-0',
      });
      const rootTree = new ControlRecord({
        children: List.of(existingChild),
        formFieldPath: 'FormName.V',
      });
      const newChild = new ControlRecord({
        control: obsControl,
        formFieldPath: 'FormName.V/1-1',
      });

      const treeMgr = new ControlRecordTreeMgr();
      const updatedTree = treeMgr.addToRootTree(rootTree, rootTree, newChild);

      expect(updatedTree.children.size).toBe(2);
      expect(updatedTree.children.get(1).formFieldPath).toBe('FormName.V/1-1');
    });

    it('should add tree to nested parent in hierarchy', () => {
      const newChild = new ControlRecord({
        control: obsControl,
        formFieldPath: 'FormName.V/1-0/2-1',
      });
      const parentChild = new ControlRecord({
        children: List.of(),
        formFieldPath: 'FormName.V/1-0',
      });
      const rootTree = new ControlRecord({
        children: List.of(parentChild),
        formFieldPath: 'FormName.V',
      });

      const treeMgr = new ControlRecordTreeMgr();
      const updatedTree = treeMgr.addToRootTree(
        rootTree,
        parentChild,
        newChild,
      );

      expect(updatedTree.children.get(0).children.size).toBe(1);
      expect(updatedTree.children.get(0).children.get(0).formFieldPath).toBe(
        'FormName.V/1-0/2-1',
      );
    });

    it('should handle trees without children in traversal', () => {
      const leafChild = new ControlRecord({
        control: obsControl,
        formFieldPath: 'FormName.V/1-0',
      });
      const anotherLeaf = new ControlRecord({
        control: obsControl,
        formFieldPath: 'FormName.V/2-0',
      });
      const rootTree = new ControlRecord({
        children: List.of(leafChild, anotherLeaf),
        formFieldPath: 'FormName.V',
      });
      const newChild = new ControlRecord({
        control: obsControl,
        formFieldPath: 'FormName.V/3-0',
      });

      const treeMgr = new ControlRecordTreeMgr();
      const updatedTree = treeMgr.addToRootTree(rootTree, rootTree, newChild);

      expect(updatedTree.children.size).toBe(3);
      expect(updatedTree.children.get(2).formFieldPath).toBe('FormName.V/3-0');
    });
  });

  describe('static add', () => {
    it('should add new tree node using complete workflow', () => {
      const existingChild = new ControlRecord({
        control: obsControl,
        value: {},
        dataSource: { concept, formFieldPath: 'FormName.V/1-0' },
        formFieldPath: 'FormName.V/1-0',
        removeObsUuidsInDataSource: () =>
          new ControlRecord({
            control: obsControl,
            value: {},
            active: true,
            formFieldPath: 'FormName.V/1-1',
          }),
      });
      const rootTree = new ControlRecord({
        children: List.of(existingChild),
        formFieldPath: 'FormName.V',
      });

      const updatedTree = ControlRecordTreeMgr.add(rootTree, 'FormName.V/1-0');

      expect(updatedTree.children.size).toBe(2);
    });
  });

  describe('static update', () => {
    it('should update node when formFieldPath matches root', () => {
      const originalTree = new ControlRecord({
        control: obsControl,
        formFieldPath: 'FormName.V/1-0',
        value: { original: true },
      });
      const updatedNode = new ControlRecord({
        control: obsControl,
        formFieldPath: 'FormName.V/1-0',
        value: { updated: true },
      });

      const result = ControlRecordTreeMgr.update(originalTree, updatedNode);

      expect(result.value.updated).toBe(true);
      expect(result.formFieldPath).toBe('FormName.V/1-0');
    });

    it('should update nested node when formFieldPath matches child', () => {
      const childToUpdate = new ControlRecord({
        control: obsControl,
        formFieldPath: 'FormName.V/1-0',
        value: { original: true },
      });
      const rootTree = new ControlRecord({
        children: List.of(childToUpdate),
        formFieldPath: 'FormName.V',
        value: { root: true },
      });
      const updatedNode = new ControlRecord({
        control: obsControl,
        formFieldPath: 'FormName.V/1-0',
        value: { updated: true },
      });

      const result = ControlRecordTreeMgr.update(rootTree, updatedNode);

      expect(result.children.get(0).value.updated).toBe(true);
      expect(result.value.root).toBe(true);
    });

    it('should return null when no match is found and no children exist', () => {
      const leafNode = new ControlRecord({
        control: obsControl,
        formFieldPath: 'FormName.V/1-0',
        value: { original: true },
      });
      const updatedNode = new ControlRecord({
        control: obsControl,
        formFieldPath: 'FormName.V/2-0',
        value: { updated: true },
      });

      const result = ControlRecordTreeMgr.update(leafNode, updatedNode);

      expect(result).toBeNull();
    });
  });

  describe('static find', () => {
    it('should find existing node by formFieldPath', () => {
      const targetChild = new ControlRecord({
        control: obsControl,
        formFieldPath: 'FormName.V/1-0',
        value: { target: true },
      });
      const parentTree = new ControlRecord({
        children: List.of(targetChild),
        formFieldPath: 'FormName.V',
      });
      const rootTree = new ControlRecord({
        children: List.of(parentTree),
        formFieldPath: 'Root',
      });

      const foundNode = ControlRecordTreeMgr.find(rootTree, 'FormName.V/1-0');

      expect(foundNode.value.target).toBe(true);
      expect(foundNode.formFieldPath).toBe('FormName.V/1-0');
    });

    it('should return null when node does not exist', () => {
      const existingChild = new ControlRecord({
        control: obsControl,
        formFieldPath: 'FormName.V/1-0',
      });
      const rootTree = new ControlRecord({
        children: List.of(existingChild),
        formFieldPath: 'Root',
      });

      const foundNode = ControlRecordTreeMgr.find(rootTree, 'FormName.V/2-0');

      expect(foundNode).toBeNull();
    });

    it('should return null when parent tree is not found', () => {
      const rootTree = new ControlRecord({
        children: List.of(),
        formFieldPath: 'Root',
      });

      const foundNode = ControlRecordTreeMgr.find(
        rootTree,
        'NonExistent.Path/1-0',
      );

      expect(foundNode).toBeNull();
    });
  });

  describe('static getBrothers', () => {
    it('should return brother trees when target tree is provided', () => {
      const targetTree = new ControlRecord({
        control: obsControl,
        formFieldPath: 'FormName.V/1-0',
      });
      const brotherTree = new ControlRecord({
        control: obsControl,
        formFieldPath: 'FormName.V/1-1',
      });
      const rootTree = new ControlRecord({
        children: List.of(targetTree, brotherTree),
        formFieldPath: 'FormName.V',
      });

      const brothers = ControlRecordTreeMgr.getBrothers(rootTree, targetTree);

      expect(brothers.length).toBeGreaterThan(0);
      expect(brothers.some((b) => b.formFieldPath === 'FormName.V/1-0')).toBe(
        true,
      );
    });

    it('should return empty array when target tree is null', () => {
      const rootTree = new ControlRecord({
        children: List.of(),
        formFieldPath: 'FormName.V',
      });

      const brothers = ControlRecordTreeMgr.getBrothers(rootTree, null);

      expect(brothers).toEqual([]);
    });

    it('should return empty array when target tree is undefined', () => {
      const rootTree = new ControlRecord({
        children: List.of(),
        formFieldPath: 'FormName.V',
      });

      const brothers = ControlRecordTreeMgr.getBrothers(rootTree, undefined);

      expect(brothers).toEqual([]);
    });
  });

  describe('getBrotherTrees', () => {
    it('should return records that are not voided', () => {
      const sectionFormFieldPath = 'FormName.V/1-0/2-0';
      const obsGroupFormFieldPath = 'FormName.V/1-0/2-0/3-0';
      const obsFormFieldPath = 'FormName.V/1-0/2-0/3-0/4-0';
      const observationRecord = new ControlRecord({
        control: obsControl,
        value: {},
        dataSource: {
          concept,
          formFieldPath: obsFormFieldPath,
          formNamespace: 'Bahmni',
          voided: true,
        },
        formFieldPath: obsFormFieldPath,
      });

      const observationRecord2 = new ControlRecord({
        control: obsControl,
        value: {},
        dataSource: {
          concept,
          formFieldPath: obsFormFieldPath,
          formNamespace: 'Bahmni',
          voided: true,
        },
        formFieldPath: obsFormFieldPath,
      });

      const voidedObsControl = {
        concept,
        hiAbsolute: null,
        hiNormal: 72,
        id: '1',
        label: {
          type: 'label',
          value: 'Pulse(/min)',
        },
        lowAbsolute: null,
        lowNormal: 72,
        properties: {
          addMore: true,
          hideLabel: false,
          location: {
            column: 0,
            row: 0,
          },
          mandatory: true,
          notes: false,
        },
        type: 'obsControl',
        units: '/min',
        voided: true,
      };
      const obsGroupControl = {
        type: 'obsGroupControl',
        label: {
          translationKey: 'concept set',
          type: 'label',
          value: 'concept set',
          id: '2',
        },
        properties: {
          addMore: true,
          location: {
            column: 0,
            row: 1,
          },
        },
        id: '2',
        unsupportedProperties: [],
        controls: [voidedObsControl, obsControl],
      };
      const voidedObservationRecord = new ControlRecord({
        control: voidedObsControl,
        value: {},
        dataSource: {
          concept,
          formFieldPath: obsFormFieldPath,
          formNamespace: 'Bahmni',
          voided: true,
        },
        formFieldPath: obsFormFieldPath,
        voided: true,
      });
      const obGrpRecord = new ControlRecord({
        control: obsGroupControl,
        value: {},
        dataSource: {
          concept,
          formFieldPath: obsGroupFormFieldPath,
          formNamespace: 'Bahmni',
          voided: true,
        },
        children: List.of(
          voidedObservationRecord,
          observationRecord,
          observationRecord2,
        ),
        formFieldPath: obsGroupFormFieldPath,
      });

      const sectionRecord = new ControlRecord({
        control: sectionControl,
        value: {},
        dataSource: {
          concept,
          formFieldPath: sectionFormFieldPath,
          formNamespace: 'Bahmni',
          voided: true,
        },
        children: List.of(obGrpRecord),
        formFieldPath: sectionFormFieldPath,
      });

      const brotherObsTree = new ControlRecordTreeMgr().getBrotherTrees(
        sectionRecord,
        obsFormFieldPath,
      );
      expect(brotherObsTree).toHaveLength(2);
      expect(brotherObsTree[0].formFieldPath).toBe(obsFormFieldPath);
      expect(brotherObsTree[1].formFieldPath).toBe(obsFormFieldPath);
    });
  });
});
