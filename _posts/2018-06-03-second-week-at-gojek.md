---
layout: post
current: post
cover:  assets/images/IMG_20180603_095731.jpg
navigation: True
title: Week 2 - Exploring Golang and the trip to Coorg
date: 2018-06-03 12:00:00
tags: [gojek,internship,travel,golang]
class: post-template
subclass: 'post tag-intern'
author: ajatprabha
---

> It's been great till now and our mentor came back from Jakarta. It's time to start building the service that will handle 50K+ image requests per minute. I also went on a road trip to Coorg at the weekend, the scenes were jaw-dropping, one of the best trips I went on.  

### Day 1  

I reached the office at around 1000 hours and joined Puneet and Deepesh a few moments later. Puneet briefed us about the project that we are assigned to and how it should be able to serve at 50K+ rpm(requests/minute) at normal load and up to 80K rpm during peak times.  

Rajat, Sainath and I started to code the functionality. At first, I thought to code the handler that'll cater to the requests but later I realized that I should first implement the `ImageProcessor` service because it was a primitive one that could be tested in isolation to the rest of the program.  

Let me explain a bit, suppose a request comes for an image at URL `host[dot]com/image.jpg` then the handler should return the requested image which is 600x400 pixels. But now I want to show the same image on multiple platforms, be it a 5" iPhone, a 6" Android, or an 8" tablet. The image should be crisp on large screens but the same image is useless for 5" iPhone since much of the pixels are not utilized. So I can ask for a smaller image by hitting the URL `host[dot]com/image.jpg?w=320&h=240` and the returned image will not be more than 320x240 pixels.  

Now the handler has to figure out what to do with the image based on the query parameters in the URL. Since we have to implement resize, crop and grayscale functionality, for now, I decided to work on individual image processing parts first. It'll be easier to test also. But it was not that easier first because we used a [Go wrapper](https://github.com/gographics/imagick) on ImageMagick library for image manipulation and the version was missing some features that we wanted to use. The solution was to create our own logic.  

<div>
    <img src="/assets/images/base_image.jpg" style="margin: 0"/>
    <p style="text-align: center; margin: 0; font-style: italic; font-size: 1.5rem;">Original</p>
    <div style="display: flex">
        <div style="width: 50%">
            <img src="/assets/images/base_resized.jpg" style="width: 100%; margin: 0"/>
            <p style="text-align: center; font-style: italic; font-size: 1.5rem;">Resized image</p>
        </div>
        <div style="width: 50%">
            <img src="/assets/images/base_cropped.jpg" style="width: 100%; margin: 0"/>
            <p style="text-align: center; font-style: italic; font-size: 1.5rem;">Cropped image</p>
        </div>
    </div>
</div>  

There are two major use cases: *Resize* and *Crop*  
Now the Go wrapper stretches the image while resizing, so we wrote some logic to not distort the image while processing. Suppose I ask for a width of 320 pixels and a height of 240 pixels. While resizing, the image processor should pick appropriate width and height and resize it, in the case above see how the image is contained within 320x240 pixels, the image here is actually 320x213 pixels.  

The second case is cropping the image. When I make a request with URL `host[dot]com/image.jpg?w=320&h=240&fit=crop&crop=top,left`, the service should return me a cropped image as shown in the image above.  

So the requirement is clear, next step is to write a test to define the behavior. This is not the very first test I wrote for this functionality but I'm taking this as an example here.  

<div style="width: 100%">
    <script src="https://gist.github.com/ajatprabha/2468d8669be5eb19eb80b6d0acc8370c.js?file=image_processor_test.go"></script>
</div>  

After this and a few more tests, the production code looked something like the code below.  
<div style="width: 100%">
    <script src="https://gist.github.com/ajatprabha/2468d8669be5eb19eb80b6d0acc8370c.js?file=image_resize_handler.go"></script>
</div>  

But we did a mistake! We wrote all the logic in the handler for deciding what type of processing is to be done on the image. I was reluctant to write everything in the handler at first but I thought maybe this is the way one codes in `Go` i.e. being very verbose, but as it turned out, I was not completely right. We realized this much later but now we have to refactor the code.  

It's not as easy as it seems to write code along with TDD while you've to understand the structure of the code that is written by someone else. It takes many iterations to figure out correctly why a certain piece of code was written. By the weekend, we implemented resize and crop very vaguely in the handler. The next week's task is to refactor the code and move everything in its correct place.  

> That's all for the work part, wanna know how the weekend went?

