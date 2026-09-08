import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import * as z from 'zod';

const updateProfileSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, 'Tên người dùng phải có ít nhất 3 ký tự')
    .max(30, 'Tên người dùng tối đa 30 ký tự')
    .regex(/^[a-zA-Z0-9_]+$/, 'Tên người dùng chỉ bao gồm chữ cái, số và dấu gạch dưới')
    .nullable()
    .optional(),
  full_name: z
    .string()
    .trim()
    .min(2, 'Họ và tên phải có ít nhất 2 ký tự')
    .max(100, 'Họ và tên tối đa 100 ký tự')
    .nullable()
    .optional(),
  avatar_url: z
    .string()
    .url('Đường dẫn ảnh đại diện không hợp lệ')
    .nullable()
    .optional()
    .or(z.literal('')),
  bio: z
    .string()
    .trim()
    .max(200, 'Giới thiệu bản thân tối đa 200 ký tự')
    .nullable()
    .optional()
    .or(z.literal('')),
});

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ profile: data });
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parseResult = updateProfileSchema.safeParse(body);
  if (!parseResult.success) {
    const firstError = parseResult.error.issues[0]?.message || 'Dữ liệu không hợp lệ';
    return NextResponse.json({ error: firstError }, { status: 400 });
  }

  const { username, full_name, avatar_url, bio } = parseResult.data;

  const updatePayload: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (username !== undefined) updatePayload.username = username || null;
  if (full_name !== undefined) updatePayload.full_name = full_name || null;
  if (avatar_url !== undefined) updatePayload.avatar_url = avatar_url || null;
  if (bio !== undefined) updatePayload.bio = bio || null;

  let { data, error } = await supabase
    .from('profiles')
    .update(updatePayload)
    .eq('id', user.id)
    .select()
    .single();

  // If bio column doesn't exist yet in database, fallback to updating without bio
  if (error && error.code === '42703' && 'bio' in updatePayload) {
    delete updatePayload.bio;
    const retry = await supabase
      .from('profiles')
      .update(updatePayload)
      .eq('id', user.id)
      .select()
      .single();
    data = retry.data;
    error = retry.error;
  }

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Tên người dùng đã tồn tại. Vui lòng chọn tên khác.' },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Also sync full_name and avatar_url to Supabase auth user_metadata if present
  try {
    const metadataUpdates: Record<string, any> = {};
    if (full_name !== undefined) metadataUpdates.full_name = full_name;
    if (avatar_url !== undefined) metadataUpdates.avatar_url = avatar_url;
    if (Object.keys(metadataUpdates).length > 0) {
      await supabase.auth.updateUser({ data: metadataUpdates });
    }
  } catch (metaErr) {
    console.warn('Failed to update auth user metadata:', metaErr);
  }

  return NextResponse.json({ profile: data });
}
