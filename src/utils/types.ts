export type Options = {
    url: string;
    emulate: string;
    fullpage: boolean;
    maxheight: number;
    w: number;
    h: number;
    waitfortime: number;
    waitforselector: string;
    auth: string;
    ip: string;
    geo: {
        longitude: number;
        latitude: number;
    };
    block: string[];
    click: string;
    outfile: string;
    log: boolean;
};
