start:
	@docker run --rm --volume="$PWD:/srv/jekyll" -p 4000:4000 ajatprabha/jekyll-blog bundle exec jekyll serve --host=0.0.0.0
