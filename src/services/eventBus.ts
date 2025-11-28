import mitt from 'mitt';

type Events = {
    'update-items': boolean;
    'timer-running': boolean;
};

export const emitter = mitt<Events>();