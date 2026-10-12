#!/bin/sh
# Build legacy output in a throwaway copy without modifying tracked dependencies.
set -eu
source_dir=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
output_dir=${1:-/tmp/ajat-legacy-rebuilt}
mkdir -p "$output_dir"
output_dir=$(CDPATH= cd -- "$output_dir" && pwd)
docker run --rm \
  -v "$source_dir:/srv/source:ro" \
  -v "$output_dir:/srv/output" \
  ruby:2.7.7@sha256:bcaad4dfd52b4805e9f8c5205be5aadb8c206813199a9aeae13793a93f2d7296 \
  bash -lc '
    mkdir /tmp/buildsrc
    cp -a /srv/source/. /tmp/buildsrc/
    cd /tmp/buildsrc
    printf "\ngem \"ffi\", \"< 1.17\"\n" >> Gemfile
    bundle config set --local force_ruby_platform true
    bundle config set --local path /tmp/bundle
    bundle install
    bundle exec jekyll build --destination /srv/output
  '
