FROM node:11.13.0-alpine

# Install horizon and the `hz` tool
RUN npm -g install horizon@2.0.0

# Copy the built application
COPY ./docker-launcher /usr/local/bin
COPY ./build /app
RUN mkdir -p /backups

ENTRYPOINT ["/usr/local/bin/docker-launcher"]
CMD ["--help"]
