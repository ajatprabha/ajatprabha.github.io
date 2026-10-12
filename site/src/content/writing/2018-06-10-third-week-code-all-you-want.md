---
title: "Week 3 - Lots of code and learning"
description: "Week 3 was filled with more of coding and learning new things down the line. I learned how dependency injection in Golang is done, writing mocks and stubs for the test cases, etc. to name..."
publishedAt: "2018-06-10T12:00:00+00:00"
route: "/2018/06/10/third-week-code-all-you-want"
tags: ["gojek","internship"]
projectIds: ["darkroom"]
author: "ajatprabha"
cover: {"height":864,"width":1536,"alt":"","src":"/assets/images/IMG_20180605_164123_1.jpg"}
legacySourceId: "2018-06-10-third-week-code-all-you-want"
---

> Week 3 was filled with more of coding and learning new things down the line. I learned how dependency injection in Golang is done, writing mocks and stubs for the test cases, etc. to name a few. How an application is deployed to tens of servers with the push of a button.  

To know what I'm building head over to week 2's post [here](/2018/06/03/second-week-at-gojek) if you haven't already.


<h2 id="day-1">Day 1</h2>


Mudit was deploying an incremental update to one of the services that power the Go-Food stack at GoJek. I asked him if I can join and he was happy to show me how it's done. The scale at which GoJek works and how a single engineer is responsible for half a million user's requests is mind-boggling. When you have that kind of requests coming in every second you can't afford your systems to go down even for a blink of an eye.  

There are several layers through which a request goes and one of them is the load balancer layer, HAProxy is used in this case. So every request falls on to HAProxy and then it is diverted to one the application servers for the request to be processed. GoJek has quite a number of them and when an update is deployed, it is deployed to one application server at a time. This way the other servers are still up to serve the requests coming in.  

Although to deploy an update you need to inform other concerned teams about it and create a document mentioning what changes it is going to make, what other services will it affect, etc? Once the teams are informed over internal IM, there are a few monitoring services to be fired up in order to track any undesired effect during the rollout.  
The actual rollout is very easy because it is all automated. You just click a button and boom, the deployment starts one-by-one on every machine in the stack. Since the code is added, refactored and changed at blazing speeds here, we need such Continuous Integration and Continuous Deployment tools to keep us going without a bottleneck. More on the process in [Day 4](#day-4).😉  

<div class="gallery">
    <div>
        <img src="/assets/images/IMG_20180604_125819.jpg" alt="A monitor and laptop displaying service monitoring dashboards with line charts and pink bars during a deployment." width="720" height="720" loading="lazy" decoding="async">
    </div>
    <div>
        <img src="/assets/images/IMG_20180604_125835.jpg" alt="A second view of the deployment monitoring dashboard, showing several time-series charts on an external monitor." width="720" height="720" loading="lazy" decoding="async">
    </div>
</div>  

The deployment was successful and the new feature was up and the [Apdex](https://en.wikipedia.org/wiki/Apdex) score was satisfactory. It took hardly 15-20 mins in the whole process without any decrease in the overall throughput of the application requests coming in. We worked on our own project for the rest of the day.  


<h2 id="day-2-3">Day 2-3</h2>


I and Rajat started working on the handler that'll serve the images after processing them, we wrote some tests and then wrote the code for the handler. We stubbed the function that'll actually process the image but it wasn't feeling right to go top-down, so we decided to go bottom-up and started working on the `ImageProcessor` service first and we chose to implement resize capability first. We're using [`imagick`](https://github.com/gographics/imagick) library which provides `Go` bindings to the underlying `ImageMagick`'s MagickWand C API.  



```go
func (ip imageProcessor) ProcessResize(srcImage *domain.Image, requiredW, requiredH uint) error {
	source := imagick.NewMagickWand()
	defer source.Destroy()
	source.ReadImageBlob(srcImage.Data)
	actualW := source.GetImageWidth()
	actualH := source.GetImageHeight()
	resizeW, resizeH := getResizeWidthandHeight(requiredW, requiredH, actualW, actualH)  //Returns appropriate size to maintain the original aspect ratio of the image
	err = source.ResizeImage(resizeW, resizeH, imagick.FILTER_LANCZOS)
	if err != nil {
		return fmt.Errorf("unable to process image: %s", err.Error())
	}
	srcImage.Data = source.GetImageBlob()
	return nil
}
```

[image_processor.go by ajatprabha](https://gist.github.com/ajatprabha/6e6281e108a4bc5e3c545ef906522ddf/cc3824b900ec65716f0cc298f2a3a53d12a8ce03#file-image-processor-go)

  

We faced a lot of problems because the image object was being mutated in different parts of the existing code. And we had to also save the processed image back to the S3 bucket but with a new UUID which has to be generated based on an SHA-1 hash of the ordered query string that was used to process the image so that we never process one image again and again.  



```go
func (i *Image) SetNewUUID(hashString string) error {
	strippedHash := strings.Replace(hashString, " ", "", -1)
	if len(strippedHash) == 0 {
		return fmt.Errorf("hash string cannot be empty")
	}
	i.Id = uuid.NewV5(i.Id, strippedHash)
	return nil
}
```

[image.go by ajatprabha](https://gist.github.com/ajatprabha/6b885458d07a2bfcc94351b36cda0d45/888ac1680ecc7ac8e55a03dda86c9bf8a944a830#file-image-go)

  

We implemented the resize and crop capability and it was working as expected. We then linked these new image processing capabilities to the handler that'll actually serve the requests on the next day and tested it locally. But we had made a mess as we wrote all the code inside the handler itself. The next task was to fix the code smell.  


<h2 id="day-4">Day 4</h2>


It was now time to introduce a new decision-making service that'll take in the requested image's name and the query parameters and based on the data it'll decide what to do and call the image processor to actually process the image. I had to use some of the existing services and since I was practicing [TDD](/2017/12/20/tdd-why-bother), I had quite a hard time in stubbing the existing services.   
I was writing tests for a function and had to call the same function twice inside the decision-making service but wanted it to behave differently based on the input I was giving to the function. That's when I came across mocks in `Golang` and how they provide additional ways to ease the task of testing. Dependency injection was very important in this part as I had to use some of the existing services inside the new service while practicing TDD.😅  


<h3 id="learning-session">Learning session</h3>


Puneet held a learning session in which I learned how actually the deploying process works, what happens inside all this one click `voodoo` that deploys your app automatically. There's a Chef, a knife, a cookbook, and many recipes. Yes, they're actually named like this.  
<img src="/assets/images/IMG_20180606_115642.jpg" alt="Colleagues gathered around a meeting-room display while a presenter points to code on screen." width="720" height="405" loading="lazy" decoding="async">  A chef knows everything, it is a server which is used to communicate during the deployment process and tells the chef-clients what to do. Every VM has a chef-client which is instructed to pick up a cookbook and start the deployment. A cookbook is nothing but contains the information on how to build an application, just like an actual cookbook has recipes for dishes. Now the individual recipes are analogous to applications.  

Let's say your application needs database. You can avoid all the pain to set up the database server and just include the `postgresql` or `mysql` recipe and voila, chef-client does it for you. Same happens with your own application, you just need to specify a recipe on how to build the app.  


<h2 id="day-5">Day 5</h2>


We added some analytics utilities to the code in order to track the performance and any other potential errors. Sainath also added the ability to turn an image all black and white. Deepesh made some adjustments and merged our branch into `master` and deployed the new code to integration environment where it'll be tested thoroughly in the coming days.  

The next step is to load test our image processing service, after all, it has to handle 50K rpm!
