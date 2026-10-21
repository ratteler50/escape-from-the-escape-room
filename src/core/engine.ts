import type { Command, CommandResult, GameState, Hotspot, HotspotId, Room, World } from './types';

/**
 * The rules engine. Pure: given the world, the current state, and a command, returns the new
 * state and the effects for the view to play. Never mutates its inputs.
 */
export function handle(world: World, state: GameState, command: Command): CommandResult {
  switch (command.type) {
    case 'look': {
      const hotspot = findHotspot(currentRoom(world, state), command.hotspotId);
      return { state, effects: [{ type: 'say', text: hotspot.look }] };
    }
  }
}

export function currentRoom(world: World, state: GameState): Room {
  const room = world.rooms[state.roomId];
  if (!room) throw new Error(`Unknown room "${state.roomId}"`);
  return room;
}

function findHotspot(room: Room, id: HotspotId): Hotspot {
  const hotspot = room.hotspots.find((h) => h.id === id);
  if (!hotspot) throw new Error(`No hotspot "${id}" in room "${room.id}"`);
  return hotspot;
}
