/// <reference path="../typings/tsd.d.ts" />

interface Icallback {
    (err?: any, data?: any, ...args: any[]): void;
}