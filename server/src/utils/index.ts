export const SOCKET_EVENTS = {
    CONNECTION: 'connection',
    DISCONNECT: 'disconnect',
    ERRORS: {
        500: 'internal_error',
        404: 'not_found',
        401: 'unauthorized',
        400: 'bad_request',
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

export const GetTimeStamp = () => new Date().toLocaleTimeString();

export const ERROR_CODES = {
    INTERNAL: 500,
    NOT_FOUND: 404,
    UNAUTHORIZED: 401,
    BAD_REQUEST: 400,
};

export class CustomError extends Error {
    public code: number;
    public constructor(code: number, message: string) {
        super(message);
        this.code = code;
    }
}