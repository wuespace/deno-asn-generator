FROM denoland/deno:1.45.5

LABEL org.label-schema.name="deno-asn-generator"
LABEL org.opencontainers.image.description="A Deno based system for generating / managing ASNs for documentat management systems in a collaborative environment."
LABEL org.opencontainers.image.source=https://github.com/wuespace/deno-asn-generator
LABEL org.opencontainers.image.licenses=MIT
LABEL maintainer="WüSpace e. V."

WORKDIR /app

COPY . .

ENV DATA_DIR=/data
ENV DB_FILE_NAME=denokv.sqlite3
ENV PORT=8080

RUN deno cache --unstable-kv --no-check main.ts

STOPSIGNAL SIGKILL

ENTRYPOINT [ \
	"deno", "run",\
	# Allow access to the environment variables
	"--allow-env", \
	# Enable to Deno KV Storage (currently "unstable")
	"--unstable-kv",\
	# Allow write access to the /data directory
	"--allow-write=/data",\
	# Allow read access to the /data directory, `.env` (if it exists), and static files
	"--allow-read=/data,/app/static,.env",\
	# Allow network access for the HTTP server
	"--allow-net",\
	"main.ts" \
]
CMD [ "server" ]
