import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Image } from 'components/Image.jsx';
import { Util } from 'helpers/Util';
import constants from 'src/constants';
import { Error } from 'src/Error';

jest.mock('helpers/Util', () => ({
  Util: {
    getFileType: jest.fn(),
    uploadFile: jest.fn(),
  },
}));

const mockFileReader = {
  readAsDataURL: jest.fn(),
  onloadend: jest.fn(),
  result: '',
};

global.FileReader = jest.fn(() => mockFileReader);

describe('Image Control', () => {
  describe('Image Upload', () => {
    let mockOnChange;
    let mockOnControlAdd;
    let mockShowNotification;
    const formFieldPath = 'test1.1/1-0';

    beforeEach(() => {
      mockOnChange = jest.fn();
      mockOnControlAdd = jest.fn();
      mockShowNotification = jest.fn();

      Util.getFileType.mockReturnValue('image');
      Util.uploadFile.mockResolvedValue({
        json: () => Promise.resolve({ url: 'someUrl' }),
      });

      mockFileReader.readAsDataURL.mockImplementation(function () {
        setTimeout(() => {
          this.onloadend({ target: { result: 'data:image/jpeg;base64,/9j/4SumRXhpZgAATU' } });
        }, 0);
      });
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    const renderImage = (props = {}) => render(
        <Image
          addMore
          formFieldPath={formFieldPath}
          onChange={mockOnChange}
          onControlAdd={mockOnControlAdd}
          showNotification={mockShowNotification}
          validate={false}
          validations={[]}
          {...props}
        />
      );

    it('should render Image', () => {
      renderImage();

      const fileInput = screen.getByLabelText('', { selector: 'input[type="file"]' });
      expect(fileInput).toHaveAttribute('type', 'file');
      expect(fileInput).toHaveAttribute('accept', 'application/pdf, image/*');
    });

    it('should upload image file to server', async () => {
      renderImage();

      const fileInput = screen.getByLabelText('', { selector: 'input[type="file"]' });
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });

      fireEvent.change(fileInput, { target: { files: [file] } });

      setTimeout(() => {
        mockFileReader.onloadend({ target: { result: 'data:image/jpeg;base64,/9j/4SumRXhpZgAATU' } });
      }, 0);

      await waitFor(() => {
        expect(Util.uploadFile).toHaveBeenCalledWith(
          'data:image/jpeg;base64,/9j/4SumRXhpZgAATU',
          undefined,
          'image'
        );
      });

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith({ value: 'someUrl', errors: [] });
      });
    });

    it('should not upload if file type is not supported', () => {
      Util.getFileType.mockReturnValue('not_supported');
      renderImage();

      const fileInput = screen.getByLabelText('', { selector: 'input[type="file"]' });
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });

      fireEvent.change(fileInput, { target: { files: [file] } });

      expect(mockShowNotification).toHaveBeenCalledWith(
        constants.errorMessage.fileTypeNotSupported,
        constants.messageType.error
      );
      expect(Util.uploadFile).not.toHaveBeenCalled();
    });

    it('should display the file which been uploaded', () => {
      renderImage({ value: 'someValue' });

      expect(screen.getByRole('img')).toBeInTheDocument();
    });

    it('should display the pdfIcon if a pdf is uploaded', () => {
      renderImage({ value: 'someValue.pdf' });
      const imageUrl = '../../../../bahmni/images/pdfIcon.png';

      const image = screen.getByRole('img');
      expect(image).toHaveAttribute('src', imageUrl);
    });

    it('should show restore button when click the delete button', () => {
      const { container, rerender } = renderImage({ value: 'someValue' });

      const deleteButton = container.querySelector('.delete-button');
      fireEvent.click(deleteButton);

      rerender(
        <Image
          addMore
          formFieldPath={formFieldPath}
          onChange={mockOnChange}
          onControlAdd={mockOnControlAdd}
          showNotification={mockShowNotification}
          validate={false}
          validations={[]}
          value="someValuevoided"
        />
      );

      expect(container.querySelector('.restore-button')).toBeInTheDocument();
    });

    it('should hide the restore button when click the restore button', () => {
      const { container, rerender } = renderImage({ value: 'someValue' });

      const deleteButton = container.querySelector('.delete-button');
      fireEvent.click(deleteButton);

      rerender(
        <Image
          addMore
          formFieldPath={formFieldPath}
          onChange={mockOnChange}
          onControlAdd={mockOnControlAdd}
          showNotification={mockShowNotification}
          validate={false}
          validations={[]}
          value="someValuevoided"
        />
      );

      const restoreButton = container.querySelector('.restore-button');
      fireEvent.click(restoreButton);

      rerender(
        <Image
          addMore
          formFieldPath={formFieldPath}
          onChange={mockOnChange}
          onControlAdd={mockOnControlAdd}
          showNotification={mockShowNotification}
          validate={false}
          validations={[]}
          value="someValue"
        />
      );

      expect(container.querySelector('.delete-button')).toBeInTheDocument();
      expect(container.querySelector('.restore-button')).not.toBeInTheDocument();
    });

    it('should one add more complex control without notification', () => {
      renderImage({ value: 'someValue' });

      expect(mockOnControlAdd).toHaveBeenCalledWith(formFieldPath, false);
    });

    it('should one add more complex control with notification after uploading the file', async () => {
      renderImage();

      const fileInput = screen.getByLabelText('', { selector: 'input[type="file"]' });
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });

      fireEvent.change(fileInput, { target: { files: [file] } });

      setTimeout(() => {
        mockFileReader.onloadend({ target: { result: 'data:application/pdf;base64,test' } });
      }, 0);

      await waitFor(() => {
        expect(mockOnControlAdd).toHaveBeenCalledWith(formFieldPath, true);
      });
    });

    it('should not add more complex control when there is no uploaded file', () => {
      renderImage({ value: undefined });

      expect(mockOnControlAdd).not.toHaveBeenCalled();
    });

    it('should not add more when the addMore property of complex control is false', () => {
      renderImage({ addMore: false });

      expect(mockOnControlAdd).not.toHaveBeenCalled();
    });

    it('should only one add more complex control when there is an re-uploaded file', () => {
      const { rerender } = renderImage({ value: 'someValue' });

      rerender(
        <Image
          addMore
          formFieldPath={formFieldPath}
          onChange={mockOnChange}
          onControlAdd={mockOnControlAdd}
          showNotification={mockShowNotification}
          validate={false}
          validations={[]}
          value="newValue"
        />
      );

      expect(mockOnControlAdd).toHaveBeenCalledTimes(1);
    });

    it('should add more control when there is value and switch the tab', () => {
      const { unmount } = renderImage();
      unmount();

      renderImage({ value: 'someValue' });

      expect(mockOnControlAdd).toHaveBeenCalledWith(formFieldPath, false);
    });

    it('should throw error on fail of validations', () => {
      const validations = ['mandatory'];
      const mandatoryError = new Error({ message: validations[0] });
      const { rerender } = renderImage({ validations });

      const fileInput = screen.getByLabelText('', { selector: 'input[type="file"]' });

      Object.defineProperty(fileInput, 'files', {
        value: undefined,
        writable: false,
      });
      fireEvent.change(fileInput, { target: { files: undefined } });

      expect(mockOnChange).toHaveBeenCalledWith({ value: undefined, errors: [mandatoryError] });
      expect(fileInput).toHaveClass('form-builder-error');

      rerender(
        <Image
          addMore
          formFieldPath={formFieldPath}
          onChange={mockOnChange}
          onControlAdd={mockOnControlAdd}
          showNotification={mockShowNotification}
          validate
          validations={validations}
          value={undefined}
        />
      );

      expect(fileInput).toHaveClass('form-builder-error');
    });

    it('should throw error on fail of validations during component update', () => {
      const validations = ['mandatory'];
      const mandatoryError = new Error({ message: validations[0] });
      const { rerender } = renderImage({ validations, value: 'someValue' });

      rerender(
        <Image
          addMore
          formFieldPath={formFieldPath}
          onChange={mockOnChange}
          onControlAdd={mockOnControlAdd}
          showNotification={mockShowNotification}
          validate
          validations={validations}
          value="someValuevoided"
        />
      );

      expect(mockOnChange).toHaveBeenCalledWith({
        value: 'someValuevoided',
        errors: [mandatoryError],
      });
    });

    it('should not throw error when the complex control is created by add more', () => {
      const validations = ['mandatory'];
      const { rerender } = renderImage({
        validations,
        value: 'someValue',
        formFieldPath: 'test1.1/1-1',
      });

      const deleteButton = screen.getByRole('button');
      fireEvent.click(deleteButton);

      rerender(
        <Image
          addMore
          formFieldPath="test1.1/1-1"
          onChange={mockOnChange}
          onControlAdd={mockOnControlAdd}
          showNotification={mockShowNotification}
          validate
          validations={validations}
          value="someValuevoided"
        />
      );

      expect(mockOnChange).toHaveBeenCalledWith({ value: 'someValuevoided', errors: [] });
    });

    it('should not update the component when the value is not change', () => {
      const { rerender } = renderImage({ value: 'someValue' });
      mockOnChange.mockClear();

      rerender(
        <Image
          addMore
          formFieldPath={formFieldPath}
          onChange={mockOnChange}
          onControlAdd={mockOnControlAdd}
          showNotification={mockShowNotification}
          validate={false}
          validations={[]}
          value="someValue"
        />
      );

      expect(mockOnChange).not.toHaveBeenCalledWith({ value: 'someValue', errors: [] });
    });

    it('should check disabled attribute when enabled prop is false', () => {
      renderImage({ enabled: false });

      const fileInput = screen.getByLabelText('', { selector: 'input[type="file"]' });
      expect(fileInput).toBeDisabled();
    });

    it('should show spinner when the file is uploading', async () => {
      const { container } = renderImage();

      const fileInput = screen.getByLabelText('', { selector: 'input[type="file"]' });
      const file = new File(['fileContent'], 'test.jpg', { type: 'image/jpeg' });

      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        const spinnerElement = container.querySelector('.overlay');
        expect(spinnerElement).toBeInTheDocument();
      });
    });

    it('should not show spinner when the file is already uploaded', () => {
      const { container } = renderImage();

      const spinnerElement = container.querySelector('.overlay');
      expect(spinnerElement).not.toBeInTheDocument();
    });
  });
});
