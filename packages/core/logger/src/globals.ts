import { Logger } from './logger/logger';
import { PrettySink } from './sinks/pretty-sink';

export const logger = new Logger(new PrettySink({ output: process.stdout }));
