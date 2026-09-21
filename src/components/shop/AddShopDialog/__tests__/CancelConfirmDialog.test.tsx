import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import {
  CancelConfirmDialog,
  CANCEL_CONFIRM_COPY
} from '../CancelConfirmDialog';

describe('CancelConfirmDialog and CANCEL_CONFIRM_COPY', () => {
  it('has correct copy constant values for create and edit modes', () => {
    expect(CANCEL_CONFIRM_COPY.create).toEqual({
      title: 'Hủy bỏ thêm quán?',
      description: 'Bạn có chắc muốn hủy? Mọi thông tin đã nhập sẽ bị mất.',
      confirmLabel: 'Hủy bỏ',
      continueLabel: 'Tiếp tục'
    });

    expect(CANCEL_CONFIRM_COPY.edit).toEqual({
      title: 'Hủy bỏ chỉnh sửa?',
      description: 'Bạn có chắc muốn hủy? Mọi thay đổi chưa lưu sẽ bị mất.',
      confirmLabel: 'Bỏ thay đổi',
      continueLabel: 'Tiếp tục'
    });
  });

  it('renders correctly in CREATE mode with proper hierarchy and copy', () => {
    const onOpenChange = vi.fn();
    const onConfirm = vi.fn();

    render(
      <CancelConfirmDialog
        open={true}
        onOpenChange={onOpenChange}
        isEditMode={false}
        onConfirm={onConfirm}
      />
    );

    // Title and description
    expect(screen.getByText('Hủy bỏ thêm quán?')).toBeInTheDocument();
    expect(
      screen.getByText('Bạn có chắc muốn hủy? Mọi thông tin đã nhập sẽ bị mất.')
    ).toBeInTheDocument();

    // Safe button ("Tiếp tục")
    const continueBtn = screen.getByRole('button', { name: 'Tiếp tục' });
    expect(continueBtn).toBeInTheDocument();
    expect(continueBtn.className).toContain('bg-amber-gold');
    expect(continueBtn.className).toContain('order-1');
    expect(continueBtn.className).toContain('sm:order-2');

    // Destructive button ("Hủy bỏ")
    const confirmBtn = screen.getByRole('button', { name: 'Hủy bỏ' });
    expect(confirmBtn).toBeInTheDocument();
    expect(confirmBtn.className).toContain('bg-transparent');
    expect(confirmBtn.className).toContain('border-border');
    expect(confirmBtn.className).not.toContain('bg-rose-600');
    expect(confirmBtn.className).toContain('order-2');
    expect(confirmBtn.className).toContain('sm:order-1');

    // Click confirm triggers onConfirm
    fireEvent.click(confirmBtn);
    expect(onConfirm).toHaveBeenCalledTimes(1);

    // Click continue triggers onOpenChange(false)
    fireEvent.click(continueBtn);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('renders correctly in EDIT mode with proper hierarchy and copy', () => {
    const onOpenChange = vi.fn();
    const onConfirm = vi.fn();

    render(
      <CancelConfirmDialog
        open={true}
        onOpenChange={onOpenChange}
        isEditMode={true}
        onConfirm={onConfirm}
      />
    );

    // Title and description
    expect(screen.getByText('Hủy bỏ chỉnh sửa?')).toBeInTheDocument();
    expect(
      screen.getByText('Bạn có chắc muốn hủy? Mọi thay đổi chưa lưu sẽ bị mất.')
    ).toBeInTheDocument();

    // Confirm button in edit mode is labeled "Bỏ thay đổi"
    const confirmBtn = screen.getByRole('button', { name: 'Bỏ thay đổi' });
    expect(confirmBtn).toBeInTheDocument();
    expect(confirmBtn.className).toContain('bg-transparent');
    expect(confirmBtn.className).not.toContain('bg-rose-600');

    // Safe button remains "Tiếp tục"
    const continueBtn = screen.getByRole('button', { name: 'Tiếp tục' });
    expect(continueBtn).toBeInTheDocument();
    expect(continueBtn.className).toContain('bg-amber-gold');
  });
});
