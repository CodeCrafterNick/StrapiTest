'use strict';

/**
 * quote service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::submission.submission');
