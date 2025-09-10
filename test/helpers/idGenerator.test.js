import { IDGenerator } from 'src/helpers/idGenerator';

describe('idGenerator', () => {
  const controls = [
    {
      id: 1,
      controls: [],
    },
    {
      id: 2,
      controls: [
        {
          id: 23,
          controls: [
            {
              id: 235,
              controls: [],
            },
          ],
        },
      ],
    },
  ];

  describe('getId', () => {
    it('should return 1 when controls are empty', () => {
      const idGenerator = new IDGenerator();
      const controlId = idGenerator.getId();
      expect(controlId).toBe(1);
    });

    it('should return all the max control Id', () => {
      const idGenerator = new IDGenerator(controls);
      const controlIds = idGenerator.getId();
      expect(controlIds).toBe(236);
    });

    it('should increment id on subsequent calls', () => {
      const idGenerator = new IDGenerator();
      expect(idGenerator.getId()).toBe(1);
      expect(idGenerator.getId()).toBe(2);
      expect(idGenerator.getId()).toBe(3);
    });

    it('should handle controls without nested controls', () => {
      const flatControls = [
        { id: 5 },
        { id: 10 },
        { id: 3 }
      ];
      const idGenerator = new IDGenerator(flatControls);
      expect(idGenerator.getId()).toBe(11);
    });

    it('should handle mixed controls with and without nested controls', () => {
      const mixedControls = [
        { id: 1, controls: [] },
        { id: 15 },
        { id: 8, controls: [{ id: 20 }] },
        { id: 5 }
      ];
      const idGenerator = new IDGenerator(mixedControls);
      expect(idGenerator.getId()).toBe(21);
    });

    it('should handle controls with null or undefined controls property', () => {
      const controlsWithNulls = [
        { id: 10, controls: null },
        { id: 25, controls: undefined },
        { id: 30 }
      ];
      const idGenerator = new IDGenerator(controlsWithNulls);
      expect(idGenerator.getId()).toBe(31);
    });

    it('should handle controls with NaN ids by falling back to 1', () => {
      const controlsWithNaN = [
        { id: NaN },
        { id: 'invalid' },
        { id: 10 }
      ];
      const idGenerator = new IDGenerator(controlsWithNaN);
      expect(idGenerator.getId()).toBe(1);
    });
  });
});
