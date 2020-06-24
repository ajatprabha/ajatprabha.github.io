FROM ruby:2.7.1-alpine3.12 as base

ENV JEKYLL_VAR_DIR=/var/jekyll
ENV JEKYLL_DATA_DIR=/srv/jekyll
ENV JEKYLL_ENV=development

FROM base AS builder
RUN apk --no-cache add \
    make \
    gcc libc-dev \
    g++ \
    git \
    ruby-dev

RUN unset GEM_HOME && unset GEM_BIN && yes | gem install --force bundler

RUN bundle config set system 'true'

COPY Gemfile Gemfile
RUN bundle install

FROM base
RUN apk --no-cache add readline git
COPY --from=builder /usr/local/bundle /usr/local/bundle

RUN addgroup -Sg 1000 jekyll
RUN adduser  -Su 1000 -G \
  jekyll jekyll
RUN mkdir -p $JEKYLL_VAR_DIR
RUN mkdir -p $JEKYLL_DATA_DIR
RUN chown -R jekyll:jekyll $JEKYLL_DATA_DIR
RUN chown -R jekyll:jekyll $JEKYLL_VAR_DIR

CMD ["jekyll", "--help"]
WORKDIR /srv/jekyll
VOLUME  /srv/jekyll
EXPOSE 35729
EXPOSE 4000
