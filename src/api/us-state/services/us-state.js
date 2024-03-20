'use strict';

/**
 * us-state service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::us-state.us-state');
