import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CommentDesigner } from 'components/designer/Comment.jsx';

describe('CommentDesigner', () => {
  it('should render add comment button', () => {
    render(<CommentDesigner />);
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).toBeNull();
  });

  it('should render the comment section on click of button', () => {
    render(<CommentDesigner />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('should hide the comment section on click of button if it is shown', () => {
    render(<CommentDesigner />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('textbox')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button'));
    expect(screen.queryByRole('textbox')).toBeNull();
  });
});
