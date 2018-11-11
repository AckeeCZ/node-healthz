import { AdapterOptions } from 'healthz';

export default (mongoose: any, definition: AdapterOptions) => {
    return new Promise((resolve, reject) => {
        let db = mongoose.connection
            ? mongoose.connection.db // prev versions
            : mongoose.db // current versions
        db.command({ ping: 1 }, { failFast: true }, (error: Error) => {
            if (error) {
                return reject(error);
            }
            return resolve(true);
        });
    });
};
