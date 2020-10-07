---
layout: post
current: post
cover:  assets/images/IMG_20201007_235240.jpg
navigation: True
title: Making a DIY Sound System that looks minimalistic
date: 2020-10-06 12:00:00
tags: [DIY,sound]
class: post-template
subclass: 'post tag-diy'
author: ajatprabha
---

I'm a huge music enthusiast and I listen to music almost half the day while working. Good quality speakers are a must for me. Recently I was changing the furniture in my house and I wanted to add a new sound system in the living room. I had two options:
- Either I could go to the market and get one off-the-shelf
- Or I could create one myself  

I really liked the second idea because I wanted the speaker system to be as minimalistic as possible and it should be hidden in the room so that no one would even notice that it is there. I also wanted to have really punchy bass while having crisp and crystal clear mids and highs.
> The arm rest thing in the sofa above is the sound system!😜  
> Serving dual purpose, and is also hidden and minimalistic.
> > Demo at the end!

### Studying about sound systems  
Now the problem was that I have never done it before! So how do I go about it? As anyone would do, I Googled `how to make DIY sound system` and it flooded me with lots of DIY videos and information around how to decide the characteristics of the sound that the system will produce or how to design the closure for the subwoofer.  
But this was overkill for me! After lots and lots of study around this topic, I came to know that there are many decisions that I have to take like:
- If I want to use 4 ohm speakers or 8 ohm speakers?
- What type of amplifier should I use? Should it be a class A, B, AB, C or D amplifier?  

I decided that I will go with 2x 50 watt Pioneer TS-1601IN speakers and a 150 watt subwoofer, all of the components are 4 ohms.  
Digging in a little deeper I found an IC, TPA3116D2, which is a dual channel class D amplifier and is also configurable, it was perfect for my use case. The were only two problems:
- It can only supply 100 watts to the subwoofer(I was okay with this)
- It had to be supplied with exactly 21 volts to drive the 4 ohm speakers  

In order to supply it with exactly 21 volts of voltage and around 7.5 amperes of maximum current, I tried to find a few power supplies with that exact description but wasn't able to find any. So the last resort that I had was to build that power supply myself and I did exactly that. 

### The DIY Power Supply  
I again went back to Google and started looking for `how can I make a power supply myself`. I had a few requirements that the voltage should be constant at 21 volts and the maximum current that can flow through the circuit should be up to 7.5 ampere, because 200W/21V ~ 9.5 Amps and 7.5 Amps should be enough to produce good quality sound without the amplified being shut-off.  
At last I found an IC named LM317 whose output voltage can be configured with the help of a resistance or a potentiometer. But the problem with this IC is that, it can only support upto 1.5 Amps of current.  
In basic electronics, we have learnt that if you connect these ICs in parallel, the current would divide across them but the voltage drop across them would remain the same. So I thought that I would connect five of these ICs in parallel and I created a circuit for that. Finally, I added a transformer and bridge rectifier with some capacitors to get a decent 35-36V DC input for the power supply I created.  

<div style="display: flex">
    <div style="margin: 1rem; width: 75%; display: inline-block">
        <img src="/assets/images/IMG_20200828_110823.jpg" style="width: 100%"/>
    </div>
    <div style="margin: 1rem; width: 25%; display: inline-block">
		<img src="/assets/images/IMG_20200925_104125.jpg" style="width: 100%"/>
    </div>
</div>  

I can go into more details about how exactly I did this but I think that would make this post a bit long. Let's keep that for another post, if required, and here's a video of how the speaker sound and look.

<div style="display: flex">
    <div style="margin: 0.5rem; width: 50%; display: inline-block">
		<video style="width: 100%" width="360" height="736" controls>
			<source src="/assets/videos/Snapchat-1775669112.mp4" type="video/mp4">
			Your browser does not support the video tag.
		</video>
    </div>
    <div style="margin: 0.5rem; width: 50%; display: inline-block">
		<video style="width: 100%" width="360" height="736" controls>
			<source src="/assets/videos/Snapchat-1169001711.mp4" type="video/mp4">
			Your browser does not support the video tag.
		</video>
    </div>
</div>  

> This is the bass response at <50% volume though! 😛  

> Speaker covers are from JBL, couldn't find Pioneer ones!  

Until next DIY 👋🏻
