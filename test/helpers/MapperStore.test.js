import MapperStore from 'src/helpers/MapperStore';
import { ObsMapper } from 'src/mapper/ObsMapper';
import { AbnormalObsGroupMapper } from 'src/mapper/AbnormalObsGroupMapper';
import { ObsGroupMapper } from 'src/mapper/ObsGroupMapper';
import { SectionMapper } from 'src/mapper/SectionMapper';
import { TableMapper } from 'src/mapper/TableMapper';
import { ObsListMapper } from 'src/mapper/ObsListMapper';

describe('MapperStore', () => {
  describe('getMapper', () => {
    let control;
    beforeEach(() => {
      control = { id: 1, type: 'obsControl', properties: {} };
    });

    it('should return obsMapper by default', () => {
      const mapper = MapperStore.getMapper(control);
      expect(mapper instanceof ObsMapper).toBe(true);
    });

    it('should return obsGroupMapper', () => {
      control.type = 'obsGroupControl';
      const mapper = MapperStore.getMapper(control);
      expect(mapper instanceof ObsGroupMapper).toBe(true);
    });

    it('should return obsListMapper if multiSelect property is enabled', () => {
      control.properties = { multiSelect: true };
      const mapper = MapperStore.getMapper(control);
      expect(mapper instanceof ObsListMapper).toBe(true);
    });

    it('should return AbnormalObsGroupMapper if obsgroup is abnormal', () => {
      control.type = 'obsGroupControl';
      control.properties = { abnormal: true };
      const mapper = MapperStore.getMapper(control);
      expect(mapper instanceof AbnormalObsGroupMapper).toBe(true);
    });

    it('should return sectionMapper when control type is section', () => {
      control.type = 'section';
      const mapper = MapperStore.getMapper(control);
      expect(mapper instanceof SectionMapper).toBe(true);
    });

    it('should return tableMapper when control type is table', () => {
      control.type = 'table';
      const mapper = MapperStore.getMapper(control);
      expect(mapper instanceof TableMapper).toBe(true);
    });
  });
});
