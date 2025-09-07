import Constants from 'src/constants';
import { createFormNamespaceAndPath, getKeyPrefixForControl, getUpdatedFormFieldPath } from 'src/helpers/formNamespace';

describe('FormNamespace Helper', () => {
  describe('getKeyPrefixForControl', () => {
    it('should return object containing formNamespace and formFieldPath without parentFormFieldPath', () => {
      const expectedDetails = {
        formNamespace: `${Constants.bahmni}`,
        formFieldPath: 'formName.1/1',
      };

      expect(getKeyPrefixForControl('formName', '1', '1')).toEqual(expectedDetails);
    });

    it('should return object containing formNamespace and formFieldPath with parentFormFieldPath', () => {
      const expectedDetails = {
        formNamespace: `${Constants.bahmni}`,
        formFieldPath: 'parent.1/2-0/childControl',
      };

      expect(getKeyPrefixForControl('formName', '1', 'childControl', 'parent.1/2-0'))
        .toEqual(expectedDetails);
    });
  });

  describe('createFormNamespaceAndPath', () => {
    it('should create formNamespace from form uuid and controlId without parentFormFieldPath', () => {
      const expectedDetails = {
        formNamespace: `${Constants.bahmni}`,
        formFieldPath: 'someFormName.1/someControlId-0',
      };

      expect(createFormNamespaceAndPath('someFormName', '1', 'someControlId'))
        .toEqual(expectedDetails);
    });

    it('should create formNamespace from form uuid and controlId with parentFormFieldPath', () => {
      const expectedDetails = {
        formNamespace: `${Constants.bahmni}`,
        formFieldPath: 'parent.1/2-0/childControl-0',
      };

      expect(createFormNamespaceAndPath('formName', '1', 'childControl', 'parent.1/2-0'))
        .toEqual(expectedDetails);
    });
  });

  describe('getUpdatedFormFieldPath', () => {
    it('should return source formFieldPath when parentFormFieldPath is empty', () => {
      const sourceNode = { formFieldPath: 'form.1/control-0' };
      
      expect(getUpdatedFormFieldPath(sourceNode, '')).toEqual('form.1/control-0');
      expect(getUpdatedFormFieldPath(sourceNode, null)).toEqual('form.1/control-0');
      expect(getUpdatedFormFieldPath(sourceNode, undefined)).toEqual('form.1/control-0');
    });

    it('should return updated formFieldPath with parentFormFieldPath prefix', () => {
      const sourceNode = { formFieldPath: 'originalForm.1/originalControl-0' };
      const parentFormFieldPath = 'newParent.2/section-1';
      
      expect(getUpdatedFormFieldPath(sourceNode, parentFormFieldPath))
        .toEqual('newParent.2/section-1/originalControl-0');
    });
  });
});
