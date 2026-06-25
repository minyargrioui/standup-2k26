// src/services/roomService.js
import { supabase } from '../../lib/supabase';

const ROOM_CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const SHARED_CAPACITY = 4;
const INDIVIDUAL_CAPACITY = 1;

function generateRoomCode() {
  let code = '';
  for (let i = 0; i < 6; i += 1) {
    code += ROOM_CODE_CHARS[Math.floor(Math.random() * ROOM_CODE_CHARS.length)];
  }
  return code;
}

function capacityForType(roomType) {
  return roomType === 'individual' ? INDIVIDUAL_CAPACITY : SHARED_CAPACITY;
}

function normalizeGenderCode(gender) {
  const value = String(gender || '').trim().toUpperCase();
  if (value === 'M' || value === 'MALE') return 'M';
  if (value === 'F' || value === 'FEMALE') return 'F';
  return '';
}

function roomGenderValue(gender) {
  return normalizeGenderCode(gender) === 'M' ? 'Male' : 'Female';
}

function genderLabel(gender) {
  return normalizeGenderCode(gender) === 'M' ? 'male' : 'female';
}

function normalizeRoom(room, members = [], fallbackType = 'shared') {
  const capacity = Number(room?.capacity) || capacityForType(room?.room_type || fallbackType);
  return {
    ...room,
    id: room.id,
    room_id: room.id,
    room_code: room.room_number,
    room_number: room.room_number,
    room_type: room.room_type || fallbackType,
    gender: normalizeGenderCode(room.gender),
    capacity,
    members,
    occupied: members.length,
  };
}

function memberFromRegistration(registration) {
  return {
    id: registration.id,
    room_id: registration.room_id,
    registration_id: registration.id,
    user_name: registration.nickname || registration.full_name,
    gender: registration.gender,
    joined_at: registration.updated_at || registration.created_at || registration.submitted_at,
  };
}

async function verifyDelegateViaApi(code) {
  try {
    const response = await fetch(`/api/registrations/verify?code=${encodeURIComponent(code)}`);
    if (!response.ok) return null;
    const payload = await response.json();
    return payload.valid ? payload.delegate : null;
  } catch {
    return null;
  }
}

export async function validateDelegateCode(code) {
  const normalizedCode = code.trim();

  if (!normalizedCode) {
    return { success: false, error: 'Please enter your registration code.' };
  }

  try {
    const delegateFields = 'id, code, full_name, email, nickname, gender';
    const { data: idMatch, error: idError } = await supabase
      .from('registrations')
      .select(delegateFields)
      .eq('id', normalizedCode)
      .maybeSingle();

    if (!idError && idMatch) {
      return { success: true, delegate: idMatch };
    }

    const { data: codeMatch, error: codeError } = await supabase
      .from('registrations')
      .select(delegateFields)
      .eq('code', normalizedCode.toUpperCase())
      .maybeSingle();

    if (!codeError && codeMatch) {
      return { success: true, delegate: codeMatch };
    }

    const apiDelegate = await verifyDelegateViaApi(normalizedCode);
    if (apiDelegate) {
      return { success: true, delegate: apiDelegate };
    }

    return {
      success: false,
      error: 'Registration code not found. Use the access key from your registration confirmation.',
    };
  } catch (error) {
    console.error('Delegate validation error:', error);
    return { success: false, error: 'Could not verify registration. Please try again.' };
  }
}

export async function getDelegateMembership(registrationId) {
  try {
    const { data: registration, error } = await supabase
      .from('registrations')
      .select('id, full_name, nickname, gender, room_id, created_at, updated_at, submitted_at')
      .eq('id', registrationId)
      .maybeSingle();

    if (error) throw error;
    if (!registration?.room_id) return { success: true, membership: null };

    const roomResult = await getRoomDetails(registration.room_id);
    if (!roomResult.success) return roomResult;

    return {
      success: true,
      membership: {
        ...memberFromRegistration(registration),
        room: roomResult.room,
      },
    };
  } catch (error) {
    console.error('Membership lookup error:', error);
    return { success: false, error: 'Could not check existing room assignment.' };
  }
}

async function getRoomOccupancy(roomId) {
  const { count, error } = await supabase
    .from('registrations')
    .select('*', { count: 'exact', head: true })
    .eq('room_id', roomId);

  if (error) throw error;
  return count || 0;
}

async function generateUniqueRoomCode() {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const roomCode = generateRoomCode();
    const { data } = await supabase
      .from('room')
      .select('id')
      .eq('room_number', roomCode)
      .maybeSingle();

    if (!data) return roomCode;
  }

  throw new Error('Could not generate a unique room code.');
}

