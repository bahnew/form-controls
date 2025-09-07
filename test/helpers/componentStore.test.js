import { TextBox } from 'components/TextBox.jsx';
import { Label } from 'components/Label.jsx';
import ComponentStore from 'src/helpers/componentStore';

describe('ComponentStore', () => {
  beforeEach(() => {
    ComponentStore.componentList = {};
    ComponentStore.designerComponentList = {};
  });

  describe('registerComponent', () => {
    it('should register a component', () => {
      ComponentStore.registerComponent('text', TextBox);
      expect(ComponentStore.componentList).toEqual({ text: TextBox });
    });

    it('should override a component if type is same', () => {
      const type = 'text';
      ComponentStore.registerComponent(type, TextBox);
      expect(ComponentStore.getRegisteredComponent(type)).toBe(TextBox);
      ComponentStore.registerComponent(type, Label);
      expect(ComponentStore.getRegisteredComponent(type)).toBe(Label);
    });
  });

  describe('registerDesignerComponent', () => {
    it('should register a designer component', () => {
      const type = 'teXt';
      ComponentStore.registerDesignerComponent(type, TextBox);
      expect(ComponentStore.getDesignerComponent(type)).toBe(TextBox);
    });

    it('should override a designer component if type is same', () => {
      const type = 'text';
      ComponentStore.registerDesignerComponent(type, TextBox);
      expect(ComponentStore.getDesignerComponent(type)).toBe(TextBox);
      ComponentStore.registerDesignerComponent(type, Label);
      expect(ComponentStore.getDesignerComponent(type)).toBe(Label);
    });
  });

  describe('getRegisteredComponent', () => {
    it('should return the registered component', () => {
      const type = 'text';
      ComponentStore.registerComponent(type, TextBox);
      const registeredComponent = ComponentStore.getRegisteredComponent(type);
      expect(registeredComponent).toBe(TextBox);
    });

    it('should return the registered component irrespective of case of type', () => {
      const type = 'TexT';
      ComponentStore.registerComponent(type, TextBox);
      expect(ComponentStore.getRegisteredComponent(type)).toBe(TextBox);

      const registeredComponent = ComponentStore.getRegisteredComponent('tEXt');
      expect(registeredComponent).toBe(TextBox);
    });

    it('should return undefined when no matching component found', () => {
      const registeredComponent = ComponentStore.getRegisteredComponent('something');
      expect(registeredComponent).toBeUndefined();
    });
  });

  describe('getRegisteredDesignerComponent', () => {
    it('should return the registered designer component', () => {
      ComponentStore.registerDesignerComponent('text', TextBox);
      const registeredDesignerComponent = ComponentStore.getDesignerComponent('text');
      expect(registeredDesignerComponent).toBe(TextBox);
    });

    it('should return the registered designer component irrespective of case of type', () => {
      const type = 'TexT';
      ComponentStore.registerDesignerComponent(type, TextBox);
      expect(ComponentStore.getDesignerComponent(type)).toBe(TextBox);

      const registeredDesignerComponent = ComponentStore.getDesignerComponent('tEXt');
      expect(registeredDesignerComponent).toBe(TextBox);
    });

    it('should return undefined when no matching designer component found', () => {
      const registeredDesignerComponent = ComponentStore.getDesignerComponent('something');
      expect(registeredDesignerComponent).toBeUndefined();
    });
  });

  describe('deRegisterComponent', () => {
    it('should deRegisterComponent component irrespective of case', () => {
      ComponentStore.registerComponent('tEXt', TextBox);
      expect(ComponentStore.getRegisteredComponent('tEXt')).toBe(TextBox);
      ComponentStore.deRegisterComponent('TexT');
      ComponentStore.deRegisterComponent('someRandomThing');
      expect(ComponentStore.getRegisteredComponent('TexT')).toBeUndefined();
      expect(ComponentStore.getRegisteredComponent('someRandomThing')).toBeUndefined();
    });
  });

  describe('deRegisterDesignerComponent', () => {
    it('should deRegisterComponent designer component irrespective of case', () => {
      ComponentStore.registerDesignerComponent('tEXt', TextBox);
      expect(ComponentStore.getDesignerComponent('tEXt')).toBe(TextBox);
      ComponentStore.deRegisterDesignerComponent('TexT');
      ComponentStore.deRegisterDesignerComponent('someRandomThing');
      expect(ComponentStore.getRegisteredComponent('TexT')).toBeUndefined();
      expect(ComponentStore.getRegisteredComponent('someRandomThing')).toBeUndefined();
    });
  });

  describe('getAllRegisteredComponents', () => {
    it('should return all the registered components', () => {
      const expectedComponents = { text: TextBox, label: Label };
      ComponentStore.registerComponent('text', TextBox);
      ComponentStore.registerComponent('label', Label);
      expect(ComponentStore.getAllRegisteredComponents()).toEqual(expectedComponents);
    });
  });

  describe('getAllDesignerComponents', () => {
    it('should return all the registered designer components', () => {
      const expectedComponents = { text: TextBox, label: Label };
      ComponentStore.registerDesignerComponent('text', TextBox);
      ComponentStore.registerDesignerComponent('label', Label);
      expect(ComponentStore.getAllDesignerComponents()).toEqual(expectedComponents);
    });
  });
});
