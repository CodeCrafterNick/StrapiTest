'use strict';

/**
 * politician service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::politician.politician');
