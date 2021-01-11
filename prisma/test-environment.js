require('dotenv/config');
const util = require('util');
const NodeEnvironment = require('jest-environment-node');
const { nanoid } = require('nanoid');
const { PrismaClient } = require('@prisma/client');
const exec = util.promisify(require('child_process').exec);
const { DB_USERNAME, DB_PASSWORD } = process.env;

class PrismaTestEnvironment extends NodeEnvironment {
  constructor(config) {
    super(config);

    // Generate a unique sqlite identifier for this test context
    this.schema = nanoid();
    this.url = `postgresql://${DB_USERNAME}:${DB_PASSWORD}@localhost:5432/prisma?connection_limit=1&schema=${this.schema}`;
    process.env.DB_URL = this.url;
    this.global.process.env.DB_URL = this.url;
    this.client = new PrismaClient();
  }

  async setup() {
    // Run the migrations to ensure our schema has the required structure
    await exec(`yarn migrate:prod`);

    return super.setup();
  }

  async teardown() {
    await this.client.$executeRaw(
      `drop schema if exists "${this.schema}" cascade`,
    );
    await this.client.$disconnect();
  }
}

module.exports = PrismaTestEnvironment;
