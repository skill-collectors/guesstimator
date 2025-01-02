import type { Room, User } from '$lib/services/rooms';
import { render } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import VoteControls from '$routes/rooms/[roomId]/VoteControls.svelte';
import { describe, expect, it, vi } from 'vitest';

function stubRoomData(): Room {
  return { validSizes: ['1', '2'] } as unknown as Room;
}

function stubCurrentUser(): User {
  return { vote: '1' } as unknown as User;
}

describe('VoteControls', () => {
  it('Emits votes per button click', async () => {
    // Given
    const user = userEvent.setup();
    const roomData = stubRoomData();
    const currentUser = stubCurrentUser();

    // When
    const { getByText } = render(VoteControls, {
      roomData,
      currentUser,
      vote: (e: { vote: string }) => voteHandler(e.vote),
    });
    const voteHandler = vi.fn();
    await user.click(getByText('2'));
    expect(voteHandler).toHaveBeenCalledWith('2');
  });
  it("Emits an empty vote when 'Clear' button clicked", async () => {
    // Given
    const user = userEvent.setup();
    const roomData = stubRoomData();
    const currentUser = stubCurrentUser();

    // When
    const { getByText } = render(VoteControls, {
      roomData,
      currentUser,
      vote: (e: { vote: string }) => voteHandler(e.vote),
    });
    const voteHandler = vi.fn();
    await user.click(getByText('Clear'));
    expect(voteHandler).toHaveBeenCalledWith('');
  });
  it('Emits an empty vote when current vote clicked again', async () => {
    // Given
    const user = userEvent.setup();
    const roomData = stubRoomData();
    const currentUser = stubCurrentUser();

    // When
    const { getByText } = render(VoteControls, {
      roomData,
      currentUser,
      vote: (e: { vote: string }) => voteHandler(e.vote),
    });
    const voteHandler = vi.fn();
    await user.click(getByText('1'));
    expect(voteHandler).toHaveBeenCalledWith('');
  });
});
