#!/usr/bin/env node

import { DocsServer } from './server.js';

const server = new DocsServer();
server.run().catch(console.error);