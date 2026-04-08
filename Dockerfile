# Copyright (C) 2026 Icarus. All rights reserved.

FROM node:22-alpine
RUN sed -i 's|https://dl-cdn.alpinelinux.org|https://mirrors.aliyun.com|g' /etc/apk/repositories \
    && apk add --no-cache git
COPY docker-entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
