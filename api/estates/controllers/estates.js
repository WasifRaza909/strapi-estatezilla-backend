"use strict";
const { sanitizeEntity, parseMultipartData } = require("strapi-utils");
/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  // Create estate with linked user
  async create(ctx) {
    console.log("HEO WL");
    let entity;
    if (ctx.is("mulitpart")) {
      const { data, files } = ctx.parseMultipartData(ctx);
      data.user = ctx.state.user.id;
      entity = await strapi.services.estates.create(data, { files });
    } else {
      ctx.request.body.user = ctx.state.user.id;
      entity = await strapi.services.estates.create(ctx.request.body);
    }
    return sanitizeEntity(entity, { model: strapi.models.estates });
  },

  // Update user estate
  async update(ctx) {
    const { id } = ctx.params;

    let entity;

    const [estates] = await strapi.services.estates.find({
      id: ctx.params.id,
      "user.id": ctx.state.user.id,
    });

    if (!estates) {
      return ctx.unauthorized(`You can't update this entry`);
    }

    if (ctx.is("multipart")) {
      const { data, files } = parseMultipartData(ctx);
      entity = await strapi.services.estates.update({ id }, data, {
        files,
      });
    } else {
      entity = await strapi.services.estates.update({ id }, ctx.request.body);
    }

    return sanitizeEntity(entity, { model: strapi.models.estates });
  },

  async delete(ctx) {
    const { id } = ctx.params;

    const [estates] = await strapi.services.estates.find({
      id: ctx.params.id,
      "user.id": ctx.state.user.id,
    });

    if (!estates) {
      return ctx.unauthorized(`You can't delete this entry`);
    }

    const entity = await strapi.services.estates.delete({ id });
    return sanitizeEntity(entity, { model: strapi.models.events });
  },

  // Get logged in user estates
  async me(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.badRequest(null, [
        {
          messages: [{ id: "No authorization header was found" }],
        },
      ]);
    }

    const data = await strapi.services.estates.find({ user: user.id });

    if (!data) {
      return ctx.notFound();
    }

    return sanitizeEntity(data, { model: strapi.models.estates });
  },
};
