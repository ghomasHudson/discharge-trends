FROM python:3.13-alpine

RUN addgroup -g 1000 app && adduser -D -u 1000 -G app app

WORKDIR /usr/src/app

COPY --chown=app:app index.html ./
COPY --chown=app:app static/ ./static/

USER app

EXPOSE 4000

CMD ["python", "-m", "http.server", "4000", "--bind", "0.0.0.0"]
