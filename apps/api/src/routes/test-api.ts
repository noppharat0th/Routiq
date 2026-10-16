import fastify, { FastifyPluginAsync } from "fastify";

export const testApi: FastifyPluginAsync = async (fastify) => {
    fastify.get("/api/test", async () => {
        return { message: "ok" }
    })
}