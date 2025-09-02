import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Video } from 'components/Video.jsx';
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

describe('Video Control', () => {
  describe('Video Upload', () => {
    let mockOnChange;
    let mockOnControlAdd;
    let mockShowNotification;
    const formFieldPath = 'test1.1/1-0';

    beforeEach(() => {
      mockOnChange = jest.fn();
      mockOnControlAdd = jest.fn();
      mockShowNotification = jest.fn();
      
      Util.getFileType.mockReturnValue('video');
      Util.uploadFile.mockResolvedValue({
        json: () => Promise.resolve({ url: 'someUrl' }),
      });
      
      mockFileReader.readAsDataURL.mockImplementation(function() {
        setTimeout(() => {
          this.onloadend({ target: { result: 'data:video/mp4;base64,/9j/4SumRXhpZgAATU' } });
        }, 0);
      });
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    const renderVideo = (props = {}) => {
      return render(
        <Video
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
    };

    it('should render ComplexControl Video', () => {
      renderVideo();

      const fileInput = screen.getByLabelText('Upload Video');
      expect(fileInput).toHaveAttribute('type', 'file');
      expect(fileInput).toHaveAttribute('accept', '.mkv,.flv,.ogg,video/*,audio/3gpp');
    });

    it('should display the video which been uploaded', () => {
      const { container } = renderVideo({ value: 'someValue' });

      expect(container.querySelector('video')).toBeInTheDocument();
    });

    it('should upload video file to server', async () => {
      renderVideo();

      const fileInput = screen.getByLabelText('Upload Video');
      const file = new File(['content'], 'test.mp4', { type: 'video/mp4' });
      
      fireEvent.change(fileInput, { target: { files: [file] } });

      setTimeout(() => {
        mockFileReader.onloadend({ target: { result: 'data:video/mp4;base64,/9j/4SumRXhpZgAATU' } });
      }, 0);

      await waitFor(() => {
        expect(Util.uploadFile).toHaveBeenCalledWith(
          'data:video/mp4;base64,/9j/4SumRXhpZgAATU',
          undefined,
          'video'
        );
      });

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith({ value: 'someUrl', errors: [] });
      });
    });

    it('should not upload if file type is not supported', () => {
      Util.getFileType.mockReturnValue('not_supported');
      renderVideo();

      const fileInput = screen.getByLabelText('Upload Video');
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      
      fireEvent.change(fileInput, { target: { files: [file] } });

      expect(mockShowNotification).toHaveBeenCalledWith(
        constants.errorMessage.fileTypeNotSupported,
        constants.messageType.error
      );
      expect(Util.uploadFile).not.toHaveBeenCalled();
    });

    it('should show restore button when click the delete button', () => {
      const { container, rerender } = renderVideo({ value: 'someValue' });

      const deleteButton = container.querySelector('.delete-button');
      fireEvent.click(deleteButton);

      rerender(
        <Video
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

    it('should one add more complex control without notification', () => {
      renderVideo({ value: 'someValue' });

      expect(mockOnControlAdd).toHaveBeenCalledWith(formFieldPath, false);
    });

    it('should not add more complex control when there is no uploaded file', () => {
      renderVideo({ value: undefined });

      expect(mockOnControlAdd).not.toHaveBeenCalled();
    });

    it('should not add more when the addMore property of complex control is false', () => {
      renderVideo({ addMore: false });

      expect(mockOnControlAdd).not.toHaveBeenCalled();
    });

    it('should only one add more complex control when there is an re-uploaded file', () => {
      const { rerender } = renderVideo({ value: 'someValue' });

      rerender(
        <Video
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
      const { unmount } = renderVideo();
      unmount();
      
      renderVideo({ value: 'someValue' });

      expect(mockOnControlAdd).toHaveBeenCalledWith(formFieldPath, false);
    });

    it('should throw error on fail of validations', () => {
      const validations = ['mandatory'];
      const mandatoryError = new Error({ message: validations[0] });
      const { rerender } = renderVideo({ validations });

      const fileInput = screen.getByLabelText('Upload Video');
      Object.defineProperty(fileInput, 'files', {
        value: undefined,
        writable: false,
      });
      fireEvent.change(fileInput, { target: { files: undefined } });

      expect(mockOnChange).toHaveBeenCalledWith({ value: undefined, errors: [mandatoryError] });
      expect(fileInput).toHaveClass('form-builder-error');

      rerender(
        <Video
          addMore
          formFieldPath={formFieldPath}
          onChange={mockOnChange}
          onControlAdd={mockOnControlAdd}
          showNotification={mockShowNotification}
          validate={true}
          validations={validations}
          value={undefined}
        />
      );

      expect(fileInput).toHaveClass('form-builder-error');
    });

    it('should throw error on fail of validations during component update', () => {
      const validations = ['mandatory'];
      const mandatoryError = new Error({ message: validations[0] });
      const { rerender } = renderVideo({ validations, value: 'someValue' });

      rerender(
        <Video
          addMore
          formFieldPath={formFieldPath}
          onChange={mockOnChange}
          onControlAdd={mockOnControlAdd}
          showNotification={mockShowNotification}
          validate={true}
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
      const { container, rerender } = renderVideo({
        validations,
        value: 'someValue',
        formFieldPath: 'test1.1/1-1',
      });

      const deleteButton = container.querySelector('.delete-button');
      fireEvent.click(deleteButton);

      rerender(
        <Video
          addMore
          formFieldPath="test1.1/1-1"
          onChange={mockOnChange}
          onControlAdd={mockOnControlAdd}
          showNotification={mockShowNotification}
          validate={true}
          validations={validations}
          value="someValuevoided"
        />
      );

      expect(mockOnChange).toHaveBeenCalledWith({ value: 'someValuevoided', errors: [] });
    });

    it('should not update the component when the value is not change', () => {
      const { rerender } = renderVideo({ value: 'someValue' });
      mockOnChange.mockClear();

      rerender(
        <Video
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
      renderVideo({ enabled: false });

      const fileInput = screen.getByLabelText('Upload Video');
      expect(fileInput).toBeDisabled();
    });

    it('should show spinner when the file is uploading', async () => {
      const { container } = renderVideo();

      const fileInput = screen.getByLabelText('Upload Video');
      const file = new File(['fileContent'], 'test.mp4', { type: 'video/mp4' });
      
      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        const spinnerElement = container.querySelector('.overlay');
        expect(spinnerElement).toBeInTheDocument();
      });
    });

    it('should not show spinner when the file is already uploaded', () => {
      const { container } = renderVideo();

      const spinnerElement = container.querySelector('.overlay');
      expect(spinnerElement).not.toBeInTheDocument();
    });

    it('should display video with disabled styling when voided', () => {
      const { container } = renderVideo({ value: 'someValuevoided' });

      const video = container.querySelector('video');
      expect(video).toHaveClass('obs-video');
      expect(video).toHaveClass('obs-disabled');
    });

    it('should hide the restore button when click the restore button', () => {
      const { container, rerender } = renderVideo({ value: 'someValue' });

      const deleteButton = container.querySelector('.delete-button');
      fireEvent.click(deleteButton);

      rerender(
        <Video
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
        <Video
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
  });
});
