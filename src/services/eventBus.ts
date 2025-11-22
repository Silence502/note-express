import mitt from 'mitt';

type Events = {
    'update-items': boolean;
};

export const emitter = mitt<Events>();