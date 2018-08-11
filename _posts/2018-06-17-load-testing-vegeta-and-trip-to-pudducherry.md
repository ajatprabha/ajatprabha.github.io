---
layout: post
current: post
cover:  assets/images/IMG_20180617_083757.jpg
navigation: True
title: Week 4 - Load testing with Vegeta and trip to Puducherry
date: 2018-06-17 12:00:00
tags: [gojek,internship,travel]
class: post-template
subclass: 'post tag-intern'
author: ajatprabha
---

> This week, I acknowledged the importance of load testing before deploying a service into production which has to serve 50K images per minute.  

To know what service I'm testing head over to week 2's post [here]({% post_url 2018-06-03-second-week-at-gojek %}) if you haven't already.

## Day 1  
We had to load test the image manipulation service that we built until now. My mentor asked us to get our hands dirty with a Golang based HTTP load testing tool called [Vegeta](https://github.com/tsenart/vegeta){:target="blank"}, yes the grumpy character from Dragon Ball obsessed with surpassing Goku. <img src="/assets/images/vegeta-blue.png" style="max-width: 225px;" /> It is quite a good load testing tool that I've come across. I also tried a python tool called Locust. While it provides a nice UI and other options, I liked Vegeta more because it's more reliable. We now had to validate our service's performance and make sure that it can survive the load. The day went mostly around getting to know Vegeta and doing a few load tests locally.  

## Day 2-3  
Initial load tests were not very good, we could hardly hit 60 rpm! After looking at the code we realized that there was a memory leak, which was constantly increasing our heap size. We optimized the memory allocation/de-allocation for each request and the heap size was then under control. This optimization increased the rpm a little bit but not significantly.  

We got a lot of server timeout errors because the service was not able to respond within 30 seconds and the response time used to increase linearly. For some strange reason, the disk read-writes were taking time. We got to the root of this in the coming days.  

On Wednesday evening, I went out to an office meeting at Hotel Royal Orchid, a very nice place. I had blue cheese there for the first time, and as expected by the smell of it, it did not taste very good to me.😂  

## Day 4-5  
We were supposed to take the service live by the weekend but due to performance issues, it got delayed. It sounds easy to build such a thing but believe me it's not!  

So all of us looked deeper into the code flow, we set up logs and found that downloading the image from S3 bucket was taking time. We tried to overcome this by setting up a download job worker and sending the results to a channel. But it didn't help much. Apparently, the result of Golang's `ioutil.ReadAll(response.Body)` was taking up too much time which was blocking the service, read more [here](https://haisum.github.io/2017/09/11/golang-ioutil-readall/){:target="blank"}. We got around this by saving the image temporarily to the disk.  

The service was now able to handle 2K rpm of traffic and with 4 application VMs we predicted 8K rpm as the threshold, but it turned out later that it was incorrect!  

## Weekend  
For the weekend, I went to Puducherry along with my seniors from college. We were 13 people in two cars. The trip started with a car that had no central locking remote and the electronics were behaving weird because of that. After wasting an hour in getting the correct key, the journey began. Our first stop was McDonald's for the breakfast. I was driving one of the cars and the other car missed the service road, so we took there order too and later met alongside the highway and had our meal.
<div style="display: flex">
    <div style="margin: 1rem; width: 50%; display: inline-block">
        <img src="/assets/images/IMG_20180616_110649.jpg" style="width: 100%"/>
    </div>
    <div style="margin: 1rem; width: 50%; display: inline-block">
        <img src="/assets/images/IMG_20180616_114501.jpg" style="width: 100%"/>
    </div>
</div>  

We refueled, put on some music and headed straight towards Puducherry. The road was better to Coorg because of the greenery as compared with the road to Puducherry. Also, we got to see more and more people wearing Lungi in Tamil Nadu.  

There is this one incident that took place, we were crossing a town and a person out of nowhere came in the middle of the road with his hands wide open, said something, all of us were shocked and then he just went away.🤣 After crossing the town, we stopped near a lake to take a group photo!  

<img src="/assets/images/IMG_20180616_135555469.jpg"/>  

It took us roughly 6 hours to reach Puducherry and as soon as we reached, we went to the beach. To be honest, it was not what I expected! I've not been to Goa yet but every other beach is just okay, not anything like what is shown in movies/videos.  

Late in the evening, we went to Promenade Beach and the White Town, it was a good place. We had our dinner and me and Krishna went on to hunt a place to crash during the night.  

Next morning, we went to Serenity beach, it was good but not as good as what it is shown in images. I spent an hour or two there. Next stop was again the Puducherry city. After visiting the city in daylight, we thought to visit Paradise beach but seeing the waiting line we decided to not go there and head back to Bangalore.  

<img src="/assets/images/IMG_20180617_080512_1.jpg"/>  

Around late evening we reached the suburbs of Bangalore. This was a good road trip but I liked the [Coorg trip]({% post_url 2018-06-03-second-week-at-gojek %}#weekend) more! Pro tip: Always travel with fewer people!😜
