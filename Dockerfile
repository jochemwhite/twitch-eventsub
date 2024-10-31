# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1.0

WORKDIR /home/bun/app

COPY ./package.json .

RUN bun install

COPY . .



# run the app
USER root

CMD [ "ls", "-la", "/home/bun/app/node_modules" ]

ENTRYPOINT [ "bun", "start" ]