FROM public.ecr.aws/lambda/provided:al2 as builder
WORKDIR /app
COPY . ./
# This is where one could build the application code as well.

FROM public.ecr.aws/lambda/nodejs:12
# Copy binary to production image.
COPY --from=builder /app/bootstrap /var/runtime/bootstrap

COPY --from=builder /app/app.js ./
# Copy Tailscale binaries from the tailscale image on Docker Hub.
COPY --from=docker.io/tailscale/tailscale:stable /usr/local/bin/tailscaled /var/runtime/tailscaled
COPY --from=docker.io/tailscale/tailscale:stable /usr/local/bin/tailscale /var/runtime/tailscale
RUN mkdir -p /var/run && ln -s /tmp/tailscale /var/run/tailscale && \
    mkdir -p /var/cache && ln -s /tmp/tailscale /var/cache/tailscale && \
    mkdir -p /var/lib && ln -s /tmp/tailscale /var/lib/tailscale && \
    mkdir -p /var/task && ln -s /tmp/tailscale /var/task/tailscale

# Run on container startup.
CMD ["app.handler"]