export async function createRoom({ registrationId, userName, gender, roomType }) {
  const normalizedGender = normalizeGenderCode(gender);
  const normalizedType = roomType.toLowerCase();

  if (!['M', 'F'].includes(normalizedGender)) {
    return { success: false, error: 'Please select a valid gender.' };
  }

  if (!['individual', 'shared'].includes(normalizedType)) {
    return { success: false, error: 'Please choose individual or shared room.' };
  }

  try {
    const existing = await getDelegateMembership(registrationId);
    if (!existing.success) return existing;
    if (existing.membership) {
      return { success: false, error: 'You are already assigned to a room.' };
    }

    const roomNumber = await generateUniqueRoomCode();

    const { data: room, error: roomError } = await supabase
      .from('room')
      .insert([{
        room_number: roomNumber,
        room_type: normalizedType,
        gender: roomGenderValue(normalizedGender),
      }])
      .select()
      .single();

    if (roomError) throw roomError;

    const joinResult = await joinRoom({
      registrationId,
      userName,
      gender: normalizedGender,
      roomId: room.id,
    });

    if (!joinResult.success) {
      await supabase.from('room').delete().eq('id', room.id);
      return joinResult;
    }

    return {
      success: true,
      roomData: normalizeRoom(room, [joinResult.membership], normalizedType),
    };
  } catch (error) {
    console.error('Create room error:', error);
    return { success: false, error: 'Could not create room. Please try again.' };
  }
}

export async function joinRoomByCode({ registrationId, userName, gender, roomCode }) {
  const normalizedGender = normalizeGenderCode(gender);
  const normalizedCode = roomCode.trim().toUpperCase();

  if (!['M', 'F'].includes(normalizedGender)) {
    return { success: false, error: 'Please select a valid gender.' };
  }

  if (!normalizedCode) {
    return { success: false, error: 'Please enter the room code.' };
  }

  try {
    const existing = await getDelegateMembership(registrationId);
    if (!existing.success) return existing;
    if (existing.membership) {
      return { success: false, error: 'You are already assigned to a room.' };
    }

    const { data: room, error: roomError } = await supabase
      .from('room')
      .select('*')
      .eq('room_number', normalizedCode)
      .maybeSingle();

    if (roomError || !room) {
      return { success: false, error: 'Room code not found. Check the code and try again.' };
    }

    const roomGender = normalizeGenderCode(room.gender);

    if (roomGender !== normalizedGender) {
      return {
        success: false,
        error: `Gender mismatch. This room is for ${genderLabel(roomGender)} delegates only.`,
      };
    }

    const capacity = capacityForType(room.room_type || 'shared');
    const occupied = await getRoomOccupancy(room.id);
    if (occupied >= capacity) {
      return { success: false, error: 'This room is full.' };
    }

    if (room.room_type === 'individual' && occupied >= 1) {
      return { success: false, error: 'Individual rooms cannot accept additional crew members.' };
    }

    const joinResult = await joinRoom({
      registrationId,
      userName,
      gender: normalizedGender,
      roomId: room.id,
    });

    if (!joinResult.success) return joinResult;

    return {
      success: true,
      roomData: normalizeRoom(room, [joinResult.membership], room.room_type || 'shared'),
    };
  } catch (error) {
    console.error('Join room by code error:', error);
    return { success: false, error: 'Could not join room. Please try again.' };
  }
}

export async function joinRoom({ registrationId, userName, gender, roomId }) {
  const normalizedGender = normalizeGenderCode(gender);

  try {
    const { data, error } = await supabase
      .from('registrations')
      .update({
        room_id: roomId,
        gender: normalizedGender,
      })
      .eq('id', registrationId)
      .select('id, full_name, nickname, gender, room_id, created_at, updated_at, submitted_at')
      .single();

    if (error) throw error;

    return { success: true, membership: memberFromRegistration({ ...data, nickname: data.nickname || userName }) };
  } catch (error) {
    console.error('Error joining room:', error);
    return { success: false, error: 'Could not join room. Please try again.' };
  }
}

export async function getRoomDetails(roomId) {
  try {
    const { data: room, error: roomError } = await supabase
      .from('room')
      .select('*')
      .eq('id', roomId)
      .single();

    if (roomError) throw roomError;

    const { data: members, error: membersError } = await supabase
      .from('registrations')
      .select('id, full_name, nickname, gender, room_id, created_at, updated_at, submitted_at')
      .eq('room_id', roomId)
      .order('updated_at', { ascending: true });

    if (membersError) throw membersError;

    return {
      success: true,
      room: normalizeRoom(room, (members || []).map(memberFromRegistration), room.room_type || 'shared'),
    };
  } catch (error) {
    console.error('Error fetching room details:', error);
    return { success: false, error: 'Could not load room details.' };
  }
}

export async function removeUserFromRoom(registrationId, roomId) {
  try {
    const { error } = await supabase
      .from('registrations')
      .update({ room_id: null })
      .eq('id', registrationId)
      .eq('room_id', roomId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error removing user from room:', error);
    return { success: false, error: 'Could not leave room.' };
  }
}
