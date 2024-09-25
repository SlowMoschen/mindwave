export const SOCKET_EVENTS = {
    CONNECTION: 'connection',
    DISCONNECT: 'disconnect',
    ERRORS: {
        INTERNAL: 'internal_error',
        INVALID_DATA: 'invalid_data',
        INVALID_ROOM: 'invalid_room',
        INVALID_PASSWORD: 'invalid_password',
    },
    MESSAGE: 'message',
    GAME_EVENTS: {
        START: 'game:start',
        END: 'game:end',
        NEXT: 'game:next',
        READY: 'game:ready',
    },
    ROOM_EVENTS: {
        CREATE: 'room:create',
        JOIN: 'room:join',
        LEAVE: 'room:leave',
        CREATED: 'room:created',
        JOINED: 'room:joined',
    }
};