### Weekend  
It was 0400 hours in the morning, I woke to pick the car we booked for our trip to Coorg. Krishna took the car, picked up Riya and Anugrah, we were next in line, and then we were off to Coorg probably around 0600 hours. The weather was awesome, there was music playing in the car and we were enjoying the drive. Around 0930 hours we pulled over the car to have breakfast and it was great to find such south Indian food on the highway in the middle of nowhere.  

<img src="/assets/images/IMG_20180602_082543.jpg" style="max-width: 300px">  

We continued the trip and it would take us 4 more hours to reach our destination. The road was great, people were awesome. You can't get bored when you've Anugrah with you. Stories from college, previous road trip experiences, etc everything was talked about. Our playlist included songs from the year as old as 1970s to 2018, from _Mere mehboob qayamat hogi_ to the latest _Tareefan_, from _Aao milo chalein_ to _Mi Gente_. It was already the best trip ever.  

<div style="display: flex">
    <div style="margin: 1rem; width: 50%; display: inline-block">
        <img src="/assets/images/IMG_20180602_103608558_HDR.jpg" style="width: 100%"/>
    </div>
    <div style="margin: 1rem; width: 50%; display: inline-block">
        <img src="/assets/images/IMG_20180602_103745892.jpg" style="width: 100%"/>
    </div>
</div>

We decided to go river rafting but unfortunately, the sport was closed for some reason.😞 We went to see `Abbey falls` it was not as I expected but the drive to it was great. [Abhinav](https://www.facebook.com/theabhinavrai) has been to Coorg before, we called him for suggestions and he suggested us to go to `Talakaveri`. And let me tell you the road was awesome, so full of nature. When we almost reached there, it started raining and continued for around half an hour.  

<div style="display: flex">
    <div style="margin: 1rem; width: 57%; display: inline-block">
        <img src="/assets/images/IMG_7152.jpg" style="width: 100%"/>
    </div>
    <div style="margin: 1rem; width: 43%; display: inline-block">
        <img src="/assets/images/IMG_20180602_150644.jpg" style="width: 100%"/>
    </div>
</div>  

We drove back to Madikeri from Talakaveri, it was around 2200 hours and we looked for a place for spending the night. We came across a homestay and it was very good, the neighborhood was awesome. I felt like I was in Kashmir or something.😂 I was very tired and went to sleep quite fast.  
> The next morning when I woke up and got outside, the view was jaw-dropping. There was mist everywhere, the temperature was around 25&#176;C or low, birds were chirping. Everything was so peaceful.  

<div style="display: flex">
    <div style="margin: 1rem; width: 50%; display: inline-block">
        <img src="/assets/images/IMG_20180603_080640.jpg" style="width: 100%"/>
    </div>
    <div style="margin: 1rem; width: 50%; display: inline-block">
        <img src="/assets/images/IMG_20180603_080548.jpg" style="width: 100%"/>
    </div>
</div>  

Rajat was our travel planner, he picked a few places that we had to visit before 1400 hours, but sadly, we could only make it to two of them.  

###### Raja's Seat  
Filled with seasonal flowers and artificial fountains, it was really some kind of a King's seat. The mountain ranges, the valley below and the greenery were so damn refreshing. The weather was as usual very pleasant. We had our breakfast and zoomed to our next destination.  

<div>
    <img src="/assets/images/PANO_20180603_093929.jpg" style="width: 100%"/>
</div>  

###### Nisargadhama  
This was some kind of island which was surrounded by a river! I know, seems a little odd to imagine an island in Coorg. We had to walk over a hanging bridge to get to the island. There were deer on the island. We found a way to get to the river bank and removed our shoes to get into the water. It was cold! We spent almost an hour there and decided to head back to Bangalore. The whole time it was raining when we were coming back. But it was a nice drive back in the rain.  

<video width="640" height="360" controls>
    <source src="/assets/videos/VID_20180603_111153.mp4" type="video/mp4">
    Your browser does not support the video tag.
</video>  

<div style="display: flex">
    <div style="margin: 1rem; width: 43%; display: inline-block">
        <img src="/assets/images/IMG_20180603_123229_BURST2.jpg" style="width: 100%"/>
    </div>
    <div style="margin: 1rem; width: 57%; display: inline-block">
        <img src="/assets/images/IMG_20180603_123841.jpg" style="width: 100%"/>
    </div>
</div>  

This was the best road trip I went on. Let's see where I go next! And yes, the next blog will consist more about the code that I wrote and the things I did at GoJek.  