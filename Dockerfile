FROM node:11.13.0-alpine

# RUN apt-get update && apt-get install -y \
#     bash

# Install horizon and the `hz` tool
RUN npm -g install horizon@2.0.0

# Copy the built application
COPY ./docker-env/docker-launcher /usr/local/bin/docker-launcher
COPY ./build /app/public
COPY ./.hz /app/.hz

RUN mkdir -p /backups \
	&& chmod +x /usr/local/bin/docker-launcher

EXPOSE 8000 8181

ENTRYPOINT ["/usr/local/bin/docker-launcher"]
CMD ["--help"]

