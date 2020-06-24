FROM ruby:2.7.1-alpine3.12

ENV JEKYLL_VAR_DIR=/var/jekyll
ENV JEKYLL_DATA_DIR=/srv/jekyll
ENV JEKYLL_ENV=development

RUN apk --no-cache add \
    make \
    readline \
    gcc libc-dev \
    g++ \
    git \
    ruby-dev

RUN unset GEM_HOME && unset GEM_BIN && yes | gem install --force bundler

RUN addgroup -Sg 1000 jekyll
RUN adduser  -Su 1000 -G \
  jekyll jekyll

RUN bundle config set system 'true'

COPY Gemfile Gemfile
RUN bundle install

RUN mkdir -p $JEKYLL_VAR_DIR
RUN mkdir -p $JEKYLL_DATA_DIR
RUN chown -R jekyll:jekyll $JEKYLL_DATA_DIR
RUN chown -R jekyll:jekyll $JEKYLL_VAR_DIR

CMD ["jekyll", "--help"]
WORKDIR /srv/jekyll
VOLUME  /srv/jekyll
EXPOSE 35729
EXPOSE 4000
